const User = require('../models/User');
const Project = require('../models/project');
const Skill = require('../models/skill');
const JoinRequest = require('../models/joinRequest');
const Task = require('../models/task');
const { cacheDel } = require('../config/redis');
const { extractResumeSkills } = require('../services/resumeSkillExtractor');

const getStudentById = async (req, res) => {
  try {
    const { id } = req.params;

    const student = await User.findById(id)
      .select('-password')
      .populate('skills.skillId', 'name');

    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    if (student.role !== 'STUDENT') {
      return res.status(400).json({ message: 'User is not a student' });
    }

    res.status(200).json({ student });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch student', error: err.message });
  }
};

const searchStudents = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const { skill, year, branch, availability, search } = req.query;

    const filter = { role: 'STUDENT' };

    if (skill) {
      const skillDoc = await Skill.findOne({ name: { $regex: skill, $options: 'i' } });
      if (skillDoc) {
        filter['skills.skillId'] = skillDoc._id;
      }
    }

    if (year) {
      filter.year = parseInt(year);
    }

    if (branch) {
      filter.branch = { $regex: branch, $options: 'i' };
    }

    if (availability) {
      filter.availability = availability;
    }

    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }

    const students = await User.find(filter)
      .select('-password')
      .populate('skills.skillId', 'name')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await User.countDocuments(filter);

    res.status(200).json({
      students,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (err) {
    res.status(500).json({ message: 'Failed to search students', error: err.message });
  }
};

const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.status(200).json({ user });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch profile', error: err.message });
  }
};

const updateProfile = async (req, res) => {
  try {
    const { branch, year, availability } = req.body;

    const updatedUser = await User.findByIdAndUpdate(
      req.user.id,
      { branch, year, availability },
      { new: true, runValidators: true }
    ).select('-password');

    await cacheDel(`project-recommendations:${req.user.id}`);

    res.status(200).json({ message: 'Profile updated', user: updatedUser });
  } catch (err) {
    res.status(500).json({ message: 'Failed to update profile', error: err.message });
  }
};

const addSkill = async (req, res) => {
  try {
    const { skillName, level } = req.body;

    let skill = await Skill.findOne({ name: skillName.trim() });
    if (!skill) {
      skill = await Skill.create({ name: skillName.trim() });
    }

    const user = await User.findById(req.user.id);

    const alreadyHasSkill = user.skills.some(
      (s) => s.skillId.toString() === skill._id.toString()
    );
    if (alreadyHasSkill) {
      return res.status(400).json({ message: 'Skill already added' });
    }

    user.skills.push({ skillId: skill._id, name: skill.name, level: level || 1 });
    await user.save();

    await cacheDel(`project-recommendations:${req.user.id}`);

    res.status(201).json({ message: 'Skill added', skills: user.skills });
  } catch (err) {
    res.status(500).json({ message: 'Failed to add skill', error: err.message });
  }
};

const removeSkill = async (req, res) => {
  try {
    const { skillId } = req.params;

    const user = await User.findById(req.user.id);
    user.skills = user.skills.filter((s) => s.skillId.toString() !== skillId);
    await user.save();

    await cacheDel(`project-recommendations:${req.user.id}`);

    res.status(200).json({ message: 'Skill removed', skills: user.skills });
  } catch (err) {
    res.status(500).json({ message: 'Failed to remove skill', error: err.message });
  }
};

const getResumeMatches = async (req, res) => {
  try {
    const { resumeText } = req.body;
    if (typeof resumeText !== 'string' || !resumeText.trim()) {
      return res.status(400).json({ message: 'Resume text is required' });
    }
    if (resumeText.length > 100000) {
      return res.status(413).json({ message: 'Resume text is too large to analyze' });
    }

    const user = await User.findById(req.user.id).select('availability role');
    if (!user) return res.status(404).json({ message: 'User not found' });

    const catalogSkills = await Skill.find().select('name');
    const detectedSkills = extractResumeSkills(resumeText, catalogSkills);
    const detectedSkillNames = new Set(detectedSkills.map((name) => name.toLowerCase()));

    const projects = await Project.find({
      status: 'OPEN',
      ownerId: { $ne: req.user.id },
      'members.userId': { $ne: req.user.id }
    }).select('title description requiredSkills minMatchScore');
    const [joinRequests, activeTasks] = await Promise.all([
      JoinRequest.find({ userId: req.user.id }).select('projectId status'),
      Task.countDocuments({
        assignedTo: req.user.id,
        status: { $in: ['TODO', 'IN_PROGRESS', 'PENDING_REVIEW'] }
      })
    ]);
    const requestsByProject = new Map(
      joinRequests.map((request) => [request.projectId.toString(), request.status])
    );
    const workloadScore = Math.max(0, 100 - (activeTasks * 20));
    const availabilityScore = user.availability === 'available' ? 100 : 30;

    const recommendations = projects.map((project) => {
      let matchedWeight = 0;
      let totalWeight = 0;
      const matchedSkills = [];
      const missingSkills = [];

      for (const requiredSkill of project.requiredSkills) {
        totalWeight += requiredSkill.weight;
        if (detectedSkillNames.has(requiredSkill.name.toLowerCase())) {
          matchedWeight += requiredSkill.weight;
          matchedSkills.push(requiredSkill.name);
        } else {
          missingSkills.push(requiredSkill.name);
        }
      }

      const skillScore = totalWeight > 0 ? Math.round((matchedWeight / totalWeight) * 100) : 0;
      const matchScore = Math.round((skillScore * 0.5) + (workloadScore * 0.3) + (availabilityScore * 0.2));

      return {
        project: {
          _id: project._id,
          title: project.title,
          description: project.description,
          minMatchScore: project.minMatchScore || 50
        },
        matchScore,
        matchedSkills,
        missingSkills,
        joinRequestStatus: requestsByProject.get(project._id.toString()) || null
      };
    }).sort((a, b) => b.matchScore - a.matchScore);

    res.status(200).json({ detectedSkills, recommendations });
  } catch (err) {
    res.status(500).json({ message: 'Failed to analyze resume', error: err.message });
  }
};

module.exports = { getProfile, updateProfile, addSkill, removeSkill, searchStudents, getStudentById, getResumeMatches };
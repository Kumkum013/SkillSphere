const Project = require('../models/project');
const Skill = require('../models/skill');
const User = require('../models/User');
const JoinRequest = require('../models/joinRequest');
const Task = require('../models/task');
const { cacheDel, cacheDelPattern } = require('../config/redis');

const createProject = async (req, res) => {
  try {
    const { 
      title, 
      description, 
      requiredSkills, 
      minMatchScore,
      clientId,
      projectType,
      budget,
      actualCost,
      billingRate,
      invoiceStatus,
      startDate,
      endDate,
      estimatedHours,
      actualHours,
      milestones
    } = req.body;

    if (!title || !description) {
      return res.status(400).json({ message: 'Title and description are required' });
    }

    if (!Array.isArray(requiredSkills) || requiredSkills.length === 0) {
      return res.status(400).json({ message: 'requiredSkills must be a non-empty array of { skillName, weight }' });
    }
    const resolvedSkills = [];
    for (const item of requiredSkills) {
      let skill = await Skill.findOne({ name: item.skillName.trim() });
      if (!skill) {
        skill = await Skill.create({ name: item.skillName.trim() });
      }
      resolvedSkills.push({
        skillId: skill._id,
        name: skill.name,
        weight: item.weight || 1
      });
    }

    const owner = await User.findById(req.user.id).select('name');
    const project = await Project.create({
      title,
      description,
      ownerId: req.user.id,
      requiredSkills: resolvedSkills,
      minMatchScore: minMatchScore || 50,
      members: [{ userId: req.user.id, name: owner?.name || 'Owner' }],
      clientId: clientId || null,
      projectType: projectType || 'ACADEMIC',
      budget: budget || 0,
      actualCost: actualCost || 0,
      billingRate: billingRate || 0,
      invoiceStatus: invoiceStatus || 'NOT_BILLED',
      startDate: startDate || null,
      endDate: endDate || null,
      estimatedHours: estimatedHours || 0,
      actualHours: actualHours || 0,
      milestones: milestones || []
    });

    await cacheDelPattern('project-recommendations:*');

    res.status(201).json({ message: 'Project created', project });
  } catch (err) {
    res.status(500).json({ message: 'Failed to create project', error: err.message });
  }
};

const listProjects = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const scope = req.query.scope || 'all';
    const filter = scope === 'my'
      ? { ownerId: req.user.id }
      : scope === 'joined'
        ? { 'members.userId': req.user.id, ownerId: { $ne: req.user.id } }
        : { status: { $nin: ['CLOSED', 'COMPLETED'] } };
    const projects = await Project.find(filter)
      .populate('ownerId', 'name email avatarUrl')
      .populate('members.userId', 'name email avatarUrl branch')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Project.countDocuments(filter);

    const user = await User.findById(req.user.id).select('skills availability');
    const userSkillIds = user?.skills?.map((s) => s.skillId.toString()) || [];

    const userWorkload = await Task.countDocuments({
      assignedTo: req.user.id,
      status: { $in: ['TODO', 'IN_PROGRESS', 'PENDING_REVIEW'] }
    });

    const projectsWithScores = projects.map((project) => {
      if (scope === 'my' || scope === 'joined') {
        return { ...project.toObject(), matchScore: null, matchedSkills: [] };
      }

      let matchedWeight = 0;
      let totalWeight = 0;
      const matchedSkills = [];

      for (const req of project.requiredSkills) {
        totalWeight += req.weight;

        const hasSkill = userSkillIds.includes(req.skillId.toString());
        if (hasSkill) {
          matchedWeight += req.weight;
          matchedSkills.push(req.name);
        }
      }

      const skillScore = totalWeight > 0 ? Math.round((matchedWeight / totalWeight) * 100) : 0;

      const workloadScore = Math.max(0, 100 - (userWorkload * 20));

      const availabilityScore = user.availability === 'available' ? 100 : 30;

      const matchScore = Math.round(
        (skillScore * 0.5) +
        (workloadScore * 0.3) +
        (availabilityScore * 0.2)
      );

      return {
        ...project.toObject(),
        matchScore,
        matchedSkills
      };
    });

    res.status(200).json({
      projects: projectsWithScores,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) }
    });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch projects', error: err.message });
  }
};

const getProjectById = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id)
      .populate('ownerId', 'name email avatarUrl')
      .populate('members.userId', 'name email avatarUrl branch year skills')
      .populate('clientId', 'name email company');
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }
    const joinRequest = await JoinRequest.findOne({ userId: req.user.id, projectId: project._id }).select('status createdAt');
    const isMember = project.members.some((member) => member.userId?._id?.toString() === req.user.id || member.userId?.toString() === req.user.id);
    const isOwner = project.ownerId?._id?.toString() === req.user.id || project.ownerId?.toString() === req.user.id;

    let matchScore = null;
    let matchedSkills = [];

    if (!isOwner && !isMember) {
      const user = await User.findById(req.user.id).select('skills availability');
      const userSkillIds = user?.skills?.map((s) => s.skillId.toString()) || [];

      const userWorkload = await Task.countDocuments({
        assignedTo: req.user.id,
        status: { $in: ['TODO', 'IN_PROGRESS', 'PENDING_REVIEW'] }
      });

      let matchedWeight = 0;
      let totalWeight = 0;

      for (const req of project.requiredSkills) {
        totalWeight += req.weight;

        const hasSkill = userSkillIds.includes(req.skillId.toString());
        if (hasSkill) {
          matchedWeight += req.weight;
          matchedSkills.push(req.name);
        }
      }

      const skillScore = totalWeight > 0 ? Math.round((matchedWeight / totalWeight) * 100) : 0;

      const workloadScore = Math.max(0, 100 - (userWorkload * 20));

      const availabilityScore = user.availability === 'available' ? 100 : 30;

      matchScore = Math.round(
        (skillScore * 0.5) +
        (workloadScore * 0.3) +
        (availabilityScore * 0.2)
      );
    }

    res.status(200).json({
      project,
      relationship: { isOwner, isMember, joinRequest },
      matchScore,
      matchedSkills
    });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch project', error: err.message });
  }
};

const updateProject = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    if (project.ownerId.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Only the project owner can update this project' });
    }

    const { 
      title, 
      description, 
      status,
      clientId,
      projectType,
      budget,
      actualCost,
      billingRate,
      invoiceStatus,
      startDate,
      endDate,
      estimatedHours,
      actualHours,
      milestones
    } = req.body;
    
    if (title) project.title = title;
    if (description) project.description = description;
    if (status) project.status = status;
    if (clientId !== undefined) project.clientId = clientId;
    if (projectType) project.projectType = projectType;
    if (budget !== undefined) project.budget = budget;
    if (actualCost !== undefined) project.actualCost = actualCost;
    if (billingRate !== undefined) project.billingRate = billingRate;
    if (invoiceStatus) project.invoiceStatus = invoiceStatus;
    if (startDate !== undefined) project.startDate = startDate;
    if (endDate !== undefined) project.endDate = endDate;
    if (estimatedHours !== undefined) project.estimatedHours = estimatedHours;
    if (actualHours !== undefined) project.actualHours = actualHours;
    if (milestones !== undefined) project.milestones = milestones;

    await project.save();

    await cacheDel(`recommendations:${project._id}`);
    await cacheDelPattern('project-recommendations:*');

    res.status(200).json({ message: 'Project updated', project });
  } catch (err) {
    res.status(500).json({ message: 'Failed to update project', error: err.message });
  }
};

const deleteProject = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    if (project.ownerId.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Only the project owner can delete this project' });
    }

    await Project.findByIdAndDelete(req.params.id);
    await cacheDel(`recommendations:${req.params.id}`);
    await cacheDelPattern('project-recommendations:*');
    res.status(200).json({ message: 'Project deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to delete project', error: err.message });
  }
};

const addMilestone = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    if (project.ownerId.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Only the project owner can add milestones' });
    }

    const { title, description, dueDate } = req.body;

    if (!title) {
      return res.status(400).json({ message: 'Title is required' });
    }

    project.milestones.push({
      title,
      description,
      dueDate: dueDate || null,
      status: 'PENDING'
    });

    await project.save();

    res.status(201).json({ message: 'Milestone added', project });
  } catch (err) {
    res.status(500).json({ message: 'Failed to add milestone', error: err.message });
  }
};

const updateMilestone = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    if (project.ownerId.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Only the project owner can update milestones' });
    }

    const { milestoneIndex } = req.params;
    const { title, description, dueDate, status } = req.body;

    if (!project.milestones[milestoneIndex]) {
      return res.status(404).json({ message: 'Milestone not found' });
    }

    if (title) project.milestones[milestoneIndex].title = title;
    if (description !== undefined) project.milestones[milestoneIndex].description = description;
    if (dueDate !== undefined) project.milestones[milestoneIndex].dueDate = dueDate;
    if (status) {
      project.milestones[milestoneIndex].status = status;
      if (status === 'COMPLETED') {
        project.milestones[milestoneIndex].completedAt = new Date();
      }
    }

    await project.save();

    res.status(200).json({ message: 'Milestone updated', project });
  } catch (err) {
    res.status(500).json({ message: 'Failed to update milestone', error: err.message });
  }
};

const deleteMilestone = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    if (project.ownerId.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Only the project owner can delete milestones' });
    }

    const { milestoneIndex } = req.params;

    if (!project.milestones[milestoneIndex]) {
      return res.status(404).json({ message: 'Milestone not found' });
    }

    project.milestones.splice(milestoneIndex, 1);
    await project.save();

    res.status(200).json({ message: 'Milestone deleted', project });
  } catch (err) {
    res.status(500).json({ message: 'Failed to delete milestone', error: err.message });
  }
};

module.exports = { createProject, listProjects, getProjectById, updateProject, deleteProject, addMilestone, updateMilestone, deleteMilestone };
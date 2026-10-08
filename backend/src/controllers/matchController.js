const Project = require('../models/project');
const User = require('../models/User');
const Task = require('../models/task');
const { cacheGet, cacheSet, cacheDel } = require('../config/redis');

const getRecommendations = async (req, res) => {
  try {
    const projectId = req.params.id;
    const cacheKey = `recommendations:${projectId}`;

    const cached = await cacheGet(cacheKey);
    if (cached) {
      res.setHeader('X-Cache', 'HIT');
      return res.status(200).json(cached);
    }
    res.setHeader('X-Cache', 'MISS');

    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    const requiredSkillIds = project.requiredSkills.map((s) => s.skillId.toString());

    const existingMemberIds = project.members.map((m) => m.userId.toString());

    const candidates = await User.find({
      role: 'STUDENT',
      _id: { $nin: existingMemberIds },
      'skills.skillId': { $in: requiredSkillIds }
    }).select('-password');

    const userIds = candidates.map((c) => c._id);

    const workloadData = await Task.aggregate([
      {
        $match: {
          assignedTo: { $in: userIds },
          status: { $in: ['TODO', 'IN_PROGRESS', 'PENDING_REVIEW'] }
        }
      },
      {
        $group: {
          _id: '$assignedTo',
          activeTasks: { $sum: 1 }
        }
      }
    ]);

    const workloadMap = new Map();
    workloadData.forEach((item) => {
      workloadMap.set(item._id.toString(), item.activeTasks);
    });

    const minScoreQuery = parseInt(req.query.minScore) || 0;

    const scored = candidates.map((student) => {
      let matchedWeight = 0;
      let totalWeight = 0;
      const matchedSkills = [];
      const missingSkills = [];
      let totalEndorsements = 0;

      for (const reqSkill of project.requiredSkills) {
        totalWeight += reqSkill.weight;

        const studentSkill = student.skills.find(
          (s) => s.skillId && s.skillId.toString() === reqSkill.skillId.toString()
        );

        if (studentSkill) {
          // Proficiency weighting: Level 1 (52%) to Level 5 (100%)
          const levelMultiplier = 0.4 + (0.6 * ((studentSkill.level || 3) / 5));
          matchedWeight += reqSkill.weight * levelMultiplier;
          matchedSkills.push({
            name: reqSkill.name,
            level: studentSkill.level || 1,
            endorsed: (studentSkill.endorsedBy && studentSkill.endorsedBy.length > 0)
          });
          if (studentSkill.endorsedBy && studentSkill.endorsedBy.length > 0) {
            totalEndorsements += studentSkill.endorsedBy.length;
          }
        } else {
          missingSkills.push({
            name: reqSkill.name,
            weight: reqSkill.weight
          });
        }
      }

      let skillScore = totalWeight > 0 ? Math.round((matchedWeight / totalWeight) * 100) : 0;
      const endorsementBonus = Math.min(totalEndorsements * 3, 10); // Up to +10 bonus for verified skills
      skillScore = Math.min(skillScore + endorsementBonus, 100);

      const activeTasks = workloadMap.get(student._id.toString()) || 0;
      const workloadScore = Math.max(10, 100 - (activeTasks * 20));
      const availabilityScore = student.availability === 'available' ? 100 : 40;

      const finalScore = Math.round(
        (skillScore * 0.5) +
        (workloadScore * 0.3) +
        (availabilityScore * 0.2)
      );

      return {
        student: {
          id: student._id,
          name: student.name,
          email: student.email,
          branch: student.branch,
          year: student.year,
          availability: student.availability,
          skills: student.skills
        },
        matchScore: finalScore,
        isEligible: finalScore >= (project.minMatchScore || 50),
        matchedSkills,
        missingSkills,
        breakdown: {
          skillScore,
          workloadScore,
          availabilityScore,
          endorsementBonus,
          activeTasks
        }
      };
    });

    const filteredScored = scored
      .filter((s) => s.matchScore >= minScoreQuery)
      .sort((a, b) => b.matchScore - a.matchScore);

    const response = {
      project: {
        id: project._id,
        title: project.title,
        minMatchScore: project.minMatchScore || 50,
        isFacultyApproved: project.isFacultyApproved
      },
      recommendations: filteredScored
    };

    await cacheSet(cacheKey, response, 1800);

    res.status(200).json(response);
  } catch (err) {
    res.status(500).json({ message: 'Failed to generate recommendations', error: err.message });
  }
};

const getProjectRecommendations = async (req, res) => {
  try {
    const userId = req.user.id;
    const cacheKey = `project-recommendations:${userId}`;

    const cached = await cacheGet(cacheKey);
    if (cached) {
      res.setHeader('X-Cache', 'HIT');
      return res.status(200).json(cached);
    }
    res.setHeader('X-Cache', 'MISS');

    const user = await User.findById(userId).select('skills availability year branch');
    if (!user) return res.status(404).json({ message: 'User not found' });

    const skillMap = new Map();
    user.skills.forEach((s) => {
      if (s.skillId) {
        skillMap.set(s.skillId.toString(), s);
      }
    });

    const skillIds = Array.from(skillMap.keys());

    const projects = await Project.find({
      status: { $nin: ['CLOSED', 'COMPLETED'] },
      ownerId: { $ne: userId },
      'members.userId': { $ne: userId },
      'requiredSkills.skillId': { $in: skillIds }
    }).populate('ownerId', 'name avatarUrl role').populate('mentorId', 'name email').sort({ createdAt: -1 });

    const userWorkload = await Task.countDocuments({
      assignedTo: userId,
      status: { $in: ['TODO', 'IN_PROGRESS', 'PENDING_REVIEW'] }
    });

    const recommendations = projects.map((project) => {
      let matchedWeight = 0;
      let totalWeight = 0;
      const matchedSkills = [];
      const missingSkills = [];
      let totalEndorsements = 0;

      for (const reqSkill of project.requiredSkills) {
        totalWeight += reqSkill.weight;

        const studentSkill = skillMap.get(reqSkill.skillId.toString());
        if (studentSkill) {
          const levelMultiplier = 0.4 + (0.6 * ((studentSkill.level || 3) / 5));
          matchedWeight += reqSkill.weight * levelMultiplier;
          matchedSkills.push(reqSkill.name);
          if (studentSkill.endorsedBy && studentSkill.endorsedBy.length > 0) {
            totalEndorsements += studentSkill.endorsedBy.length;
          }
        } else {
          missingSkills.push(reqSkill.name);
        }
      }

      let skillScore = totalWeight > 0 ? Math.round((matchedWeight / totalWeight) * 100) : 0;
      const endorsementBonus = Math.min(totalEndorsements * 3, 10);
      skillScore = Math.min(skillScore + endorsementBonus, 100);

      const workloadScore = Math.max(10, 100 - (userWorkload * 20));
      const availabilityScore = user.availability === 'available' ? 100 : 40;

      const matchScore = Math.round(
        (skillScore * 0.5) +
        (workloadScore * 0.3) +
        (availabilityScore * 0.2)
      );

      return {
        project,
        matchedSkills,
        missingSkills,
        matchScore,
        isEligible: matchScore >= (project.minMatchScore || 50),
        breakdown: {
          skillScore,
          workloadScore,
          availabilityScore,
          endorsementBonus
        }
      };
    }).sort((a, b) => b.matchScore - a.matchScore);

    const response = { recommendations };

    await cacheSet(cacheKey, response, 1800);

    res.status(200).json(response);
  } catch (err) {
    res.status(500).json({ message: 'Failed to generate project recommendations', error: err.message });
  }
};

module.exports = { getRecommendations, getProjectRecommendations };
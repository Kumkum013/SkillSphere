const Invitation = require('../models/invitation');
const Project = require('../models/project');
const User = require('../models/User');
const Task = require('../models/task');
const { cacheDel } = require('../config/redis');
const { sendInvitationEmail, sendDecisionEmail } = require('../services/emailService');

const sendInvitation = async (req, res) => {
  try {
    const { projectId, studentId } = req.body;

    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    if (project.ownerId.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Only the project owner can send invitations' });
    }

    const alreadyMember = project.members.some((m) => m.userId.toString() === studentId);
    if (alreadyMember) {
      return res.status(400).json({ message: 'Student is already a team member' });
    }

    const student = await User.findById(studentId).select('name email');
    const owner = await User.findById(req.user.id).select('name');
    if (!student) return res.status(404).json({ message: 'Student not found' });

    const existingInvite = await Invitation.findOne({ projectId, studentId, status: 'PENDING' });
    if (existingInvite) {
      return res.status(400).json({ message: 'Invitation already sent and pending' });
    }

    const invitation = await Invitation.create({ projectId, studentId });
    const email = await sendInvitationEmail({ recipient: student, project, owner, invitationId: invitation._id });
    if (!email.sent) {
      await invitation.deleteOne();
      console.error('Project invitation email was not delivered:', email.reason || email.error);
      return res.status(503).json({
        message: email.reason || 'Could not deliver invitation email. Please check SMTP configuration and try again.',
        emailSent: false
      });
    }
    res.status(201).json({ message: 'Invitation sent by email', invitation, emailSent: true });
  } catch (err) {
    res.status(500).json({ message: 'Failed to send invitation', error: err.message });
  }
};

const getMyInvitations = async (req, res) => {
  try {
    const invitations = await Invitation.find({ studentId: req.user.id, status: 'PENDING' })
      .populate('projectId', 'title description status');

    res.status(200).json({ invitations });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch invitations', error: err.message });
  }
};

const respondToInvitation = async (req, res) => {
  try {
    const { response } = req.body;

    if (!['ACCEPTED', 'REJECTED'].includes(response)) {
      return res.status(400).json({ message: 'response must be ACCEPTED or REJECTED' });
    }

    const invitation = await Invitation.findById(req.params.id);
    if (!invitation) {
      return res.status(404).json({ message: 'Invitation not found' });
    }

    if (invitation.studentId.toString() !== req.user.id) {
      return res.status(403).json({ message: 'This invitation does not belong to you' });
    }

    if (invitation.status !== 'PENDING') {
      return res.status(400).json({ message: 'This invitation has already been responded to' });
    }

    invitation.status = response;
    await invitation.save();

    if (response === 'ACCEPTED') {
      const user = await User.findById(req.user.id).select('name');
      await Project.findByIdAndUpdate(invitation.projectId, {
        $push: { members: { userId: req.user.id, name: user?.name || 'Member' } }
      });
      await cacheDel(`recommendations:${invitation.projectId}`);
      await cacheDel(`project-recommendations:${req.user.id}`);
    }

    // Notify project owner by email
    const project = await Project.findById(invitation.projectId).select('title ownerId');
    if (project && project.ownerId) {
      const owner = await User.findById(project.ownerId).select('name email');
      if (owner && owner.email) {
        sendDecisionEmail({ recipient: owner, project, decision: response, senderName: req.user.name })
          .catch((err) => console.error('Owner email notification error:', err.message));
      }
    }

    res.status(200).json({ message: `Invitation ${response.toLowerCase()}`, invitation });
  } catch (err) {
    res.status(500).json({ message: 'Failed to respond to invitation', error: err.message });
  }
};

const sendBulkInvitations = async (req, res) => {
  try {
    const { projectId, studentIds, minScore } = req.body;

    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    if (project.ownerId.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Only the project owner can send invitations' });
    }

    const requiredSkillIds = project.requiredSkills.map((s) => s.skillId.toString());
    const existingMemberIds = project.members.map((m) => m.userId.toString());

    const candidates = await User.find({
      role: 'STUDENT',
      _id: { $in: studentIds, $nin: existingMemberIds },
      'skills.skillId': { $in: requiredSkillIds }
    }).select('-password');

    const workloadData = await Task.aggregate([
      {
        $match: {
          assignedTo: { $in: studentIds },
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

    const scored = candidates.map((student) => {
      let matchedWeight = 0;
      let totalWeight = 0;

      for (const req of project.requiredSkills) {
        totalWeight += req.weight;

        const hasSkill = student.skills.some(
          (s) => s.skillId.toString() === req.skillId.toString()
        );
        if (hasSkill) {
          matchedWeight += req.weight;
        }
      }

      const skillScore = totalWeight > 0 ? Math.round((matchedWeight / totalWeight) * 100) : 0;

      const activeTasks = workloadMap.get(student._id.toString()) || 0;
      const workloadScore = Math.max(0, 100 - (activeTasks * 20));

      const availabilityScore = student.availability === 'available' ? 100 : 30;

      const finalScore = Math.round(
        (skillScore * 0.5) +
        (workloadScore * 0.3) +
        (availabilityScore * 0.2)
      );

      return {
        student,
        matchScore: finalScore
      };
    });

    const filteredCandidates = scored.filter((c) => c.matchScore >= minScore);

    const invitations = [];
    const failedEmails = [];
    const owner = await User.findById(req.user.id).select('name');

    for (const candidate of filteredCandidates) {
      const existingInvite = await Invitation.findOne({
        projectId,
        studentId: candidate.student._id,
        status: 'PENDING'
      });

      if (!existingInvite) {
        const invitation = await Invitation.create({
          projectId,
          studentId: candidate.student._id
        });

        const email = await sendInvitationEmail({
          recipient: candidate.student,
          project,
          owner,
          invitationId: invitation._id
        });
        if (!email.sent) {
          await invitation.deleteOne();
          failedEmails.push(candidate.student.name);
          console.error(`Bulk invitation email was not delivered to ${candidate.student.email}:`, email.reason || email.error);
          continue;
        }

        invitations.push({
          invitation,
          studentId: candidate.student._id,
          matchScore: candidate.matchScore
        });
      }
    }

    res.status(201).json({
      message: `Delivered ${invitations.length} invitations to candidates with ${minScore}%+ match score`,
      invitations,
      totalSent: invitations.length,
      failedEmails
    });
  } catch (err) {
    res.status(500).json({ message: 'Failed to send bulk invitations', error: err.message });
  }
};

module.exports = { sendInvitation, getMyInvitations, respondToInvitation, sendBulkInvitations };
const JoinRequest = require('../models/joinRequest');
const Project = require('../models/project');
const User = require('../models/User');
const Notification = require('../models/notification');
const { cacheDel } = require('../config/redis');
const { sendJoinRequestEmail, sendDecisionEmail } = require('../services/emailService');

const isOwner = (project, userId) => project.ownerId.toString() === userId;

const requestToJoin = async (req, res) => {
  try {
    const project = await Project.findById(req.params.projectId);
    if (!project) return res.status(404).json({ message: 'Project not found' });
    if (project.status !== 'OPEN') return res.status(400).json({ message: 'This project is not accepting join requests' });
    if (isOwner(project, req.user.id)) return res.status(400).json({ message: 'Project owners cannot request to join their own project' });
    if (project.members.some((member) => member.userId.toString() === req.user.id)) {
      return res.status(400).json({ message: 'You are already a member of this project' });
    }

    const existingRequest = await JoinRequest.findOne({ userId: req.user.id, projectId: project._id });
    if (existingRequest?.status === 'PENDING') return res.status(409).json({ message: 'Join request is already pending', request: existingRequest });
    if (existingRequest?.status === 'ACCEPTED') return res.status(400).json({ message: 'Join request was already accepted' });

    const request = existingRequest
      ? await JoinRequest.findByIdAndUpdate(existingRequest._id, { status: 'PENDING', createdAt: new Date() }, { new: true })
      : await JoinRequest.create({ userId: req.user.id, projectId: project._id });
    const requester = await User.findById(req.user.id).select('name email');
    const owner = await User.findById(project.ownerId).select('name email');

    await Notification.create({
      userId: project.ownerId,
      type: 'JOIN_REQUEST',
      projectId: project._id,
      message: `${requester.name} wants to join "${project.title}".`
    });

    const email = owner?.email
      ? await sendJoinRequestEmail({ owner, requester, project })
      : { sent: false, reason: 'Project owner email address is unavailable' };
    if (!email.sent) {
      console.error('Join request email was not delivered:', email.reason || email.error);
    }

    res.status(201).json({
      message: email.sent ? 'Join request sent and project owner emailed' : 'Join request sent, but owner email could not be delivered',
      request,
      emailSent: email.sent
    });
  } catch (err) {
    if (err.code === 11000) return res.status(409).json({ message: 'Join request is already pending' });
    res.status(500).json({ message: 'Failed to create join request', error: err.message });
  }
};

const getProjectJoinRequestState = async (req, res) => {
  try {
    const request = await JoinRequest.findOne({ userId: req.user.id, projectId: req.params.projectId }).select('status createdAt');
    res.json({ request: request || null });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch join request state', error: err.message });
  }
};

const listOwnerJoinRequests = async (req, res) => {
  try {
    const project = await Project.findById(req.params.projectId);
    if (!project) return res.status(404).json({ message: 'Project not found' });
    if (!isOwner(project, req.user.id)) return res.status(403).json({ message: 'Only the project owner can view join requests' });
    const requests = await JoinRequest.find({ projectId: project._id, status: 'PENDING' })
      .populate('userId', 'name email avatarUrl branch year skills')
      .populate('projectId', 'title')
      .sort({ createdAt: -1 });
    res.json({ requests });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch join requests', error: err.message });
  }
};

const decideJoinRequest = async (req, res) => {
  try {
    const { decision } = req.body;
    if (!['ACCEPTED', 'REJECTED'].includes(decision)) return res.status(400).json({ message: 'decision must be ACCEPTED or REJECTED' });
    const request = await JoinRequest.findById(req.params.requestId).populate('userId', 'name').populate('projectId', 'title ownerId status');
    if (!request) return res.status(404).json({ message: 'Join request not found' });
    if (!isOwner(request.projectId, req.user.id)) return res.status(403).json({ message: 'Only the project owner can decide join requests' });
    if (request.status !== 'PENDING') return res.status(400).json({ message: 'Join request has already been decided' });

    request.status = decision;
    await request.save();
    if (decision === 'ACCEPTED') {
      await Project.updateOne(
        { _id: request.projectId._id, 'members.userId': { $ne: request.userId._id } },
        { $push: { members: { userId: request.userId._id, name: request.userId.name } } }
      );
      await cacheDel(`recommendations:${request.projectId._id}`);
      await cacheDel(`project-recommendations:${request.userId._id}`);
    }
    await Notification.create({
      userId: request.userId._id,
      type: decision === 'ACCEPTED' ? 'JOIN_REQUEST_ACCEPTED' : 'JOIN_REQUEST_REJECTED',
      projectId: request.projectId._id,
      message: decision === 'ACCEPTED'
        ? `Your request to join "${request.projectId.title}" was accepted.`
        : `Your request to join "${request.projectId.title}" was rejected.`
    });

    const applicant = await User.findById(request.userId._id).select('name email');
    const email = applicant?.email
      ? await sendDecisionEmail({ recipient: applicant, project: request.projectId, decision })
      : { sent: false, reason: 'Applicant email address is unavailable' };
    if (!email.sent) {
      console.error('Join request decision email was not delivered:', email.reason || email.error);
    }

    res.json({
      message: email.sent
        ? `Join request ${decision.toLowerCase()} and applicant emailed`
        : `Join request ${decision.toLowerCase()}, but applicant email could not be delivered`,
      request,
      emailSent: email.sent
    });
  } catch (err) {
    res.status(500).json({ message: 'Failed to decide join request', error: err.message });
  }
};

module.exports = { requestToJoin, getProjectJoinRequestState, listOwnerJoinRequests, decideJoinRequest };

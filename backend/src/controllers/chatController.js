const mongoose = require('mongoose');
const Project = require('../models/project');
const Message = require('../models/message');

const normalizeUserId = (value) => {
  if (value == null) return '';
  if (typeof value === 'string') return value;
  if (typeof value === 'object' && value._id) return value._id.toString();
  return value.toString();
};

const isProjectMember = (project, userId) => {
  const memberId = normalizeUserId(userId);
  if (!memberId) return false;
  if (normalizeUserId(project.ownerId) === memberId) return true;

  return (project.members || []).some((member) => {
    const candidate = member?.userId ?? member;
    const memberCandidateId = candidate && typeof candidate === 'object' && candidate._id
      ? normalizeUserId(candidate._id)
      : normalizeUserId(candidate);
    return memberCandidateId === memberId;
  });
};

const normalizeMessageText = (value) => {
  const message = typeof value === 'string' ? value.trim() : '';
  if (!message) {
    throw new Error('Message is required');
  }
  if (message.length > 2000) {
    throw new Error('Message is too long');
  }
  return message;
};

const getProjectWithMembership = async (projectId, userId) => {
  const project = await Project.findById(projectId).populate('ownerId', 'name avatarUrl').populate('members.userId', 'name avatarUrl');
  if (!project) {
    throw new Error('Project not found');
  }
  if (!isProjectMember(project, userId)) {
    const err = new Error('Only project members can access this chat');
    err.statusCode = 403;
    throw err;
  }
  return project;
};

const getProjectMessages = async (req, res) => {
  try {
    const project = await getProjectWithMembership(req.params.projectId, req.user.id);
    const messages = await Message.find({ project: project._id, receiver: null })
      .populate('sender', 'name avatarUrl')
      .sort({ createdAt: 1 });

    res.status(200).json({ messages });
  } catch (err) {
    const status = err.statusCode || 500;
    const response = status === 500 ? { message: 'Failed to fetch project messages', error: err.message } : { message: err.message };
    res.status(status).json(response);
  }
};

const sendProjectMessage = async (req, res) => {
  try {
    const project = await getProjectWithMembership(req.params.projectId, req.user.id);
    const trimmedMessage = normalizeMessageText(req.body?.message ?? req.body?.body);

    const message = await Message.create({
      sender: req.user.id,
      receiver: null,
      project: project._id,
      message: trimmedMessage
    });

    const populated = await message.populate('sender', 'name avatarUrl');
    res.status(201).json({ message: populated });
  } catch (err) {
    const status = err.statusCode || 500;
    const response = status === 500 ? { message: 'Failed to send project message', error: err.message } : { message: err.message };
    res.status(status).json(response);
  }
};

const getPrivateMessages = async (req, res) => {
  try {
    const project = await getProjectWithMembership(req.params.projectId, req.user.id);
    const otherUserId = String(req.params.userId || '').trim();

    if (!otherUserId || !mongoose.Types.ObjectId.isValid(otherUserId) || otherUserId === String(req.user.id)) {
      return res.status(400).json({ message: 'Invalid user ID' });
    }

    if (!isProjectMember(project, otherUserId)) {
      return res.status(403).json({ message: 'You can only message project members' });
    }

    const messages = await Message.find({
      project: project._id,
      receiver: { $ne: null },
      $or: [
        { sender: req.user.id, receiver: otherUserId },
        { sender: otherUserId, receiver: req.user.id }
      ]
    })
      .populate('sender', 'name avatarUrl')
      .populate('receiver', 'name avatarUrl')
      .sort({ createdAt: 1 });

    res.status(200).json({ messages });
  } catch (err) {
    const status = err.statusCode || 500;
    const response = status === 500 ? { message: 'Failed to fetch private messages', error: err.message } : { message: err.message };
    res.status(status).json(response);
  }
};

const sendPrivateMessage = async (req, res) => {
  try {
    const project = await getProjectWithMembership(req.params.projectId, req.user.id);
    const otherUserId = String(req.params.userId || '').trim();

    if (!otherUserId || !mongoose.Types.ObjectId.isValid(otherUserId) || otherUserId === String(req.user.id)) {
      return res.status(400).json({ message: 'You cannot message yourself or use an invalid user ID' });
    }

    if (!isProjectMember(project, otherUserId)) {
      return res.status(403).json({ message: 'You can only message project members' });
    }

    const trimmedMessage = normalizeMessageText(req.body?.message ?? req.body?.body);

    const message = await Message.create({
      sender: req.user.id,
      receiver: otherUserId,
      project: project._id,
      message: trimmedMessage
    });

    const populated = await message.populate([
      { path: 'sender', select: 'name avatarUrl' },
      { path: 'receiver', select: 'name avatarUrl' }
    ]);
    res.status(201).json({ message: populated });
  } catch (err) {
    const status = err.statusCode || 500;
    const response = status === 500 ? { message: 'Failed to send private message', error: err.message } : { message: err.message };
    res.status(status).json(response);
  }
};

module.exports = {
  getProjectMessages,
  sendProjectMessage,
  getPrivateMessages,
  sendPrivateMessage
};

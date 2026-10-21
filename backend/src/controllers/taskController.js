const Task = require('../models/task');
const Project = require('../models/project');
const Notification = require('../models/notification');
const { cacheDel, cacheDelPattern } = require('../config/redis');

const isMember = (project, userId) => project.members.some((member) => member.userId.toString() === userId);
const isOwner = (project, userId) => project.ownerId.toString() === userId;
const canViewProjectTasks = (project, user) => (
  isOwner(project, user.id) ||
  isMember(project, user.id) ||
  (['FACULTY', 'ADMIN'].includes(user.role) && project.mentorId?.toString() === user.id)
);
const loadProject = async (projectId, res) => {
  const project = await Project.findById(projectId);
  if (!project) res.status(404).json({ message: 'Project not found' });
  return project;
};

const createTask = async (req, res) => {
  try {
    const { projectId, title, description, requiredSkill, deadline, assignedTo } = req.body;
    if (!projectId || !title) return res.status(400).json({ message: 'projectId and title are required' });
    const project = await loadProject(projectId, res);
    if (!project || !isOwner(project, req.user.id)) return res.status(403).json({ message: 'Only the project owner can create tasks' });
    if (assignedTo && !isMember(project, assignedTo)) return res.status(400).json({ message: 'assignedTo must be a project member' });
    const task = await Task.create({ projectId, title, description, requiredSkill, deadline, assignedTo, assignedBy: req.user.id });
    const populated = await Task.findById(task._id).populate('assignedTo', 'name email avatarUrl').populate('assignedBy', 'name avatarUrl');

    if (assignedTo) {
      await cacheDel(`recommendations:${projectId}`);
      await cacheDel(`project-recommendations:${assignedTo}`);
    }

    res.status(201).json({ message: 'Task created', task: populated });
  } catch (err) { res.status(500).json({ message: 'Failed to create task', error: err.message }); }
};

const listProjectTasks = async (req, res) => {
  try {
    const project = await loadProject(req.params.projectId, res);
    if (!project || !canViewProjectTasks(project, req.user)) return res.status(403).json({ message: 'Only project members, owners, or the assigned faculty mentor can view tasks' });
    const tasks = await Task.find({ projectId: req.params.projectId }).populate('assignedTo', 'name email avatarUrl').populate('assignedBy', 'name avatarUrl').sort({ createdAt: -1 });
    res.status(200).json({ tasks });
  } catch (err) { res.status(500).json({ message: 'Failed to fetch tasks', error: err.message }); }
};

const getMyTasks = async (req, res) => {
  try {
    const tasks = await Task.find({ assignedTo: req.user.id }).populate('projectId', 'title ownerId').populate('assignedBy', 'name avatarUrl').sort({ deadline: 1, createdAt: -1 });
    res.status(200).json({ tasks });
  } catch (err) { res.status(500).json({ message: 'Failed to fetch tasks', error: err.message }); }
};

const updateTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ message: 'Task not found' });
    const project = await loadProject(task.projectId, res);
    if (!project || !isOwner(project, req.user.id)) return res.status(403).json({ message: 'Only the project owner can edit tasks' });
    ['title', 'description', 'requiredSkill', 'deadline', 'assignedTo'].forEach((field) => { if (req.body[field] !== undefined) task[field] = req.body[field]; });
    if (task.assignedTo && !isMember(project, task.assignedTo.toString())) return res.status(400).json({ message: 'assignedTo must be a project member' });
    await task.save();
    res.status(200).json({ message: 'Task updated', task });
  } catch (err) { res.status(500).json({ message: 'Failed to update task', error: err.message }); }
};

const deleteTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ message: 'Task not found' });
    const project = await loadProject(task.projectId, res);
    if (!project || !isOwner(project, req.user.id)) return res.status(403).json({ message: 'Only the project owner can delete tasks' });
    await task.deleteOne();
    res.status(200).json({ message: 'Task deleted' });
  } catch (err) { res.status(500).json({ message: 'Failed to delete task', error: err.message }); }
};

const updateTaskStatus = async (req, res) => {
  try {
    const { status } = req.body;
    if (!['TODO', 'IN_PROGRESS', 'PENDING_REVIEW', 'COMPLETED'].includes(status)) {
      return res.status(400).json({ message: 'Invalid task status' });
    }
    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ message: 'Task not found' });
    const project = await loadProject(task.projectId, res);
    if (!project || !isMember(project, req.user.id)) {
      return res.status(403).json({ message: 'Only project members can update this task' });
    }
    const owner = isOwner(project, req.user.id);
    const assignee = task.assignedTo && task.assignedTo.toString() === req.user.id;
    
    // If unassigned, assign to current member completing/starting it
    if (!task.assignedTo && !owner) {
      task.assignedTo = req.user.id;
    } else if (!owner && !assignee) {
      return res.status(403).json({ message: 'Only the assignee or owner can update this task' });
    }

    task.status = !owner && status === 'COMPLETED' ? 'PENDING_REVIEW' : status;
    task.completedAt = task.status === 'PENDING_REVIEW' || task.status === 'COMPLETED' ? new Date() : undefined;
    await task.save();
    if (task.assignedTo) {
      await cacheDel(`recommendations:${task.projectId}`);
      await cacheDel(`project-recommendations:${task.assignedTo}`);
    }
    if (!owner && task.status === 'PENDING_REVIEW') {
      await Notification.create({ userId: project.ownerId, type: 'TASK_COMPLETED', taskId: task._id, projectId: project._id, message: `${req.user.name || 'A teammate'} marked "${task.title}" complete in "${project.title}".` });
    }
    res.status(200).json({ message: 'Task status updated', task });
  } catch (err) { res.status(500).json({ message: 'Failed to update task', error: err.message }); }
};

module.exports = { createTask, listProjectTasks, getMyTasks, updateTask, deleteTask, updateTaskStatus };

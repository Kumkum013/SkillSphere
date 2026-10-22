const TimeEntry = require('../models/timeEntry');
const Project = require('../models/project');

const startTimeEntry = async (req, res) => {
  try {
    const { projectId, taskId, description, isBillable } = req.body;

    // Check if user has a running time entry
    const runningEntry = await TimeEntry.findOne({
      userId: req.user.id,
      status: 'RUNNING'
    });

    if (runningEntry) {
      return res.status(400).json({
        message: 'You already have a running time entry',
        runningEntry
      });
    }

    // Verify project exists and user is a member
    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    const isMember = project.members.some(m => m.userId.toString() === req.user.id);
    const isOwner = project.ownerId.toString() === req.user.id;

    if (!isMember && !isOwner) {
      return res.status(403).json({ message: 'You are not a member of this project' });
    }

    const timeEntry = await TimeEntry.create({
      userId: req.user.id,
      projectId,
      taskId: taskId || null,
      description: description || 'Work on project',
      startTime: new Date(),
      isBillable: isBillable !== undefined ? isBillable : true,
      status: 'RUNNING'
    });

    res.status(201).json({ message: 'Time entry started', timeEntry });
  } catch (err) {
    res.status(500).json({ message: 'Failed to start time entry', error: err.message });
  }
};

const stopTimeEntry = async (req, res) => {
  try {
    const { id } = req.params;

    const timeEntry = await TimeEntry.findById(id);
    if (!timeEntry) {
      return res.status(404).json({ message: 'Time entry not found' });
    }

    if (timeEntry.userId.toString() !== req.user.id) {
      return res.status(403).json({ message: 'You can only stop your own time entries' });
    }

    if (timeEntry.status !== 'RUNNING') {
      return res.status(400).json({ message: 'Time entry is not running' });
    }

    timeEntry.endTime = new Date();
    timeEntry.status = 'COMPLETED';
    await timeEntry.save();

    // Update project actual hours
    const project = await Project.findById(timeEntry.projectId);
    if (project) {
      project.actualHours += timeEntry.duration / 60; // Convert minutes to hours
      await project.save();
    }

    res.status(200).json({ message: 'Time entry stopped', timeEntry });
  } catch (err) {
    res.status(500).json({ message: 'Failed to stop time entry', error: err.message });
  }
};

const getTimeEntries = async (req, res) => {
  try {
    const { projectId, startDate, endDate, status } = req.query;

    const filter = { userId: req.user.id };

    if (projectId) {
      filter.projectId = projectId;
    }

    if (startDate || endDate) {
      filter.startTime = {};
      if (startDate) filter.startTime.$gte = new Date(startDate);
      if (endDate) filter.startTime.$lte = new Date(endDate);
    }

    if (status) {
      filter.status = status;
    }

    const timeEntries = await TimeEntry.find(filter)
      .populate('projectId', 'title')
      .populate('taskId', 'title')
      .sort({ startTime: -1 });

    res.status(200).json({ timeEntries });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch time entries', error: err.message });
  }
};

const updateTimeEntry = async (req, res) => {
  try {
    const { id } = req.params;
    const { description, isBillable, notes } = req.body;

    const timeEntry = await TimeEntry.findById(id);
    if (!timeEntry) {
      return res.status(404).json({ message: 'Time entry not found' });
    }

    if (timeEntry.userId.toString() !== req.user.id) {
      return res.status(403).json({ message: 'You can only update your own time entries' });
    }

    const updatedEntry = await TimeEntry.findByIdAndUpdate(
      id,
      { description, isBillable, notes },
      { new: true, runValidators: true }
    );

    res.status(200).json({ message: 'Time entry updated', timeEntry: updatedEntry });
  } catch (err) {
    res.status(500).json({ message: 'Failed to update time entry', error: err.message });
  }
};

const deleteTimeEntry = async (req, res) => {
  try {
    const { id } = req.params;

    const timeEntry = await TimeEntry.findById(id);
    if (!timeEntry) {
      return res.status(404).json({ message: 'Time entry not found' });
    }

    if (timeEntry.userId.toString() !== req.user.id) {
      return res.status(403).json({ message: 'You can only delete your own time entries' });
    }

    await TimeEntry.findByIdAndDelete(id);

    res.status(200).json({ message: 'Time entry deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to delete time entry', error: err.message });
  }
};

const getProjectTimeSummary = async (req, res) => {
  try {
    const { projectId } = req.params;

    const timeEntries = await TimeEntry.find({ projectId, status: 'COMPLETED' })
      .populate('userId', 'name email');

    const summary = {
      totalHours: 0,
      billableHours: 0,
      nonBillableHours: 0,
      byUser: {}
    };

    timeEntries.forEach(entry => {
      const hours = entry.duration / 60;
      summary.totalHours += hours;

      if (entry.isBillable) {
        summary.billableHours += hours;
      } else {
        summary.nonBillableHours += hours;
      }

      const userId = entry.userId._id.toString();
      if (!summary.byUser[userId]) {
        summary.byUser[userId] = {
          name: entry.userId.name,
          email: entry.userId.email,
          hours: 0,
          billableHours: 0
        };
      }
      summary.byUser[userId].hours += hours;
      if (entry.isBillable) {
        summary.byUser[userId].billableHours += hours;
      }
    });

    res.status(200).json({ summary });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch time summary', error: err.message });
  }
};

module.exports = {
  startTimeEntry,
  stopTimeEntry,
  getTimeEntries,
  updateTimeEntry,
  deleteTimeEntry,
  getProjectTimeSummary
};

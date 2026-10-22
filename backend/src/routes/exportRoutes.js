const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const Project = require('../models/project');
const TimeEntry = require('../models/timeEntry');
const Client = require('../models/client');

router.get('/projects/csv', protect, async (req, res) => {
  try {
    const projects = await Project.find({ ownerId: req.user.id })
      .populate('clientId', 'name company')
      .sort({ createdAt: -1 });

    const csv = [
      ['Project Title', 'Type', 'Status', 'Budget', 'Actual Cost', 'Client', 'Created Date'],
      ...projects.map(p => [
        p.title,
        p.projectType,
        p.status,
        p.budget || 0,
        p.actualCost || 0,
        p.clientId?.name || 'N/A',
        p.createdAt.toISOString().split('T')[0]
      ])
    ].map(row => row.join(',')).join('\n');

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=projects.csv');
    res.send(csv);
  } catch (err) {
    res.status(500).json({ message: 'Failed to export projects', error: err.message });
  }
});

router.get('/time-entries/csv', protect, async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const filter = { userId: req.user.id, status: 'COMPLETED' };

    if (startDate || endDate) {
      filter.startTime = {};
      if (startDate) filter.startTime.$gte = new Date(startDate);
      if (endDate) filter.startTime.$lte = new Date(endDate);
    }

    const timeEntries = await TimeEntry.find(filter)
      .populate('projectId', 'title')
      .sort({ startTime: -1 });

    const csv = [
      ['Date', 'Project', 'Description', 'Duration (minutes)', 'Billable', 'Status'],
      ...timeEntries.map(e => [
        e.startTime.toISOString().split('T')[0],
        e.projectId?.title || 'N/A',
        e.description,
        e.duration,
        e.isBillable ? 'Yes' : 'No',
        e.status
      ])
    ].map(row => row.join(',')).join('\n');

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=time-entries.csv');
    res.send(csv);
  } catch (err) {
    res.status(500).json({ message: 'Failed to export time entries', error: err.message });
  }
});

router.get('/clients/csv', protect, async (req, res) => {
  try {
    const clients = await Client.find({ createdBy: req.user.id })
      .sort({ createdAt: -1 });

    const csv = [
      ['Name', 'Email', 'Phone', 'Company', 'Industry', 'Status', 'Created Date'],
      ...clients.map(c => [
        c.name,
        c.email,
        c.phone || 'N/A',
        c.company || 'N/A',
        c.industry || 'N/A',
        c.status,
        c.createdAt.toISOString().split('T')[0]
      ])
    ].map(row => row.join(',')).join('\n');

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=clients.csv');
    res.send(csv);
  } catch (err) {
    res.status(500).json({ message: 'Failed to export clients', error: err.message });
  }
});

module.exports = router;

const express = require('express');
const router = express.Router();
const Project = require('../models/project');
const Client = require('../models/client');
const TimeEntry = require('../models/timeEntry');
const { protect } = require('../middleware/authMiddleware');

router.get('/project/:projectId', protect, async (req, res) => {
  try {
    const project = await Project.findById(req.params.projectId)
      .populate('clientId', 'name email company address')
      .populate('ownerId', 'name email');
    
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    if (project.ownerId.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Only project owner can generate invoices' });
    }

    // Get time entries for this project
    const timeEntries = await TimeEntry.find({
      projectId: project._id,
      status: 'COMPLETED',
      isBillable: true
    }).populate('userId', 'name email');

    // Calculate totals
    const totalHours = timeEntries.reduce((sum, entry) => sum + entry.duration / 60, 0);
    const totalAmount = totalHours * (project.billingRate || 0);

    // Group by user
    const byUser = {};
    timeEntries.forEach(entry => {
      const userId = entry.userId._id.toString();
      if (!byUser[userId]) {
        byUser[userId] = {
          name: entry.userId.name,
          email: entry.userId.email,
          hours: 0,
          entries: []
        };
      }
      byUser[userId].hours += entry.duration / 60;
      byUser[userId].entries.push(entry);
    });

    const invoiceData = {
      invoiceNumber: `INV-${Date.now()}`,
      invoiceDate: new Date().toISOString().split('T')[0],
      dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      client: project.clientId,
      project: {
        id: project._id,
        title: project.title,
        description: project.description
      },
      billingRate: project.billingRate || 0,
      totalHours,
      totalAmount,
      lineItems: Object.values(byUser).map(user => ({
        description: `${user.name} - Professional Services`,
        hours: user.hours,
        rate: project.billingRate || 0,
        amount: user.hours * (project.billingRate || 0)
      }))
    };

    res.status(200).json({ invoice: invoiceData });
  } catch (err) {
    res.status(500).json({ message: 'Failed to generate invoice', error: err.message });
  }
});

module.exports = router;

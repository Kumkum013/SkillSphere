const ActivityLog = require('../models/activityLog');

const logActivity = async (userId, action, description, options = {}) => {
  try {
    await ActivityLog.create({
      userId,
      action,
      description,
      entityType: options.entityType,
      entityId: options.entityId,
      ipAddress: options.ipAddress,
      userAgent: options.userAgent,
      metadata: options.metadata || {}
    });
  } catch (error) {
    console.error('Failed to log activity:', error);
  }
};

const getActivityLogs = async (req, res) => {
  try {
    const { userId, action, entityType, page = 1, limit = 50 } = req.query;
    const skip = (page - 1) * limit;

    const filter = {};
    if (userId) filter.userId = userId;
    if (action) filter.action = action;
    if (entityType) filter.entityType = entityType;

    const logs = await ActivityLog.find(filter)
      .populate('userId', 'name email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await ActivityLog.countDocuments(filter);

    res.status(200).json({
      logs,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch activity logs', error: err.message });
  }
};

const getUserActivity = async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const skip = (page - 1) * limit;

    const logs = await ActivityLog.find({ userId: req.user.id })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await ActivityLog.countDocuments({ userId: req.user.id });

    res.status(200).json({
      logs,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch user activity', error: err.message });
  }
};

module.exports = {
  logActivity,
  getActivityLogs,
  getUserActivity
};

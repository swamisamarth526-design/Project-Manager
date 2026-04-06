const Task = require('../models/Task');
const Project = require('../models/Project');
const mongoose = require('mongoose');

// ─── @desc    Get dashboard aggregation stats for user
// ─── @route   GET /api/dashboard/stats
// ─── @access  Private
const getDashboardStats = async (req, res) => {
  try {
    const userId = new mongoose.Types.ObjectId(req.user._id);

    // ── 1. Overall task stats (Aggregation Pipeline)
    const taskStats = await Task.aggregate([
      { $match: { owner: userId } },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
        },
      },
    ]);

    // ── 2. Tasks by priority
    const priorityStats = await Task.aggregate([
      { $match: { owner: userId } },
      {
        $group: {
          _id: '$priority',
          count: { $sum: 1 },
        },
      },
    ]);

    // ── 3. Per-project breakdown (tasks done vs total)
    const projectStats = await Task.aggregate([
      { $match: { owner: userId } },
      {
        $group: {
          _id: '$project',
          total: { $sum: 1 },
          done: { $sum: { $cond: [{ $eq: ['$status', 'done'] }, 1, 0] } },
          inProgress: { $sum: { $cond: [{ $eq: ['$status', 'in-progress'] }, 1, 0] } },
        },
      },
      {
        $lookup: {
          from: 'projects',
          localField: '_id',
          foreignField: '_id',
          as: 'projectInfo',
        },
      },
      { $unwind: '$projectInfo' },
      {
        $project: {
          _id: 1,
          total: 1,
          done: 1,
          inProgress: 1,
          projectName: '$projectInfo.name',
          projectColor: '$projectInfo.color',
          completionRate: {
            $cond: [
              { $eq: ['$total', 0] },
              0,
              { $multiply: [{ $divide: ['$done', '$total'] }, 100] },
            ],
          },
        },
      },
      { $sort: { total: -1 } },
    ]);

    // ── 4. Total counts
    const totalProjects = await Project.countDocuments({ owner: userId });
    const totalTasks = await Task.countDocuments({ owner: userId });

    // ── 5. Overdue tasks
    const overdueTasks = await Task.countDocuments({
      owner: userId,
      dueDate: { $lt: new Date() },
      status: { $ne: 'done' },
    });

    // ── 6. Tasks created in last 7 days (activity)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const recentActivity = await Task.aggregate([
      {
        $match: {
          owner: userId,
          createdAt: { $gte: sevenDaysAgo },
        },
      },
      {
        $group: {
          _id: {
            $dateToString: { format: '%Y-%m-%d', date: '$createdAt' },
          },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    // Format taskStats into a map
    const statusMap = { todo: 0, 'in-progress': 0, done: 0 };
    taskStats.forEach((s) => { statusMap[s._id] = s.count; });

    const priorityMap = { low: 0, medium: 0, high: 0 };
    priorityStats.forEach((p) => { priorityMap[p._id] = p.count; });

    res.json({
      success: true,
      data: {
        overview: {
          totalProjects,
          totalTasks,
          overdueTasks,
          completedTasks: statusMap['done'],
          inProgressTasks: statusMap['in-progress'],
          todoTasks: statusMap['todo'],
        },
        priorityBreakdown: priorityMap,
        projectBreakdown: projectStats,
        recentActivity,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { getDashboardStats };

const Project = require('../models/Project');
const Task = require('../models/Task');

// ─── @desc    Get all projects for logged-in user
// ─── @route   GET /api/projects
// ─── @access  Private
const getProjects = async (req, res) => {
  try {
    const projects = await Project.find({ owner: req.user._id }).sort({ createdAt: -1 });

    // Attach task counts via aggregation
    const projectIds = projects.map((p) => p._id);
    const taskCounts = await Task.aggregate([
      { $match: { project: { $in: projectIds } } },
      {
        $group: {
          _id: '$project',
          total: { $sum: 1 },
          done: { $sum: { $cond: [{ $eq: ['$status', 'done'] }, 1, 0] } },
        },
      },
    ]);

    const countMap = {};
    taskCounts.forEach((tc) => {
      countMap[tc._id.toString()] = { total: tc.total, done: tc.done };
    });

    const projectsWithCounts = projects.map((p) => ({
      ...p.toObject(),
      taskCount: countMap[p._id.toString()]?.total || 0,
      doneCount: countMap[p._id.toString()]?.done || 0,
    }));

    res.json({ success: true, data: projectsWithCounts });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─── @desc    Get single project
// ─── @route   GET /api/projects/:id
// ─── @access  Private
const getProject = async (req, res) => {
  try {
    const project = await Project.findOne({
      _id: req.params.id,
      owner: req.user._id,
    });

    if (!project) {
      return res.status(404).json({ success: false, message: 'Project not found' });
    }

    res.json({ success: true, data: project });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─── @desc    Create project
// ─── @route   POST /api/projects
// ─── @access  Private
const createProject = async (req, res) => {
  try {
    const { name, description, color, dueDate } = req.body;

    if (!name) {
      return res.status(400).json({ success: false, message: 'Project name is required' });
    }

    const project = await Project.create({
      name,
      description,
      color: color || '#6366f1',
      dueDate,
      owner: req.user._id,
    });

    res.status(201).json({ success: true, data: project });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─── @desc    Update project
// ─── @route   PUT /api/projects/:id
// ─── @access  Private
const updateProject = async (req, res) => {
  try {
    const project = await Project.findOne({
      _id: req.params.id,
      owner: req.user._id,
    });

    if (!project) {
      return res.status(404).json({ success: false, message: 'Project not found' });
    }

    const { name, description, color, status, dueDate } = req.body;

    project.name = name ?? project.name;
    project.description = description ?? project.description;
    project.color = color ?? project.color;
    project.status = status ?? project.status;
    project.dueDate = dueDate ?? project.dueDate;

    const updated = await project.save();
    res.json({ success: true, data: updated });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─── @desc    Delete project (and all its tasks)
// ─── @route   DELETE /api/projects/:id
// ─── @access  Private
const deleteProject = async (req, res) => {
  try {
    const project = await Project.findOne({
      _id: req.params.id,
      owner: req.user._id,
    });

    if (!project) {
      return res.status(404).json({ success: false, message: 'Project not found' });
    }

    // Delete all tasks linked to this project
    await Task.deleteMany({ project: project._id });
    await project.deleteOne();

    res.json({ success: true, message: 'Project and all its tasks deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { getProjects, getProject, createProject, updateProject, deleteProject };

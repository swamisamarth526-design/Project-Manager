const Task = require('../models/Task');
const Project = require('../models/Project');
const fs = require('fs');
const path = require('path');

// ─── @desc    Get all tasks for a project
// ─── @route   GET /api/tasks?projectId=xxx
// ─── @access  Private
const getTasks = async (req, res) => {
  try {
    const { projectId, status, priority } = req.query;

    const filter = { owner: req.user._id };
    if (projectId) filter.project = projectId;
    if (status) filter.status = status;
    if (priority) filter.priority = priority;

    const tasks = await Task.find(filter)
      .populate('project', 'name color')
      .sort({ createdAt: -1 });

    res.json({ success: true, data: tasks });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─── @desc    Get single task
// ─── @route   GET /api/tasks/:id
// ─── @access  Private
const getTask = async (req, res) => {
  try {
    const task = await Task.findOne({ _id: req.params.id, owner: req.user._id }).populate('project', 'name color');
    if (!task) return res.status(404).json({ success: false, message: 'Task not found' });
    res.json({ success: true, data: task });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─── @desc    Create task (with optional file attachment)
// ─── @route   POST /api/tasks
// ─── @access  Private
const createTask = async (req, res) => {
  try {
    const { title, description, status, priority, dueDate, projectId } = req.body;

    if (!title || !projectId) {
      return res.status(400).json({ success: false, message: 'Title and projectId are required' });
    }

    // Ensure project belongs to this user
    const project = await Project.findOne({ _id: projectId, owner: req.user._id });
    if (!project) {
      return res.status(404).json({ success: false, message: 'Project not found' });
    }

    const taskData = {
      title,
      description,
      status: status || 'todo',
      priority: priority || 'medium',
      dueDate,
      project: projectId,
      owner: req.user._id,
    };

    // Handle file upload (Multer populates req.file)
    if (req.file) {
      taskData.attachment = {
        filename: req.file.filename,
        originalName: req.file.originalname,
        mimetype: req.file.mimetype,
        size: req.file.size,
        path: `/uploads/${req.file.filename}`,
      };
    }

    const task = await Task.create(taskData);
    const populated = await task.populate('project', 'name color');

    res.status(201).json({ success: true, data: populated });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─── @desc    Update task
// ─── @route   PUT /api/tasks/:id
// ─── @access  Private
const updateTask = async (req, res) => {
  try {
    const task = await Task.findOne({ _id: req.params.id, owner: req.user._id });
    if (!task) return res.status(404).json({ success: false, message: 'Task not found' });

    const { title, description, status, priority, dueDate } = req.body;

    task.title = title ?? task.title;
    task.description = description ?? task.description;
    task.status = status ?? task.status;
    task.priority = priority ?? task.priority;
    task.dueDate = dueDate ?? task.dueDate;

    // Replace attachment if new file uploaded
    if (req.file) {
      // Delete old file if exists
      if (task.attachment?.filename) {
        const oldPath = path.join(__dirname, '../uploads', task.attachment.filename);
        if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
      }
      task.attachment = {
        filename: req.file.filename,
        originalName: req.file.originalname,
        mimetype: req.file.mimetype,
        size: req.file.size,
        path: `/uploads/${req.file.filename}`,
      };
    }

    const updated = await task.save();
    await updated.populate('project', 'name color');

    res.json({ success: true, data: updated });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─── @desc    Update task status only (quick toggle)
// ─── @route   PATCH /api/tasks/:id/status
// ─── @access  Private
const updateTaskStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const allowed = ['todo', 'in-progress', 'done'];

    if (!allowed.includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status value' });
    }

    const task = await Task.findOneAndUpdate(
      { _id: req.params.id, owner: req.user._id },
      { status },
      { new: true }
    ).populate('project', 'name color');

    if (!task) return res.status(404).json({ success: false, message: 'Task not found' });

    res.json({ success: true, data: task });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─── @desc    Delete task
// ─── @route   DELETE /api/tasks/:id
// ─── @access  Private
const deleteTask = async (req, res) => {
  try {
    const task = await Task.findOne({ _id: req.params.id, owner: req.user._id });
    if (!task) return res.status(404).json({ success: false, message: 'Task not found' });

    // Remove attached file from disk
    if (task.attachment?.filename) {
      const filePath = path.join(__dirname, '../uploads', task.attachment.filename);
      if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    }

    await task.deleteOne();
    res.json({ success: true, message: 'Task deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { getTasks, getTask, createTask, updateTask, updateTaskStatus, deleteTask };

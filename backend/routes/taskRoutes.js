const express = require('express');
const router = express.Router();
const {
  getTasks,
  getTask,
  createTask,
  updateTask,
  updateTaskStatus,
  deleteTask,
} = require('../controllers/taskController');
const { protect } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

// All task routes are protected
router.use(protect);

router.route('/').get(getTasks).post(upload.single('attachment'), createTask);
router.route('/:id')
  .get(getTask)
  .put(upload.single('attachment'), updateTask)
  .delete(deleteTask);
router.patch('/:id/status', updateTaskStatus);

module.exports = router;

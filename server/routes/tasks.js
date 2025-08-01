const express = require('express');
const Task = require('../models/Task');
const auth = require('../middleware/auth');
const upload = require('../middleware/upload');
const fs = require('fs');
const NotificationService = require('../services/notificationService');

const router = express.Router();

// @desc    Get all tasks
// @route   GET /api/tasks
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    const { status, priority, page = 1, limit = 10 } = req.query;
    
    const query = {};
    if (status) query.status = status;
    if (priority) query.priority = priority;
    
    // If not admin, only show tasks assigned to or created by the user
    if (req.user.role !== 'admin') {
      query.$or = [
        { assignedTo: req.user.id },
        { createdBy: req.user.id }
      ];
    }

    const tasks = await Task.find(query)
      .populate('assignedTo', 'name email')
      .populate('createdBy', 'name email')
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ createdAt: -1 });

    const total = await Task.countDocuments(query);

    res.json({
      success: true,
      count: tasks.length,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / limit),
      data: tasks
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// @desc    Get single task
// @route   GET /api/tasks/:id
// @access  Private
router.get('/:id', auth, async (req, res) => {
  try {
    const task = await Task.findById(req.params.id)
      .populate('assignedTo', 'name email')
      .populate('createdBy', 'name email');

    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found'
      });
    }

    res.json({
      success: true,
      data: task
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// @desc    Create new task
// @route   POST /api/tasks
// @access  Private
router.post('/', auth, upload.array('attachments', 5), async (req, res) => {
  try {
    const { title, description, status, priority, dueDate, assignedTo, tags } = req.body;

    // Process attachments if any
    const attachments = [];
    if (req.files && req.files.length > 0) {
      req.files.forEach(file => {
        attachments.push({
          filename: file.filename,
          originalName: file.originalname,
          mimetype: file.mimetype,
          size: file.size,
          path: file.path
        });
      });
    }

    const task = await Task.create({
      title,
      description,
      status,
      priority,
      dueDate,
      assignedTo,
      createdBy: req.user.id,
      tags: tags ? (Array.isArray(tags) ? tags : tags.split(',').map(tag => tag.trim())) : [],
      attachments
    });

    await task.populate([
      { path: 'assignedTo', select: 'name email' },
      { path: 'createdBy', select: 'name email' }
    ]);

    // Create notification if task is assigned to someone else
    if (task.assignedTo && task.assignedTo._id.toString() !== req.user.id) {
      try {
        await NotificationService.createTaskAssignedNotification(
          task,
          task.assignedTo,
          task.createdBy
        );
      } catch (notificationError) {
        console.error('Failed to create assignment notification:', notificationError);
        // Continue with task creation even if notification fails
      }
    }

    res.status(201).json({
      success: true,
      message: 'Task created successfully',
      data: task
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// @desc    Update task
// @route   PUT /api/tasks/:id
// @access  Private
router.put('/:id', auth, upload.array('attachments', 5), async (req, res) => {
  try {
    const { title, description, status, priority, dueDate, assignedTo, tags } = req.body;

    let task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found'
      });
    }

    // Store original values for change detection
    const originalStatus = task.status;
    const originalPriority = task.priority;
    const originalDueDate = task.dueDate;
    const originalAssignedTo = task.assignedTo;

    // Process new attachments if any
    const newAttachments = [];
    if (req.files && req.files.length > 0) {
      req.files.forEach(file => {
        newAttachments.push({
          filename: file.filename,
          originalName: file.originalname,
          mimetype: file.mimetype,
          size: file.size,
          path: file.path
        });
      });
    }

    // Update completedAt if status is changed to completed
    const updateData = { 
      title, 
      description, 
      status, 
      priority, 
      dueDate, 
      assignedTo, 
      tags: tags ? (Array.isArray(tags) ? tags : tags.split(',').map(tag => tag.trim())) : []
    };
    
    // Add new attachments to existing ones
    if (newAttachments.length > 0) {
      updateData.attachments = [...(task.attachments || []), ...newAttachments];
    }
    
    if (status === 'completed' && task.status !== 'completed') {
      updateData.completedAt = new Date();
    } else if (status !== 'completed') {
      updateData.completedAt = null;
    }

    task = await Task.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    ).populate([
      { path: 'assignedTo', select: 'name email' },
      { path: 'createdBy', select: 'name email' }
    ]);

    // Create notifications based on changes
    try {
      const currentUser = { _id: req.user.id, name: req.user.name };
      
      // Detect changes for notification
      const changes = {};
      if (originalStatus !== status) changes.status = status;
      if (originalPriority !== priority) changes.priority = priority;
      if (originalDueDate && dueDate && new Date(originalDueDate).getTime() !== new Date(dueDate).getTime()) {
        changes.dueDate = dueDate;
      }

      // If task assignment changed, create new assignment notification
      if (originalAssignedTo && assignedTo && 
          originalAssignedTo.toString() !== assignedTo.toString()) {
        await NotificationService.createTaskAssignedNotification(
          task,
          task.assignedTo,
          currentUser
        );
      }
      // If task was updated with significant changes, notify assignee
      else if (Object.keys(changes).length > 0) {
        await NotificationService.createTaskUpdatedNotification(
          task,
          currentUser,
          changes
        );
      }

      // If task was marked as completed, notify the creator
      if (originalStatus !== 'completed' && status === 'completed') {
        await NotificationService.createTaskCompletedNotification(
          task,
          currentUser
        );
      }
    } catch (notificationError) {
      console.error('Failed to create update notification:', notificationError);
      // Continue with task update even if notification fails
    }

    res.json({
      success: true,
      message: 'Task updated successfully',
      data: task
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// @desc    Delete task
// @route   DELETE /api/tasks/:id
// @access  Private
router.delete('/:id', auth, async (req, res) => {
  try {
    const task = await Task.findByIdAndDelete(req.params.id);

    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found'
      });
    }

    res.json({
      success: true,
      message: 'Task deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// @desc    Download attachment
// @route   GET /api/tasks/:id/attachments/:attachmentId
// @access  Private
router.get('/:id/attachments/:attachmentId', auth, async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found'
      });
    }

    const attachment = task.attachments.id(req.params.attachmentId);

    if (!attachment) {
      return res.status(404).json({
        success: false,
        message: 'Attachment not found'
      });
    }

    // Check if file exists
    if (!fs.existsSync(attachment.path)) {
      return res.status(404).json({
        success: false,
        message: 'File not found on server'
      });
    }

    // Set headers for file download
    res.setHeader('Content-Disposition', `attachment; filename="${attachment.originalName}"`);
    res.setHeader('Content-Type', attachment.mimetype);

    // Stream the file
    const fileStream = fs.createReadStream(attachment.path);
    fileStream.pipe(res);

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// @desc    Delete attachment
// @route   DELETE /api/tasks/:id/attachments/:attachmentId
// @access  Private
router.delete('/:id/attachments/:attachmentId', auth, async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found'
      });
    }

    const attachment = task.attachments.id(req.params.attachmentId);

    if (!attachment) {
      return res.status(404).json({
        success: false,
        message: 'Attachment not found'
      });
    }

    // Delete file from filesystem
    if (fs.existsSync(attachment.path)) {
      fs.unlinkSync(attachment.path);
    }

    // Remove attachment from task
    task.attachments.pull(req.params.attachmentId);
    await task.save();

    res.json({
      success: true,
      message: 'Attachment deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

module.exports = router;

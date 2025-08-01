const Notification = require('../models/Notification');

class NotificationService {
  // Create a task assignment notification
  static async createTaskAssignedNotification(task, assignedUser, createdByUser) {
    if (!assignedUser || !createdByUser || assignedUser._id.toString() === createdByUser._id.toString()) {
      return null; // Don't notify if self-assignment
    }

    try {
      const notification = await Notification.create({
        recipient: assignedUser._id,
        sender: createdByUser._id,
        type: 'task_assigned',
        title: 'New Task Assigned',
        message: `${createdByUser.name} assigned you a new task: "${task.title}"`,
        relatedTask: task._id,
        metadata: {
          taskPriority: task.priority,
          taskStatus: task.status,
          taskDueDate: task.dueDate
        }
      });

      await notification.populate([
        { path: 'sender', select: 'name email avatar' },
        { path: 'recipient', select: 'name email' },
        { path: 'relatedTask', select: 'title status priority' }
      ]);

      return notification;
    } catch (error) {
      console.error('Error creating task assigned notification:', error);
      return null;
    }
  }

  // Create a task update notification
  static async createTaskUpdatedNotification(task, updatedByUser, changes = {}) {
    if (!task.assignedTo || !updatedByUser || 
        task.assignedTo._id.toString() === updatedByUser._id.toString()) {
      return null; // Don't notify if self-update or no assignee
    }

    try {
      let message = `${updatedByUser.name} updated the task: "${task.title}"`;
      
      // Add details about what changed
      if (changes.status) {
        message += ` (Status changed to: ${changes.status})`;
      }
      if (changes.priority) {
        message += ` (Priority changed to: ${changes.priority})`;
      }
      if (changes.dueDate) {
        message += ` (Due date updated)`;
      }

      const notification = await Notification.create({
        recipient: task.assignedTo._id,
        sender: updatedByUser._id,
        type: 'task_updated',
        title: 'Task Updated',
        message,
        relatedTask: task._id,
        metadata: {
          changes,
          taskPriority: task.priority,
          taskStatus: task.status,
          taskDueDate: task.dueDate
        }
      });

      await notification.populate([
        { path: 'sender', select: 'name email avatar' },
        { path: 'recipient', select: 'name email' },
        { path: 'relatedTask', select: 'title status priority' }
      ]);

      return notification;
    } catch (error) {
      console.error('Error creating task updated notification:', error);
      return null;
    }
  }

  // Create a task completion notification
  static async createTaskCompletedNotification(task, completedByUser) {
    if (!task.createdBy || !completedByUser || 
        task.createdBy._id.toString() === completedByUser._id.toString()) {
      return null; // Don't notify if self-completion
    }

    try {
      const notification = await Notification.create({
        recipient: task.createdBy._id,
        sender: completedByUser._id,
        type: 'task_completed',
        title: 'Task Completed',
        message: `${completedByUser.name} completed the task: "${task.title}"`,
        relatedTask: task._id,
        metadata: {
          completedAt: new Date(),
          taskPriority: task.priority
        }
      });

      await notification.populate([
        { path: 'sender', select: 'name email avatar' },
        { path: 'recipient', select: 'name email' },
        { path: 'relatedTask', select: 'title status priority' }
      ]);

      return notification;
    } catch (error) {
      console.error('Error creating task completed notification:', error);
      return null;
    }
  }

  // Create overdue task notification
  static async createTaskOverdueNotification(task) {
    if (!task.assignedTo) {
      return null;
    }

    try {
      const notification = await Notification.create({
        recipient: task.assignedTo._id,
        sender: task.createdBy._id,
        type: 'task_overdue',
        title: 'Task Overdue',
        message: `Task "${task.title}" is now overdue. Please complete it as soon as possible.`,
        relatedTask: task._id,
        metadata: {
          overdueDate: new Date(),
          taskPriority: task.priority,
          taskDueDate: task.dueDate
        }
      });

      await notification.populate([
        { path: 'sender', select: 'name email avatar' },
        { path: 'recipient', select: 'name email' },
        { path: 'relatedTask', select: 'title status priority' }
      ]);

      return notification;
    } catch (error) {
      console.error('Error creating task overdue notification:', error);
      return null;
    }
  }

  // Get notification statistics for a user
  static async getNotificationStats(userId) {
    try {
      const total = await Notification.countDocuments({ recipient: userId });
      const unread = await Notification.countDocuments({ 
        recipient: userId, 
        read: false 
      });

      return {
        total,
        unread,
        read: total - unread
      };
    } catch (error) {
      console.error('Error getting notification stats:', error);
      return { total: 0, unread: 0, read: 0 };
    }
  }

  // Clean up old notifications (older than 30 days)
  static async cleanupOldNotifications() {
    try {
      const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
      const result = await Notification.deleteMany({
        createdAt: { $lt: thirtyDaysAgo },
        read: true
      });

      console.log(`Cleaned up ${result.deletedCount} old notifications`);
      return result.deletedCount;
    } catch (error) {
      console.error('Error cleaning up old notifications:', error);
      return 0;
    }
  }
}

module.exports = NotificationService;

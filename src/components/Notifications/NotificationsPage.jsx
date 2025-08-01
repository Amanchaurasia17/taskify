import { useState, useEffect, useMemo, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useNotifications } from '../../hooks/useNotifications';
import {
  BellIcon,
  CheckIcon,
  XMarkIcon,
  TrashIcon,
  ClockIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  UserPlusIcon,
  PencilSquareIcon,
  EyeIcon,
  EyeSlashIcon
} from '@heroicons/react/24/outline';

const NotificationsPage = () => {
  const [filter, setFilter] = useState('all'); // all, unread, read
  const [selectedNotifications, setSelectedNotifications] = useState(new Set());
  const [selectAll, setSelectAll] = useState(false);

  // Clear selections when filter changes
  useEffect(() => {
    setSelectedNotifications(new Set());
    setSelectAll(false);
  }, [filter]);
  
  const {
    notifications,
    unreadCount,
    loading,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    loadMore,
    hasMore,
    refreshNotifications
  } = useNotifications();

  // Filter notifications based on current filter
  const filteredNotifications = useMemo(() => {
    return notifications.filter(notification => {
      if (filter === 'unread') return !notification.read;
      if (filter === 'read') return notification.read;
      return true;
    });
  }, [notifications, filter]);

  // Handle select all toggle - use useCallback to prevent unnecessary re-renders
  const handleSelectAllChange = useCallback((checked) => {
    setSelectAll(checked);
    if (checked) {
      setSelectedNotifications(new Set(filteredNotifications.map(n => n._id)));
    } else {
      setSelectedNotifications(new Set());
    }
  }, [filteredNotifications]);

  // Update select all state when filtered notifications or selections change
  useEffect(() => {
    if (filteredNotifications.length === 0) {
      setSelectAll(false);
    } else {
      const allFilteredSelected = filteredNotifications.every(n => 
        selectedNotifications.has(n._id)
      );
      setSelectAll(allFilteredSelected && selectedNotifications.size > 0);
    }
  }, [filteredNotifications, selectedNotifications]);

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'task_assigned':
        return <UserPlusIcon className="h-6 w-6 text-blue-500" />;
      case 'task_updated':
        return <PencilSquareIcon className="h-6 w-6 text-yellow-500" />;
      case 'task_completed':
        return <CheckCircleIcon className="h-6 w-6 text-green-500" />;
      case 'task_overdue':
        return <ExclamationTriangleIcon className="h-6 w-6 text-red-500" />;
      default:
        return <ClockIcon className="h-6 w-6 text-gray-500" />;
    }
  };

  const getTypeDisplayName = (type) => {
    switch (type) {
      case 'task_assigned': return 'Task Assigned';
      case 'task_updated': return 'Task Updated';
      case 'task_completed': return 'Task Completed';
      case 'task_overdue': return 'Task Overdue';
      default: return 'Notification';
    }
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleNotificationClick = useCallback(async (notification) => {
    if (!notification.read) {
      await markAsRead(notification._id);
    }
  }, [markAsRead]);

  const handleMarkSelectedAsRead = useCallback(async () => {
    const unreadSelected = Array.from(selectedNotifications).filter(id =>
      notifications.find(n => n._id === id && !n.read)
    );
    
    const promises = unreadSelected.map(id => markAsRead(id));
    await Promise.all(promises);
    setSelectedNotifications(new Set());
  }, [selectedNotifications, notifications, markAsRead]);

  const handleDeleteSelected = useCallback(async () => {
    const promises = Array.from(selectedNotifications).map(id => deleteNotification(id));
    await Promise.all(promises);
    setSelectedNotifications(new Set());
    setSelectAll(false);
  }, [selectedNotifications, deleteNotification]);

  const toggleSelection = useCallback((notificationId) => {
    setSelectedNotifications(prevSelected => {
      const newSelected = new Set(prevSelected);
      if (newSelected.has(notificationId)) {
        newSelected.delete(notificationId);
      } else {
        newSelected.add(notificationId);
      }
      return newSelected;
    });
  }, []);

  const getFilterStats = useMemo(() => {
    return {
      all: notifications.length,
      unread: notifications.filter(n => !n.read).length,
      read: notifications.filter(n => n.read).length
    };
  }, [notifications]);

  const stats = getFilterStats;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Notifications</h1>
            <p className="text-gray-600 mt-1">
              Stay updated with your task activities
            </p>
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={refreshNotifications}
              disabled={loading}
              className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
            >
              <ClockIcon className="h-4 w-4 mr-2" />
              Refresh
            </button>
            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <CheckIcon className="h-4 w-4 mr-2" />
                Mark All Read
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex space-x-6">
              {[
                { key: 'all', label: 'All', count: stats.all },
                { key: 'unread', label: 'Unread', count: stats.unread },
                { key: 'read', label: 'Read', count: stats.read }
              ].map(({ key, label, count }) => (
                <button
                  key={key}
                  onClick={() => setFilter(key)}
                  className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    filter === key
                      ? 'bg-blue-100 text-blue-700'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                  }`}
                >
                  <span>{label}</span>
                  <span className={`px-2 py-1 rounded-full text-xs ${
                    filter === key
                      ? 'bg-blue-200 text-blue-800'
                      : 'bg-gray-200 text-gray-600'
                  }`}>
                    {count}
                  </span>
                </button>
              ))}
            </div>

            {/* Bulk Actions */}
            {selectedNotifications.size > 0 && (
              <div className="flex items-center space-x-3">
                <span className="text-sm text-gray-600">
                  {selectedNotifications.size} selected
                </span>
                <button
                  onClick={handleMarkSelectedAsRead}
                  className="text-sm text-blue-600 hover:text-blue-800"
                >
                  Mark as read
                </button>
                <button
                  onClick={handleDeleteSelected}
                  className="text-sm text-red-600 hover:text-red-800"
                >
                  Delete
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Select All */}
        {filteredNotifications.length > 0 && (
          <div className="px-6 py-3 border-b border-gray-200 bg-gray-50">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={selectAll}
                onChange={(e) => handleSelectAllChange(e.target.checked)}
                className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <span className="ml-2 text-sm text-gray-600">
                Select all {filteredNotifications.length} notifications
              </span>
            </label>
          </div>
        )}
      </div>

      {/* Notifications List */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        {loading && notifications.length === 0 ? (
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading notifications...</p>
          </div>
        ) : filteredNotifications.length === 0 ? (
          <div className="p-8 text-center">
            <BellIcon className="h-12 w-12 mx-auto text-gray-300 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {filter === 'unread' ? 'No unread notifications' : 
               filter === 'read' ? 'No read notifications' : 'No notifications'}
            </h3>
            <p className="text-gray-600">
              {filter === 'all' 
                ? "You'll see notifications here when there's activity on your tasks."
                : `No ${filter} notifications to show.`}
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {filteredNotifications.map((notification) => (
              <div
                key={notification._id}
                className={`p-6 hover:bg-gray-50 transition-colors ${
                  !notification.read ? 'bg-blue-50' : ''
                }`}
              >
                <div className="flex items-start space-x-4">
                  {/* Selection Checkbox */}
                  <input
                    type="checkbox"
                    checked={selectedNotifications.has(notification._id)}
                    onChange={() => toggleSelection(notification._id)}
                    className="mt-1 h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  
                  {/* Icon */}
                  <div className="flex-shrink-0 mt-1">
                    {getNotificationIcon(notification.type)}
                  </div>
                  
                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-1">
                          <h3 className="text-sm font-semibold text-gray-900">
                            {notification.title}
                          </h3>
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
                            {getTypeDisplayName(notification.type)}
                          </span>
                          {!notification.read && (
                            <span className="inline-block w-2 h-2 bg-blue-500 rounded-full"></span>
                          )}
                        </div>
                        <p className="text-sm text-gray-600 mb-2">
                          {notification.message}
                        </p>
                        <div className="flex items-center space-x-4 text-xs text-gray-500">
                          <span>From: {notification.sender.name}</span>
                          <span>{formatDate(notification.createdAt)}</span>
                          {notification.relatedTask && (
                            <Link
                              to={`/tasks/${notification.relatedTask._id}`}
                              className="text-blue-600 hover:text-blue-800"
                              onClick={() => handleNotificationClick(notification)}
                            >
                              View Task
                            </Link>
                          )}
                        </div>
                      </div>
                      
                      {/* Actions */}
                      <div className="flex items-center space-x-2 ml-4">
                        {!notification.read && (
                          <button
                            onClick={() => markAsRead(notification._id)}
                            className="p-1 text-gray-400 hover:text-blue-600"
                            title="Mark as read"
                          >
                            <EyeIcon className="h-4 w-4" />
                          </button>
                        )}
                        <button
                          onClick={() => deleteNotification(notification._id)}
                          className="p-1 text-gray-400 hover:text-red-600"
                          title="Delete notification"
                        >
                          <TrashIcon className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Load More */}
        {hasMore && filteredNotifications.length > 0 && (
          <div className="p-4 border-t border-gray-200">
            <button
              onClick={loadMore}
              disabled={loading}
              className="w-full py-2 px-4 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
            >
              {loading ? 'Loading...' : 'Load More Notifications'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default NotificationsPage;

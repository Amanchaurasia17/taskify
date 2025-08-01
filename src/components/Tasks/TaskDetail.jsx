import { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { tasksAPI } from '../../services/api';

const TaskDetail = () => {
  const { id } = useParams();
  const [task, setTask] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchTask = useCallback(async () => {
    try {
      setLoading(true);
      const response = await tasksAPI.getTask(id);
      setTask(response.data);
    } catch (err) {
      setError('Failed to fetch task details');
      console.error('Error fetching task:', err);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchTask();
  }, [fetchTask]);

  const downloadAttachment = async (attachmentId, originalName) => {
    try {
      const response = await tasksAPI.downloadAttachment(id, attachmentId);
      
      // Create a blob URL and trigger download
      const blob = new Blob([response.data]);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = originalName;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Error downloading attachment:', err);
      alert('Failed to download attachment');
    }
  };

  const deleteAttachment = async (attachmentId) => {
    if (window.confirm('Are you sure you want to delete this attachment?')) {
      try {
        await tasksAPI.deleteAttachment(id, attachmentId);
        fetchTask(); // Refresh task data
      } catch (err) {
        console.error('Error deleting attachment:', err);
        alert('Failed to delete attachment');
      }
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'in-progress':
        return 'bg-yellow-100 text-yellow-800';
      case 'pending':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high':
        return 'text-red-600';
      case 'medium':
        return 'text-yellow-600';
      case 'low':
        return 'text-green-600';
      default:
        return 'text-gray-600';
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getFileIcon = (mimetype) => {
    if (mimetype.startsWith('image/')) {
      return '🖼️';
    } else if (mimetype.includes('pdf')) {
      return '📄';
    } else if (mimetype.includes('word') || mimetype.includes('document')) {
      return '📝';
    } else if (mimetype.includes('excel') || mimetype.includes('spreadsheet')) {
      return '📊';
    } else if (mimetype.includes('powerpoint') || mimetype.includes('presentation')) {
      return '📊';
    } else if (mimetype.includes('zip') || mimetype.includes('archive')) {
      return '🗂️';
    } else {
      return '📎';
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error || !task) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600">{error || 'Task not found'}</p>
        <Link to="/tasks" className="mt-4 text-blue-600 hover:text-blue-500">
          Back to Tasks
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <Link to="/tasks" className="text-blue-600 hover:text-blue-500 mb-4 inline-block">
          ← Back to Tasks
        </Link>
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-gray-900">{task.title}</h1>
          <div className="flex space-x-3">
            <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(task.status)}`}>
              {task.status}
            </span>
            <span className={`font-medium ${getPriorityColor(task.priority)}`}>
              {task.priority} priority
            </span>
          </div>
        </div>
      </div>

      {/* Task Details */}
      <div className="bg-white shadow rounded-lg p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">Task Information</h3>
            <dl className="space-y-3">
              <div>
                <dt className="text-sm font-medium text-gray-500">Description</dt>
                <dd className="text-sm text-gray-900">{task.description || 'No description provided'}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Created by</dt>
                <dd className="text-sm text-gray-900">{task.createdBy?.name}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Assigned to</dt>
                <dd className="text-sm text-gray-900">{task.assignedTo?.name}</dd>
              </div>
            </dl>
          </div>
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">Timeline</h3>
            <dl className="space-y-3">
              <div>
                <dt className="text-sm font-medium text-gray-500">Created</dt>
                <dd className="text-sm text-gray-900">{formatDate(task.createdAt)}</dd>
              </div>
              {task.dueDate && (
                <div>
                  <dt className="text-sm font-medium text-gray-500">Due Date</dt>
                  <dd className="text-sm text-gray-900">{formatDate(task.dueDate)}</dd>
                </div>
              )}
              {task.completedAt && (
                <div>
                  <dt className="text-sm font-medium text-gray-500">Completed</dt>
                  <dd className="text-sm text-gray-900">{formatDate(task.completedAt)}</dd>
                </div>
              )}
            </dl>
          </div>
        </div>

        {/* Tags */}
        {task.tags && task.tags.length > 0 && (
          <div className="mt-6">
            <h3 className="text-lg font-medium text-gray-900 mb-2">Tags</h3>
            <div className="flex flex-wrap gap-2">
              {task.tags.map((tag, index) => (
                <span key={index} className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                  {tag}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Attachments */}
      {task.attachments && task.attachments.length > 0 && (
        <div className="bg-white shadow rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Attachments</h3>
          <div className="space-y-3">
            {task.attachments.map((attachment) => (
              <div key={attachment._id} className="flex items-center justify-between p-3 border border-gray-200 rounded-md">
                <div className="flex items-center">
                  <span className="text-2xl mr-3">{getFileIcon(attachment.mimetype)}</span>
                  <div>
                    <p className="text-sm font-medium text-gray-900">{attachment.originalName}</p>
                    <p className="text-xs text-gray-500">
                      {(attachment.size / 1024 / 1024).toFixed(2)} MB • 
                      Uploaded {formatDate(attachment.uploadedAt)}
                    </p>
                  </div>
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => downloadAttachment(attachment._id, attachment.originalName)}
                    className="text-blue-600 hover:text-blue-500 text-sm font-medium"
                  >
                    Download
                  </button>
                  <button
                    onClick={() => deleteAttachment(attachment._id)}
                    className="text-red-600 hover:text-red-500 text-sm font-medium"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default TaskDetail;

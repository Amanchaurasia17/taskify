import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../hooks/useAuth';
import axios from 'axios';
import {
  UserIcon,
  EnvelopeIcon,
  CalendarIcon,
  PencilIcon,
  CheckCircleIcon,
  XMarkIcon,
  ExclamationCircleIcon,
  ClipboardDocumentListIcon,
  UserGroupIcon,
  TrophyIcon
} from '@heroicons/react/24/outline';

const Profile = () => {
  const { user, updateUser } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || ''
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('');
  const [stats, setStats] = useState({
    totalTasks: 0,
    completedTasks: 0,
    pendingTasks: 0,
    assignedToMe: 0
  });

  const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

  const fetchUserStats = useCallback(async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/tasks?limit=100`);
      const tasks = response.data.data || [];
      
      // Calculate real stats for current user
      const totalTasks = tasks.length;
      const completedTasks = tasks.filter(task => task.status === 'completed').length;
      const pendingTasks = tasks.filter(task => task.status === 'pending').length;
      const assignedToMe = tasks.filter(task => 
        task.assignedTo && 
        task.assignedTo._id === user.id && 
        task.createdBy._id !== user.id
      ).length;
      
      setStats({
        totalTasks,
        completedTasks,
        pendingTasks,
        assignedToMe
      });
    } catch (error) {
      console.error('Error fetching user stats:', error);
      // Fallback to zeros if error
      setStats({
        totalTasks: 0,
        completedTasks: 0,
        pendingTasks: 0,
        assignedToMe: 0
      });
    }
  }, [API_BASE_URL, user?.id]);

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        email: user.email || ''
      });
      // Fetch real user stats
      fetchUserStats();
    }
  }, [user, fetchUserStats]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      const result = await updateUser(formData);
      
      if (result.success) {
        setMessage(result.message);
        setMessageType('success');
        setIsEditing(false);
      } else {
        setMessage(result.message);
        setMessageType('error');
      }
    } catch (error) {
      console.error('Profile update error:', error);
      setMessage('Error updating profile. Please try again.');
      setMessageType('error');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      name: user?.name || '',
      email: user?.email || ''
    });
    setIsEditing(false);
    setMessage('');
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getCompletionRate = () => {
    if (stats.totalTasks === 0) return 0;
    return Math.round((stats.completedTasks / stats.totalTasks) * 100);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-8">
          {/* Header */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Profile</h1>
                <p className="mt-1 text-sm text-gray-500">
                  Manage your account settings and view your activity
                </p>
              </div>
              {!isEditing && (
                <button
                  onClick={() => setIsEditing(true)}
                  className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
                >
                  <PencilIcon className="-ml-1 mr-2 h-5 w-5" />
                  Edit Profile
                </button>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Profile Information */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h3 className="text-lg font-medium text-gray-900">Personal Information</h3>
                </div>
                <div className="p-6">
                  {message && (
                    <div className={`mb-6 p-4 rounded-md ${
                      messageType === 'success' 
                        ? 'bg-green-50 border border-green-200' 
                        : 'bg-red-50 border border-red-200'
                    }`}>
                      <div className="flex">
                        <div className="flex-shrink-0">
                          {messageType === 'success' ? (
                            <CheckCircleIcon className="h-5 w-5 text-green-400" />
                          ) : (
                            <ExclamationCircleIcon className="h-5 w-5 text-red-400" />
                          )}
                        </div>
                        <div className="ml-3">
                          <p className={`text-sm ${
                            messageType === 'success' ? 'text-green-800' : 'text-red-800'
                          }`}>
                            {message}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {isEditing ? (
                    <form onSubmit={handleSubmit} className="space-y-6">
                      {/* Profile Avatar */}
                      <div className="flex items-center space-x-6">
                        <div className="h-20 w-20 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center">
                          <span className="text-white font-bold text-2xl">
                            {user?.name?.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div>
                          <h4 className="text-lg font-medium text-gray-900">Profile Picture</h4>
                          <p className="text-sm text-gray-500">
                            Avatar is generated from your name initial
                          </p>
                        </div>
                      </div>

                      {/* Name Field */}
                      <div>
                        <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                          Full Name
                        </label>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <UserIcon className="h-5 w-5 text-gray-400" />
                          </div>
                          <input
                            type="text"
                            id="name"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                            placeholder="Enter your full name"
                            required
                          />
                        </div>
                      </div>

                      {/* Email Field */}
                      <div>
                        <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                          Email Address
                        </label>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <EnvelopeIcon className="h-5 w-5 text-gray-400" />
                          </div>
                          <input
                            type="email"
                            id="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                            placeholder="Enter your email address"
                            required
                          />
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
                        <button
                          type="button"
                          onClick={handleCancel}
                          className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-150"
                        >
                          <XMarkIcon className="-ml-1 mr-2 h-4 w-4 inline" />
                          Cancel
                        </button>
                        <button
                          type="submit"
                          disabled={loading}
                          className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-150"
                        >
                          {loading ? (
                            <>
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                              Saving...
                            </>
                          ) : (
                            <>
                              <CheckCircleIcon className="-ml-1 mr-2 h-4 w-4" />
                              Save Changes
                            </>
                          )}
                        </button>
                      </div>
                    </form>
                  ) : (
                    <div className="space-y-6">
                      {/* Profile Avatar */}
                      <div className="flex items-center space-x-6">
                        <div className="h-20 w-20 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center">
                          <span className="text-white font-bold text-2xl">
                            {user?.name?.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div>
                          <h4 className="text-lg font-medium text-gray-900">{user?.name}</h4>
                          <p className="text-sm text-gray-500">{user?.email}</p>
                        </div>
                      </div>

                      {/* Profile Details */}
                      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                        <div className="bg-gray-50 p-4 rounded-lg">
                          <div className="flex items-center">
                            <UserIcon className="h-5 w-5 text-gray-400 mr-3" />
                            <div>
                              <p className="text-sm font-medium text-gray-900">Full Name</p>
                              <p className="text-sm text-gray-600">{user?.name}</p>
                            </div>
                          </div>
                        </div>

                        <div className="bg-gray-50 p-4 rounded-lg">
                          <div className="flex items-center">
                            <EnvelopeIcon className="h-5 w-5 text-gray-400 mr-3" />
                            <div>
                              <p className="text-sm font-medium text-gray-900">Email</p>
                              <p className="text-sm text-gray-600">{user?.email}</p>
                            </div>
                          </div>
                        </div>

                        <div className="bg-gray-50 p-4 rounded-lg sm:col-span-2">
                          <div className="flex items-center">
                            <CalendarIcon className="h-5 w-5 text-gray-400 mr-3" />
                            <div>
                              <p className="text-sm font-medium text-gray-900">Member Since</p>
                              <p className="text-sm text-gray-600">
                                {user?.createdAt ? formatDate(user.createdAt) : 'N/A'}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Stats Sidebar */}
            <div className="space-y-6">
              {/* Task Statistics */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h3 className="text-lg font-medium text-gray-900">Task Statistics</h3>
                </div>
                <div className="p-6 space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <ClipboardDocumentListIcon className="h-5 w-5 text-blue-600 mr-2" />
                      <span className="text-sm text-gray-600">Total Tasks</span>
                    </div>
                    <span className="text-sm font-medium text-gray-900">{stats.totalTasks}</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <CheckCircleIcon className="h-5 w-5 text-green-600 mr-2" />
                      <span className="text-sm text-gray-600">Completed</span>
                    </div>
                    <span className="text-sm font-medium text-gray-900">{stats.completedTasks}</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <ExclamationCircleIcon className="h-5 w-5 text-yellow-600 mr-2" />
                      <span className="text-sm text-gray-600">Pending</span>
                    </div>
                    <span className="text-sm font-medium text-gray-900">{stats.pendingTasks}</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <UserGroupIcon className="h-5 w-5 text-purple-600 mr-2" />
                      <span className="text-sm text-gray-600">Assigned to Me</span>
                    </div>
                    <span className="text-sm font-medium text-gray-900">{stats.assignedToMe}</span>
                  </div>

                  <div className="pt-4 border-t border-gray-200">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-gray-600">Completion Rate</span>
                      <span className="text-sm font-medium text-gray-900">{getCompletionRate()}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-green-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${getCompletionRate()}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Achievement Badge */}
              <div className="bg-gradient-to-br from-yellow-50 to-orange-50 rounded-lg shadow-sm border border-yellow-200">
                <div className="p-6 text-center">
                  <TrophyIcon className="h-12 w-12 text-yellow-600 mx-auto mb-4" />
                  <h4 className="text-lg font-medium text-gray-900 mb-2">
                    {getCompletionRate() >= 80 ? 'High Performer' : 
                     getCompletionRate() >= 60 ? 'Good Progress' : 
                     'Getting Started'}
                  </h4>
                  <p className="text-sm text-gray-600">
                    {getCompletionRate() >= 80 ? 'Excellent task completion rate!' :
                     getCompletionRate() >= 60 ? 'Keep up the good work!' :
                     'Complete more tasks to improve your rating'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import axios from 'axios';
import {
  ClipboardDocumentListIcon,
  ClockIcon,
  CheckCircleIcon,
  PlusIcon,
  UserGroupIcon,
  ArrowPathIcon,
  CalendarIcon,
  ExclamationCircleIcon
} from '@heroicons/react/24/outline';

const Dashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    inProgress: 0,
    completed: 0
  });
  const [assignedStats, setAssignedStats] = useState({
    assignedToMe: 0,
    createdByMe: 0
  });
  const [recentTasks, setRecentTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
  const userId = user?.id;

  useEffect(() => {
    const fetchData = async () => {
      console.log('Dashboard useEffect triggered');
      console.log('User state:', user);
      console.log('Token in localStorage:', localStorage.getItem('token'));
      
      if (!user || !userId) {
        console.log('User not loaded yet, user:', user);
        setLoading(false);
        return;
      }
      
      try {
        setLoading(true);
        console.log('Making API call to:', `${API_BASE_URL}/tasks?limit=100`);
        console.log('Current user ID:', userId);
        
        // Fetch user's tasks using axios like TaskList
        const response = await axios.get(`${API_BASE_URL}/tasks?limit=100`);
        console.log('API Response status:', response.status);
        console.log('API Response data:', response.data);
        
        if (!response.data.success) {
          console.error('API returned unsuccessful response:', response.data);
          setLoading(false);
          return;
        }
        
        const tasks = response.data.data || [];
        console.log('Number of tasks received:', tasks.length);
        console.log('Tasks:', tasks);
        
        // Calculate stats
        const totalStats = {
          total: tasks.length,
          pending: tasks.filter(task => task.status === 'pending').length,
          inProgress: tasks.filter(task => task.status === 'in-progress').length,
          completed: tasks.filter(task => task.status === 'completed').length
        };
        
        // Calculate assignment stats
        const assignmentStats = {
          assignedToMe: tasks.filter(task => 
            task.assignedTo && 
            task.assignedTo._id === userId && 
            task.createdBy._id !== userId
          ).length,
          createdByMe: tasks.filter(task => 
            task.createdBy && task.createdBy._id === userId
          ).length
        };
        
        console.log('Final stats calculated:', { totalStats, assignmentStats });
        
        setStats(totalStats);
        setAssignedStats(assignmentStats);
        setRecentTasks(tasks.slice(0, 5)); // Only show 5 recent tasks
        setLoading(false);
        console.log('Dashboard data loading complete');
      } catch (error) {
        console.error('Dashboard API Error:', error);
        console.error('Error response:', error.response?.data);
        setLoading(false);
      }
    };

    fetchData();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId, API_BASE_URL]);

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'in-progress':
        return 'bg-blue-100 text-blue-800';
      case 'completed':
        return 'bg-green-100 text-green-800';
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="flex items-center justify-center min-h-96">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading dashboard...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-8">
          {/* Header */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
                <p className="mt-1 text-sm text-gray-500">
                  Welcome back, {user?.name}! Here's what's happening today.
                </p>
              </div>
              <div className="mt-4 sm:mt-0">
                <Link
                  to="/tasks/new"
                  className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  <PlusIcon className="-ml-1 mr-2 h-5 w-5" />
                  New Task
                </Link>
              </div>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <ClipboardDocumentListIcon className="h-8 w-8 text-blue-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Tasks</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <ClockIcon className="h-8 w-8 text-yellow-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Pending</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.pending}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <ArrowPathIcon className="h-8 w-8 text-blue-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">In Progress</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.inProgress}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <CheckCircleIcon className="h-8 w-8 text-green-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Completed</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.completed}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Assignment Stats Cards */}
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg shadow-sm border border-blue-200 p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <UserGroupIcon className="h-8 w-8 text-blue-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-blue-700">Tasks Assigned to Me</p>
                  <p className="text-2xl font-bold text-blue-900">{assignedStats.assignedToMe}</p>
                  <p className="text-xs text-blue-600">Tasks others have assigned to you</p>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-r from-green-50 to-green-100 rounded-lg shadow-sm border border-green-200 p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <PlusIcon className="h-8 w-8 text-green-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-green-700">Tasks I Created</p>
                  <p className="text-2xl font-bold text-green-900">{assignedStats.createdByMe}</p>
                  <p className="text-xs text-green-600">Tasks you have created</p>
                </div>
              </div>
            </div>
          </div>

          {/* Recent Tasks */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-medium text-gray-900">Recent Tasks</h2>
                <Link
                  to="/tasks"
                  className="text-sm font-medium text-blue-600 hover:text-blue-500"
                >
                  View all tasks
                </Link>
              </div>
            </div>
            
            {recentTasks.length > 0 ? (
              <div className="divide-y divide-gray-200">
                {recentTasks.slice(0, 5).map((task) => (
                  <div key={task._id} className="p-6 hover:bg-gray-50">
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2 mb-2">
                          <h3 className="text-sm font-medium text-gray-900 truncate">
                            {task.title}
                          </h3>
                          {task.assignedTo && task.assignedTo._id === user._id && task.createdBy._id !== user._id && (
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                              Assigned to me
                            </span>
                          )}
                          {task.createdBy._id === user._id && (
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                              Created by me
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-gray-600 mb-2 truncate">
                          {task.description}
                        </p>
                        <div className="flex items-center space-x-4 text-xs text-gray-500">
                          <div className="flex items-center">
                            <CalendarIcon className="h-4 w-4 mr-1" />
                            Due: {new Date(task.dueDate).toLocaleDateString()}
                          </div>
                          {task.assignedTo && (
                            <div>
                              Assigned to: {task.assignedTo.name}
                            </div>
                          )}
                          {task.createdBy && (
                            <div>
                              Created by: {task.createdBy.name}
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center space-x-2 ml-4">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(task.status)}`}>
                          {task.status}
                        </span>
                        <span className={`text-sm font-medium ${getPriorityColor(task.priority)}`}>
                          {task.priority}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-6">
                <ClipboardDocumentListIcon className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">No tasks</h3>
                <p className="mt-1 text-sm text-gray-500">
                  Get started by creating a new task.
                </p>
                <div className="mt-6">
                  <Link
                    to="/tasks/new"
                    className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    <PlusIcon className="-ml-1 mr-2 h-5 w-5" />
                    New Task
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

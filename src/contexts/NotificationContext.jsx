import { createContext, useReducer, useCallback, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../hooks/useAuth';

const NotificationContext = createContext();

const initialState = {
  notifications: [],
  unreadCount: 0,
  loading: false,
  error: null,
  page: 1,
  hasMore: true
};

const notificationReducer = (state, action) => {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    
    case 'SET_ERROR':
      return { ...state, error: action.payload, loading: false };
    
    case 'SET_NOTIFICATIONS':
      return {
        ...state,
        notifications: action.payload.notifications,
        unreadCount: action.payload.unreadCount || 0,
        page: action.payload.page || 1,
        hasMore: action.payload.hasMore || false,
        loading: false,
        error: null
      };
    
    case 'ADD_NOTIFICATION':
      return {
        ...state,
        notifications: [action.payload, ...state.notifications],
        unreadCount: state.unreadCount + 1
      };
    
    case 'APPEND_NOTIFICATIONS':
      return {
        ...state,
        notifications: [...state.notifications, ...action.payload.notifications],
        page: action.payload.page,
        hasMore: action.payload.hasMore,
        loading: false
      };
    
    case 'UPDATE_NOTIFICATION':
      return {
        ...state,
        notifications: state.notifications.map(notification =>
          notification._id === action.payload._id ? action.payload : notification
        )
      };
    
    case 'MARK_AS_READ':
      return {
        ...state,
        notifications: state.notifications.map(notification =>
          notification._id === action.payload.id 
            ? { ...notification, read: true, readAt: new Date() }
            : notification
        ),
        unreadCount: Math.max(0, state.unreadCount - 1)
      };
    
    case 'MARK_ALL_AS_READ':
      return {
        ...state,
        notifications: state.notifications.map(notification => ({
          ...notification,
          read: true,
          readAt: new Date()
        })),
        unreadCount: 0
      };
    
    case 'SET_UNREAD_COUNT':
      return {
        ...state,
        unreadCount: action.payload
      };
    
    case 'REMOVE_NOTIFICATION':
      return {
        ...state,
        notifications: state.notifications.filter(
          notification => notification._id !== action.payload
        ),
        unreadCount: state.notifications.find(n => n._id === action.payload && !n.read) 
          ? state.unreadCount - 1 
          : state.unreadCount
      };
    
    case 'CLEAR_NOTIFICATIONS':
      return {
        ...state,
        notifications: [],
        unreadCount: 0,
        page: 1,
        hasMore: true
      };
    
    default:
      return state;
  }
};

export const NotificationProvider = ({ children }) => {
  const [state, dispatch] = useReducer(notificationReducer, initialState);
  const { user, token } = useAuth();
  
  const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

  // Fetch notifications
  const fetchNotifications = useCallback(async (page = 1, limit = 20) => {
    if (!token || !user) return;

    try {
      if (page === 1) {
        dispatch({ type: 'SET_LOADING', payload: true });
      }

      const response = await axios.get(
        `${API_BASE_URL}/notifications?page=${page}&limit=${limit}`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      if (response.data.success) {
        const hasMore = page < response.data.pages;
        
        if (page === 1) {
          dispatch({
            type: 'SET_NOTIFICATIONS',
            payload: {
              notifications: response.data.data,
              unreadCount: response.data.data.filter(n => !n.read).length,
              page,
              hasMore
            }
          });
        } else {
          dispatch({
            type: 'APPEND_NOTIFICATIONS',
            payload: {
              notifications: response.data.data,
              page,
              hasMore
            }
          });
        }
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
      dispatch({ 
        type: 'SET_ERROR', 
        payload: error.response?.data?.message || 'Failed to fetch notifications' 
      });
    }
  }, [API_BASE_URL, token, user]);

  // Fetch unread count
  const fetchUnreadCount = useCallback(async () => {
    if (!token || !user) return;

    try {
      const response = await axios.get(
        `${API_BASE_URL}/notifications/unread-count`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      if (response.data.success) {
        dispatch({
          type: 'SET_UNREAD_COUNT',
          payload: response.data.data.count
        });
      }
    } catch (error) {
      console.error('Error fetching unread count:', error);
    }
  }, [API_BASE_URL, token, user]);

  // Mark notification as read
  const markAsRead = useCallback(async (notificationId) => {
    if (!token) return;

    try {
      await axios.put(
        `${API_BASE_URL}/notifications/${notificationId}/read`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      dispatch({ type: 'MARK_AS_READ', payload: { id: notificationId } });
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  }, [API_BASE_URL, token]);

  // Mark all notifications as read
  const markAllAsRead = useCallback(async () => {
    if (!token) return;

    try {
      await axios.put(
        `${API_BASE_URL}/notifications/mark-all-read`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      dispatch({ type: 'MARK_ALL_AS_READ' });
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  }, [API_BASE_URL, token]);

  // Delete notification
  const deleteNotification = useCallback(async (notificationId) => {
    if (!token) return;

    try {
      await axios.delete(
        `${API_BASE_URL}/notifications/${notificationId}`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      dispatch({ type: 'REMOVE_NOTIFICATION', payload: notificationId });
    } catch (error) {
      console.error('Error deleting notification:', error);
    }
  }, [API_BASE_URL, token]);

  // Load more notifications
  const loadMore = useCallback(() => {
    if (state.hasMore && !state.loading) {
      fetchNotifications(state.page + 1);
    }
  }, [fetchNotifications, state.hasMore, state.loading, state.page]);

  // Auto-refresh notifications periodically
  useEffect(() => {
    if (!user || !token) return;

    // Initial load
    fetchNotifications();
    fetchUnreadCount();

    // Set up periodic refresh (every 30 seconds)
    const interval = setInterval(() => {
      fetchUnreadCount();
    }, 30000);

    return () => clearInterval(interval);
  }, [fetchNotifications, fetchUnreadCount, user, token]);

  // Clear notifications on logout
  useEffect(() => {
    if (!user || !token) {
      dispatch({ type: 'CLEAR_NOTIFICATIONS' });
    }
  }, [user, token]);

  const value = {
    ...state,
    fetchNotifications,
    fetchUnreadCount,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    loadMore,
    refreshNotifications: () => fetchNotifications(1)
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};

export { NotificationContext };

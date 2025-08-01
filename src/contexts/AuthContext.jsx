import { useReducer, useEffect, useCallback } from 'react';
import axios from 'axios';
import { AuthContext } from './AuthContextState';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Initial state
const initialState = {
  user: null,
  token: localStorage.getItem('token'),
  loading: true,
  error: null
};

// Auth reducer
const authReducer = (state, action) => {
  switch (action.type) {
    case 'LOGIN_SUCCESS':
    case 'REGISTER_SUCCESS':
      localStorage.setItem('token', action.payload.token);
      return {
        ...state,
        user: action.payload.user,
        token: action.payload.token,
        loading: false,
        error: null
      };
    case 'LOGOUT':
      localStorage.removeItem('token');
      return {
        ...state,
        user: null,
        token: null,
        loading: false,
        error: null
      };
    case 'USER_LOADED':
      return {
        ...state,
        user: action.payload,
        loading: false,
        error: null
      };
    case 'AUTH_ERROR':
      localStorage.removeItem('token');
      return {
        ...state,
        user: null,
        token: null,
        loading: false,
        error: action.payload
      };
    case 'CLEAR_ERROR':
      return {
        ...state,
        error: null
      };
    case 'SET_LOADING':
      return {
        ...state,
        loading: action.payload
      };
    default:
      return state;
  }
};

// Auth Provider Component
export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Set auth token for axios
  const setAuthToken = (token) => {
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    } else {
      delete axios.defaults.headers.common['Authorization'];
    }
  };

  // Load user
  const loadUser = useCallback(async () => {
    if (localStorage.token) {
      setAuthToken(localStorage.token);
      try {
        const res = await axios.get(`${API_BASE_URL}/auth/me`);
        dispatch({
          type: 'USER_LOADED',
          payload: res.data.user
        });
      } catch (error) {
        dispatch({
          type: 'AUTH_ERROR',
          payload: error.response?.data?.message || 'Authentication failed'
        });
      }
    } else {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, []);

  // Register user
  const register = useCallback(async (userData) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      const res = await axios.post(`${API_BASE_URL}/auth/register`, userData);
      
      dispatch({
        type: 'REGISTER_SUCCESS',
        payload: {
          token: res.data.token,
          user: res.data.user
        }
      });
      
      setAuthToken(res.data.token);
      return { success: true, message: res.data.message };
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Registration failed';
      dispatch({
        type: 'AUTH_ERROR',
        payload: errorMessage
      });
      return { success: false, message: errorMessage };
    }
  }, []);

  // Login user
  const login = useCallback(async (credentials) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      const res = await axios.post(`${API_BASE_URL}/auth/login`, credentials);
      
      dispatch({
        type: 'LOGIN_SUCCESS',
        payload: {
          token: res.data.token,
          user: res.data.user
        }
      });
      
      setAuthToken(res.data.token);
      return { success: true, message: res.data.message };
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Login failed';
      dispatch({
        type: 'AUTH_ERROR',
        payload: errorMessage
      });
      return { success: false, message: errorMessage };
    }
  }, []);

  // Logout user
  const logout = useCallback(() => {
    dispatch({ type: 'LOGOUT' });
    setAuthToken(null);
  }, []);

  // Update user profile
  const updateUser = useCallback(async (userData) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      const res = await axios.put(`${API_BASE_URL}/users/${state.user.id}`, userData);
      
      dispatch({
        type: 'USER_LOADED',
        payload: res.data.data
      });
      
      return { success: true, message: 'Profile updated successfully' };
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Profile update failed';
      dispatch({ type: 'SET_LOADING', payload: false });
      return { success: false, message: errorMessage };
    }
  }, [state.user]);

  // Clear errors
  const clearError = useCallback(() => {
    dispatch({ type: 'CLEAR_ERROR' });
  }, []);

  // Load user on app start
  useEffect(() => {
    const initializeAuth = async () => {
      if (localStorage.token) {
        setAuthToken(localStorage.token);
        try {
          const res = await axios.get(`${API_BASE_URL}/auth/me`);
          dispatch({
            type: 'USER_LOADED',
            payload: res.data.user
          });
        } catch (error) {
          dispatch({
            type: 'AUTH_ERROR',
            payload: error.response?.data?.message || 'Authentication failed'
          });
        }
      } else {
        dispatch({ type: 'SET_LOADING', payload: false });
      }
    };

    initializeAuth();
  }, []);

  const value = {
    user: state.user,
    token: state.token,
    loading: state.loading,
    error: state.error,
    register,
    login,
    logout,
    clearError,
    loadUser,
    updateUser
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

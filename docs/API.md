# 🔌 API Documentation

## Base URL
```
Production: https://your-api-domain.com/api
Development: http://localhost:5000/api
```

## Authentication

All protected routes require a valid JWT token in the Authorization header:
```
Authorization: Bearer <your-jwt-token>
```

---

## 🔐 Authentication Endpoints

### Register User
**POST** `/auth/register`

Register a new user account.

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123"
}
```

**Response (201):**
```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "user": {
      "_id": "64f8a1b2c3d4e5f6a7b8c9d0",
      "name": "John Doe",
      "email": "john@example.com",
      "createdAt": "2025-08-01T10:30:00.000Z"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

### Login User
**POST** `/auth/login`

Authenticate user and get access token.

**Request Body:**
```json
{
  "email": "john@example.com",
  "password": "password123"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {
      "_id": "64f8a1b2c3d4e5f6a7b8c9d0",
      "name": "John Doe",
      "email": "john@example.com"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

### Get Current User
**GET** `/auth/me`

Get current authenticated user information.

**Headers:**
```
Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "user": {
      "_id": "64f8a1b2c3d4e5f6a7b8c9d0",
      "name": "John Doe",
      "email": "john@example.com",
      "createdAt": "2025-08-01T10:30:00.000Z"
    }
  }
}
```

---

## 📋 Task Management Endpoints

### Get All Tasks
**GET** `/tasks`

Retrieve all tasks for the authenticated user.

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10)
- `status` (optional): Filter by status (pending, in-progress, completed)
- `priority` (optional): Filter by priority (low, medium, high)
- `search` (optional): Search in title and description

**Example:**
```
GET /tasks?page=1&limit=10&status=pending&priority=high&search=project
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "tasks": [
      {
        "_id": "64f8a1b2c3d4e5f6a7b8c9d1",
        "title": "Complete Project Documentation",
        "description": "Write comprehensive API documentation",
        "status": "pending",
        "priority": "high",
        "assignedTo": {
          "_id": "64f8a1b2c3d4e5f6a7b8c9d0",
          "name": "John Doe",
          "email": "john@example.com"
        },
        "attachments": [
          {
            "filename": "requirements.pdf",
            "originalName": "Project Requirements.pdf",
            "path": "/uploads/requirements.pdf",
            "size": 1024000
          }
        ],
        "createdAt": "2025-08-01T10:30:00.000Z",
        "updatedAt": "2025-08-01T10:30:00.000Z"
      }
    ],
    "pagination": {
      "currentPage": 1,
      "totalPages": 5,
      "totalTasks": 47,
      "hasNext": true,
      "hasPrev": false
    }
  }
}
```

### Create Task
**POST** `/tasks`

Create a new task.

**Request Body (multipart/form-data):**
```json
{
  "title": "Complete Project Documentation",
  "description": "Write comprehensive API documentation",
  "status": "pending",
  "priority": "high",
  "assignedTo": "64f8a1b2c3d4e5f6a7b8c9d0"
}
```

**Files (optional):**
- `attachments`: Multiple file uploads supported

**Response (201):**
```json
{
  "success": true,
  "message": "Task created successfully",
  "data": {
    "task": {
      "_id": "64f8a1b2c3d4e5f6a7b8c9d1",
      "title": "Complete Project Documentation",
      "description": "Write comprehensive API documentation",
      "status": "pending",
      "priority": "high",
      "assignedTo": {
        "_id": "64f8a1b2c3d4e5f6a7b8c9d0",
        "name": "John Doe",
        "email": "john@example.com"
      },
      "attachments": [],
      "createdAt": "2025-08-01T10:30:00.000Z",
      "updatedAt": "2025-08-01T10:30:00.000Z"
    }
  }
}
```

### Get Task by ID
**GET** `/tasks/:id`

Retrieve a specific task by ID.

**Response (200):**
```json
{
  "success": true,
  "data": {
    "task": {
      "_id": "64f8a1b2c3d4e5f6a7b8c9d1",
      "title": "Complete Project Documentation",
      "description": "Write comprehensive API documentation",
      "status": "pending",
      "priority": "high",
      "assignedTo": {
        "_id": "64f8a1b2c3d4e5f6a7b8c9d0",
        "name": "John Doe",
        "email": "john@example.com"
      },
      "attachments": [],
      "createdAt": "2025-08-01T10:30:00.000Z",
      "updatedAt": "2025-08-01T10:30:00.000Z"
    }
  }
}
```

### Update Task
**PUT** `/tasks/:id`

Update an existing task.

**Request Body:**
```json
{
  "title": "Updated Task Title",
  "description": "Updated description",
  "status": "in-progress",
  "priority": "medium"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Task updated successfully",
  "data": {
    "task": {
      "_id": "64f8a1b2c3d4e5f6a7b8c9d1",
      "title": "Updated Task Title",
      "description": "Updated description",
      "status": "in-progress",
      "priority": "medium",
      "assignedTo": {
        "_id": "64f8a1b2c3d4e5f6a7b8c9d0",
        "name": "John Doe",
        "email": "john@example.com"
      },
      "attachments": [],
      "createdAt": "2025-08-01T10:30:00.000Z",
      "updatedAt": "2025-08-01T12:45:00.000Z"
    }
  }
}
```

### Delete Task
**DELETE** `/tasks/:id`

Delete a task by ID.

**Response (200):**
```json
{
  "success": true,
  "message": "Task deleted successfully"
}
```

---

## 🔔 Notification Endpoints

### Get All Notifications
**GET** `/notifications`

Retrieve all notifications for the authenticated user.

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 20)
- `isRead` (optional): Filter by read status (true/false)

**Response (200):**
```json
{
  "success": true,
  "data": {
    "notifications": [
      {
        "_id": "64f8a1b2c3d4e5f6a7b8c9d2",
        "type": "task_assigned",
        "title": "New Task Assigned",
        "message": "You have been assigned a new task: Complete Project Documentation",
        "relatedId": "64f8a1b2c3d4e5f6a7b8c9d1",
        "relatedModel": "Task",
        "isRead": false,
        "createdAt": "2025-08-01T10:30:00.000Z"
      }
    ],
    "pagination": {
      "currentPage": 1,
      "totalPages": 3,
      "totalNotifications": 25,
      "unreadCount": 8
    }
  }
}
```

### Mark Notification as Read
**PUT** `/notifications/:id/read`

Mark a specific notification as read.

**Response (200):**
```json
{
  "success": true,
  "message": "Notification marked as read",
  "data": {
    "notification": {
      "_id": "64f8a1b2c3d4e5f6a7b8c9d2",
      "isRead": true,
      "updatedAt": "2025-08-01T12:45:00.000Z"
    }
  }
}
```

### Mark All Notifications as Read
**PUT** `/notifications/mark-all-read`

Mark all notifications as read for the authenticated user.

**Response (200):**
```json
{
  "success": true,
  "message": "All notifications marked as read",
  "data": {
    "modifiedCount": 8
  }
}
```

### Delete Notification
**DELETE** `/notifications/:id`

Delete a specific notification.

**Response (200):**
```json
{
  "success": true,
  "message": "Notification deleted successfully"
}
```

---

## 👥 User Management Endpoints

### Get All Users
**GET** `/users`

Retrieve all users (for task assignment).

**Response (200):**
```json
{
  "success": true,
  "data": {
    "users": [
      {
        "_id": "64f8a1b2c3d4e5f6a7b8c9d0",
        "name": "John Doe",
        "email": "john@example.com",
        "createdAt": "2025-08-01T10:30:00.000Z"
      },
      {
        "_id": "64f8a1b2c3d4e5f6a7b8c9d3",
        "name": "Jane Smith",
        "email": "jane@example.com",
        "createdAt": "2025-08-01T09:15:00.000Z"
      }
    ]
  }
}
```

### Update User Profile
**PUT** `/users/profile`

Update current user's profile information.

**Request Body:**
```json
{
  "name": "John Doe Updated",
  "email": "john.updated@example.com"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Profile updated successfully",
  "data": {
    "user": {
      "_id": "64f8a1b2c3d4e5f6a7b8c9d0",
      "name": "John Doe Updated",
      "email": "john.updated@example.com",
      "updatedAt": "2025-08-01T12:45:00.000Z"
    }
  }
}
```

---

## 📊 Statistics Endpoints

### Get Dashboard Stats
**GET** `/stats/dashboard`

Get dashboard statistics for the authenticated user.

**Response (200):**
```json
{
  "success": true,
  "data": {
    "stats": {
      "totalTasks": 47,
      "pendingTasks": 15,
      "inProgressTasks": 12,
      "completedTasks": 20,
      "totalNotifications": 25,
      "unreadNotifications": 8,
      "tasksCreatedThisWeek": 5,
      "tasksCompletedThisWeek": 8
    }
  }
}
```

---

## 📁 File Upload Endpoints

### Upload Files
**POST** `/upload`

Upload files for task attachments.

**Request (multipart/form-data):**
- `files`: Multiple files (max 10MB each)

**Allowed file types:**
- Documents: PDF, DOC, DOCX
- Images: PNG, JPG, JPEG, GIF
- Archives: ZIP, RAR

**Response (200):**
```json
{
  "success": true,
  "message": "Files uploaded successfully",
  "data": {
    "files": [
      {
        "filename": "document_1628671234567.pdf",
        "originalName": "Project Requirements.pdf",
        "path": "/uploads/document_1628671234567.pdf",
        "size": 1024000,
        "mimetype": "application/pdf"
      }
    ]
  }
}
```

### Download File
**GET** `/upload/:filename`

Download a specific file.

**Response:** File download with appropriate headers.

---

## ❌ Error Responses

### Common Error Codes

| Code | Description |
|------|-------------|
| 400 | Bad Request - Invalid input data |
| 401 | Unauthorized - Invalid or missing token |
| 403 | Forbidden - Insufficient permissions |
| 404 | Not Found - Resource doesn't exist |
| 413 | Payload Too Large - File size exceeds limit |
| 422 | Unprocessable Entity - Validation errors |
| 429 | Too Many Requests - Rate limit exceeded |
| 500 | Internal Server Error - Server error |

### Error Response Format

```json
{
  "success": false,
  "message": "Error description",
  "error": {
    "code": "VALIDATION_ERROR",
    "details": [
      {
        "field": "email",
        "message": "Email is required"
      }
    ]
  }
}
```

---

## 🔄 Rate Limiting

API endpoints are rate-limited to prevent abuse:

- **Authentication endpoints**: 5 requests per minute per IP
- **General endpoints**: 100 requests per minute per user
- **File upload**: 10 requests per minute per user

Rate limit headers are included in responses:
```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1628671834
```

---

## 📝 Response Status Codes

| Code | Status | Description |
|------|--------|-------------|
| 200 | OK | Request successful |
| 201 | Created | Resource created successfully |
| 400 | Bad Request | Invalid request data |
| 401 | Unauthorized | Authentication required |
| 403 | Forbidden | Access denied |
| 404 | Not Found | Resource not found |
| 422 | Unprocessable Entity | Validation failed |
| 429 | Too Many Requests | Rate limit exceeded |
| 500 | Internal Server Error | Server error |

---

## 🔧 Testing the API

### Using cURL

```bash
# Register a new user
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "password": "password123"
  }'

# Login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }'

# Get tasks (with token)
curl -X GET http://localhost:5000/api/tasks \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Using Postman

1. Import the API collection from `/docs/postman/`
2. Set the environment variables:
   - `baseUrl`: http://localhost:5000/api
   - `token`: Your JWT token after login
3. Run the requests

---

## 📚 Additional Resources

- [Postman Collection](./postman/TASKIFY.postman_collection.json)
- [Environment Variables](./postman/TASKIFY.postman_environment.json)
- [Database Schema](./database-schema.md)
- [Deployment Guide](../DOCKER_GUIDE.md)

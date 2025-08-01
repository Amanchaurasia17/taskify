# 🗄️ Database Schema Documentation

## Overview

TASKIFY uses **MongoDB** as the primary database. This document outlines the database schema, relationships, and indexing strategies.

---

## 📊 Collections Overview

| Collection | Purpose | Documents (Approx.) |
|------------|---------|---------------------|
| `users` | User accounts and profiles | ~1K |
| `tasks` | Task management data | ~10K |
| `notifications` | User notifications | ~50K |
| `sessions` | User session tracking | ~5K |

---

## 👥 Users Collection

### Schema Structure

```javascript
{
  _id: ObjectId,
  name: String,
  email: String,
  password: String,
  role: String,
  avatar: String,
  isActive: Boolean,
  lastLogin: Date,
  createdAt: Date,
  updatedAt: Date
}
```

### Field Details

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `_id` | ObjectId | Yes | Primary key (auto-generated) |
| `name` | String | Yes | User's full name (3-50 chars) |
| `email` | String | Yes | Unique email address |
| `password` | String | Yes | Bcrypt hashed password |
| `role` | String | No | User role (default: 'user') |
| `avatar` | String | No | Avatar image URL |
| `isActive` | Boolean | No | Account status (default: true) |
| `lastLogin` | Date | No | Last login timestamp |
| `createdAt` | Date | Yes | Account creation date |
| `updatedAt` | Date | Yes | Last update timestamp |

### Validation Rules

```javascript
const userSchema = {
  name: {
    type: String,
    required: true,
    trim: true,
    minlength: 3,
    maxlength: 50
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    validate: [validator.isEmail, 'Please provide a valid email']
  },
  password: {
    type: String,
    required: true,
    minlength: 8,
    select: false
  },
  role: {
    type: String,
    enum: ['user', 'admin', 'manager'],
    default: 'user'
  },
  isActive: {
    type: Boolean,
    default: true
  }
}
```

### Indexes

```javascript
// Unique index on email
db.users.createIndex({ "email": 1 }, { unique: true })

// Compound index for active users
db.users.createIndex({ "isActive": 1, "createdAt": -1 })

// Text search index
db.users.createIndex({ 
  "name": "text", 
  "email": "text" 
})
```

---

## 📋 Tasks Collection

### Schema Structure

```javascript
{
  _id: ObjectId,
  title: String,
  description: String,
  status: String,
  priority: String,
  assignedTo: ObjectId,
  createdBy: ObjectId,
  attachments: [AttachmentSchema],
  dueDate: Date,
  completedAt: Date,
  tags: [String],
  comments: [CommentSchema],
  createdAt: Date,
  updatedAt: Date
}
```

### Field Details

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `_id` | ObjectId | Yes | Primary key (auto-generated) |
| `title` | String | Yes | Task title (5-100 chars) |
| `description` | String | No | Detailed description |
| `status` | String | Yes | Current status (enum) |
| `priority` | String | Yes | Priority level (enum) |
| `assignedTo` | ObjectId | No | Assigned user reference |
| `createdBy` | ObjectId | Yes | Creator user reference |
| `attachments` | Array | No | File attachments |
| `dueDate` | Date | No | Task deadline |
| `completedAt` | Date | No | Completion timestamp |
| `tags` | Array | No | Task tags/labels |
| `comments` | Array | No | Task comments |
| `createdAt` | Date | Yes | Creation timestamp |
| `updatedAt` | Date | Yes | Last update timestamp |

### Embedded Schemas

#### Attachment Schema
```javascript
{
  filename: String,
  originalName: String,
  path: String,
  size: Number,
  mimetype: String,
  uploadedAt: Date
}
```

#### Comment Schema
```javascript
{
  _id: ObjectId,
  author: ObjectId,
  content: String,
  createdAt: Date
}
```

### Validation Rules

```javascript
const taskSchema = {
  title: {
    type: String,
    required: true,
    trim: true,
    minlength: 5,
    maxlength: 100
  },
  description: {
    type: String,
    maxlength: 1000
  },
  status: {
    type: String,
    enum: ['pending', 'in-progress', 'completed', 'cancelled'],
    default: 'pending'
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium'
  },
  assignedTo: {
    type: ObjectId,
    ref: 'User'
  },
  createdBy: {
    type: ObjectId,
    ref: 'User',
    required: true
  },
  dueDate: {
    type: Date,
    validate: {
      validator: function(date) {
        return !date || date > Date.now();
      },
      message: 'Due date must be in the future'
    }
  }
}
```

### Indexes

```javascript
// Compound index for user tasks
db.tasks.createIndex({ "assignedTo": 1, "status": 1, "createdAt": -1 })

// Status and priority index
db.tasks.createIndex({ "status": 1, "priority": 1 })

// Creator index
db.tasks.createIndex({ "createdBy": 1, "createdAt": -1 })

// Due date index
db.tasks.createIndex({ "dueDate": 1 })

// Text search index
db.tasks.createIndex({ 
  "title": "text", 
  "description": "text",
  "tags": "text"
})

// Geospatial index for location-based tasks (future use)
db.tasks.createIndex({ "location": "2dsphere" })
```

---

## 🔔 Notifications Collection

### Schema Structure

```javascript
{
  _id: ObjectId,
  recipient: ObjectId,
  type: String,
  title: String,
  message: String,
  relatedId: ObjectId,
  relatedModel: String,
  isRead: Boolean,
  readAt: Date,
  data: Object,
  createdAt: Date,
  expiresAt: Date
}
```

### Field Details

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `_id` | ObjectId | Yes | Primary key (auto-generated) |
| `recipient` | ObjectId | Yes | User receiving notification |
| `type` | String | Yes | Notification type (enum) |
| `title` | String | Yes | Notification title |
| `message` | String | Yes | Notification content |
| `relatedId` | ObjectId | No | Related entity ID |
| `relatedModel` | String | No | Related entity type |
| `isRead` | Boolean | No | Read status (default: false) |
| `readAt` | Date | No | Read timestamp |
| `data` | Object | No | Additional metadata |
| `createdAt` | Date | Yes | Creation timestamp |
| `expiresAt` | Date | No | Expiration date (TTL) |

### Validation Rules

```javascript
const notificationSchema = {
  recipient: {
    type: ObjectId,
    ref: 'User',
    required: true
  },
  type: {
    type: String,
    enum: [
      'task_assigned',
      'task_updated',
      'task_completed',
      'task_overdue',
      'comment_added',
      'file_uploaded',
      'system_announcement'
    ],
    required: true
  },
  title: {
    type: String,
    required: true,
    maxlength: 100
  },
  message: {
    type: String,
    required: true,
    maxlength: 500
  },
  relatedModel: {
    type: String,
    enum: ['Task', 'User', 'System']
  },
  isRead: {
    type: Boolean,
    default: false
  },
  expiresAt: {
    type: Date,
    default: Date.now,
    expires: 2592000 // 30 days
  }
}
```

### Indexes

```javascript
// Recipient and read status index
db.notifications.createIndex({ "recipient": 1, "isRead": 1, "createdAt": -1 })

// Type and creation date index
db.notifications.createIndex({ "type": 1, "createdAt": -1 })

// TTL index for auto-deletion
db.notifications.createIndex({ "expiresAt": 1 }, { expireAfterSeconds: 0 })

// Related entity index
db.notifications.createIndex({ "relatedId": 1, "relatedModel": 1 })
```

---

## 🔑 Sessions Collection

### Schema Structure

```javascript
{
  _id: ObjectId,
  userId: ObjectId,
  token: String,
  refreshToken: String,
  userAgent: String,
  ipAddress: String,
  isActive: Boolean,
  lastActivity: Date,
  createdAt: Date,
  expiresAt: Date
}
```

### Field Details

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `_id` | ObjectId | Yes | Primary key (auto-generated) |
| `userId` | ObjectId | Yes | User reference |
| `token` | String | Yes | JWT token hash |
| `refreshToken` | String | No | Refresh token |
| `userAgent` | String | No | Browser/client info |
| `ipAddress` | String | No | Client IP address |
| `isActive` | Boolean | No | Session status |
| `lastActivity` | Date | Yes | Last activity timestamp |
| `createdAt` | Date | Yes | Session creation |
| `expiresAt` | Date | Yes | Session expiration |

### Indexes

```javascript
// User sessions index
db.sessions.createIndex({ "userId": 1, "isActive": 1, "lastActivity": -1 })

// Token hash index
db.sessions.createIndex({ "token": 1 }, { unique: true })

// TTL index for auto-deletion
db.sessions.createIndex({ "expiresAt": 1 }, { expireAfterSeconds: 0 })
```

---

## 🔗 Relationships

### User → Tasks
- One-to-Many: A user can be assigned to multiple tasks
- One-to-Many: A user can create multiple tasks

```javascript
// Populate assigned tasks
User.findById(userId).populate('assignedTasks')

// Populate created tasks
User.findById(userId).populate('createdTasks')
```

### Task → User
- Many-to-One: Multiple tasks can be assigned to one user
- Many-to-One: Multiple tasks can be created by one user

```javascript
// Populate task assignee
Task.findById(taskId).populate('assignedTo', 'name email')

// Populate task creator
Task.findById(taskId).populate('createdBy', 'name email')
```

### User → Notifications
- One-to-Many: A user can have multiple notifications

```javascript
// Get user notifications
Notification.find({ recipient: userId })
  .populate('recipient', 'name email')
  .sort({ createdAt: -1 })
```

---

## 📈 Performance Optimizations

### 1. Database Indexing Strategy

```javascript
// Compound indexes for common queries
db.tasks.createIndex({ 
  "assignedTo": 1, 
  "status": 1, 
  "priority": 1, 
  "createdAt": -1 
})

// Partial indexes for specific conditions
db.tasks.createIndex(
  { "dueDate": 1 },
  { partialFilterExpression: { "dueDate": { $exists: true } } }
)
```

### 2. Aggregation Pipeline Optimization

```javascript
// Optimized task statistics query
db.tasks.aggregate([
  { $match: { assignedTo: ObjectId(userId) } },
  { $group: {
      _id: "$status",
      count: { $sum: 1 }
    }
  },
  { $sort: { _id: 1 } }
])
```

### 3. Connection Pooling

```javascript
// MongoDB connection configuration
const mongooseOptions = {
  maxPoolSize: 10,
  serverSelectionTimeoutMS: 5000,
  socketTimeoutMS: 45000,
  family: 4,
  bufferCommands: false,
  bufferMaxEntries: 0
}
```

---

## 🔒 Security Considerations

### 1. Data Validation
- Input sanitization at schema level
- Mongoose validation for data integrity
- Custom validators for business rules

### 2. Access Control
```javascript
// Field-level access control
const userSchema = new Schema({
  password: { 
    type: String, 
    required: true,
    select: false  // Never return in queries
  }
})
```

### 3. Data Encryption
```javascript
// Sensitive field encryption
const sensitiveFields = ['ssn', 'creditCard']
sensitiveFields.forEach(field => {
  userSchema.pre('save', function() {
    if (this.isModified(field)) {
      this[field] = encrypt(this[field])
    }
  })
})
```

---

## 📊 Monitoring & Analytics

### 1. Query Performance
```javascript
// Enable profiling for slow queries
db.setProfilingLevel(2, { slowms: 100 })

// Check slow queries
db.system.profile.find().sort({ ts: -1 }).limit(5)
```

### 2. Collection Statistics
```javascript
// Get collection stats
db.tasks.stats()
db.users.stats()
db.notifications.stats()
```

### 3. Index Usage Analysis
```javascript
// Check index usage
db.tasks.getIndexes()
db.tasks.aggregate([{ $indexStats: {} }])
```

---

## 🔄 Data Migration Scripts

### 1. Adding New Fields
```javascript
// Add isArchived field to existing tasks
db.tasks.updateMany(
  { isArchived: { $exists: false } },
  { $set: { isArchived: false } }
)
```

### 2. Data Type Migrations
```javascript
// Convert string dates to Date objects
db.tasks.find({ createdAt: { $type: "string" } }).forEach(doc => {
  db.tasks.updateOne(
    { _id: doc._id },
    { $set: { createdAt: new Date(doc.createdAt) } }
  )
})
```

---

## 📝 Backup & Recovery

### 1. Backup Strategy
```bash
# Daily backup script
mongodump --host localhost:27017 --db taskify --out /backups/$(date +%Y%m%d)

# Compress backup
tar -czf taskify_backup_$(date +%Y%m%d).tar.gz /backups/$(date +%Y%m%d)
```

### 2. Recovery Process
```bash
# Restore from backup
mongorestore --host localhost:27017 --db taskify /backups/20250801/taskify/
```

---

## 🔧 Development Tools

### 1. MongoDB Compass
- Visual database exploration
- Query optimization
- Index management

### 2. Studio 3T
- Advanced query building
- Data comparison
- Export/Import utilities

### 3. Mongoose Debug Mode
```javascript
// Enable debug mode
mongoose.set('debug', true)

// Custom debug function
mongoose.set('debug', function (coll, method, query, doc) {
  console.log(`${coll}.${method}`, JSON.stringify(query), doc)
})
```

---

## 📚 Additional Resources

- [MongoDB Documentation](https://docs.mongodb.com/)
- [Mongoose Documentation](https://mongoosejs.com/docs/)
- [MongoDB Performance Best Practices](https://docs.mongodb.com/manual/administration/analyzing-mongodb-performance/)
- [Schema Design Patterns](https://docs.mongodb.com/manual/applications/data-models/)

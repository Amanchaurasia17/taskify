// MongoDB initialization script
// This script runs when the MongoDB container starts for the first time

// Switch to the application database
db = db.getSiblingDB('taskify');

// Create collections with indexes for better performance
db.createCollection('users');
db.createCollection('tasks');
db.createCollection('notifications');

// Create indexes for better query performance
db.users.createIndex({ "email": 1 }, { unique: true });
db.tasks.createIndex({ "assignedTo": 1, "status": 1 });
db.tasks.createIndex({ "createdBy": 1 });
db.tasks.createIndex({ "dueDate": 1 });
db.notifications.createIndex({ "recipient": 1, "read": 1 });
db.notifications.createIndex({ "createdAt": -1 });

// Create a default admin user (optional)
db.users.insertOne({
  name: "Admin User",
  email: "admin@taskflow.com",
  password: "$2a$10$rQ2QZ.Zp7CJz8ZxGqF6TzOYnJfWjSUZg5JfQpHn8Qz4XzJ8Qz4XzJ", // password: admin123
  role: "admin",
  isEmailVerified: true,
  createdAt: new Date(),
  updatedAt: new Date()
});

print('Database initialized successfully with indexes and default admin user');
print('Admin credentials: admin@taskflow.com / admin123');
print('Please change the admin password after first login!');

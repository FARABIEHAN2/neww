// MongoDB Initialization Script for NOTEZ FUN Platform

// Switch to the application database
db = db.getSiblingDB('notez_fun_db');

// Create application user
db.createUser({
  user: 'notez_app',
  pwd: 'notez_password_123',
  roles: [
    {
      role: 'readWrite',
      db: 'notez_fun_db'
    }
  ]
});

// Create collections with validation schemas
db.createCollection('users', {
  validator: {
    $jsonSchema: {
      bsonType: 'object',
      required: ['id', 'username', 'email', 'password_hash', 'created_at'],
      properties: {
        id: {
          bsonType: 'string',
          description: 'User unique identifier'
        },
        username: {
          bsonType: 'string',
          minLength: 1,
          maxLength: 50,
          description: 'Username must be between 1-50 characters'
        },
        email: {
          bsonType: 'string',
          pattern: '^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$',
          description: 'Valid email address required'
        },
        password_hash: {
          bsonType: 'string',
          description: 'Hashed password'
        },
        created_at: {
          bsonType: 'date',
          description: 'User creation timestamp'
        }
      }
    }
  }
});

db.createCollection('pages', {
  validator: {
    $jsonSchema: {
      bsonType: 'object',
      required: ['id', 'user_id', 'pagename', 'title', 'short_description', 'long_description', 'view_count', 'created_at'],
      properties: {
        id: {
          bsonType: 'string',
          description: 'Page unique identifier'
        },
        user_id: {
          bsonType: 'string',
          description: 'Reference to user who created the page'
        },
        pagename: {
          bsonType: 'string',
          minLength: 1,
          maxLength: 100,
          description: 'URL-friendly page name'
        },
        title: {
          bsonType: 'string',
          minLength: 1,
          maxLength: 200,
          description: 'Page title'
        },
        short_description: {
          bsonType: 'string',
          minLength: 1,
          maxLength: 500,
          description: 'Brief page description'
        },
        long_description: {
          bsonType: 'string',
          minLength: 1,
          description: 'Detailed page content'
        },
        view_count: {
          bsonType: 'int',
          minimum: 0,
          description: 'Number of page views'
        },
        is_maintenance: {
          bsonType: 'bool',
          description: 'Whether page is in maintenance mode'
        },
        is_suspended: {
          bsonType: 'bool',
          description: 'Whether page is suspended by admin'
        },
        suspension_reason: {
          bsonType: ['string', 'null'],
          description: 'Reason for page suspension'
        },
        created_at: {
          bsonType: 'date',
          description: 'Page creation timestamp'
        },
        updated_at: {
          bsonType: 'date',
          description: 'Page last update timestamp'
        }
      }
    }
  }
});

db.createCollection('feedback', {
  validator: {
    $jsonSchema: {
      bsonType: 'object',
      required: ['id', 'page_id', 'user_id', 'username', 'message', 'created_at'],
      properties: {
        id: {
          bsonType: 'string',
          description: 'Feedback unique identifier'
        },
        page_id: {
          bsonType: 'string',
          description: 'Reference to the page'
        },
        user_id: {
          bsonType: 'string',
          description: 'Reference to user who left feedback'
        },
        username: {
          bsonType: 'string',
          description: 'Username of feedback author'
        },
        message: {
          bsonType: 'string',
          minLength: 1,
          maxLength: 1000,
          description: 'Feedback message content'
        },
        created_at: {
          bsonType: 'date',
          description: 'Feedback creation timestamp'
        }
      }
    }
  }
});

db.createCollection('notifications', {
  validator: {
    $jsonSchema: {
      bsonType: 'object',
      required: ['id', 'user_id', 'type', 'title', 'message', 'is_read', 'created_at'],
      properties: {
        id: {
          bsonType: 'string',
          description: 'Notification unique identifier'
        },
        user_id: {
          bsonType: 'string',
          description: 'Reference to user receiving notification'
        },
        type: {
          bsonType: 'string',
          enum: ['feedback', 'suspension', 'system'],
          description: 'Type of notification'
        },
        title: {
          bsonType: 'string',
          minLength: 1,
          maxLength: 200,
          description: 'Notification title'
        },
        message: {
          bsonType: 'string',
          minLength: 1,
          maxLength: 1000,
          description: 'Notification message content'
        },
        is_read: {
          bsonType: 'bool',
          description: 'Whether notification has been read'
        },
        created_at: {
          bsonType: 'date',
          description: 'Notification creation timestamp'
        }
      }
    }
  }
});

// Create indexes for better performance
db.users.createIndex({ "email": 1 }, { unique: true });
db.users.createIndex({ "username": 1 }, { unique: true });
db.users.createIndex({ "id": 1 }, { unique: true });

db.pages.createIndex({ "id": 1 }, { unique: true });
db.pages.createIndex({ "pagename": 1 }, { unique: true });
db.pages.createIndex({ "user_id": 1 });
db.pages.createIndex({ "created_at": -1 });
db.pages.createIndex({ "view_count": -1 });

db.feedback.createIndex({ "id": 1 }, { unique: true });
db.feedback.createIndex({ "page_id": 1 });
db.feedback.createIndex({ "user_id": 1 });
db.feedback.createIndex({ "created_at": -1 });

db.notifications.createIndex({ "id": 1 }, { unique: true });
db.notifications.createIndex({ "user_id": 1 });
db.notifications.createIndex({ "is_read": 1 });
db.notifications.createIndex({ "created_at": -1 });
db.notifications.createIndex({ "type": 1 });

print('NOTEZ FUN database initialized successfully!');
print('Collections created: users, pages, feedback, notifications');
print('Indexes created for optimal performance');
print('Validation schemas applied for data integrity');
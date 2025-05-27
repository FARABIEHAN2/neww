# NOTEZ FUN Platform 🎉

A comprehensive page building and hosting platform with authentication, user management, and admin controls.

## 🚀 Features

### 🔐 Authentication System
- User registration with validation (6+ chars, 1 uppercase, 1 number)
- Secure login with JWT tokens
- "Remember me" functionality (30-day sessions)
- Protected routes and persistent sessions

### 🖥️ Dashboard Features
- **Create Website Tab:** Custom pagename, title, descriptions
- **Manage Websites Tab:** Edit, delete, maintenance mode toggle
- **Notifications Tab:** Feedback alerts, suspension notices
- View count tracking for all pages

### 📄 Dynamic Page System
- Custom page routing (/{pagename})
- Real-time view counting
- Maintenance mode display
- Feedback system for logged-in users
- Page suspension with admin messages

### 🔔 Notification System
- User-to-user feedback notifications
- Admin suspension notifications with reasons
- Read/unread status tracking
- Dashboard notification counter

### 👑 Owner Admin Panel
- Secure admin access (/owner route)
- Platform oversight and moderation
- Page suspension with custom reasons
- Send notifications to page creators
- View all users and their pages

### 🎨 Professional UI
- Beautiful purple gradient theme
- Responsive design with Tailwind CSS
- Smooth animations and transitions
- Modern card-based layouts

## 🛠️ Tech Stack

### Backend
- **FastAPI** - Modern Python web framework
- **MongoDB** - NoSQL database with Motor async driver
- **JWT** - Secure authentication tokens
- **Bcrypt** - Password hashing
- **Pydantic** - Data validation

### Frontend
- **React 18** - Modern UI library
- **React Router** - Client-side routing
- **Axios** - HTTP client
- **Tailwind CSS** - Utility-first CSS framework
- **Context API** - State management

### Production
- **Docker** - Containerization
- **Gunicorn** - WSGI server for production
- **Nginx** - Reverse proxy and static file serving
- **Render.com** - Cloud deployment platform

## 🚀 One-Click Deployment on Render.com

This project is configured for seamless one-click deployment on Render.com.

### Prerequisites
1. GitHub account with this repository
2. Render.com account
3. Fork or clone this repository to your GitHub

### Deployment Steps

1. **Connect to Render.com:**
   - Go to [Render.com](https://render.com)
   - Sign in with your GitHub account
   - Click "New" → "Blueprint"

2. **Deploy from Repository:**
   - Select this repository
   - Render will automatically detect the `render.yaml` configuration
   - Click "Apply" to start deployment

3. **Environment Variables:**
   The following environment variables will be automatically configured:
   - `MONGO_URL` - MongoDB connection string
   - `JWT_SECRET_KEY` - Auto-generated secure key
   - `REACT_APP_BACKEND_URL` - Auto-linked backend URL

4. **Services Created:**
   - **Backend Service** - FastAPI application
   - **Frontend Service** - React application 
   - **MongoDB Database** - Managed database

5. **Access Your App:**
   - Frontend: `https://notez-fun-frontend.onrender.com`
   - Backend API: `https://notez-fun-backend.onrender.com`
   - Admin Panel: `https://notez-fun-frontend.onrender.com/owner`

## 🔧 Local Development

### Prerequisites
- Python 3.11+
- Node.js 16+
- MongoDB
- Yarn

### Backend Setup
```bash
cd backend
cp .env.example .env
# Edit .env with your configuration
pip install -r requirements.txt
uvicorn server:app --host 0.0.0.0 --port 8001 --reload
```

### Frontend Setup
```bash
cd frontend
cp .env.example .env
# Edit .env with your configuration
yarn install
yarn start
```

### Database Setup
Make sure MongoDB is running locally or update the `MONGO_URL` in your `.env` file.

## 📡 API Endpoints

### Authentication
- `POST /api/register` - User registration
- `POST /api/login` - User login
- `GET /api/me` - Get current user

### Pages
- `POST /api/pages` - Create page
- `GET /api/pages` - Get user's pages
- `GET /api/pages/{id}` - Get specific page
- `PUT /api/pages/{id}` - Update page
- `DELETE /api/pages/{id}` - Delete page
- `GET /api/public/page/{pagename}` - Public page view

### Feedback
- `POST /api/feedback` - Submit feedback
- `GET /api/feedback/{page_id}` - Get page feedback

### Notifications
- `GET /api/notifications` - Get user notifications
- `PUT /api/notifications/{id}/read` - Mark notification read
- `GET /api/notifications/unread-count` - Get unread count

### Owner Admin
- `POST /api/owner/login` - Owner authentication
- `GET /api/owner/pages` - Get all platform pages
- `POST /api/owner/suspend` - Suspend page
- `POST /api/owner/unsuspend/{id}` - Unsuspend page

## 🔒 Security Features

- **Password Validation** - Enforced strong passwords
- **JWT Authentication** - Secure token-based auth
- **CORS Protection** - Cross-origin request security
- **SQL Injection Protection** - MongoDB with proper validation
- **XSS Protection** - Input sanitization
- **HTTPS Enforcement** - Secure connections in production

## 🎯 User Journeys

### Regular User
1. Register account with secure password
2. Login to access dashboard
3. Create custom pages with content
4. Manage pages (edit, delete, maintenance mode)
5. Receive notifications for feedback
6. View page analytics and engagement

### Page Visitor
1. Visit any page at `/{pagename}`
2. View content and page information
3. Leave feedback (if logged in)
4. See view counts and page stats

### Platform Owner
1. Access admin panel at `/owner`
2. Enter owner password ("onlyOwner12$")
3. View all platform pages and users
4. Suspend problematic content
5. Send notifications to users
6. Monitor platform activity

## 🐳 Docker Support

### Build Images
```bash
# Backend
docker build -t notez-fun-backend ./backend

# Frontend
docker build -t notez-fun-frontend ./frontend
```

### Run Containers
```bash
# Backend
docker run -p 8001:8001 -e MONGO_URL=your_mongo_url notez-fun-backend

# Frontend
docker run -p 80:80 -e REACT_APP_BACKEND_URL=http://localhost:8001 notez-fun-frontend
```

## 📊 Monitoring & Analytics

The platform includes basic analytics:
- Page view counting
- User engagement tracking
- Notification metrics
- Admin activity monitoring

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📜 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

- **Documentation:** Check this README and inline code comments
- **Issues:** Use GitHub Issues for bug reports
- **Features:** Submit feature requests via GitHub Issues

## 🎉 Acknowledgments

Built with modern web technologies and best practices for a secure, scalable, and user-friendly experience.

---

**NOTEZ FUN** - Build, Share, Engage! 🚀
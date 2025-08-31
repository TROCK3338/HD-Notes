# HD NOTES - Note Taking Application

A modern full-stack note-taking application built with React (TypeScript) frontend and Node.js (TypeScript) backend.

## ✨ Features

### 🔐 Authentication
- Signup with email + OTP verification
- Login/Signup with Google account
- JWT-based secure authorization
- Error handling for incorrect inputs, OTP errors, and API failures

### 📝 Notes
- Create and delete notes
- View notes after login/signup
- User-specific notes (authorized via JWT)

### 🎨 User Interface
- Mobile-friendly and responsive
- Design replicates provided assets (Apple Notes-inspired)

## 🛠️ Technology Stack
- **Frontend**: React 18 + TypeScript, Vite, TailwindCSS, React Router
- **Backend**: Node.js, Express, TypeScript
- **Database**: MongoDB with Mongoose
- **Auth**: JWT, Google OAuth, Nodemailer for OTP
- **Version Control**: Git

## 🚀 Quick Start

### Clone Repository
```bash
git clone <repository-url>
cd HD-Notes
```

### Backend Setup
```bash
cd backend
npm install
cp .env.example .env   # update values
npm run dev
```

### Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

### Default URLs
- Frontend: http://localhost:5173
- Backend: http://localhost:4000

## 📋 Prerequisites
- Node.js 18+
- MongoDB (local or Atlas)
- Google OAuth credentials (for Google login)
- Gmail App Password (for OTP delivery)

## ⚙️ Environment Variables (Backend)
```env
PORT=4000
MONGO_URI=mongodb://localhost:27017/hdnotes
JWT_SECRET=your_jwt_secret
FRONTEND_URL=http://localhost:5173
EMAIL_USER=your-gmail@gmail.com
EMAIL_PASS=your-gmail-app-password
SESSION_SECRET=your_session_secret
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
GOOGLE_CALLBACK_URL=http://localhost:4000/api/auth/google/callback
```

## 📡 API Endpoints

### Authentication
- `POST /api/auth/signup` - Signup with OTP
- `POST /api/auth/login` - Login with OTP
- `POST /api/auth/otp/verify` - Verify OTP
- `POST /api/auth/logout` - Logout user
- `GET /api/auth/me` - Get current user info
- `GET /api/auth/google` - Start Google OAuth
- `GET /api/auth/google/callback` - Google OAuth callback

### Notes
- `POST /api/notes` - Create note
- `GET /api/notes` - Get all notes
- `DELETE /api/notes/:id` - Delete note

## 📝 Development Workflow
- Commit work after completing each feature
- Use feature-branch workflow
- Deploy backend and frontend with proper environment variables

## 📦 Deployment
- **Backend**: Render, Railway, or similar
- **Frontend**: Vercel, Netlify, etc.
- **Database**: MongoDB Atlas
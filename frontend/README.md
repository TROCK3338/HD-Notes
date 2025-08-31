# HD Notes - Full-Stack Note-Taking Application

A modern, responsive note-taking application built with React (TypeScript) frontend and Node.js (Express) backend with MongoDB database.

## 🚀 Features

- **Email & OTP Authentication**: Secure signup/signin with email verification
- **Google OAuth Integration**: One-click sign-in with Google account
- **JWT-based Authorization**: Secure API access with JSON Web Tokens
- **CRUD Operations**: Create, read, and delete notes
- **Mobile-Responsive Design**: Optimized for all device sizes
- **Real-time Validation**: Client and server-side input validation
- **Error Handling**: Comprehensive error messages and user feedback

## 🛠️ Technology Stack

### Frontend
- **React 18** with TypeScript
- **React Router DOM** for routing
- **Tailwind CSS** for styling
- **Vite** for build tooling
- **Axios** for API calls

### Backend
- **Node.js** with Express framework
- **TypeScript** for type safety
- **MongoDB** with Mongoose ODM
- **JWT** for authentication
- **Passport.js** for Google OAuth
- **Nodemailer** for email services

## ⚙️ Installation & Setup

### 1. Backend Setup

```bash
cd backend

# Install dependencies
npm install

# Install additional required dependencies
npm install express-session @types/express-session @types/passport @types/passport-google-oauth20
```

### 2. Environment Configuration

Update the `.env` file in the backend directory with your credentials:

```env
PORT=4000
MONGO_URI=mongodb://localhost:27017/hdnotes
JWT_SECRET=your_strong_jwt_secret_here
SESSION_SECRET=your_session_secret_key_here
FRONTEND_URL=http://localhost:5173

# Email Configuration (Gmail)
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password

# Google OAuth Configuration
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_CALLBACK_URL=http://localhost:4000/api/auth/google/callback
```

### 3. Frontend Setup

```bash
cd frontend
npm install
```

## 🚀 Running the Application

### Start the Backend Server
```bash
cd backend
npm run dev
```

### Start the Frontend Development Server
```bash
cd frontend
npm run dev
```

The application will be available at:
- Frontend: http://localhost:5173
- Backend API: http://localhost:4000

## 🐛 Issues Fixed

1. **NoteCard Component**: Fixed type mismatch between `id` and `_id`
2. **Google OAuth**: Added complete Google authentication flow
3. **Mobile Responsiveness**: Improved responsive design for all screen sizes
4. **Error Handling**: Enhanced error messages and validation
5. **Session Management**: Added proper session handling for Passport.js
6. **UI/UX Improvements**: Better visual feedback, loading states, and confirmation dialogs

## 📱 Features Implemented

✅ Email & OTP authentication
✅ Google OAuth integration
✅ JWT-based authorization
✅ CRUD operations for notes
✅ Mobile-responsive design
✅ Input validation (client & server)
✅ Error handling & user feedback
✅ Secure cookie management
✅ Password-less authentication

## 🔧 Setup Google OAuth

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable Google+ API
4. Go to Credentials → Create Credentials → OAuth 2.0 Client IDs
5. Set application type to "Web application"
6. Add authorized redirect URI: `http://localhost:4000/api/auth/google/callback`
7. Copy Client ID and Client Secret to your `.env` file

## 📞 Support

For any issues, please:
1. Check console logs for specific errors
2. Ensure all environment variables are correctly configured
3. Verify MongoDB is running
4. Check that all required dependencies are installed

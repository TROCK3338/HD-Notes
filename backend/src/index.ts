import dotenv from "dotenv";
dotenv.config();
// console.log("GOOGLE_CLIENT_ID:", process.env.GOOGLE_CLIENT_ID);
import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import session from "express-session";
import passport from "passport";
import { connectDB } from "./config/db";
import "./config/passport"; // Import passport configuration
import authRoutes from "./routes/auth";
import notesRoutes from "./routes/notes";
import uploadRoutes from "./routes/upload";
import path from "path";

connectDB();

const app = express();

// Configure session middleware for Passport
app.use(session({
  secret: process.env.SESSION_SECRET || 'fallback-secret-key',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    maxAge: 60 * 60 * 1000 // 1 hour
  }
}));

app.use(cors({ origin: process.env.FRONTEND_URL, credentials: true }));
app.use(express.json());
app.use(cookieParser());
app.use(passport.initialize());
app.use(passport.session());

app.use("/api/auth", authRoutes);
app.use("/api/notes", notesRoutes);
app.use("/api/upload", uploadRoutes);

// Serve uploaded images statically
app.use("/uploads", express.static(path.join(__dirname, "../uploads")));

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

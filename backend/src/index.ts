import dotenv from "dotenv";
dotenv.config();

// Environment validation
console.log("Environment check:", {
  NODE_ENV: process.env.NODE_ENV,
  PORT: process.env.PORT,
  MONGO_URI: process.env.MONGO_URI ? "[SET]" : "[NOT SET]",
  JWT_SECRET: process.env.JWT_SECRET ? "[SET]" : "[NOT SET]",
  FRONTEND_URL: process.env.FRONTEND_URL,
  SESSION_SECRET: process.env.SESSION_SECRET ? "[SET]" : "[NOT SET]"
});
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
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax', 
    maxAge: 60 * 60 * 1000, // 1 hour
    httpOnly: true
  }
}));

app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "https://hd-notes-psi.vercel.app",
      "https://hd-notes-psi.vercel.app/"
    ],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Cookie'],
    optionsSuccessStatus: 200
  })
);
app.use(express.json());
app.use(cookieParser());
app.use(passport.initialize());
app.use(passport.session());

// Root route
app.get("/", (req, res) => {
  res.send("HD-Notes backend is running!");
});

// Health check route
app.get("/health", (req, res) => {
  res.json({ 
    status: "OK", 
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
    cors: {
      origin: [
        "http://localhost:5173",
        "https://hd-notes-psi.vercel.app",
        "https://hd-notes-psi.vercel.app/"
      ]
    }
  });
});

// API health check
app.get("/api/health", (req, res) => {
  res.json({ 
    status: "API OK", 
    timestamp: new Date().toISOString() 
  });
});

app.use("/api/auth", authRoutes);
app.use("/api/notes", notesRoutes);
app.use("/api/upload", uploadRoutes);

// Serve uploaded images statically
app.use("/uploads", express.static(path.join(__dirname, "../uploads")));

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import cookieParser from "cookie-parser";
import passport from "passport";
import { connectDB } from "./config/db";
import "./config/passport"; // Import passport configuration
import authRoutes from "./routes/auth";
import notesRoutes from "./routes/notes";

dotenv.config();
connectDB();

const app = express();

// CORS configuration
app.use(cors({ 
  origin: process.env.FRONTEND_URL || "http://localhost:5173", 
  credentials: true 
}));

app.use(express.json());
app.use(cookieParser());

// Initialize passport without sessions for now (we'll use JWT only)
app.use(passport.initialize());

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/notes", notesRoutes);

// Health check
app.get("/", (req, res) => {
  res.json({ 
    message: "Note Taking App API is running", 
    timestamp: new Date().toISOString(),
    version: "1.0.0"
  });
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Frontend URL: ${process.env.FRONTEND_URL}`);
  console.log("API endpoints available at:");
  console.log(`  - http://localhost:${PORT}/api/auth/*`);
  console.log(`  - http://localhost:${PORT}/api/notes/*`);
});

import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import cookieParser from "cookie-parser";
import { connectDB } from "./config/db";

// Load environment variables
dotenv.config();

console.log("Starting simple server without sessions...");

const app = express();

// Basic middleware
app.use(cors({ 
  origin: process.env.FRONTEND_URL || "http://localhost:5173", 
  credentials: true 
}));
app.use(express.json());
app.use(cookieParser());

// Test routes
app.get("/", (req, res) => {
  res.json({ 
    message: "Simple server is working", 
    timestamp: new Date().toISOString(),
    env: process.env.NODE_ENV || "development"
  });
});

app.get("/api/test", (req, res) => {
  res.json({ 
    message: "API is working", 
    db: "Not connected yet" 
  });
});

// Basic auth routes without passport for now
app.post("/api/auth/signup", async (req, res) => {
  const { email } = req.body;
  res.json({ 
    message: "Signup endpoint working", 
    email: email || "No email provided" 
  });
});

// Connect to database
connectDB().then(() => {
  console.log("Database connection successful");
}).catch((error) => {
  console.error("Database connection failed:", error);
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Simple server running on port ${PORT}`);
  console.log(`Frontend URL: ${process.env.FRONTEND_URL}`);
  console.log(`Test endpoints:`);
  console.log(`  - http://localhost:${PORT}/`);
  console.log(`  - http://localhost:${PORT}/api/test`);
});

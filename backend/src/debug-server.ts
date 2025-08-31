import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import cookieParser from "cookie-parser";
import { connectDB } from "./config/db";

// Load environment variables
dotenv.config();

console.log("Starting debug server...");
console.log("Environment variables:");
console.log("- PORT:", process.env.PORT);
console.log("- MONGO_URI:", process.env.MONGO_URI ? "Set" : "Not set");
console.log("- JWT_SECRET:", process.env.JWT_SECRET ? "Set" : "Not set");
console.log("- EMAIL_USER:", process.env.EMAIL_USER ? "Set" : "Not set");
console.log("- EMAIL_PASS:", process.env.EMAIL_PASS ? "Set" : "Not set");
console.log("- GOOGLE_CLIENT_ID:", process.env.GOOGLE_CLIENT_ID ? "Set" : "Not set");

const app = express();

// Basic middleware
app.use(cors({ origin: process.env.FRONTEND_URL, credentials: true }));
app.use(express.json());
app.use(cookieParser());

// Test route
app.get("/test", (req, res) => {
  res.json({ 
    message: "Server is working", 
    timestamp: new Date().toISOString(),
    env: process.env.NODE_ENV || "development"
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
  console.log(`Debug server running on port ${PORT}`);
  console.log(`Test endpoint: http://localhost:${PORT}/test`);
});

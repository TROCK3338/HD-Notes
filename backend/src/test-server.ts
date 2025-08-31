import express from "express";
import dotenv from "dotenv";

dotenv.config();

const app = express();

app.get("/", (req, res) => {
  res.json({ message: "Server is running" });
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`Test server running on port ${PORT}`));

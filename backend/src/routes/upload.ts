import express from "express";
import { uploadImage, upload } from "../controllers/uploadController";
import { protect } from "../middleware/authMiddleware";

const router = express.Router();

router.post("/image", protect, upload.single('image'), uploadImage);

export default router;

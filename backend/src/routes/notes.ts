import express from "express";
import { createNote, getNotes, updateNote, deleteNote } from "../controllers/notesController";
import { protect } from "../middleware/authMiddleware";
import { validateNoteData } from "../middleware/validation";

const router = express.Router();

router.post("/", protect, validateNoteData, createNote);
router.get("/", protect, getNotes);
router.put("/:id", protect, validateNoteData, updateNote);
router.delete("/:id", protect, deleteNote);

export default router;
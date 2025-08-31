import type { Request, Response } from "express";
import Note from "../models/Note";

export const createNote = async (req: Request, res: Response): Promise<void> => {
  const { title, content, richContent, attachments } = req.body;
  
  try {
    const note = await Note.create({
      user: (req as any).user.id,
      title: title.trim(),
      content: content.trim(),
      richContent: richContent || undefined,
      attachments: attachments || []
    });
    res.status(201).json(note);
  } catch (err) {
    console.error("Create note error:", err);
    res.status(500).json({ message: "Error creating note. Please try again." });
  }
};

export const getNotes = async (req: Request, res: Response): Promise<void> => {
  try {
    const notes = await Note.find({ user: (req as any).user.id }).sort({ createdAt: -1 });
    res.json(notes);
  } catch (err) {
    console.error("Get notes error:", err);
    res.status(500).json({ message: "Error fetching notes. Please try again." });
  }
};

export const updateNote = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  const { title, content, richContent, attachments } = req.body;
  
  if (!id) {
    res.status(400).json({ message: "Note ID is required" });
    return;
  }
  
  try {
    const updateData: any = {
      title: title.trim(),
      content: content.trim()
    };
    
    if (richContent !== undefined) {
      updateData.richContent = richContent;
    }
    if (attachments !== undefined) {
      updateData.attachments = attachments;
    }
    
    const note = await Note.findOneAndUpdate(
      { _id: id, user: (req as any).user.id },
      updateData,
      { new: true }
    );
    if (!note) {
      res.status(404).json({ message: "Note not found" });
      return;
    }
    res.json(note);
  } catch (err) {
    console.error("Update note error:", err);
    res.status(500).json({ message: "Error updating note. Please try again." });
  }
};

export const deleteNote = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  
  if (!id) {
    res.status(400).json({ message: "Note ID is required" });
    return;
  }
  
  try {
    const note = await Note.findOneAndDelete({ _id: id, user: (req as any).user.id });
    if (!note) {
      res.status(404).json({ message: "Note not found" });
      return;
    }
    res.json({ message: "Note deleted successfully" });
  } catch (err) {
    console.error("Delete note error:", err);
    res.status(500).json({ message: "Error deleting note. Please try again." });
  }
};

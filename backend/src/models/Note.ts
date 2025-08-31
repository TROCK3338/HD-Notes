import mongoose, { Schema, Document } from "mongoose";

export interface INote extends Document {
  user: mongoose.Types.ObjectId;
  title: string;
  content: string;
  richContent?: string; // HTML content for rich text
  attachments?: string[]; // Array of image URLs
  createdAt: Date;
  updatedAt: Date;
}

const noteSchema = new Schema<INote>(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    title: { type: String, required: true },
    content: { type: String, required: true },
    richContent: { type: String }, // HTML content for rich text
    attachments: [{ type: String }] // Array of image URLs
  },
  { timestamps: true }
);

export default mongoose.model<INote>("Note", noteSchema);

import api from "./api";

export const getNotes = () => api.get("/notes");
export const createNote = (title: string, content: string, richContent?: string, attachments?: string[]) => 
  api.post("/notes", { title, content, richContent, attachments });

export const updateNote = (id: string, title: string, content: string, richContent?: string, attachments?: string[]) => 
  api.put(`/notes/${id}`, { title, content, richContent, attachments });
export const deleteNote = (id: string) => api.delete(`/notes/${id}`);
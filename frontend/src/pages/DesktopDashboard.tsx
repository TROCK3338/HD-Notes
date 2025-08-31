import React, { useState, useEffect } from "react";
import Sidebar from "../components/Sidebar";
import NoteEditor from "../components/NoteEditor";
import AddNoteModal from "../components/AddNoteModal";
import { getMe, logout } from "../services/auth";
import { getNotes, createNote, updateNote, deleteNote } from "../services/notes";
import { useNavigate } from "react-router-dom";

type Note = {
  _id: string;
  title: string;
  content: string;
  createdAt?: string;
  updatedAt?: string;
};

export default function DesktopDashboard() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [selectedNoteId, setSelectedNoteId] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [userName, setUserName] = useState<string>("User");
  const [userEmail, setUserEmail] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    async function fetchData() {
      try {
        const userRes = await getMe();
        const user = userRes?.data?.user;
        if (user) {
          setUserName(user.name || user.email || "User");
          setUserEmail(user.email || "");
        }
        const notesRes = await getNotes();
        const notesData = notesRes?.data || [];
        setNotes(notesData);
        
        // Auto-select first note if available
        if (notesData.length > 0 && !selectedNoteId) {
          setSelectedNoteId(notesData[0]._id);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [selectedNoteId]);

  const handleAddNote = async (title: string, content: string) => {
    try {
      const response = await createNote(title, content);
      const newNote = response?.data;
      
      // Refresh notes list
      const notesRes = await getNotes();
      const updatedNotes = notesRes?.data || [];
      setNotes(updatedNotes);
      
      // Select the newly created note
      if (newNote && newNote._id) {
        setSelectedNoteId(newNote._id);
        setIsEditing(true);
      }
      
      setIsModalOpen(false);
    } catch (error) {
      console.error("Error adding note:", error);
    }
  };

  const handleUpdateNote = async (id: string, title: string, content: string) => {
    try {
      await updateNote(id, title, content);
      // Refresh notes list
      const notesRes = await getNotes();
      setNotes(notesRes?.data || []);
      setIsEditing(false);
    } catch (error) {
      console.error("Error updating note:", error);
    }
  };

  const handleDeleteNote = async (id: string) => {
    try {
      await deleteNote(id);
      // If we're deleting the currently selected note, clear selection
      if (selectedNoteId === id) {
        setSelectedNoteId(null);
        setIsEditing(false);
      }
      // Refresh notes list
      const notesRes = await getNotes();
      const updatedNotes = notesRes?.data || [];
      setNotes(updatedNotes);
      
      // Auto-select first note if available and we deleted the selected one
      if (selectedNoteId === id && updatedNotes.length > 0) {
        setSelectedNoteId(updatedNotes[0]._id);
      }
    } catch (error) {
      console.error("Error deleting note:", error);
    }
  };

  const handleSelectNote = (noteId: string) => {
    setSelectedNoteId(noteId);
    setIsEditing(false);
  };

  const handleCreateNewNote = () => {
    setIsModalOpen(true);
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigate("/signin");
    } catch (error) {
      console.error("Logout error:", error);
      navigate("/signin");
    }
  };

  const handleCloseEditor = () => {
    setSelectedNoteId(null);
    setIsEditing(false);
  };

  const selectedNote = notes.find(note => note._id === selectedNoteId) || null;

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your notes...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-gray-100 flex overflow-hidden">
      {/* Sidebar */}
      <Sidebar
        notes={notes}
        selectedNoteId={selectedNoteId}
        onSelectNote={handleSelectNote}
        onCreateNote={handleCreateNewNote}
        onDeleteNote={handleDeleteNote}
        userName={userName}
        userEmail={userEmail}
        onLogout={handleLogout}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col">
        <NoteEditor
          note={selectedNote}
          onSave={handleUpdateNote}
          onClose={handleCloseEditor}
          isEditing={isEditing}
          onStartEdit={() => setIsEditing(true)}
        />
      </div>

      {/* Add Note Modal */}
      {isModalOpen && (
        <AddNoteModal
          onClose={() => setIsModalOpen(false)}
          onSave={handleAddNote}
        />
      )}
    </div>
  );
}
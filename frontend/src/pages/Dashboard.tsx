import React, { useState, useEffect } from "react";
import NoteCard from "../components/NoteCard";
import AddNoteModal from "../components/AddNoteModal";
import Sidebar from "../components/Sidebar";
import EnhancedNoteEditor from "../components/EnhancedNoteEditor";
import RichTextEditor from "../components/RichTextEditor";
import { getMe, logout } from "../services/auth";
import { getNotes, createNote, updateNote, deleteNote } from "../services/notes";
import { useNavigate } from "react-router-dom";

type Note = {
  _id: string;
  title: string;
  content: string;
  richContent?: string;
  attachments?: string[];
  createdAt?: string;
  updatedAt?: string;
};

export default function Dashboard() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [selectedNoteId, setSelectedNoteId] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [userName, setUserName] = useState<string>("User");
  const [userEmail, setUserEmail] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [isMobileEditing, setIsMobileEditing] = useState(false);
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
        
        // Auto-select first note on desktop if available
        if (notesData.length > 0 && !selectedNoteId && window.innerWidth >= 768) {
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

  const handleAddNote = async (title: string, content: string, richContent?: string, attachments?: string[]) => {
    try {
      const response = await createNote(title, content, richContent, attachments);
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

  const handleUpdateNote = async (id: string, title: string, content: string, richContent?: string, attachments?: string[]) => {
    try {
      await updateNote(id, title, content, richContent, attachments);
      // Refresh notes list
      const notesRes = await getNotes();
      setNotes(notesRes?.data || []);
      setIsEditing(false);
      setIsMobileEditing(false);
    } catch (error) {
      console.error("Error updating note:", error);
    }
  };

  const handleDeleteNote = async (_id: string) => {
    try {
      await deleteNote(_id);
      // If we're deleting the currently selected note, clear selection
      if (selectedNoteId === _id) {
        setSelectedNoteId(null);
        setIsEditing(false);
        setIsMobileEditing(false);
      }
      // Refresh notes list
      const notesRes = await getNotes();
      const updatedNotes = notesRes?.data || [];
      setNotes(updatedNotes);
      
      // Auto-select first note if available and we deleted the selected one
      if (selectedNoteId === _id && updatedNotes.length > 0 && window.innerWidth >= 768) {
        setSelectedNoteId(updatedNotes[0]._id);
      }
    } catch (error) {
      console.error("Error deleting note:", error);
    }
  };

  const handleSelectNote = (noteId: string) => {
    setSelectedNoteId(noteId);
    setIsEditing(false);
    setIsMobileEditing(false);
  };

  const handleMobileEditNote = (noteId: string) => {
    setSelectedNoteId(noteId);
    setIsMobileEditing(true);
    setIsEditing(true);
  };

  const handleCreateNewNote = () => {
    setIsModalOpen(true);
  };

  const handleCloseEditor = () => {
    setSelectedNoteId(null);
    setIsEditing(false);
    setIsMobileEditing(false);
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigate("/signin");
    } catch (error) {
      console.error("Logout error:", error);
      // Even if logout fails, redirect to signin for security
      navigate("/signin");
    }
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

  // Mobile Editor View
  if (isMobileEditing && selectedNote) {
    return (
      <div className="md:hidden min-h-screen bg-white flex flex-col">
        <EnhancedNoteEditor
          note={selectedNote}
          onSave={handleUpdateNote}
          onClose={handleCloseEditor}
          isEditing={true}
          onStartEdit={() => setIsEditing(true)}
        />
      </div>
    );
  }

  return (
    <>
      {/* Mobile View - Only show on screens smaller than md (768px) */}
      <div className="md:hidden min-h-screen bg-gray-50 flex flex-col items-center px-4 py-4">
        {/* Header */}
        <header className="w-full max-w-4xl flex items-center justify-between border-b border-gray-200 pb-4 mb-6">
          <div className="flex items-center gap-2">
            <img src="/icon.png" alt="HD" className="w-6 h-6" />
            <h1 className="text-xl font-bold">HD Notes</h1>
          </div>
          <button
            onClick={handleLogout}
            className="text-blue-600 hover:underline text-sm font-medium"
          >
            Sign Out
          </button>
        </header>

        {/* Welcome Card */}
        <div className="w-full max-w-4xl bg-white rounded-lg shadow p-4 mb-4 flex flex-col items-start">
          <span className="text-xs text-gray-500 mb-1">Welcome,</span>
          <span className="font-bold text-xl mb-1 break-words">{userName}</span>
          <span className="text-gray-600 text-sm break-all">Email: {userEmail}</span>
        </div>

        {/* Create Note Button */}
        <div className="w-full max-w-4xl mb-6">
          <button
            onClick={() => setIsModalOpen(true)}
            className="w-full px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold transition-colors"
          >
            + Create Note
          </button>
        </div>

        {/* Notes Section Title */}
        <div className="w-full max-w-4xl mb-4">
          <h2 className="text-lg font-bold">My Notes ({notes.length})</h2>
        </div>

        {/* Notes List */}
        <main className="w-full max-w-4xl">
          {notes.length === 0 ? (
            <div className="text-center text-gray-500 mt-10">
              No notes yet. Click <span className="font-semibold">Create Note</span> to create one.
            </div>
          ) : (
            <div className="grid gap-4 grid-cols-1 sm:grid-cols-2">
              {notes.map((note) => (
                <EnhancedMobileNoteCard 
                  key={note._id} 
                  note={note} 
                  onDelete={() => handleDeleteNote(note._id)}
                  onEdit={() => handleMobileEditNote(note._id)}
                />
              ))}
            </div>
          )}
        </main>
      </div>

      {/* Desktop View - Only show on screens md (768px) and larger */}
      <div className="hidden md:flex h-screen bg-gray-100 overflow-hidden">
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
          <EnhancedNoteEditor
            note={selectedNote}
            onSave={handleUpdateNote}
            onClose={handleCloseEditor}
            isEditing={isEditing}
            onStartEdit={() => setIsEditing(true)}
          />
        </div>
      </div>

      {/* Add Note Modal */}
      {isModalOpen && (
        <AddNoteModal
          onClose={() => setIsModalOpen(false)}
          onSave={handleAddNote}
        />
      )}
    </>
  );
}

// Enhanced Mobile Note Card Component with Edit functionality
function EnhancedMobileNoteCard({ 
  note, 
  onDelete, 
  onEdit 
}: { 
  note: Note; 
  onDelete: () => void;
  onEdit: () => void;
}) {
  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm('Are you sure you want to delete this note?')) {
      onDelete();
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow p-4 flex flex-col justify-between min-h-[150px]">
      <div className="flex-1">
        <h3 className="text-lg font-semibold mb-2 text-gray-800 line-clamp-2">{note.title}</h3>
        <p className="text-gray-600 text-sm leading-relaxed line-clamp-4">{note.content}</p>
      </div>
      <div className="mt-4 pt-3 border-t border-gray-100 flex justify-between items-center">
        <button
          onClick={onEdit}
          className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 transition-colors font-medium"
        >
          Edit
        </button>
        <button
          onClick={handleDelete}
          className="text-red-500 text-sm hover:text-red-700 hover:underline transition-colors font-medium"
        >
          Delete
        </button>
      </div>
    </div>
  );
}
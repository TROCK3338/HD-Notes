import React, { useState } from "react";

type Note = {
  _id: string;
  title: string;
  content: string;
  createdAt?: string;
  updatedAt?: string;
};

type SidebarProps = {
  notes: Note[];
  selectedNoteId: string | null;
  onSelectNote: (noteId: string) => void;
  onCreateNote: () => void;
  onDeleteNote: (noteId: string) => void;
  userName: string;
  userEmail: string;
  onLogout: () => void;
};

export default function Sidebar({
  notes,
  selectedNoteId,
  onSelectNote,
  onCreateNote,
  onDeleteNote,
  userName,
  userEmail,
  onLogout,
}: SidebarProps) {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredNotes = notes.filter(
    (note) =>
      note.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      note.content.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleDeleteNote = (e: React.MouseEvent, noteId: string) => {
    e.stopPropagation();
    if (window.confirm("Are you sure you want to delete this note?")) {
      onDeleteNote(noteId);
    }
  };

  const truncateText = (text: string, maxLength: number) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + "...";
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else if (diffDays === 1) {
      return "Yesterday";
    } else if (diffDays < 7) {
      return date.toLocaleDateString([], { weekday: 'short' });
    } else {
      return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
    }
  };

  return (
    <div className="w-80 bg-gray-50 border-r border-gray-200 flex flex-col h-full">
      {/* User Info Header */}
      <div className="p-4 bg-white border-b border-gray-200">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <img src="/icon.png" alt="HD" className="w-6 h-6" />
            <h1 className="text-lg font-bold">HD Notes</h1>
          </div>
          <button
            onClick={onLogout}
            className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
            title="Sign Out"
          >
            <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
          </button>
        </div>
        <div className="text-sm">
          <div className="font-medium text-gray-900 truncate">{userName}</div>
          <div className="text-gray-600 text-xs truncate">{userEmail}</div>
        </div>
      </div>

      {/* Create Note Button */}
      <div className="p-4 bg-white border-b border-gray-200">
        <button
          onClick={onCreateNote}
          className="w-full flex items-center gap-3 px-3 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          <span className="font-medium">New Note</span>
        </button>
      </div>

      {/* Search Bar */}
      <div className="p-4 bg-white border-b border-gray-200">
        <div className="relative">
          <svg
            className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            placeholder="Search notes..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Notes Count */}
      <div className="px-4 py-2 bg-white border-b border-gray-200">
        <span className="text-sm font-medium text-gray-700">
          {filteredNotes.length} {filteredNotes.length === 1 ? 'note' : 'notes'}
        </span>
      </div>

      {/* Notes List */}
      <div className="flex-1 overflow-y-auto bg-white custom-scrollbar">
        {filteredNotes.length === 0 ? (
          <div className="p-4 text-center text-gray-500">
            <div className="mb-2">
              {searchTerm ? "No notes found" : "No notes yet"}
            </div>
            {!searchTerm && (
              <button
                onClick={onCreateNote}
                className="text-blue-600 hover:underline text-sm"
              >
                Create your first note
              </button>
            )}
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {filteredNotes.map((note) => (
              <div
                key={note._id}
                onClick={() => onSelectNote(note._id)}
                className={`p-4 cursor-pointer transition-colors relative group ${
                  selectedNoteId === note._id
                    ? "bg-blue-50 border-r-2 border-blue-600"
                    : "hover:bg-gray-50"
                }`}
              >
                <div className="flex justify-between items-start mb-1">
                  <h3 className="font-medium text-gray-900 text-sm truncate pr-2">
                    {note.title || "Untitled"}
                  </h3>
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <span className="text-xs text-gray-500">
                      {formatDate(note.updatedAt || note.createdAt)}
                    </span>
                    <button
                      onClick={(e) => handleDeleteNote(e, note._id)}
                      className="p-1 hover:bg-red-100 rounded text-red-500 hover:text-red-700 transition-colors"
                      title="Delete note"
                    >
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </div>
                <p className="text-xs text-gray-600 leading-relaxed">
                  {truncateText(note.content, 100)}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
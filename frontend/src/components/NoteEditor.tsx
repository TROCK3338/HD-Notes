import React, { useState, useEffect } from "react";

type Note = {
  _id: string;
  title: string;
  content: string;
  createdAt?: string;
  updatedAt?: string;
};

type NoteEditorProps = {
  note: Note | null;
  onSave: (id: string, title: string, content: string) => void;
  onClose: () => void;
  isEditing: boolean;
  onStartEdit: () => void;
};

export default function NoteEditor({ 
  note, 
  onSave, 
  onClose, 
  isEditing, 
  onStartEdit 
}: NoteEditorProps) {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  useEffect(() => {
    if (note) {
      setTitle(note.title);
      setContent(note.content);
      setHasUnsavedChanges(false);
    } else {
      setTitle("");
      setContent("");
      setHasUnsavedChanges(false);
    }
  }, [note]);

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTitle(e.target.value);
    setHasUnsavedChanges(true);
  };

  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setContent(e.target.value);
    setHasUnsavedChanges(true);
  };

  const handleSave = () => {
    if (note && title.trim() && content.trim()) {
      onSave(note._id, title.trim(), content.trim());
      setHasUnsavedChanges(false);
    }
  };

  const handleCancel = () => {
    if (hasUnsavedChanges) {
      if (window.confirm("You have unsaved changes. Are you sure you want to discard them?")) {
        setTitle(note?.title || "");
        setContent(note?.content || "");
        setHasUnsavedChanges(false);
        onClose();
      }
    } else {
      onClose();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if ((e.metaKey || e.ctrlKey) && e.key === 's') {
      e.preventDefault();
      if (hasUnsavedChanges) {
        handleSave();
      }
    }
  };

  if (!note) {
    return (
      <div className="flex-1 flex items-center justify-center bg-gray-50">
        <div className="text-center text-gray-500 max-w-md">
          <div className="w-20 h-20 mx-auto mb-6 opacity-40">
            <svg viewBox="0 0 24 24" fill="currentColor" className="w-full h-full">
              <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z" />
            </svg>
          </div>
          <h3 className="text-xl font-medium mb-3 text-gray-700">Select a note to view</h3>
          <p className="text-gray-500 leading-relaxed">
            Choose a note from the sidebar to start reading and editing, or create a new note to get started.
          </p>
        </div>
      </div>
    );
  }

  if (!isEditing) {
    return (
      <div className="flex-1 flex flex-col bg-white">
        {/* View Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-white">
          <div className="flex items-center gap-3 flex-1">
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors text-gray-600 sm:hidden"
              title="Back to notes"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <div className="flex-1 min-w-0">
              <h1 className="text-lg font-semibold text-gray-800 truncate">
                {note.title}
              </h1>
              <p className="text-xs text-gray-500 mt-0.5">
                {new Date(note.updatedAt || note.createdAt || '').toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'short', 
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </p>
            </div>
          </div>
          <button
            onClick={onStartEdit}
            className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            Edit
          </button>
        </div>

        {/* View Content */}
        <div className="flex-1 p-6 overflow-y-auto bg-white custom-scrollbar">
          <div className="max-w-4xl mx-auto prose prose-gray prose-lg max-w-none">
            <div className="whitespace-pre-wrap text-gray-800 leading-relaxed font-['system-ui','SF_Pro_Text','-apple-system','BlinkMacSystemFont','Segoe_UI','Roboto',sans-serif]">
              {note.content}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col bg-white" onKeyDown={handleKeyDown}>
      {/* Edit Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-white">
        <div className="flex items-center gap-3">
          <button
            onClick={handleCancel}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors text-gray-600"
            title="Cancel editing"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
          <div className="flex flex-col">
            <span className="text-sm font-medium text-gray-700">Editing Note</span>
            {hasUnsavedChanges && (
              <span className="text-xs text-amber-600 flex items-center gap-1">
                <div className="w-2 h-2 bg-amber-500 rounded-full animate-pulse"></div>
                Unsaved changes
              </span>
            )}
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs text-gray-400 hidden sm:block">⌘S to save</span>
          <button
            onClick={handleSave}
            disabled={!hasUnsavedChanges || !title.trim() || !content.trim()}
            className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors font-medium"
          >
            {hasUnsavedChanges ? 'Save Changes' : 'Saved'}
          </button>
        </div>
      </div>

      {/* Edit Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="p-6 border-b border-gray-100">
          <input
            type="text"
            value={title}
            onChange={handleTitleChange}
            placeholder="Note title..."
            className="w-full text-2xl font-bold text-gray-900 placeholder-gray-400 border-none outline-none bg-transparent resize-none font-['system-ui','SF_Pro_Text','-apple-system','BlinkMacSystemFont','Segoe_UI','Roboto',sans-serif]"
            maxLength={100}
          />
        </div>
        <div className="flex-1 p-6">
          <textarea
            value={content}
            onChange={handleContentChange}
            placeholder="Start writing your note..."
            className="w-full h-full text-gray-800 placeholder-gray-400 border-none outline-none resize-none bg-transparent leading-relaxed font-['system-ui','SF_Pro_Text','-apple-system','BlinkMacSystemFont','Segoe_UI','Roboto',sans-serif] text-base"
            maxLength={5000}
          />
        </div>
      </div>
    </div>
  );
}
import React, { useState, useEffect } from "react";
import RichTextEditor from "./RichTextEditor";

type Note = {
  _id: string;
  title: string;
  content: string;
  richContent?: string;
  attachments?: string[];
  createdAt?: string;
  updatedAt?: string;
};

type EnhancedNoteEditorProps = {
  note: Note | null;
  onSave: (id: string, title: string, content: string, richContent?: string, attachments?: string[]) => void;
  onClose: () => void;
  isEditing: boolean;
  onStartEdit: () => void;
};

export default function EnhancedNoteEditor({ 
  note, 
  onSave, 
  onClose, 
  isEditing, 
  onStartEdit 
}: EnhancedNoteEditorProps) {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [richContent, setRichContent] = useState("");
  const [attachments, setAttachments] = useState<string[]>([]);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [useRichText, setUseRichText] = useState(false);
  const [showDiscardDialog, setShowDiscardDialog] = useState(false);

  useEffect(() => {
    if (note) {
      setTitle(note.title);
      setContent(note.content);
      setRichContent(note.richContent || "");
      setAttachments(note.attachments || []);
      setUseRichText(!!note.richContent);
      setHasUnsavedChanges(false);
    } else {
      setTitle("");
      setContent("");
      setRichContent("");
      setAttachments([]);
      setUseRichText(false);
      setHasUnsavedChanges(false);
    }
  }, [note]);

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTitle(e.target.value);
    setHasUnsavedChanges(true);
  };

  const handleContentChange = (newContent: string, newRichContent?: string) => {
    if (useRichText && newRichContent !== undefined) {
      setContent(newContent);
      setRichContent(newRichContent);
    } else {
      setContent(newContent);
    }
    setHasUnsavedChanges(true);
  };

  const handleSimpleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setContent(e.target.value);
    setHasUnsavedChanges(true);
  };

  const handleSave = () => {
    if (note && title.trim() && content.trim()) {
      onSave(
        note._id, 
        title.trim(), 
        content.trim(), 
        useRichText ? richContent : undefined,
        attachments
      );
      setHasUnsavedChanges(false);
    }
  };

  const handleCancel = () => {
    if (hasUnsavedChanges) {
      setShowDiscardDialog(true);
    } else {
      onClose();
    }
  };

  const handleDiscardChanges = () => {
    setTitle(note?.title || "");
    setContent(note?.content || "");
    setRichContent(note?.richContent || "");
    setAttachments(note?.attachments || []);
    setUseRichText(!!note?.richContent);
    setHasUnsavedChanges(false);
    setShowDiscardDialog(false);
    onClose();
  };

  const handleKeepEditing = () => {
    setShowDiscardDialog(false);
  };

  const toggleRichText = () => {
    setUseRichText(!useRichText);
    setHasUnsavedChanges(true);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if ((e.metaKey || e.ctrlKey) && e.key === 's') {
      e.preventDefault();
      if (hasUnsavedChanges && title.trim() && content.trim()) {
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
          <div className="max-w-4xl mx-auto">
            {/* Rich Content Display */}
            {note.richContent ? (
              <div className="prose prose-gray prose-lg max-w-none">
                <div 
                  dangerouslySetInnerHTML={{ __html: note.richContent }}
                  className="text-gray-800 leading-relaxed rich-editor-content"
                />
              </div>
            ) : (
              <div className="prose prose-gray prose-lg max-w-none">
                <div className="whitespace-pre-wrap text-gray-800 leading-relaxed font-['system-ui','SF_Pro_Text','-apple-system','BlinkMacSystemFont','Segoe_UI','Roboto',sans-serif]">
                  {note.content}
                </div>
              </div>
            )}
            
            {/* Display attachments */}
            {note.attachments && note.attachments.length > 0 && (
              <div className="mt-6 border-t border-gray-200 pt-6">
                <h4 className="text-sm font-medium text-gray-700 mb-3">Attachments</h4>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {note.attachments.map((attachment, index) => (
                    <img
                      key={index}
                      src={attachment}
                      alt={`Attachment ${index + 1}`}
                      className="rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow max-w-full h-auto"
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
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
            <label className="flex items-center gap-2 text-sm text-gray-600">
              <input
                type="checkbox"
                checked={useRichText}
                onChange={toggleRichText}
                className="rounded"
              />
              Rich Text
            </label>
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
          
          <div className="flex-1 overflow-hidden">
            {useRichText ? (
              <RichTextEditor
                value={richContent || content}
                onChange={handleContentChange}
                placeholder="Start writing your note..."
                className="h-full"
              />
            ) : (
              <div className="p-6 h-full">
                <textarea
                  value={content}
                  onChange={handleSimpleContentChange}
                  placeholder="Start writing your note..."
                  className="w-full h-full text-gray-800 placeholder-gray-400 border-none outline-none resize-none bg-transparent leading-relaxed font-['system-ui','SF_Pro_Text','-apple-system','BlinkMacSystemFont','Segoe_UI','Roboto',sans-serif] text-base"
                  maxLength={5000}
                />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Discard Changes Dialog */}
      {showDiscardDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 glass-effect">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6 animate-modal-in">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Discard Changes?</h3>
            <p className="text-gray-600 mb-6">
              You have unsaved changes that will be lost. Are you sure you want to discard them?
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={handleKeepEditing}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
              >
                Keep Editing
              </button>
              <button
                onClick={handleDiscardChanges}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium"
              >
                Discard Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

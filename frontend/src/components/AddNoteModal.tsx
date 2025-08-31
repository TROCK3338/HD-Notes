import React, { useState } from "react";

type AddNoteModalProps = {
  onClose: () => void;
  onSave: (title: string, content: string, richContent?: string, attachments?: string[]) => void;
};

export default function AddNoteModal({ onClose, onSave }: AddNoteModalProps) {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [loading, setLoading] = useState(false);

  const validateForm = () => {
    const validationErrors: { [key: string]: string } = {};
    
    if (!title.trim()) {
      validationErrors.title = "Title is required";
    } else if (title.trim().length > 100) {
      validationErrors.title = "Title must be less than 100 characters";
    }
    
    if (!content.trim()) {
      validationErrors.content = "Content is required";
    } else if (content.trim().length > 5000) {
      validationErrors.content = "Content must be less than 5000 characters";
    }
    
    return validationErrors;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }
    
    setErrors({});
    setLoading(true);
    
    try {
      await onSave(title.trim(), content.trim());
    } catch (error) {
      setErrors({ general: "Failed to save note. Please try again." });
    } finally {
      setLoading(false);
    }
  };

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setTitle(value);
    if (errors.title) {
      setErrors(prev => ({ ...prev, title: "" }));
    }
  };

  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    setContent(value);
    if (errors.content) {
      setErrors(prev => ({ ...prev, content: "" }));
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 glass-effect flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold">Add New Note</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 text-2xl leading-none"
              type="button"
            >
              ×
            </button>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
              <input
                type="text"
                placeholder="Enter note title..."
                value={title}
                onChange={handleTitleChange}
                className={`w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 transition-colors ${
                  errors.title ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500'
                }`}
                maxLength={100}
              />
              {errors.title && (
                <p className="text-red-500 text-xs mt-1">{errors.title}</p>
              )}
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Content</label>
              <textarea
                placeholder="Write your note here..."
                value={content}
                onChange={handleContentChange}
                className={`w-full border rounded-lg px-3 py-2 h-32 focus:outline-none focus:ring-2 resize-none transition-colors ${
                  errors.content ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500'
                }`}
                maxLength={5000}
              />
              <div className="flex justify-between items-center mt-1">
                {errors.content && (
                  <p className="text-red-500 text-xs">{errors.content}</p>
                )}
                <p className="text-gray-400 text-xs ml-auto">{content.length}/5000</p>
              </div>
            </div>
            
            {errors.general && (
              <p className="text-red-500 text-sm">{errors.general}</p>
            )}
            
            <div className="flex justify-end gap-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                disabled={loading}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 disabled:text-gray-300 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading || !title.trim() || !content.trim()}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-blue-300 transition-colors flex items-center gap-2"
              >
                {loading && <div className="spinner"></div>}
                {loading ? "Saving..." : "Save Note"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
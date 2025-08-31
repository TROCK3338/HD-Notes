import React from "react";

type NoteCardProps = {
  note: { _id: string; title: string; content: string };
  onDelete: (_id: string) => void;
  onSelect?: (_id: string) => void;
};

export default function NoteCard({ note, onDelete, onSelect }: NoteCardProps) {
  const handleDelete = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (window.confirm('Are you sure you want to delete this note?')) {
      onDelete(note._id);
    }
  };

  const handleClick = () => {
    if (onSelect) {
      onSelect(note._id);
    }
  };

  return (
    <div 
      className={`bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow p-4 flex flex-col justify-between min-h-[150px] ${
        onSelect ? 'cursor-pointer' : ''
      }`}
      onClick={handleClick}
    >
      <div className="flex-1">
        <h3 className="text-lg font-semibold mb-2 text-gray-800 line-clamp-2">{note.title}</h3>
        <p className="text-gray-600 text-sm leading-relaxed line-clamp-4">{note.content}</p>
      </div>
      <div className="mt-4 pt-3 border-t border-gray-100">
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
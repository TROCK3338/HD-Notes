import React, { useState, useRef, useCallback, useEffect } from "react";

interface RichTextEditorProps {
  value: string;
  onChange: (content: string, richContent: string) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
}

interface FormatButton {
  command: string;
  icon: string;
  title: string;
  isActive?: () => boolean;
}

const RichTextEditor: React.FC<RichTextEditorProps> = ({
  value,
  onChange,
  placeholder = "Start writing...",
  disabled = false,
  className = ""
}) => {
  const editorRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isImageUploading, setIsImageUploading] = useState(false);
  const [selectedFont, setSelectedFont] = useState("Arial");
  const [selectedSize, setSelectedSize] = useState("3");

  // Initialize editor content
  useEffect(() => {
    if (editorRef.current && !disabled) {
      editorRef.current.innerHTML = value || "";
    }
  }, [value, disabled]);

  const executeCommand = useCallback((command: string, value?: string) => {
    if (disabled) return;
    document.execCommand(command, false, value);
    updateContent();
  }, [disabled]);

  const updateContent = useCallback(() => {
    if (!editorRef.current || disabled) return;
    
    const htmlContent = editorRef.current.innerHTML;
    const textContent = editorRef.current.textContent || editorRef.current.innerText || "";
    
    onChange(textContent, htmlContent);
  }, [onChange, disabled]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (disabled) return;
    
    // Handle keyboard shortcuts
    if ((e.metaKey || e.ctrlKey)) {
      switch (e.key) {
        case 'b':
          e.preventDefault();
          executeCommand('bold');
          break;
        case 'i':
          e.preventDefault();
          executeCommand('italic');
          break;
        case 'u':
          e.preventDefault();
          executeCommand('underline');
          break;
        case 'z':
          if (e.shiftKey) {
            e.preventDefault();
            executeCommand('redo');
          } else {
            e.preventDefault();
            executeCommand('undo');
          }
          break;
      }
    }
  }, [executeCommand, disabled]);

  const handleImageUpload = useCallback(async (file: File) => {
    if (!file || !file.type.startsWith('image/')) {
      alert('Please select a valid image file');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      alert('Image size should be less than 5MB');
      return;
    }

    setIsImageUploading(true);
    
    try {
      const formData = new FormData();
      formData.append('image', file);

      const response = await fetch('http://localhost:4000/api/upload/image', {
        method: 'POST',
        credentials: 'include',
        body: formData
      });

      if (!response.ok) {
        throw new Error('Failed to upload image');
      }

      const result = await response.json();
      
      // Insert the image into the editor
      if (editorRef.current) {
        const img = document.createElement('img');
        img.src = `http://localhost:4000${result.imageUrl}`;
        img.alt = file.name;
        img.style.maxWidth = '100%';
        img.style.height = 'auto';
        img.style.display = 'block';
        img.style.margin = '10px 0';
        img.style.borderRadius = '8px';
        img.style.boxShadow = '0 2px 8px rgba(0,0,0,0.1)';
        
        // Insert at current cursor position
        const selection = window.getSelection();
        if (selection && selection.rangeCount > 0) {
          const range = selection.getRangeAt(0);
          range.deleteContents();
          range.insertNode(img);
          range.collapse(false);
        } else {
          editorRef.current.appendChild(img);
        }
        
        updateContent();
      }
    } catch (error) {
      console.error('Error uploading image:', error);
      alert('Failed to upload image. Please try again.');
    } finally {
      setIsImageUploading(false);
    }
  }, [updateContent]);

  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleImageUpload(file);
    }
    e.target.value = '';
  }, [handleImageUpload]);

  const insertTable = useCallback(() => {
    if (disabled) return;
    
    const rows = prompt('Number of rows:');
    const cols = prompt('Number of columns:');
    
    if (rows && cols && parseInt(rows) > 0 && parseInt(cols) > 0) {
      let tableHTML = '<table border="1" style="border-collapse: collapse; width: 100%; margin: 10px 0;">';
      
      for (let i = 0; i < parseInt(rows); i++) {
        tableHTML += '<tr>';
        for (let j = 0; j < parseInt(cols); j++) {
          tableHTML += '<td style="border: 1px solid #ccc; padding: 8px;">&nbsp;</td>';
        }
        tableHTML += '</tr>';
      }
      tableHTML += '</table>';
      
      executeCommand('insertHTML', tableHTML);
    }
  }, [executeCommand, disabled]);

  const formatButtons: FormatButton[] = [
    {
      command: 'bold',
      icon: 'B',
      title: 'Bold (Ctrl+B)',
      isActive: () => document.queryCommandState('bold')
    },
    {
      command: 'italic',
      icon: 'I',
      title: 'Italic (Ctrl+I)',
      isActive: () => document.queryCommandState('italic')
    },
    {
      command: 'underline',
      icon: 'U',
      title: 'Underline (Ctrl+U)',
      isActive: () => document.queryCommandState('underline')
    },
    {
      command: 'strikethrough',
      icon: 'S',
      title: 'Strikethrough',
      isActive: () => document.queryCommandState('strikethrough')
    }
  ];

  const alignmentButtons = [
    { command: 'justifyLeft', icon: '⬅', title: 'Align Left' },
    { command: 'justifyCenter', icon: '↔', title: 'Align Center' },
    { command: 'justifyRight', icon: '➡', title: 'Align Right' },
    { command: 'justifyFull', icon: '↕', title: 'Justify' }
  ];

  const listButtons = [
    { command: 'insertUnorderedList', icon: '•', title: 'Bullet List' },
    { command: 'insertOrderedList', icon: '1.', title: 'Numbered List' }
  ];

  if (disabled) {
    return (
      <div 
        className={`prose max-w-none rich-editor-content ${className} p-4 bg-gray-50 rounded-lg border`}
        dangerouslySetInnerHTML={{ __html: value }}
      />
    );
  }

  return (
    <div className={`border border-gray-300 rounded-lg overflow-hidden ${className}`}>
      {/* Toolbar */}
      <div className="border-b border-gray-200 bg-gray-50 p-2 flex flex-wrap gap-1">
        {/* Font Family */}
        <select
          value={selectedFont}
          onChange={(e) => {
            setSelectedFont(e.target.value);
            executeCommand('fontName', e.target.value);
          }}
          className="px-2 py-1 border border-gray-300 rounded text-sm"
        >
          <option value="Arial">Arial</option>
          <option value="Times New Roman">Times New Roman</option>
          <option value="Courier New">Courier New</option>
          <option value="Helvetica">Helvetica</option>
          <option value="Georgia">Georgia</option>
          <option value="Verdana">Verdana</option>
        </select>

        {/* Font Size */}
        <select
          value={selectedSize}
          onChange={(e) => {
            setSelectedSize(e.target.value);
            executeCommand('fontSize', e.target.value);
          }}
          className="px-2 py-1 border border-gray-300 rounded text-sm mr-2"
        >
          <option value="1">8pt</option>
          <option value="2">10pt</option>
          <option value="3">12pt</option>
          <option value="4">14pt</option>
          <option value="5">18pt</option>
          <option value="6">24pt</option>
          <option value="7">36pt</option>
        </select>

        {/* Format Dropdown */}
        <select
          onChange={(e) => {
            if (e.target.value) {
              executeCommand('formatBlock', e.target.value);
              e.target.value = ''; // Reset selection
            }
          }}
          className="px-2 py-1 border border-gray-300 rounded text-sm mr-2"
        >
          <option value="">Format</option>
          <option value="h1">Heading 1</option>
          <option value="h2">Heading 2</option>
          <option value="h3">Heading 3</option>
          <option value="p">Paragraph</option>
          <option value="blockquote">Quote</option>
          <option value="pre">Code Block</option>
        </select>

        <div className="w-px h-6 bg-gray-300 mx-1"></div>

        {/* Format Buttons */}
        {formatButtons.map((button) => (
          <button
            key={button.command}
            onClick={() => executeCommand(button.command)}
            className={`px-2 py-1 text-sm font-bold border border-gray-300 rounded hover:bg-gray-200 ${
              button.isActive?.() ? 'bg-blue-200 text-blue-800' : 'bg-white'
            }`}
            title={button.title}
          >
            {button.icon}
          </button>
        ))}

        <div className="w-px h-6 bg-gray-300 mx-1"></div>

        {/* Text Color */}
        <input
          type="color"
          onChange={(e) => executeCommand('foreColor', e.target.value)}
          className="w-8 h-6 border border-gray-300 rounded cursor-pointer"
          title="Text Color"
        />

        {/* Background Color */}
        <input
          type="color"
          onChange={(e) => executeCommand('backColor', e.target.value)}
          className="w-8 h-6 border border-gray-300 rounded cursor-pointer"
          title="Background Color"
        />

        <div className="w-px h-6 bg-gray-300 mx-1"></div>

        {/* Alignment */}
        {alignmentButtons.map((button) => (
          <button
            key={button.command}
            onClick={() => executeCommand(button.command)}
            className="px-2 py-1 text-sm border border-gray-300 rounded hover:bg-gray-200 bg-white"
            title={button.title}
          >
            {button.icon}
          </button>
        ))}

        <div className="w-px h-6 bg-gray-300 mx-1"></div>

        {/* Lists */}
        {listButtons.map((button) => (
          <button
            key={button.command}
            onClick={() => executeCommand(button.command)}
            className="px-2 py-1 text-sm border border-gray-300 rounded hover:bg-gray-200 bg-white"
            title={button.title}
          >
            {button.icon}
          </button>
        ))}

        <div className="w-px h-6 bg-gray-300 mx-1"></div>

        {/* Additional Actions */}
        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={isImageUploading}
          className="px-2 py-1 text-sm border border-gray-300 rounded hover:bg-gray-200 bg-white disabled:opacity-50"
          title="Insert Image"
        >
          {isImageUploading ? '...' : '📷'}
        </button>

        <button
          onClick={insertTable}
          className="px-2 py-1 text-sm border border-gray-300 rounded hover:bg-gray-200 bg-white"
          title="Insert Table"
        >
          ⊞
        </button>

        <button
          onClick={() => executeCommand('createLink', prompt('Enter URL:') || '')}
          className="px-2 py-1 text-sm border border-gray-300 rounded hover:bg-gray-200 bg-white"
          title="Insert Link"
        >
          🔗
        </button>

        <div className="w-px h-6 bg-gray-300 mx-1"></div>

        {/* Undo/Redo */}
        <button
          onClick={() => executeCommand('undo')}
          className="px-2 py-1 text-sm border border-gray-300 rounded hover:bg-gray-200 bg-white"
          title="Undo (Ctrl+Z)"
        >
          ↶
        </button>

        <button
          onClick={() => executeCommand('redo')}
          className="px-2 py-1 text-sm border border-gray-300 rounded hover:bg-gray-200 bg-white"
          title="Redo (Ctrl+Shift+Z)"
        >
          ↷
        </button>
      </div>

      {/* Editor */}
      <div
        ref={editorRef}
        contentEditable
        onInput={updateContent}
        onKeyDown={handleKeyDown}
        className="p-4 min-h-[300px] max-h-[600px] overflow-y-auto outline-none focus:ring-2 focus:ring-blue-500 focus:ring-inset rich-editor-content"
        style={{ 
          fontSize: '14px', 
          lineHeight: '1.6',
          fontFamily: selectedFont 
        }}
        data-placeholder={placeholder}
      />

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
      />
    </div>
  );
};

export default RichTextEditor;

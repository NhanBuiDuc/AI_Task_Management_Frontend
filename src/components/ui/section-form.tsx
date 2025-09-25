import React, { useState, useRef, useEffect } from 'react';

interface SectionFormProps {
  onSubmit: (sectionName: string) => void;
  onCancel: () => void;
  initialValue?: string;
  isLoading?: boolean;
}

export function SectionForm({ onSubmit, onCancel, initialValue = "", isLoading = false }: SectionFormProps) {
  const [sectionName, setSectionName] = useState(initialValue);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-focus the input when component mounts
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  const handleSubmit = () => {
    if (sectionName.trim() && !isLoading) {
      onSubmit(sectionName.trim());
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSubmit();
    } else if (e.key === 'Escape') {
      onCancel();
    }
  };

  return (
    <div className="space-y-3">
      {/* Input field */}
      <input
        ref={inputRef}
        type="text"
        value={sectionName}
        onChange={(e) => setSectionName(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Name this section"
        disabled={isLoading}
        className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
      />
      
      {/* Buttons */}
      <div className="flex items-center gap-3">
        <button
          onClick={handleSubmit}
          disabled={!sectionName.trim() || isLoading}
          className="px-4 py-2 bg-red-400 text-white text-sm font-medium rounded-md hover:bg-red-500 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
        >
          {isLoading ? 'Adding...' : 'Add section'}
        </button>
        
        <button
          onClick={onCancel}
          disabled={isLoading}
          className="px-4 py-2 text-gray-600 text-sm font-medium hover:text-gray-800 focus:outline-none transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}

// Example usage component
export function SectionFormExample() {
  const [showForm, setShowForm] = useState(false);
  const [sections, setSections] = useState([
    { id: 1, name: "Daily" },
    { id: 2, name: "Work" }
  ]);

  const handleAddSection = (sectionName: string) => {
    const newSection = {
      id: sections.length + 1,
      name: sectionName
    };
    setSections([...sections, newSection]);
    setShowForm(false);
    console.log("Added section:", sectionName);
  };

  const handleCancel = () => {
    setShowForm(false);
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h2 className="text-2xl font-semibold text-gray-900 mb-6">Sections</h2>
      
      {/* Existing sections */}
      {sections.map((section) => (
        <div key={section.id} className="mb-4 p-4 border border-gray-200 rounded-lg">
          <h3 className="font-medium text-gray-900">{section.name}</h3>
          <p className="text-sm text-gray-500 mt-1">Section content here...</p>
        </div>
      ))}
      
      {/* Add section form or button */}
      {showForm ? (
        <div className="mb-4">
          <SectionForm 
            onSubmit={handleAddSection} 
            onCancel={handleCancel} 
          />
        </div>
      ) : (
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 text-red-500 hover:text-red-600 transition-colors duration-200"
        >
          <span className="text-lg">+</span>
          <span className="text-sm font-medium">Add section</span>
        </button>
      )}
    </div>
  );
}
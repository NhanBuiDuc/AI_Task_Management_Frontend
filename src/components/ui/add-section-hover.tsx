import React, { useState } from 'react';
import { Plus } from 'lucide-react';
import { SectionForm } from './section-form';
import { sectionApi } from '@/lib/api/section';
import { SectionItem } from '@/types';

interface AddSectionProps {
  projectId?: string; // Optional project ID - when provided, uses API; when not provided, uses callback only
  onAddSection?: (section: SectionItem | string) => void; // Can pass either SectionItem (when API) or string (when legacy)
  onCreate?: () => void; // Called after successful section creation to refresh data
  className?: string;
}

export function AddSectionHover({ projectId, onAddSection, onCreate, className = "" }: AddSectionProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleClick = () => {
    setShowForm(true);
    setIsHovered(false);
  };

  const handleSubmit = async (sectionName: string) => {
    setIsLoading(true);
    setError(null);

    try {
      // If projectId is provided, use API functionality
      if (projectId) {
        // Check if section name already exists in this project
        const nameExists = await sectionApi.checkSectionNameExists(projectId, sectionName);

        if (nameExists) {
          setError(`Section "${sectionName}" already exists in this project`);
          setIsLoading(false);
          return;
        }

        // Create the section
        const newSection = await sectionApi.createSection(projectId, sectionName);

        // Call parent callback with the created section
        if (onAddSection) {
          onAddSection(newSection);
        }

        // Call onCreate callback to refresh data
        if (onCreate) {
          onCreate();
        }
      } else {
        // Legacy mode: just call the callback with the section name
        if (onAddSection) {
          onAddSection(sectionName);
        }

        // Call onCreate callback even in legacy mode
        if (onCreate) {
          onCreate();
        }
      }

      setShowForm(false);
    } catch (error) {
      console.error('Error creating section:', error);
      setError('Failed to create section. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    setShowForm(false);
    setError(null);
  };

  // If form is showing, render the form instead of hover elements
  if (showForm) {
    return (
      <div className={`py-2 ${className}`}>
        <SectionForm
          onSubmit={handleSubmit}
          onCancel={handleCancel}
          isLoading={isLoading}
        />
        {error && (
          <div className="mt-2 text-sm text-red-600 bg-red-50 border border-red-200 rounded px-3 py-2">
            {error}
          </div>
        )}
      </div>
    );
  }

  return (
    <div
      className={`relative py-0.5 ${className}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Hover trigger area - spans full width */}
      <div className="w-full h-2" />

      {/* Add section element - only visible on hover */}
      {isHovered && (
        <div className="absolute top-1/2 left-0 w-full transform -translate-y-1/2">
          {/* Horizontal line with centered text */}
          <div className="relative flex items-center justify-center">
            {/* Left line */}
            <div className="flex-1 h-px bg-gray-300"></div>

            {/* Centered button */}
            <button
              onClick={handleClick}
              className="flex items-center gap-1 px-4 py-1 bg-white text-red-500 hover:text-red-600 transition-colors duration-200 text-sm font-medium"
            >
              <Plus className="h-3 w-3" />
              <span>add section</span>
            </button>

            {/* Right line */}
            <div className="flex-1 h-px bg-gray-300"></div>
          </div>
        </div>
      )}

      {/* Default state - subtle line hint */}
      {!isHovered && (
        <div className="absolute top-1/2 left-0 w-full transform -translate-y-1/2">
          <div className="w-full h-px bg-gray-100"></div>
        </div>
      )}
    </div>
  );
}

// Example usage in a container component
export function SectionContainer({ projectId }: { projectId: string }) {
  const [sections, setSections] = useState<SectionItem[]>([]);

  const handleAddSection = (newSection: SectionItem) => {
    setSections([...sections, newSection]);
    console.log("Added new section:", newSection);
  };

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-4">
      <h2 className="text-2xl font-semibold text-gray-900 mb-4">Project Sections</h2>
      
      {/* Render existing sections */}
      {sections.map((section, index) => (
        <div key={section.id}>
          <div className="bg-white border border-gray-200 rounded-lg p-4 mb-2">
            <h3 className="font-medium text-gray-900">{section.name}</h3>
            <p className="text-sm text-gray-500 mt-1">Section content goes here...</p>
          </div>

          {/* Add section hover area between sections */}
          <AddSectionHover projectId={projectId} onAddSection={handleAddSection} />
        </div>
      ))}

      {/* Add section hover area at the end */}
      <AddSectionHover projectId={projectId} onAddSection={handleAddSection} />
    </div>
  );
}
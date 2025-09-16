import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import {
  FolderIcon,
  Hash,
  Star,
  Heart,
  Calendar,
  Clock,
  Target,
  Zap,
  Coffee,
  Home,
  Briefcase,
  Book,
  Music,
  Camera,
  Gamepad2,
  Palette
} from 'lucide-react';

interface ProjectFormProps {
  onSubmit?: (project: any) => void;
  onCancel?: () => void;
}

export default function ProjectForm({ onSubmit, onCancel }: ProjectFormProps) {
  const [projectName, setProjectName] = useState('');
  const [selectedColor, setSelectedColor] = useState('blue');
  const [selectedIcon, setSelectedIcon] = useState('folder');
  const [isColorOpen, setIsColorOpen] = useState(false);
  const [isIconOpen, setIsIconOpen] = useState(false);

  const colorOptions = [
    { value: 'blue', label: 'Blue', color: 'bg-blue-500', textColor: 'text-blue-500' },
    { value: 'red', label: 'Red', color: 'bg-red-500', textColor: 'text-red-500' },
    { value: 'green', label: 'Green', color: 'bg-green-500', textColor: 'text-green-500' },
    { value: 'yellow', label: 'Yellow', color: 'bg-yellow-500', textColor: 'text-yellow-500' },
    { value: 'purple', label: 'Purple', color: 'bg-purple-500', textColor: 'text-purple-500' },
    { value: 'orange', label: 'Orange', color: 'bg-orange-500', textColor: 'text-orange-500' },
    { value: 'pink', label: 'Pink', color: 'bg-pink-500', textColor: 'text-pink-500' },
    { value: 'gray', label: 'Gray', color: 'bg-gray-500', textColor: 'text-gray-500' }
  ];

  const iconOptions = [
    { value: 'folder', label: 'Folder', icon: FolderIcon },
    { value: 'hash', label: 'Hash', icon: Hash },
    { value: 'star', label: 'Star', icon: Star },
    { value: 'heart', label: 'Heart', icon: Heart },
    { value: 'calendar', label: 'Calendar', icon: Calendar },
    { value: 'clock', label: 'Clock', icon: Clock },
    { value: 'target', label: 'Target', icon: Target },
    { value: 'zap', label: 'Zap', icon: Zap },
    { value: 'coffee', label: 'Coffee', icon: Coffee },
    { value: 'home', label: 'Home', icon: Home },
    { value: 'briefcase', label: 'Briefcase', icon: Briefcase },
    { value: 'book', label: 'Book', icon: Book },
    { value: 'music', label: 'Music', icon: Music },
    { value: 'camera', label: 'Camera', icon: Camera },
    { value: 'gamepad', label: 'Gamepad', icon: Gamepad2 },
    { value: 'palette', label: 'Palette', icon: Palette }
  ];

  const selectedColorOption = colorOptions.find(c => c.value === selectedColor);
  const selectedIconOption = iconOptions.find(i => i.value === selectedIcon);
  const IconComponent = selectedIconOption?.icon || FolderIcon;

  const handleSubmit = () => {
    const project = {
      name: projectName,
      color: selectedColor,
      icon: selectedIcon
    };
    onSubmit?.(project);
  };

  return (
    <div className="w-full max-w-md mx-auto bg-white rounded-lg border border-gray-200 shadow-sm p-4">
      {/* Project Name Input */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Project Name
        </label>
        <Input
          placeholder="Enter project name"
          value={projectName}
          onChange={(e) => setProjectName(e.target.value)}
          className="w-full"
        />
      </div>

      {/* Color Selection */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Color
        </label>
        <Popover open={isColorOpen} onOpenChange={setIsColorOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className="w-full justify-start"
            >
              <div className="flex items-center gap-2">
                <div className={`w-4 h-4 rounded-full ${selectedColorOption?.color}`}></div>
                {selectedColorOption?.label}
              </div>
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-48 p-2" align="start">
            <div className="grid grid-cols-2 gap-1">
              {colorOptions.map((color) => (
                <button
                  key={color.value}
                  onClick={() => {
                    setSelectedColor(color.value);
                    setIsColorOpen(false);
                  }}
                  className="flex items-center gap-2 px-2 py-2 text-sm hover:bg-gray-100 rounded-md text-left"
                >
                  <div className={`w-4 h-4 rounded-full ${color.color}`}></div>
                  {color.label}
                </button>
              ))}
            </div>
          </PopoverContent>
        </Popover>
      </div>

      {/* Icon Selection */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Icon
        </label>
        <Popover open={isIconOpen} onOpenChange={setIsIconOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className="w-full justify-start"
            >
              <div className="flex items-center gap-2">
                <IconComponent className={`h-4 w-4 ${selectedColorOption?.textColor}`} />
                {selectedIconOption?.label}
              </div>
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-64 p-2" align="start">
            <div className="grid grid-cols-4 gap-1 max-h-48 overflow-y-auto">
              {iconOptions.map((iconOption) => {
                const Icon = iconOption.icon;
                return (
                  <button
                    key={iconOption.value}
                    onClick={() => {
                      setSelectedIcon(iconOption.value);
                      setIsIconOpen(false);
                    }}
                    className="flex flex-col items-center gap-1 p-2 text-xs hover:bg-gray-100 rounded-md"
                    title={iconOption.label}
                  >
                    <Icon className={`h-5 w-5 ${selectedColorOption?.textColor}`} />
                    <span className="truncate w-full text-center">{iconOption.label}</span>
                  </button>
                );
              })}
            </div>
          </PopoverContent>
        </Popover>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center gap-2 justify-end">
        <Button
          variant="ghost"
          size="sm"
          onClick={onCancel}
          className="text-gray-600 hover:text-gray-800"
        >
          Cancel
        </Button>
        <Button
          size="sm"
          onClick={handleSubmit}
          disabled={!projectName.trim()}
          className="bg-blue-500 hover:bg-blue-600 text-white"
        >
          Create Project
        </Button>
      </div>
    </div>
  );
}
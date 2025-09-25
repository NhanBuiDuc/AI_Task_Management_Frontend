import { TaskCard } from '@/components/ui/task_card';
import { IconTextButton } from '@/components/ui/icon_text_button';
import TaskForm from '@/components/ui/task_form';
import { Plus, PlusCircle, ChevronDown, ChevronRight, MoreHorizontal, Edit3, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { SectionItem, TaskItem } from '@/types';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { sectionApi } from '@/lib/api/section';

interface SectionDropdownProps {
  section: SectionItem;
  tasks: TaskItem[];
  onUpdateTask: (taskId: string, updates: Partial<TaskItem>) => void;
  onToggleSection: (sectionId: string) => void;
  isExpanded: boolean;
  onDataRefresh?: () => Promise<void>;
  onSectionUpdate?: (sectionId: string, updates: Partial<SectionItem>) => void;
  onSectionDelete?: (sectionId: string) => void;
  viewContext?: 'inbox' | 'today' | 'upcoming' | 'project' | 'completed';
}

// Section Component
export function SectionDropdown({ section, tasks, onUpdateTask, onToggleSection, isExpanded, onDataRefresh, onSectionUpdate, onSectionDelete, viewContext }: SectionDropdownProps) {
  const taskCount = tasks.length;
  const [isRenameDialogOpen, setIsRenameDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [newSectionName, setNewSectionName] = useState(section.name);
  const [isRenaming, setIsRenaming] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleRename = async () => {
    if (!newSectionName.trim() || newSectionName === section.name) {
      setIsRenameDialogOpen(false);
      return;
    }

    try {
      setIsRenaming(true);
      const updatedSection = await sectionApi.updateSectionName(section.id, newSectionName.trim());
      onSectionUpdate?.(section.id, { name: updatedSection.name });
      setIsRenameDialogOpen(false);
      if (onDataRefresh) {
        await onDataRefresh();
      }
    } catch (error) {
      console.error('Failed to rename section:', error);
      alert('Failed to rename section. Please try again.');
    } finally {
      setIsRenaming(false);
    }
  };

  const handleDelete = async () => {
    try {
      setIsDeleting(true);
      await sectionApi.deleteSection(section.id);
      onSectionDelete?.(section.id);
      setIsDeleteDialogOpen(false);
      if (onDataRefresh) {
        await onDataRefresh();
      }
    } catch (error) {
      console.error('Failed to delete section:', error);
      alert('Failed to delete section. Please try again.');
    } finally {
      setIsDeleting(false);
    }
  };

  const openRenameDialog = () => {
    setNewSectionName(section.name);
    setIsRenameDialogOpen(true);
  };
  
  return (
    <div className="mb-4">
      {/* Section Header */}
      <div 
        className="flex items-center justify-between py-2 px-1 cursor-pointer hover:bg-gray-50 rounded group"
        onClick={() => onToggleSection(section.id)}
      >
        <div className="flex items-center gap-2">
          {isExpanded ? (
            <ChevronDown className="h-4 w-4 text-gray-500" />
          ) : (
            <ChevronRight className="h-4 w-4 text-gray-500" />
          )}
          <span className="font-medium text-gray-900">{section.name}</span>
          <span className="text-sm text-gray-500">{taskCount}</span>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="opacity-0 group-hover:opacity-100 p-1 hover:bg-gray-200 rounded">
              <MoreHorizontal className="h-4 w-4 text-gray-500" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuItem onClick={openRenameDialog}>
              <Edit3 className="h-4 w-4 mr-2" />
              Rename section
            </DropdownMenuItem>
            <DropdownMenuItem
              variant="destructive"
              onClick={() => setIsDeleteDialogOpen(true)}
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Delete section
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      
      {/* Section Tasks */}
      {isExpanded && (
        <div className="ml-6 mt-2">
          {tasks.map((task, index) => (
            <div key={task.id}>
              <TaskCard
                task={task}
                onUpdateTask={onUpdateTask}
                onDataRefresh={onDataRefresh}
                viewContext={viewContext}
              />
              {index < tasks.length - 1 && (
                <div className="border-b border-gray-200 my-2"></div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Rename Dialog */}
      <Dialog open={isRenameDialogOpen} onOpenChange={setIsRenameDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Rename section</DialogTitle>
            <DialogDescription>
              Enter a new name for "{section.name}" section.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Input
              value={newSectionName}
              onChange={(e) => setNewSectionName(e.target.value)}
              placeholder="Section name"
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleRename();
                }
              }}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsRenameDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleRename}
              disabled={!newSectionName.trim() || newSectionName === section.name || isRenaming}
            >
              {isRenaming ? 'Renaming...' : 'Rename'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Delete section</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete "{section.name}"? This will also delete all {taskCount} task{taskCount !== 1 ? 's' : ''} in this section. This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={isDeleting}
            >
              {isDeleting ? 'Deleting...' : 'Delete section'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

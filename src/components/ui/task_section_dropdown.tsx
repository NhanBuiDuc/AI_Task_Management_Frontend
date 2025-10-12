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
import { enhancedTaskApi } from '@/lib/api/enhancedTaskApi';

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
  // Drag and drop props
  onTaskReorder?: (sectionId: string, taskId: string, originalIndex: number, newIndex: number) => void;
  onTaskMoveToSection?: (taskId: string, sourceSectionId: string, targetSectionId: string) => void;
  isDragDisabled?: boolean;
}

// Section Component
export function SectionDropdown({
  section,
  tasks,
  onUpdateTask,
  onToggleSection,
  isExpanded,
  onDataRefresh,
  onSectionUpdate,
  onSectionDelete,
  viewContext,
  onTaskReorder,
  onTaskMoveToSection,
  isDragDisabled = false
}: SectionDropdownProps) {
  const taskCount = tasks.length;
  const [isRenameDialogOpen, setIsRenameDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [newSectionName, setNewSectionName] = useState(section.name);
  const [isRenaming, setIsRenaming] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isDragOverSection, setIsDragOverSection] = useState(false);

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

  // Drag and drop handlers for section
  const handleTaskReorder = (taskId: string, originalIndex: number, newIndex: number) => {
    if (onTaskReorder) {
      onTaskReorder(section.id, taskId, originalIndex, newIndex);
    }
  };

  const handleTaskMoveToSection = (taskId: string, targetSectionId: string) => {
    if (onTaskMoveToSection) {
      onTaskMoveToSection(taskId, section.id, targetSectionId);
    }
  };

  const handleSectionDragOver = (e: React.DragEvent) => {
    if (isDragDisabled) return;

    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setIsDragOverSection(true);
  };

  const handleSectionDragLeave = () => {
    setIsDragOverSection(false);
  };

  const handleSectionDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOverSection(false);

    if (isDragDisabled) return;

    try {
      const dragData = JSON.parse(e.dataTransfer.getData('application/json'));
      const { taskId, originalSectionId } = dragData;

      // Don't drop if already in this section
      if (originalSectionId === section.id) return;

      if (onTaskMoveToSection) {
        onTaskMoveToSection(taskId, originalSectionId, section.id);
      }
    } catch (error) {
      console.error('Error handling section drop:', error);
    }
  };
  
  return (
    <div className="mb-4">
      {/* Section Header */}
      <div
        className={`flex items-center justify-between py-2 px-1 cursor-pointer hover:bg-gray-50 rounded group transition-all duration-200 ${
          isDragOverSection ? 'bg-blue-50 border-blue-200 border-2 border-dashed' : ''
        }`}
        onClick={() => onToggleSection(section.id)}
        onDragOver={handleSectionDragOver}
        onDragLeave={handleSectionDragLeave}
        onDrop={handleSectionDrop}
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
                onTaskReorder={handleTaskReorder}
                onTaskMoveToSection={handleTaskMoveToSection}
                taskIndex={index}
                sectionId={section.id}
                isDragDisabled={isDragDisabled}
              />
              {index < tasks.length - 1 && (
                <div className="border-b border-gray-200 my-2"></div>
              )}
            </div>
          ))}

          {/* Drop zone at the end of tasks */}
          {!isDragDisabled && (
            <div
              className="h-8 w-full border-2 border-dashed border-transparent hover:border-gray-300 transition-colors duration-200 flex items-center justify-center text-sm text-gray-400"
              onDragOver={handleSectionDragOver}
              onDragLeave={handleSectionDragLeave}
              onDrop={handleSectionDrop}
            >
              <span className="opacity-0 hover:opacity-100 transition-opacity duration-200">
                Drop task here
              </span>
            </div>
          )}
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

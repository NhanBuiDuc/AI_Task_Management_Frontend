import { TaskCard } from '@/components/ui/task_card';
import { IconTextButton } from '@/components/ui/icon_text_button';
import TaskForm from '@/components/ui/task_form';
import { Plus, PlusCircle } from 'lucide-react';
import { useState } from 'react';
import {SectionDropdown} from '@/components/ui/task_section_dropdown';

export function Today() {
  // Data structure for Today (project_id = 2)
  const [sections, setSections] = useState([
    { id: 3, project_id: 2, name: "Morning" },
    { id: 4, project_id: 2, name: "Work" },
    { id: 5, project_id: 2, name: "Evening" }
  ]);

  const [tasks, setTasks] = useState([
    // Tasks with sections for Today
    { id: 8, project_id: 2, section_id: 3, text: "Morning exercise", completed: false, dueDate: "2025-09-17" },
    { id: 9, project_id: 2, section_id: 3, text: "Read for 30 minutes", completed: true, dueDate: "2025-09-17" },
    { id: 10, project_id: 2, section_id: 3, text: "Plan the day", completed: false, dueDate: "2025-09-17" },

    { id: 11, project_id: 2, section_id: 4, text: "Team standup meeting", completed: false, dueDate: "2025-09-17" },
    { id: 12, project_id: 2, section_id: 4, text: "Review project proposal", completed: false, dueDate: "2025-09-17" },
    { id: 13, project_id: 2, section_id: 4, text: "Code review", completed: true, dueDate: "2025-09-17" },

    { id: 14, project_id: 2, section_id: 5, text: "Evening walk", completed: false, dueDate: "2025-09-17" },
    { id: 15, project_id: 2, section_id: 5, text: "Cook dinner", completed: false, dueDate: "2025-09-17" },

    // Tasks without sections (section_id: null) for Today
    { id: 16, project_id: 2, section_id: null, text: "Call mom", completed: false, dueDate: "2025-09-17" },
    { id: 17, project_id: 2, section_id: null, text: "Pick up dry cleaning", completed: false, dueDate: "2025-09-17" },
  ]);

  const [expandedSections, setExpandedSections] = useState({
    3: true,  // Morning section expanded by default
    4: true,  // Work section expanded by default
    5: false  // Evening section collapsed by default
  });

  const [showTaskForm, setShowTaskForm] = useState(false);

  const toggleTask = (id: number) => {
    setTasks(tasks.map(task =>
      task.id === id ? { ...task, completed: !task.completed } : task
    ));
  };

  const toggleSection = (sectionId: number) => {
    setExpandedSections(prev => ({
      ...prev,
      [sectionId]: !prev[sectionId]
    }));
  };

  const handleAddTask = (newTask: any) => {
    const task = {
      id: Math.max(...tasks.map(t => t.id), 0) + 1,
      project_id: 2, // Today project
      section_id: null, // New tasks go to unsectioned by default
      text: newTask.name,
      completed: false,
      dueDate: newTask.dueDate?.toISOString().split('T')[0] || "2025-09-17"
    };
    setTasks([...tasks, task]);
    setShowTaskForm(false);
  };

  const handleCancelForm = () => {
    setShowTaskForm(false);
  };

  // Group tasks by section
  const tasksBySection = tasks.reduce((acc, task) => {
    const key = task.section_id || 'unsectioned';
    if (!acc[key]) {
      acc[key] = [];
    }
    acc[key].push(task);
    return acc;
  }, {});

  // Get unsectioned tasks
  const unsectionedTasks = tasksBySection['unsectioned'] || [];

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h2 className="text-2xl font-semibold text-gray-900 mb-6">Today</h2>

      <div className="mb-6">
        {/* Render sections with their tasks */}
        {sections.map((section) => {
          const sectionTasks = tasksBySection[section.id] || [];
          if (sectionTasks.length === 0) return null;

          return (
            <SectionDropdown
              key={section.id}
              section={section}
              tasks={sectionTasks}
              onToggleTask={toggleTask}
              onToggleSection={toggleSection}
              isExpanded={expandedSections[section.id]}
            />
          );
        })}

        {/* Render unsectioned tasks */}
        {unsectionedTasks.length > 0 && (
          <div className="mb-4">
            <div className="mb-2">
              {unsectionedTasks.map((task, index) => (
                <div key={task.id}>
                  <TaskCard
                    task={task.text}
                    completed={task.completed}
                    onToggle={() => toggleTask(task.id)}
                    dueDate={task.dueDate}
                  />
                  {index < unsectionedTasks.length - 1 && (
                    <div className="border-b border-gray-200 my-2"></div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
      <div>
        {showTaskForm ? (
          <TaskForm onSubmit={handleAddTask} onCancel={handleCancelForm} />
        ) : (
          <IconTextButton
            onClick={() => setShowTaskForm(true)}
            icon={
              <div className="relative h-5 w-5">
                <Plus className="h-5 w-5 text-orange-500 group-hover:opacity-0 opacity-100 transition-opacity duration-200 absolute inset-0" />
                <PlusCircle className="h-5 w-5 text-orange-500 group-hover:opacity-100 opacity-0 transition-opacity duration-200 absolute inset-0" />
              </div>
            }
            label="Add Task"
            variant="ghost"
            className="group text-black hover:text-orange-500 transition-colors duration-200"
            iconClassName="transition-all duration-200"
          />
        )}
      </div>
    </div>
  );
}

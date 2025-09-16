import { TaskCard } from '@/components/ui/task_card';
import { IconTextButton } from '@/components/ui/icon_text_button';
import TaskForm from '@/components/ui/task_form';
import { Plus, PlusCircle } from 'lucide-react';
import { useState } from 'react';
import {SectionDropdown} from '@/components/ui/task_section_dropdown';

export function Upcoming() {
  // Data structure for Upcoming (project_id = 3)
  const [sections, setSections] = useState([
    { id: 6, project_id: 3, name: "This Week" },
    { id: 7, project_id: 3, name: "Next Week" },
    { id: 8, project_id: 3, name: "Later" }
  ]);

  const [tasks, setTasks] = useState([
    // Tasks with sections for Upcoming
    { id: 18, project_id: 3, section_id: 6, text: "Dentist appointment", completed: false, dueDate: "2025-09-18" },
    { id: 19, project_id: 3, section_id: 6, text: "Client presentation", completed: false, dueDate: "2025-09-19" },
    { id: 20, project_id: 3, section_id: 6, text: "Weekend grocery shopping", completed: false, dueDate: "2025-09-21" },

    { id: 21, project_id: 3, section_id: 7, text: "Team planning meeting", completed: false, dueDate: "2025-09-24" },
    { id: 22, project_id: 3, section_id: 7, text: "Project milestone review", completed: false, dueDate: "2025-09-25" },
    { id: 23, project_id: 3, section_id: 7, text: "Conference call with stakeholders", completed: false, dueDate: "2025-09-26" },

    { id: 24, project_id: 3, section_id: 8, text: "Annual performance review", completed: false, dueDate: "2025-10-15" },
    { id: 25, project_id: 3, section_id: 8, text: "Plan vacation", completed: false, dueDate: "2025-11-01" },

    // Tasks without sections (section_id: null) for Upcoming
    { id: 26, project_id: 3, section_id: null, text: "Book flight tickets", completed: false, dueDate: "2025-09-25" },
    { id: 27, project_id: 3, section_id: null, text: "Renew car insurance", completed: false, dueDate: "2025-10-05" },
  ]);

  const [expandedSections, setExpandedSections] = useState({
    6: true,  // This Week section expanded by default
    7: true,  // Next Week section expanded by default
    8: false  // Later section collapsed by default
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
      project_id: 3, // Upcoming project
      section_id: null, // New tasks go to unsectioned by default
      text: newTask.name,
      completed: false,
      dueDate: newTask.dueDate?.toISOString().split('T')[0] || "2025-09-18"
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
      <h2 className="text-2xl font-semibold text-gray-900 mb-6">Upcoming</h2>

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
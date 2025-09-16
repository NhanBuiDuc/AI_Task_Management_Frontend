import { TaskCard } from '@/components/ui/task_card';
import { IconTextButton } from '@/components/ui/icon_text_button';
import TaskForm from '@/components/ui/task_form';
import { Plus, PlusCircle, ArrowLeft, Settings } from 'lucide-react';
import { useState, useEffect } from 'react';
import { SectionDropdown } from '@/components/ui/task_section_dropdown';

interface Project {
  id: number;
  name: string;
  parent_id: number | null;
}

interface Section {
  id: number;
  project_id: number;
  name: string;
}

interface Task {
  id: number;
  project_id: number;
  section_id: number | null;
  text: string;
  completed: boolean;
  dueDate: string;
}

interface ProjectTasksProps {
  projectId: number;
  onBackToProjects: () => void;
}

export function ProjectTasks({ projectId, onBackToProjects }: ProjectTasksProps) {
  const [project, setProject] = useState<Project | null>(null);
  const [sections, setSections] = useState<Section[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [expandedSections, setExpandedSections] = useState<{[key: number]: boolean}>({});
  const [showTaskForm, setShowTaskForm] = useState(false);

  // Load project-specific data based on projectId
  useEffect(() => {
    loadProjectData(projectId);
  }, [projectId]);

  const loadProjectData = (id: number) => {
    // Simulate project-specific data for different projects
    const projectsData = {
      // Getting Started Project (Parent)
      4: {
        project: { id: 4, name: "Getting Started", parent_id: null },
        sections: [
          { id: 20, project_id: 4, name: "Setup" },
          { id: 21, project_id: 4, name: "Learning" },
          { id: 22, project_id: 4, name: "Practice" }
        ],
        tasks: [
          { id: 100, project_id: 4, section_id: 20, text: "Install development tools", completed: true, dueDate: "2025-09-17" },
          { id: 101, project_id: 4, section_id: 20, text: "Set up workspace", completed: false, dueDate: "2025-09-18" },
          { id: 102, project_id: 4, section_id: 20, text: "Configure environment", completed: false, dueDate: "2025-09-19" },

          { id: 103, project_id: 4, section_id: 21, text: "Read documentation", completed: true, dueDate: "2025-09-17" },
          { id: 104, project_id: 4, section_id: 21, text: "Watch tutorial videos", completed: false, dueDate: "2025-09-18" },
          { id: 105, project_id: 4, section_id: 21, text: "Complete online course", completed: false, dueDate: "2025-09-20" },

          { id: 106, project_id: 4, section_id: 22, text: "Build hello world app", completed: false, dueDate: "2025-09-19" },
          { id: 107, project_id: 4, section_id: 22, text: "Create small project", completed: false, dueDate: "2025-09-22" },

          // Unsectioned tasks
          { id: 108, project_id: 4, section_id: null, text: "Join community forum", completed: false, dueDate: "2025-09-18" },
          { id: 109, project_id: 4, section_id: null, text: "Find mentor", completed: false, dueDate: "2025-09-25" },
        ],
        expanded: { 20: true, 21: true, 22: false }
      },

      // Sub Project 1 under Getting Started
      8: {
        project: { id: 8, name: "Frontend Basics", parent_id: 4 },
        sections: [
          { id: 23, project_id: 8, name: "HTML" },
          { id: 24, project_id: 8, name: "CSS" },
          { id: 25, project_id: 8, name: "JavaScript" }
        ],
        tasks: [
          { id: 110, project_id: 8, section_id: 23, text: "Learn HTML5 semantic elements", completed: true, dueDate: "2025-09-16" },
          { id: 111, project_id: 8, section_id: 23, text: "Practice forms and inputs", completed: false, dueDate: "2025-09-18" },
          { id: 112, project_id: 8, section_id: 23, text: "Build accessibility features", completed: false, dueDate: "2025-09-20" },

          { id: 113, project_id: 8, section_id: 24, text: "Master CSS Grid", completed: false, dueDate: "2025-09-19" },
          { id: 114, project_id: 8, section_id: 24, text: "Learn Flexbox layouts", completed: true, dueDate: "2025-09-17" },
          { id: 115, project_id: 8, section_id: 24, text: "Responsive design principles", completed: false, dueDate: "2025-09-21" },

          { id: 116, project_id: 8, section_id: 25, text: "ES6+ features practice", completed: false, dueDate: "2025-09-22" },
          { id: 117, project_id: 8, section_id: 25, text: "DOM manipulation exercises", completed: false, dueDate: "2025-09-23" },

          { id: 118, project_id: 8, section_id: null, text: "Build portfolio website", completed: false, dueDate: "2025-09-30" },
        ],
        expanded: { 23: false, 24: true, 25: true }
      },

      // Sub Project 2 under Getting Started
      9: {
        project: { id: 9, name: "Backend Basics", parent_id: 4 },
        sections: [
          { id: 26, project_id: 9, name: "Node.js" },
          { id: 27, project_id: 9, name: "Database" },
          { id: 28, project_id: 9, name: "APIs" }
        ],
        tasks: [
          { id: 119, project_id: 9, section_id: 26, text: "Set up Node.js server", completed: false, dueDate: "2025-09-18" },
          { id: 120, project_id: 9, section_id: 26, text: "Learn Express.js", completed: false, dueDate: "2025-09-20" },
          { id: 121, project_id: 9, section_id: 26, text: "File system operations", completed: false, dueDate: "2025-09-22" },

          { id: 122, project_id: 9, section_id: 27, text: "Install MongoDB", completed: false, dueDate: "2025-09-19" },
          { id: 123, project_id: 9, section_id: 27, text: "Design database schema", completed: false, dueDate: "2025-09-21" },
          { id: 124, project_id: 9, section_id: 27, text: "Practice CRUD operations", completed: false, dueDate: "2025-09-24" },

          { id: 125, project_id: 9, section_id: 28, text: "Build REST API", completed: false, dueDate: "2025-09-25" },
          { id: 126, project_id: 9, section_id: 28, text: "API authentication", completed: false, dueDate: "2025-09-27" },

          { id: 127, project_id: 9, section_id: null, text: "Deploy to cloud", completed: false, dueDate: "2025-10-01" },
        ],
        expanded: { 26: true, 27: false, 28: true }
      },

      // Mobile Development Project (Parent)
      5: {
        project: { id: 5, name: "Mobile Development", parent_id: null },
        sections: [
          { id: 29, project_id: 5, name: "Planning" },
          { id: 30, project_id: 5, name: "Design" },
          { id: 31, project_id: 5, name: "Development" }
        ],
        tasks: [
          { id: 128, project_id: 5, section_id: 29, text: "Market research", completed: true, dueDate: "2025-09-15" },
          { id: 129, project_id: 5, section_id: 29, text: "Define app requirements", completed: false, dueDate: "2025-09-18" },
          { id: 130, project_id: 5, section_id: 29, text: "Choose tech stack", completed: false, dueDate: "2025-09-20" },

          { id: 131, project_id: 5, section_id: 30, text: "Create wireframes", completed: false, dueDate: "2025-09-22" },
          { id: 132, project_id: 5, section_id: 30, text: "Design UI mockups", completed: false, dueDate: "2025-09-25" },
          { id: 133, project_id: 5, section_id: 30, text: "User experience testing", completed: false, dueDate: "2025-09-28" },

          { id: 134, project_id: 5, section_id: 31, text: "Set up React Native", completed: false, dueDate: "2025-09-30" },
          { id: 135, project_id: 5, section_id: 31, text: "Build core features", completed: false, dueDate: "2025-10-15" },

          { id: 136, project_id: 5, section_id: null, text: "App store submission", completed: false, dueDate: "2025-11-01" },
        ],
        expanded: { 29: true, 30: true, 31: false }
      },

      // Task Manager App (Sub project under Mobile Development)
      11: {
        project: { id: 11, name: "Task Manager App", parent_id: 5 },
        sections: [
          { id: 32, project_id: 11, name: "Core Features" },
          { id: 33, project_id: 11, name: "UI Components" },
          { id: 34, project_id: 11, name: "Data Management" }
        ],
        tasks: [
          { id: 137, project_id: 11, section_id: 32, text: "Task creation flow", completed: false, dueDate: "2025-09-20" },
          { id: 138, project_id: 11, section_id: 32, text: "Task completion system", completed: false, dueDate: "2025-09-22" },
          { id: 139, project_id: 11, section_id: 32, text: "Due date notifications", completed: false, dueDate: "2025-09-25" },

          { id: 140, project_id: 11, section_id: 33, text: "Task list component", completed: false, dueDate: "2025-09-21" },
          { id: 141, project_id: 11, section_id: 33, text: "Calendar view", completed: false, dueDate: "2025-09-24" },
          { id: 142, project_id: 11, section_id: 33, text: "Settings screen", completed: false, dueDate: "2025-09-26" },

          { id: 143, project_id: 11, section_id: 34, text: "Local storage setup", completed: false, dueDate: "2025-09-23" },
          { id: 144, project_id: 11, section_id: 34, text: "Cloud sync integration", completed: false, dueDate: "2025-09-28" },

          { id: 145, project_id: 11, section_id: null, text: "Performance optimization", completed: false, dueDate: "2025-10-05" },
        ],
        expanded: { 32: true, 33: false, 34: true }
      }
    };

    const data = projectsData[id] || projectsData[4]; // Fallback to Getting Started data

    setProject(data.project);
    setSections(data.sections);
    setTasks(data.tasks);
    setExpandedSections(data.expanded);
  };

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
      project_id: projectId,
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

  if (!project) {
    return (
      <div className="max-w-2xl mx-auto p-6">
        <div className="text-center py-12">
          <p className="text-gray-500">Loading project...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-6">
      {/* Header with back button and project info */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <button
            onClick={onBackToProjects}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="h-5 w-5 text-gray-600" />
          </button>
          <div>
            <h2 className="text-2xl font-semibold text-gray-900">{project.name}</h2>
            <p className="text-sm text-gray-500">
              Project ID: {project.id}
              {project.parent_id && ` (Sub-project of ${project.parent_id})`}
            </p>
          </div>
        </div>
        <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
          <Settings className="h-5 w-5 text-gray-600" />
        </button>
      </div>

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
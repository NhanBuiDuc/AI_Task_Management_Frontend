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

interface ProjectViewProps {
  projectId: number;
  onBack: () => void;
}

export function ProjectView({ projectId, onBack }: ProjectViewProps) {
  // This would typically fetch data based on projectId
  // For now, we'll simulate different data for different projects

  const [project, setProject] = useState<Project | null>(null);
  const [sections, setSections] = useState<Section[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [expandedSections, setExpandedSections] = useState<{[key: number]: boolean}>({});
  const [showTaskForm, setShowTaskForm] = useState(false);

  // Simulate loading project-specific data
  useEffect(() => {
    loadProjectData(projectId);
  }, [projectId]);

  const loadProjectData = (id: number) => {
    // Simulate different data for different projects
    const projectsData = {
      4: {
        project: { id: 4, name: "Web Development", parent_id: null },
        sections: [
          { id: 20, project_id: 4, name: "Frontend" },
          { id: 21, project_id: 4, name: "Backend" },
          { id: 22, project_id: 4, name: "Testing" }
        ],
        tasks: [
          { id: 100, project_id: 4, section_id: 20, text: "Design homepage layout", completed: false, dueDate: "2025-09-18" },
          { id: 101, project_id: 4, section_id: 20, text: "Implement responsive navigation", completed: true, dueDate: "2025-09-17" },
          { id: 102, project_id: 4, section_id: 21, text: "Set up API endpoints", completed: false, dueDate: "2025-09-19" },
          { id: 103, project_id: 4, section_id: 21, text: "Database schema design", completed: false, dueDate: "2025-09-20" },
          { id: 104, project_id: 4, section_id: 22, text: "Write unit tests", completed: false, dueDate: "2025-09-22" },
          { id: 105, project_id: 4, section_id: null, text: "Project documentation", completed: false, dueDate: "2025-09-25" },
        ],
        expanded: { 20: true, 21: true, 22: false }
      },
      8: {
        project: { id: 8, name: "Portfolio Website", parent_id: 4 },
        sections: [
          { id: 23, project_id: 8, name: "Design" },
          { id: 24, project_id: 8, name: "Development" },
          { id: 25, project_id: 8, name: "Content" }
        ],
        tasks: [
          { id: 106, project_id: 8, section_id: 23, text: "Create wireframes", completed: true, dueDate: "2025-09-15" },
          { id: 107, project_id: 8, section_id: 23, text: "Design color scheme", completed: false, dueDate: "2025-09-18" },
          { id: 108, project_id: 8, section_id: 24, text: "Set up Next.js project", completed: true, dueDate: "2025-09-16" },
          { id: 109, project_id: 8, section_id: 24, text: "Implement portfolio grid", completed: false, dueDate: "2025-09-19" },
          { id: 110, project_id: 8, section_id: 25, text: "Write about page content", completed: false, dueDate: "2025-09-20" },
          { id: 111, project_id: 8, section_id: null, text: "Deploy to production", completed: false, dueDate: "2025-09-25" },
        ],
        expanded: { 23: false, 24: true, 25: true }
      },
      5: {
        project: { id: 5, name: "Mobile Apps", parent_id: null },
        sections: [
          { id: 26, project_id: 5, name: "Planning" },
          { id: 27, project_id: 5, name: "UI/UX" },
          { id: 28, project_id: 5, name: "Development" }
        ],
        tasks: [
          { id: 112, project_id: 5, section_id: 26, text: "Market research", completed: true, dueDate: "2025-09-10" },
          { id: 113, project_id: 5, section_id: 26, text: "Define app requirements", completed: false, dueDate: "2025-09-18" },
          { id: 114, project_id: 5, section_id: 27, text: "Create user personas", completed: false, dueDate: "2025-09-20" },
          { id: 115, project_id: 5, section_id: 27, text: "Design app mockups", completed: false, dueDate: "2025-09-22" },
          { id: 116, project_id: 5, section_id: 28, text: "Set up React Native", completed: false, dueDate: "2025-09-25" },
          { id: 117, project_id: 5, section_id: null, text: "App store preparation", completed: false, dueDate: "2025-10-15" },
        ],
        expanded: { 26: true, 27: true, 28: false }
      }
    };

    const data = projectsData[id] || projectsData[4]; // Fallback to Web Development data

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
            onClick={onBack}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="h-5 w-5 text-gray-600" />
          </button>
          <div>
            <h2 className="text-2xl font-semibold text-gray-900">{project.name}</h2>
            <p className="text-sm text-gray-500">Project ID: {project.id}</p>
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
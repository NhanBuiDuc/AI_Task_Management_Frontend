import { TaskCard } from '@/components/ui/task_card';
import { IconTextButton } from '@/components/ui/icon_text_button';
import TaskForm from '@/components/ui/task_form';
import { Plus, PlusCircle } from 'lucide-react';
import { useState } from 'react';
import {SectionDropdown} from '@/components/ui/task_section_dropdown';

// export function Inbox() {
//   const [tasks, setTasks] = useState([
//     { id: 1, text: "Task 1: Hello world", completed: false, dueDate: "2025-09-16" }, // Today (green)
//     { id: 2, text: "Task 2: Learn React", completed: false, dueDate: "2025-09-17" }, // Tomorrow (orange)
//     { id: 3, text: "Task 3: Build something cool", completed: false, dueDate: "2025-09-20" } // Next 7 days (purple)
//   ]);
//   const [showTaskForm, setShowTaskForm] = useState(false);

//   const toggleTask = (id: number) => {
//     setTasks(tasks.map(task =>
//       task.id === id ? { ...task, completed: !task.completed } : task
//     ));
//   };

//   const handleAddTask = (newTask: any) => {
//     const task = {
//       id: tasks.length + 1,
//       text: newTask.name,
//       completed: false,
//       dueDate: newTask.dueDate?.toISOString().split('T')[0] || "2025-09-16"
//     };
//     setTasks([...tasks, task]);
//     setShowTaskForm(false);
//   };

//   const handleCancelForm = () => {
//     setShowTaskForm(false);
//   };

//   return (
//     <div className="max-w-2xl mx-auto p-6">
//       <h2 className="text-2xl font-semibold text-gray-900 mb-6">Inbox</h2>

//       <div className="mb-6">
//         {tasks.map((task, index) => (
//           <div key={task.id}>
//             <TaskCard
//               task={task.text}
//               completed={task.completed}
//               onToggle={() => toggleTask(task.id)}
//               dueDate={task.dueDate}
//             />
//             {index < tasks.length - 1 && (
//               <div className="border-b border-gray-200 my-2"></div>
//             )}
//           </div>
//         ))}
//       </div>
//       <div>
//         {showTaskForm ? (
//           <TaskForm onSubmit={handleAddTask} onCancel={handleCancelForm} />
//         ) : (
//           <IconTextButton
//             onClick={() => setShowTaskForm(true)}
//             icon={
//               <div className="relative h-5 w-5">
//                 <Plus className="h-5 w-5 text-orange-500 group-hover:opacity-0 opacity-100 transition-opacity duration-200 absolute inset-0" />
//                 <PlusCircle className="h-5 w-5 text-orange-500 group-hover:opacity-100 opacity-0 transition-opacity duration-200 absolute inset-0" />
//               </div>
//             }
//             label="Add Task"
//             variant="ghost"
//             className="group text-black hover:text-orange-500 transition-colors duration-200"
//             iconClassName="transition-all duration-200"
//           />
//         )}
//       </div>
//     </div>
//   );
// }



export function Inbox() {
  // Updated data structure with sections and tasks with section_id for Inbox (project_id = 1)
  const [sections, setSections] = useState([
    { id: 1, project_id: 1, name: "Personal" },
    { id: 2, project_id: 1, name: "Shopping" }
  ]);

  const [tasks, setTasks] = useState([
    // Tasks with sections for Inbox
    { id: 1, project_id: 1, section_id: 1, text: "Call family", completed: false, dueDate: "2025-09-17" },
    { id: 2, project_id: 1, section_id: 1, text: "Schedule doctor appointment", completed: false, dueDate: "2025-09-18" },
    { id: 3, project_id: 1, section_id: 2, text: "Buy birthday gift", completed: false, dueDate: "2025-09-19" },
    { id: 4, project_id: 1, section_id: 2, text: "Grocery shopping", completed: false, dueDate: "2025-09-17" },

    // Tasks without sections (section_id: null) for Inbox
    { id: 5, project_id: 1, section_id: null, text: "Random inbox item", completed: false, dueDate: "2025-09-17" },
    { id: 6, project_id: 1, section_id: null, text: "Misc task", completed: false, dueDate: "2025-09-20" },
  ]);

  const [expandedSections, setExpandedSections] = useState({
    1: true, // Daily section expanded by default
    2: false  // Work section collapsed by default
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
      project_id: 1,
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
      <h2 className="text-2xl font-semibold text-gray-900 mb-6">Inbox</h2>
      
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
# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

- **Development server**: `npm run dev` (Next.js dev server with Turbopack on port 3000)
- **Build**: `npm run build` (Production build with Turbopack)
- **Lint**: `npm run lint` (ESLint with Next.js config)
- **Start**: `npm start` (Production server)

## Tech Stack & Architecture

**Framework**: Next.js 15.5.3 with React 19.1.0 and TypeScript (latest versions)
**Build System**: Turbopack enabled for enhanced dev/build performance
**Styling**: Tailwind CSS 4.x with comprehensive design system and CSS variables
**UI Components**: Custom component library based on Radix UI primitives with ShadCN integration
**Icons**: Lucide React for consistent iconography
**Component Variants**: Class Variance Authority (CVA) for type-safe component styling
**State Management**: Simple React hooks pattern (useState with props drilling)
**Utilities**: clsx and tailwind-merge for conditional className handling

## CRITICAL BEHAVIOR RULES

### MANDATORY: READ BROWSER STATE BEFORE CODING
- **ALWAYS FIRST**: Use `mcp__playwright__browser_navigate` to visit the current page
- **READ STATE**: Use `mcp__playwright__browser_snapshot` to understand current UI structure
- **CHECK CONSOLE**: Use `mcp__playwright__browser_console_messages` to see errors/logs
- **UNDERSTAND BEFORE ACTING**: Never write code blindly - always know what exists first

### Frontend Server Management - SINGLE INSTANCE ONLY
- **CRITICAL**: Always use ONLY `http://localhost:3000` - never run multiple instances
- **CHECK FIRST**: Always check if port 3000 is already running before starting dev server
- **REUSE EXISTING**: Navigate to existing running server instead of starting new ones
- **AUTO-RELOAD**: Frontend automatically updates with hot-reload via Turbopack, no need to restart
= **COLOR-GLOBALL**: Detect any hard code color and put it into globals.css, think of a distiguisable name for it

#### Server Management Commands
**MANDATORY: Before starting any development server:**

1. **Check port 3000**: `netstat -ano | findstr :3000`
2. **Kill existing processes**: `taskkill /PID <PID> /F` for each PID found
3. **Start single instance**: Use ONLY `npm run dev` on port 3000
4. **Never run multiple dev servers** - causes port conflicts and resource waste

Example workflow:
```bash
# Check what's running on port 3000
netstat -ano | findstr :3000

# Kill any existing processes (replace <PID> with actual process ID)
taskkill /PID <PID> /F

# Start clean development server on port 3000 ONLY
npm run dev
```

### UI Implementation - EXACT COPY RULE
- **PIXEL PERFECT**: When given an image/design, copy the UI exactly as shown
- **NO INTERPRETATION**: Don't add, modify, or "improve" elements beyond what's shown
- **MATCH EVERYTHING**: Colors, spacing, layout, text, components must match precisely

## MCP Shadcn Component Management

### MANDATORY: MCP-Powered Frontend Development Workflow

**This is the REQUIRED workflow for ALL frontend code changes. Follow this exact sequence:**

#### **Core Principle: Read → Find → Modify → Verify**
Never write code blindly. Always understand the current state before making changes.

**CRITICAL SERVER RULE**: Always use ONLY `http://localhost:3000` - never start multiple dev server instances.

#### **MCP Frontend Development Steps**

**STEP 1: Verify Development Environment**
```bash
# Check if dev server is running on port 3000
netstat -ano | findstr :3000

# If NOT running, start it
npm run dev

# If IS running, use existing server - DO NOT start another
```

**STEP 2: Initialize MCP if needed**
```bash
# Verify MCP connection is active
/mcp

# If not connected, initialize
npx shadcn@latest mcp init --client claude
```

#### **STEP 3: Read Current UI State** (ALWAYS FIRST)
**CRITICAL: This step is MANDATORY before ANY code changes**

```bash
# Navigate to application (ALWAYS use port 3000)
mcp__playwright__browser_navigate("http://localhost:3000")

# Capture current UI structure and state
mcp__playwright__browser_snapshot()

# Check for existing errors/warnings
mcp__playwright__browser_console_messages()
```

**Essential UI Analysis Checklist:**
- ✅ Current navigation state (Home/About/Contact)
- ✅ Sidebar with avatar dropdown functionality
- ✅ Active page content and layout
- ✅ Any console errors or warnings
- ✅ Component hierarchy and interactive elements
- ✅ Existing styling patterns and design system usage

**Understanding Current Application:**
- **Navigation**: Sidebar-based with 3 main sections
- **Avatar Dropdown**: Complex menu with user profile, actions, shortcuts
- **Components**: Custom IconTextButton and IconDoubleTextButton implementations
- **State Management**: Simple React useState pattern
- **Styling**: Tailwind CSS with design system variables

#### **STEP 4: Find Existing Components First**
**ALWAYS check existing project components before installing new ones**

```bash
# Find all existing component files
Glob("src/components/**/*.tsx")

# Search for specific component implementations
Grep("export.*function.*Button", glob="src/components/**/*.tsx")
Grep("interface.*Props", glob="src/components/**/*.tsx")

# Read existing components to understand patterns
Read("src/components/ui/button.tsx")           # Base button component
Read("src/components/ui/icon_text_button.tsx") # Custom icon+text button
Read("src/components/ui/avartar_dropdown.tsx") # Complex dropdown menu
Read("src/components/ui/Sidebar.tsx")          # Navigation sidebar
```

**Existing Component Library:**
- ✅ `Button` - CVA-based with variants (default, outline, secondary, ghost, destructive)
- ✅ `IconTextButton` - Icon + main label + optional secondary label
- ✅ `IconDoubleTextButton` - Icon + stacked text labels (primary/secondary)
- ✅ `AvatarDropdown` - Full user menu with profile, shortcuts, actions
- ✅ `Avatar`, `Popover`, `Command`, `Dialog` - Radix UI components

#### **STEP 5: Install Missing Components (if needed)**
```bash
# Only if component doesn't exist in project
mcp__shadcn__search_components("form input checkbox")
mcp__shadcn__install_component("form")
mcp__shadcn__install_component("input")
```

#### **STEP 6: Understand Target Code Structure**
**Read and analyze the specific files you need to modify:**

```bash
# Read main application orchestrator
Read("src/app/page.tsx")              # Simple 27-line navigation logic

# Read target component files
Read("src/components/ui/Sidebar.tsx")      # Navigation sidebar
Read("src/pages/Home.tsx")                # Page content components

# Understand current patterns
Grep("useState", glob="**/*.tsx")          # State management patterns
Grep("className=", glob="**/*.tsx")        # Styling patterns
```

**Code Patterns to Follow:**
- **Component Structure**: Function components with TypeScript interfaces
- **State Management**: Simple `useState` with props drilling
- **Styling**: Tailwind CSS with conditional classes using template literals
- **Navigation**: Array-based configuration with dynamic component rendering
- **Imports**: Consistent path aliases (`@/components`, `@/lib`)

#### **STEP 7: Implement Code Changes**
**Make targeted modifications following existing patterns:**

```bash
# For single component changes
Edit("src/components/ui/Sidebar.tsx", old_string, new_string)

# For multiple related changes in one file
MultiEdit("src/app/page.tsx", [
  {old_string: "const [activeId, setActiveId] = useState(\"home\")", new_string: "const [activeId, setActiveId] = useState(\"about\")"},
  {old_string: "// Add new nav item", new_string: "{id: \"settings\", label: \"Settings\", component: Settings}"}
])

# For new components (if needed)
Write("src/components/ui/new-component.tsx", component_code)
```

**Implementation Checklist:**
- ✅ Follow TypeScript interface patterns
- ✅ Use existing CVA variant systems for styling
- ✅ Maintain consistent import structure
- ✅ Integrate with existing state management
- ✅ Follow Tailwind CSS organization

#### **STEP 8: Verify Implementation** (MANDATORY)
**CRITICAL: Always verify changes match requirements using MCP browser tools**

```bash
# Navigate to application (ALWAYS use existing port 3000)
mcp__playwright__browser_navigate("http://localhost:3000")

# Read updated UI state - MOST CRITICAL STEP
mcp__playwright__browser_snapshot()

# Check for console errors - ESSENTIAL for debugging
mcp__playwright__browser_console_messages()

# Test interactions if applicable
mcp__playwright__browser_click("button[aria-label='User menu']")  # Example: test avatar dropdown
mcp__playwright__browser_click("text=Home")                       # Example: test navigation
```

**Comprehensive Verification Process:**

**Phase 1: Visual Verification**
- ✅ UI matches the requested changes exactly
- ✅ Components render in correct positions
- ✅ Styling follows design system (colors, spacing, typography)
- ✅ Layout is not broken or misaligned

**Phase 2: Functional Verification**
- ✅ Interactive elements work as expected (buttons, dropdowns, navigation)
- ✅ State management functions properly
- ✅ Navigation between pages works correctly
- ✅ Avatar dropdown opens and closes properly

**Phase 3: Technical Verification**
- ✅ No console errors or warnings
- ✅ No TypeScript compilation errors
- ✅ All imports resolve correctly
- ✅ Components follow existing patterns

**Phase 4: Requirement Matching**
- ✅ Changes exactly match provided description or images
- ✅ All specified features are implemented
- ✅ No unintended side effects or regressions

**Final Step: Document Changes**
```bash
# Take final screenshot for documentation (if requested)
mcp__playwright__browser_take_screenshot()
```

## Project Structure

```
src/
├── app/                       # Next.js app directory
│   ├── globals.css            # Design system with CSS variables & OKLCH colors
│   ├── layout.tsx             # Root layout with Geist fonts
│   └── page.tsx               # Main application orchestrator (27 lines)
├── components/ui/             # Custom UI component library
│   ├── avatar.tsx             # Radix avatar component
│   ├── button.tsx             # Base button with CVA variants
│   ├── icon_text_button.tsx   # Custom icon + text + secondary label
│   ├── icon_double_text_button.tsx # Icon + stacked text labels
│   ├── avartar_dropdown.tsx   # Complex user dropdown menu
│   ├── Sidebar.tsx            # Navigation sidebar with avatar
│   ├── ViewHolder.tsx         # Content area wrapper
│   ├── popover.tsx            # Radix popover component
│   ├── command.tsx            # Command palette component
│   └── dialog.tsx             # Modal dialog component
├── pages/                     # Page content components
│   ├── Home.tsx               # Home page content
│   ├── About.tsx              # About page content
│   └── Contact.tsx            # Contact page content
└── lib/
    └── utils.ts               # Utilities (cn function, clsx/tailwind-merge)
```

## Current Application Architecture

The application follows a clean, modern React architecture with simple but effective patterns:

### **Main Application** (`src/app/page.tsx`):
- **Simple Orchestration**: 27-line clean component that coordinates UI
- **Navigation State**: Manages active page state with `useState`
- **Component Configuration**: Uses array of navigation items for dynamic rendering
- **Dynamic Content**: Renders different page components via `ViewHolder`

### **Component Library Design**:
The app features a sophisticated custom component library:

**Base Components:**
- `Button`: CVA-based button with multiple variants (default, outline, secondary, ghost, destructive, link)
- `Avatar`: Radix UI avatar with image and fallback support
- `Popover`: Radix UI popover for dropdown interactions

**Custom Button Components:**
- `IconTextButton`: Icon + main label + optional secondary label (right-aligned)
- `IconDoubleTextButton`: Icon + stacked text labels (primary/secondary vertically)

**Complex Components:**
- `AvatarDropdown`: Full-featured user menu with profile, actions, shortcuts, and footer
- `Sidebar`: Navigation sidebar with integrated avatar dropdown

### State Management Pattern

The application uses a **simple React state pattern** appropriate for its current scope:

```typescript
// Main application state management (src/app/page.tsx)
const navItems = [
  {id: "home", label: "Home", component: Home},
  {id: "about", label: "About", component: About},
  {id: "contact", label: "Contact", component: Contact},
]

const [activeId, setActiveId] = useState("home");
const activeItem = navItems.find((item) => item.id === activeId)!;

// Clean component composition
<Sidebar items={navItems} activeId={activeId} onChange={setActiveId} />
<ViewHolder Component={activeItem.component}/>
```

**State Management Characteristics:**
- **Local State**: Uses React `useState` for navigation state
- **Props Drilling**: State passed down through component props (appropriate for current scale)
- **Event Handlers**: Parent components manage state, children receive callbacks
- **No External State Libraries**: Relies on built-in React state management

## Current Application Features

### **Navigation System**:
- Clean sidebar-based navigation with three main sections (Home, About, Contact)
- Integrated avatar dropdown at top of sidebar
- Dynamic content rendering via `ViewHolder` component

### **Avatar Dropdown Menu**:
- User profile section with avatar and task count display
- Comprehensive action menu with icons and labels
- Keyboard shortcuts display (⌘ then S, Ctrl P, etc.)
- Professional menu items: Settings, Add team, Activity log, Print, What's new, Upgrade to Pro, Sync, Log out
- Footer with version information and changelog link

### **Component Design System**:
- **Consistent Theming**: OKLCH color system with light/dark mode support
- **Accessible Components**: Built on Radix UI primitives
- **Type-Safe Variants**: CVA-based component styling system
- **Icon Integration**: Lucide React icons throughout

### **Custom Button Components**:
- `IconTextButton`: Icon + label + optional secondary label (e.g., shortcuts, badges)
- `IconDoubleTextButton`: Icon with stacked text labels for profile displays
- Both components support all base button variants and proper keyboard navigation

## Development Guidelines

### **Component Development**:
- Follow existing CVA variant patterns for consistent styling
- Use TypeScript interfaces for all component props
- Integrate with existing design system (CSS variables, theme support)
- Leverage Radix UI primitives for accessibility

### **Code Organization**:
- Place reusable UI components in `src/components/ui/`
- Keep page content components in `src/pages/`
- Use consistent naming conventions (PascalCase for components)
- Maintain single responsibility principle

### **Styling Approach**:
- Use Tailwind CSS with custom CSS variables
- Follow existing design token system
- Implement hover states and focus management
- Ensure responsive design considerations

## Architecture Strengths

1. **Simplicity**: Clean 27-line main orchestrator without complexity overhead
2. **Type Safety**: Full TypeScript coverage with proper interfaces
3. **Modern Tooling**: Turbopack, latest React/Next.js versions
4. **Accessibility**: Radix UI foundation ensures WCAG compliance
5. **Design System**: Systematic approach to theming and component variants
6. **Developer Experience**: MCP integration for component management

The current architecture provides an excellent foundation for scaling while maintaining clean code principles and modern React best practices.

Project → Sections → Tasks: Full Behavior Spec
1. Inbox View

Sections

Only sections with current_view = "inbox".

Can add new sections:

project_id = null

current_view = "inbox"

Can have or not have a parent section.

Tasks

Load all tasks where current_view includes "inbox".

When inserting into Inbox:

project_id = null

current_view = ["inbox"]

If due date = today, current_view = ["inbox", "today"].

2. Today View

Sections

One section per day, e.g., "21 September 2025".

Backend behavior:

Automatically create today’s section if not existing:

current_view = "today"

project_id = null

Tasks

Load all tasks with due_date = today (00:00–23:59).

Assign tasks to today’s section:

If task is Inbox: current_view = ["inbox", "today"]

If task belongs to a Project:

current_view = ["project", "today"]

project_id = <project_id>

3. Upcoming View

Sections

Always exactly two sections:

This Week

Name: "This Week ( <today> – <end of week> )"

current_view = "upcoming"

project_id = null

Next Week

Name: "Next Week ( <next Monday> – <next Sunday> )"

current_view = "upcoming"

project_id = null

System ensures these sections exist daily.

Tasks

Assign tasks by due date:

This Week Section → tasks with due_date between today and end of this week.

Next Week Section → tasks with due_date in the next week (following Monday → Sunday).

Tasks belonging to projects are included if their due dates fall in these ranges:

current_view = ["project", "upcoming"]

project_id = <project_id>

4. Task project_id and current_view Rules

Inbox Tasks

Inserted into Inbox → project_id = null, current_view = ["inbox"]

Due today → current_view = ["inbox", "today"]

Project Tasks

Inserted into Project → project_id = <project_id>

Due today → current_view = ["project", "today"]

Due this week/next week → current_view = ["project", "upcoming"]

No due date / outside today/upcoming → current_view = ["project"]

Automatic Daily Update

Every day, the system checks all tasks and updates current_view automatically according to their due date.

Ensures tasks always appear in the correct dynamic views (Inbox, Today, Upcoming, Project).

5. Key Summary
Target	Due Date	Project ID	current_view
Inbox	Any	null	["inbox"]
Inbox	Today	null	["inbox", "today"]
Project	Today	<project_id>	["project", "today"]
Project	This Week / Next Week	<project_id>	["project", "upcoming"]
Project	Other / None	<project_id>	["project"]

Views Overview

Inbox → free bucket for tasks without projects.

Today → daily section for tasks due today.

Upcoming → weekly sections for tasks due this week/next week.

Project → static section for tasks assigned to a project.
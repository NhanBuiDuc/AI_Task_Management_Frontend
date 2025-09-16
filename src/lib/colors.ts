/**
 * Shared color constants for the application
 * These correspond to CSS custom properties defined in globals.css
 */

export const colors = {
  // Custom colors
  sidebarBackground: '#FCFAF8',
  sidebarActive: '#FFEFE5',
  sidebarText: '#DC4C3E',
  // Custom sizing
  sidebarWidth: '32rem',
  // CSS custom property references (use these with Tailwind classes)
  cssVariables: {
    sidebarBackground: 'var(--sidebar-background)',
    sidebarActive: 'var(--sidebar-active)',
    sidebarText: 'var(--sidebar-text)',
    sidebarWidth: 'var(--sidebar-width)',
    background: 'var(--background)',
    foreground: 'var(--foreground)',
    primary: 'var(--primary)',
    secondary: 'var(--secondary)',
    accent: 'var(--accent)',
    muted: 'var(--muted)',
    destructive: 'var(--destructive)',
  }
} as const

export type ColorKey = keyof typeof colors
export type CSSVariableKey = keyof typeof colors.cssVariables
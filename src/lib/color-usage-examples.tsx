/**
 * Examples of how to use the shared color system
 * This file demonstrates different ways to access and use shared colors
 */

import React from 'react'
import { colors } from './colors'

// Example 1: Using Tailwind CSS class (recommended for most cases)
export function ExampleWithTailwind() {
  return (
    <button className="bg-sidebar-active text-white p-2 rounded">
      Using Tailwind class: bg-sidebar-active
    </button>
  )
}

// Example 2: Using inline styles with CSS variable
export function ExampleWithInlineStyle() {
  return (
    <button
      style={{
        backgroundColor: colors.cssVariables.sidebarActive,
        color: 'white',
        padding: '0.5rem',
        borderRadius: '0.25rem'
      }}
    >
      Using CSS variable: {colors.cssVariables.sidebarActive}
    </button>
  )
}

// Example 3: Using direct hex value (use sparingly)
export function ExampleWithDirectHex() {
  return (
    <button
      style={{
        backgroundColor: colors.sidebarActive,
        color: 'white',
        padding: '0.5rem',
        borderRadius: '0.25rem'
      }}
    >
      Using hex value: {colors.sidebarActive}
    </button>
  )
}

// Example 4: Dynamic usage based on condition
export function ExampleDynamic({ isActive }: { isActive: boolean }) {
  return (
    <button
      className={`p-2 rounded ${
        isActive ? "bg-sidebar-active text-white" : "bg-gray-200 hover:bg-gray-300"
      }`}
    >
      Dynamic usage
    </button>
  )
}
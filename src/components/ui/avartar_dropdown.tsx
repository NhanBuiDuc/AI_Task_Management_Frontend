"use client"
// src\components\ui\avartar_dropdown.tsx
import * as React from "react"
import { ChevronDown } from "lucide-react"
import {
  User,
  Settings,
  Plus,
  Activity,
  Printer,
  Sparkles,
  RotateCcw,
  LogOut,
  Bell
} from "lucide-react"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { IconTextButton } from "@/components/ui/icon_text_button"
import { IconDoubleTextButton } from "@/components/ui/icon_double_text_button"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

export function AvatarDropdown() {
  const [open, setOpen] = React.useState(false)

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <div className="flex items-center gap-2 px-2 py-1.5 hover:bg-gray-100 rounded cursor-pointer">
          <Avatar className="h-8 w-8">
            <AvatarImage src="https://github.com/shadcn.png" />
            <AvatarFallback>B</AvatarFallback>
          </Avatar>
          <span className="text-sm font-medium">Bùi</span>
          <ChevronDown className="h-4 w-4 text-gray-500" />
        </div>
      </PopoverTrigger>
      <PopoverContent className="w-72 p-0" align="start">
        <div className="flex flex-col">
          {/* User Profile Section */}
          <div className="p-2">
            <IconDoubleTextButton
              icon={<User className="h-5 w-5 text-gray-600" />}
              primaryText="Bùi Đức Nhân"
              endTextLabel = "O then P"
              secondaryText="0/5 tasks"
              variant="ghost"
              className="w-full justify-start h-auto py-2"
            />
          </div>

          <div className="border-t border-gray-200">
            <div className="p-1">
              {/* Settings */}
              <IconTextButton
                icon={<Settings className="h-4 w-4 text-gray-600" />}
                label="Settings"
                endTextLabel="Ctrl + S"
                variant="ghost"
                className="w-full justify-start h-9 px-3"
              />

              {/* Add a team */}
              <IconTextButton
                icon={<Plus className="h-4 w-4 text-gray-600" />}
                label="Add a team"
                variant="ghost"
                className="w-full justify-start h-9 px-3"
              />

              {/* Activity log */}
              <IconTextButton
                icon={<Activity className="h-4 w-4 text-gray-600" />}
                label="Activity log"
                endTextLabel="A then L"
                variant="ghost"
                className="w-full justify-start h-9 px-3"
              />

              {/* Print */}
              <IconTextButton
                icon={<Printer className="h-4 w-4 text-gray-600" />}
                label="Print"
                endTextLabel="Ctrl + P"
                variant="ghost"
                className="w-full justify-start h-9 px-3"
              />

              {/* What's new */}
              <IconTextButton
                icon={<Bell className="h-4 w-4 text-gray-600" />}
                label="What's new"
                variant="ghost"
                className="w-full justify-start h-9 px-3"
              />

              {/* Upgrade to Pro */}
              <IconTextButton
                icon={<Sparkles className="h-4 w-4 text-orange-500" />}
                label="Upgrade to Pro"
                variant="ghost"
                className="w-full justify-start h-9 px-3"
              />

              {/* Sync */}
              <IconTextButton
                icon={<RotateCcw className="h-4 w-4 text-gray-600" />}
                label="Sync"
                endTextLabel="15 minutes ago"
                variant="ghost"
                className="w-full justify-start h-9 px-3"
              />

              {/* Log out */}
              <IconTextButton
                icon={<LogOut className="h-4 w-4 text-gray-600" />}
                label="Log out"
                variant="ghost"
                className="w-full justify-start h-9 px-3"
              />
            </div>
          </div>

          {/* Footer */}
          <div className="border-t border-gray-200 px-3 py-2">
            <div className="flex items-center justify-between text-xs text-gray-500">
              <span>v8796</span>
              <span>•</span>
              <span>Changelog</span>
            </div>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  )
}
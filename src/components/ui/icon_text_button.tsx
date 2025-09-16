// src\components\ui\icon_text_button.tsx

import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { Button, buttonVariants } from "./button"
import { cn } from "@/lib/utils"
import { ButtonSize } from "@/types";

const iconTextButtonVariants = cva(
  "inline-flex items-center justify-between gap-3 text-left relative transition-all duration-200 ease-in-out",
  {
    variants: {
      size: {
        default: "h-10 px-3 py-2 text-sm",
        sm: "h-8 px-2 py-1.5 gap-2 text-xs",
        lg: "h-12 px-4 py-3 gap-4 text-base",
        xl: "h-16 px-6 py-4 gap-6 text-lg",
      },
    },
    defaultVariants: {
      size: "default",
    },
  }
)

interface IconTextButtonProps
  extends Omit<React.ComponentProps<typeof Button>, "children">,
    VariantProps<typeof iconTextButtonVariants> {
  icon?: React.ReactNode
  label: string
  endTextLabel?: string
  iconClassName?: string
  labelClassName?: string
  endTextLabelClassName?: string
}

function IconTextButton({
  className,
  variant,
  size,
  icon,
  label,
  endTextLabel,
  iconClassName,
  labelClassName,
  endTextLabelClassName,
  ...props
}: IconTextButtonProps) {
  return (
    <Button
      className={cn(
        iconTextButtonVariants({ size}),
        "hover:scale-[1.02] active:scale-[0.98] rounded-lg border-0 shadow-none",
        className
      )}
      variant={variant}
      size={size}
      {...props}
    >
      <div className="flex items-center gap-3 flex-1 min-w-0">
        {icon && (
          <div className={cn("shrink-0 flex items-center justify-center", iconClassName)}>
            {icon}
          </div>
        )}
        <span className={cn("font-medium truncate text-left", labelClassName)}>
          {label}
        </span>
      </div>
      {endTextLabel && (
        <span
          className={cn(
            "text-xs font-medium shrink-0 ml-auto opacity-70",
            endTextLabelClassName
          )}
        >
          {endTextLabel}
        </span>
      )}
    </Button>
  )
}

export { IconTextButton, iconTextButtonVariants, type IconTextButtonProps }
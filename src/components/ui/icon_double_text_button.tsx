// src\components\ui\icon_double_text_button.tsx

import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { Button, buttonVariants } from "./button"
import { cn } from "@/lib/utils"

const iconDoubleTextButtonVariants = cva(
  "inline-flex items-center justify-start gap-3 text-left h-auto py-2.5",
  {
    variants: {
      size: {
        default: "px-4 py-2.5",
        sm: "px-3 py-2 gap-2",
        lg: "px-6 py-3 gap-4",
      },
    },
    defaultVariants: {
      size: "default",
    },
  }
)

interface IconDoubleTextButtonProps
  extends Omit<React.ComponentProps<typeof Button>, "children">,
    VariantProps<typeof iconDoubleTextButtonVariants> {
  icon?: React.ReactNode
  primaryText: string
  secondaryText?: string
  iconClassName?: string
  endTextLabel?: string
  primaryTextClassName?: string
  secondaryTextClassName?: string
  endTextLabelClassName?: string 
}

function IconDoubleTextButton({
  className,
  variant,
  size,
  icon,
  primaryText,
  secondaryText,
  iconClassName,
  endTextLabel,
  primaryTextClassName,
  secondaryTextClassName,
  endTextLabelClassName,
  ...props
}: IconDoubleTextButtonProps) {
  return (
    <Button
      className={cn(iconDoubleTextButtonVariants({ size }), className)}
      variant={variant}
      size={size}
      {...props}
    >
      {icon && (
        <div className={cn("shrink-0 flex items-center", iconClassName)}>
          {icon}
        </div>
      )}
      <div className="flex flex-col items-start flex-1 min-w-0">
        <span className={cn("font-medium text-sm truncate", primaryTextClassName)}>
          {primaryText}
        </span>
        {secondaryText && (
          <span
            className={cn(
              "text-xs text-muted-foreground truncate max-w-full",
              secondaryTextClassName
            )}
          >
            {secondaryText}
          </span>
        )}
      </div>

      <span className={cn(endTextLabelClassName)}>
        {endTextLabel}
      </span>

    </Button>
  )
}

export { IconDoubleTextButton, iconDoubleTextButtonVariants, type IconDoubleTextButtonProps }
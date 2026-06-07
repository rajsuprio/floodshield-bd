"use client"

import * as React from "react"
import { Label as LabelPrimitive } from "radix-ui"

import { cn } from "@/lib/utils"

function Label({
  className,
  ...props
}: React.ComponentProps<typeof LabelPrimitive.Root>) {
  return (
    <LabelPrimitive.Root
      data-slot="label"
      className={cn(
        "block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5",
        className
      )}
      {...props}
    />
  )
}

export { Label }

import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border-2 px-5 text-sm font-bold transition-colors duration-200 disabled:pointer-events-none disabled:opacity-50 focus-visible:outline-[3px] focus-visible:outline-offset-4 focus-visible:outline-[#FF5100] shadow-none",
  {
    variants: {
      variant: {
        default: "border-[#FF5100] bg-[#FF5100] text-[var(--accent-button-text)]! hover:border-[var(--accent-button-hover)] hover:bg-[var(--accent-button-hover)] hover:text-[var(--accent-button-text)]!",
        outline: "border-[var(--border)] bg-transparent text-[var(--foreground)]! hover:border-[#FF5100]",
        ghost: "border-transparent bg-transparent text-[var(--foreground)]! hover:bg-[var(--surface)]",
      },
      size: {
        default: "h-11 px-5",
        sm: "h-9 px-3 text-xs",
        lg: "h-12 px-7",
        icon: "size-11 p-0",
      },
    },
    defaultVariants: { variant: "default", size: "default" },
  },
);

type ButtonProps = React.ComponentProps<"button"> & VariantProps<typeof buttonVariants> & { asChild?: boolean };

function Button({ className, variant, size, asChild = false, ...props }: ButtonProps) {
  const Component = asChild ? Slot : "button";
  return <Component data-slot="button" className={cn(buttonVariants({ variant, size }), className)} {...props} />;
}

export { Button, buttonVariants };

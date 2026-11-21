import Link from "next/link";
import { cn } from "@/lib/utils";

export function FooterLink({ className, ...props }: React.ComponentProps<typeof Link>) {
  return (
    <Link
      className={cn(
        "relative inline-flex w-fit items-center gap-1.5 border-0 bg-transparent text-sm font-semibold text-[var(--muted)] no-underline",
        "after:pointer-events-none after:absolute after:inset-x-0 after:-bottom-[3px] after:h-px after:bg-[var(--muted)] after:opacity-0 after:content-['']",
        "after:transition-opacity after:duration-150 hover:after:opacity-100 focus-visible:after:opacity-100",
        "focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#FF5100]",
        className
      )}
      {...props}
    />
  );
}

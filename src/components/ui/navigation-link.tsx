import Link from "next/link";
import { cn } from "@/lib/utils";

type NavigationLinkProps = React.ComponentProps<typeof Link> & { active?: boolean };

export function NavigationLink({ active = false, className, ...props }: NavigationLinkProps) {
  return (
    <Link
      aria-current={active ? "page" : undefined}
      className={cn(
        "relative inline-flex w-fit items-center border-0 bg-transparent py-3 text-sm font-bold text-[var(--muted)]! no-underline transition-colors hover:text-[var(--foreground)]! focus-visible:outline-[3px] focus-visible:outline-offset-4 focus-visible:outline-[#FF5100]",
        active && "text-[var(--foreground)]! after:absolute after:inset-x-0 after:bottom-1 after:h-0.5 after:rounded-full after:bg-[#FF5100]",
        className,
      )}
      {...props}
    />
  );
}

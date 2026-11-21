type BrandMarkProps = {
  size?: number;
  className?: string;
  color?: "accent" | "black" | "white" | "inherit";
};

const COLORS = {
  accent: "#FF5100",
  black: "#090909",
  white: "#FFFFFF",
  inherit: "currentColor",
} as const;

/** AAYNA monogram has no dot. The accent dot belongs only to the wordmark. */
export function BrandMark({ size = 32, className, color = "accent" }: BrandMarkProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      fill="none"
      aria-hidden="true"
      className={className}
      style={{ display: "block", flexShrink: 0 }}
    >
      <path
        d="M12 52V32C12 20.95 20.95 12 32 12S52 20.95 52 32V52"
        stroke={COLORS[color]}
        strokeWidth="7"
        strokeLinecap="round"
      />
      <path
        d="M21 52H43"
        stroke={COLORS[color]}
        strokeWidth="7"
        strokeLinecap="round"
      />
    </svg>
  );
}

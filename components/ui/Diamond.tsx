// A small rotated square, as used before notes, references and links in the design.
const tones = {
  gold: "bg-gold",
  green: "bg-green",
  check: "bg-check",
} as const;

export function Diamond({
  size = 8,
  tone = "gold",
  className = "",
}: {
  size?: number;
  tone?: keyof typeof tones;
  className?: string;
}) {
  return (
    <span
      aria-hidden="true"
      className={`inline-block flex-none rotate-45 ${tones[tone]} ${className}`}
      style={{ width: size, height: size }}
    />
  );
}

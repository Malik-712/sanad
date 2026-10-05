// Icons drawn as in the design: 24px grid, 2px stroke, square caps. Decorative (aria-hidden).
import type { ReactNode } from "react";

function Icon({ size, children }: { size: number; children: ReactNode }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="square"
      aria-hidden="true"
    >
      {children}
    </svg>
  );
}

export function SearchIcon({ size = 18 }: { size?: number }) {
  return (
    <Icon size={size}>
      <path d="M10.5 4a6.5 6.5 0 1 0 0 13 6.5 6.5 0 0 0 0-13zM20 20l-4.8-4.8" />
    </Icon>
  );
}

/** The «نتائج البحث» back chevron (points right, the start side in RTL). */
export function ChevronIcon({ size = 16 }: { size?: number }) {
  return (
    <Icon size={size}>
      <path d="M9 6l6 6-6 6" />
    </Icon>
  );
}

export function CloseIcon({ size = 16 }: { size?: number }) {
  return (
    <Icon size={size}>
      <path d="M6 6l12 12M18 6L6 18" />
    </Icon>
  );
}

/** The Paste link row on Home. */
export function PasteIcon({ size = 20 }: { size?: number }) {
  return (
    <Icon size={size}>
      <path d="M7 5h10v16H7z" />
      <path d="M10 3h4v4h-4z" />
      <path d="M10 12h4M10 16h4" />
    </Icon>
  );
}

/** The privacy line on /parse. */
export function LockIcon({ size = 14 }: { size?: number }) {
  return (
    <Icon size={size}>
      <path d="M6 11h12v9H6zM9 11V7a3 3 0 0 1 6 0v4" />
    </Icon>
  );
}

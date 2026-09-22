export function Logo({ className = "size-8" }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" className={className} aria-hidden="true">
      <rect width="32" height="32" fill="var(--color-primary)" />
      <rect
        x="2.4"
        y="2.4"
        width="27.2"
        height="27.2"
        fill="none"
        stroke="var(--color-primary-fg)"
        strokeWidth="1.05"
      />
      <path
        d="M9.2 18.2c.4-5.2 3.2-8.6 6.8-8.6 4.2 0 7 3.6 7 8.2 0 4.8-2.8 8.4-7.1 8.4-2.6 0-4.6-1.4-5.6-3.6"
        fill="none"
        stroke="var(--color-primary-fg)"
        strokeWidth="1.85"
        strokeLinecap="round"
      />
    </svg>
  );
}

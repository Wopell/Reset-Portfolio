interface ProjectImagePlaceholderProps {
  className?: string;
  label?: string; // e.g. "Proyecto 01 — Img A"
}

export function ProjectImagePlaceholder({ className, label }: ProjectImagePlaceholderProps) {
  return (
    <div
      className={`bg-[#2A2A2A] flex flex-col items-center justify-center gap-2 ${className}`}
      style={{ border: '1px solid rgba(255,255,255,0.06)' }}
    >
      {/* Camera icon */}
      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="1.5">
        <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/>
        <circle cx="12" cy="13" r="4"/>
      </svg>
      {/* Optional label */}
      {label && (
        <span style={{ color: 'rgba(255,255,255,0.15)', fontSize: '0.65rem', fontFamily: 'Inter', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
          {label}
        </span>
      )}
    </div>
  );
}

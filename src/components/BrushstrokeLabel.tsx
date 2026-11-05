import { ReactNode } from 'react';

interface BrushstrokeLabelProps {
  children: ReactNode;
  className?: string;
  rotation?: number; // e.g. -1.5
  bgColor?: string; // default to 'bg-white'
  textColor?: string; // default to 'text-[#0D0D0D]'
}

export function BrushstrokeLabel({
  children,
  className = '',
  rotation = -1.5,
  bgColor = 'bg-white',
  textColor = 'text-[#0D0D0D]'
}: BrushstrokeLabelProps) {
  return (
    <div className={`relative inline-block ${className}`}>
      {/* Organic hand-drawn background accent */}
      <div
        className={`absolute inset-x-[-12px] inset-y-[-4px] ${bgColor} pointer-events-none z-0`}
        style={{
          transform: `rotate(${rotation}deg)`,
          borderRadius: '12px 15px 14px 11px / 14px 12px 15px 13px',
          boxShadow: '2px 3px 10px rgba(0,0,0,0.1)',
          filter: 'blur(0.3px)'
        }}
      />
      {/* Text in front */}
      <span className={`relative z-10 font-caveat font-bold ${textColor}`}>
        {children}
      </span>
    </div>
  );
}

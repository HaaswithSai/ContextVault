import React from 'react';

interface LogoProps {
  size?: number;
  className?: string;
}

export const Logo: React.FC<LogoProps> = ({ size = 28, className = '' }) => {
  return (
    <div
      style={{ width: size, height: size }}
      className={`relative rounded-lg bg-gradient-to-br from-slate-900 to-slate-950 border border-indigo-500/40 p-1 flex items-center justify-center shadow-lg shadow-indigo-500/20 shrink-0 ${className}`}
    >
      <svg viewBox="0 0 128 128" fill="none" className="w-full h-full">
        <defs>
          <linearGradient id="headerNeonGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#6366f1" />
            <stop offset="50%" stop-color="#818cf8" />
            <stop offset="100%" stop-color="#38bdf8" />
          </linearGradient>
          <linearGradient id="headerRibbonGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stop-color="#38bdf8" />
            <stop offset="100%" stop-color="#6366f1" />
          </linearGradient>
        </defs>

        {/* Shackle Arch */}
        <path
          d="M44 48V36C44 25 53 16 64 16C75 16 84 25 84 36V48"
          stroke="url(#headerNeonGrad)"
          strokeWidth="8"
          strokeLinecap="round"
          fill="none"
        />

        {/* Vault Body */}
        <rect
          x="28"
          y="48"
          width="72"
          height="60"
          rx="14"
          fill="#090d16"
          stroke="url(#headerNeonGrad)"
          strokeWidth="6"
        />

        {/* Keyhole / Memory Core */}
        <circle
          cx="64"
          cy="74"
          r="10"
          stroke="url(#headerNeonGrad)"
          strokeWidth="5"
          fill="none"
        />
        <path
          d="M64 84V93"
          stroke="url(#headerNeonGrad)"
          strokeWidth="5"
          strokeLinecap="round"
        />

        {/* Ribbon Bookmark */}
        <path
          d="M86 42V98L94 92L102 98V42C102 38.6863 99.3137 36 96 36C92.6863 36 86 38.6863 86 42Z"
          fill="url(#headerRibbonGrad)"
        />
      </svg>
    </div>
  );
};

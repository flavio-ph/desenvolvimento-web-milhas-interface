import React from 'react';

interface LogoProps {
  className?: string;
}

export const Logo: React.FC<LogoProps> = ({ className }) => {
  return (
    <svg
      viewBox="0 0 256 160"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      preserveAspectRatio="xMidYMid meet"
    >
      <defs>
        {/* Gradientes Adaptados para Indigo (Design System Atual) */}
        <linearGradient id="cardGradient" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#6366f1" /> {/* Indigo-500 */}
          <stop offset="100%" stopColor="#4338ca" /> {/* Indigo-700 */}
        </linearGradient>

        <linearGradient id="sunGradient" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#c7d2fe" /> {/* Indigo-200 */}
          <stop offset="100%" stopColor="#818cf8" /> {/* Indigo-400 */}
        </linearGradient>

        <clipPath id="cardClip">
          <rect x="0" y="0" width="256" height="160" rx="24" ry="24" />
        </clipPath>
      </defs>

      <g clipPath="url(#cardClip)">
        {/* Fundo */}
        <rect width="256" height="160" fill="url(#cardGradient)" />

        {/* Sol */}
        <circle cx="128" cy="92" r="28" fill="url(#sunGradient)" />

        {/* Horizonte (Camadas) */}
        <path
          d="M0 88 C40 78, 88 86, 128 84 C168 82, 216 88, 256 84 L256 170 L0 170 Z"
          fill="#4f46e5" 
        /> {/* Indigo-600 */}

        <path
          d="M0 106 C48 96, 96 108, 128 106 C160 104, 208 110, 256 104 L256 170 L0 170 Z"
          fill="#3730a3"
        /> {/* Indigo-800 */}

        {/* Chip (Detalhes) */}
        <rect x="176" y="32" width="24" height="24" rx="6" ry="6" fill="#818cf8" opacity="0.85" />
        <rect x="208" y="32" width="24" height="24" rx="6" ry="6" fill="#818cf8" opacity="0.65" />
      </g>
    </svg>
  );
};
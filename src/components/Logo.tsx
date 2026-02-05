import React from 'react';
import { Plane } from 'lucide-react';

interface LogoProps {
  className?: string;
}

export const Logo: React.FC<LogoProps> = ({ className }) => {
  return (
    <div className={`flex items-center justify-center bg-indigo-600 rounded-2xl shadow-sm p-3 ${className}`}>
      <Plane className="text-white w-full h-full" strokeWidth={2} />
    </div>
  );
};
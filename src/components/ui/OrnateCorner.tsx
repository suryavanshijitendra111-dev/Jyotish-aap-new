import React from 'react';

interface OrnateCornerProps {
  position: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
  size?: number;
  color?: string;
}

export const OrnateCorner: React.FC<OrnateCornerProps> = ({ 
  position, 
  size = 40, 
  color = "#D4AF37" 
}) => {
  const rotation = {
    'top-left': 'rotate-0',
    'top-right': 'rotate-90',
    'bottom-right': 'rotate-180',
    'bottom-left': 'rotate-270'
  };

  const placement = {
    'top-left': 'top-0 left-0',
    'top-right': 'top-0 right-0',
    'bottom-right': 'bottom-0 right-0',
    'bottom-left': 'bottom-0 left-0'
  };

  return (
    <div 
      className={`absolute ${placement[position]} ${rotation[position]} pointer-events-none opacity-60 z-20`}
      style={{ width: size, height: size }}
    >
      <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path 
          d="M0 0C0 40 10 60 40 60C60 60 60 40 60 20M0 0V40M0 0H40M20 20C20 30 30 40 40 40" 
          stroke={color} 
          strokeWidth="2" 
          strokeLinecap="round"
        />
        <circle cx="10" cy="10" r="3" fill={color} />
        <circle cx="50" cy="10" r="2" fill={color} />
        <circle cx="10" cy="50" r="2" fill={color} />
      </svg>
    </div>
  );
};

export default OrnateCorner;

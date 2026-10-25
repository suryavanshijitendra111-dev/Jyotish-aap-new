import React from 'react';
import { cn } from '../../utils/cn';

export interface CarvedCardProps {
  children: React.ReactNode;
  className?: string;
  variant?: 'gold' | 'silver' | 'none';
  cornerSize?: number;
  id?: string;
  header?: React.ReactNode;
  glow?: boolean;
}

export const CarvedCard: React.FC<CarvedCardProps> = ({ children, className, id, header, glow }) => {
  return (
    <div id={id} className={cn(
      "relative rounded-2xl overflow-hidden",
      "bg-gradient-to-br from-[#1A1A1A] to-[#0A0A0A]",
      "border border-[#D4AF37]/30",
      glow ? "shadow-[0_0_35px_rgba(212,175,55,0.25)] border-[#D4AF37]/60" : "shadow-[0_10px_30px_rgba(0,0,0,0.5),inset_0_0_20px_rgba(212,175,55,0.05)]",
      className
    )}>
      {/* Texture Overlay */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none mix-blend-overlay bg-[url('https://www.transparenttextures.com/patterns/leather.png')]"></div>
      
      {/* Inner Glow/Border */}
      <div className="absolute inset-[1px] rounded-[15px] border border-white/5 pointer-events-none"></div>
      
      <div className="relative z-10">
        {header && <div className="border-b border-[#d4af37]/20 px-4 py-3">{header}</div>}
        {children}
      </div>
    </div>
  );
};

export default CarvedCard;

import React from 'react';

interface YantraMotifProps {
  cx?: number;
  cy?: number;
  radius?: number;
  opacity?: number;
  color?: string;
  className?: string;
}

/**
 * Sacred Vedic Yantra & Mandala SVG Motif (वैदिक श्रीयंत्र व मंडला रेखांकन)
 * Designed to sit at the sanctum/center (50, 50) of North Indian Kundli charts.
 * Features central Bindu, intersecting Shatkona triangles, and Ashtadala lotus circle.
 */
export const YantraMotif: React.FC<YantraMotifProps> = ({
  cx = 50,
  cy = 50,
  radius = 16,
  opacity = 0.22,
  color = '#d4af37',
  className = ''
}) => {
  const r1 = radius * 0.35;
  const r2 = radius * 0.65;
  const r3 = radius;

  // Shatkona (Intersecting equilateral triangles) points
  // Upward triangle
  const upTri = `
    ${cx},${cy - r2} 
    ${cx - r2 * 0.866},${cy + r2 * 0.5} 
    ${cx + r2 * 0.866},${cy + r2 * 0.5}
  `.trim();

  // Downward triangle
  const downTri = `
    ${cx},${cy + r2} 
    ${cx - r2 * 0.866},${cy - r2 * 0.5} 
    ${cx + r2 * 0.866},${cy - r2 * 0.5}
  `.trim();

  // 8 Petal Lotus radial rays
  const petals = [0, 45, 90, 135, 180, 225, 270, 315].map((angle, idx) => {
    const rad = (angle * Math.PI) / 180;
    const x1 = cx + (r2 * 0.9) * Math.cos(rad);
    const y1 = cy + (r2 * 0.9) * Math.sin(rad);
    const x2 = cx + r3 * Math.cos(rad);
    const y2 = cy + r3 * Math.sin(rad);
    return (
      <g key={`petal-${idx}`}>
        <line x1={x1} y1={y1} x2={x2} y2={y2} stroke={color} strokeWidth="0.4" />
        <circle cx={x2} cy={y2} r="0.6" fill={color} />
      </g>
    );
  });

  return (
    <g 
      className={`pointer-events-none select-none transition-opacity duration-300 ${className}`} 
      opacity={opacity}
      aria-hidden="true"
    >
      {/* Outer Sacred Ring (महावृत्त) */}
      <circle
        cx={cx}
        cy={cy}
        r={r3}
        fill="none"
        stroke={color}
        strokeWidth="0.5"
        strokeDasharray="1.2 1.2"
      />

      {/* Middle Lotus Ring */}
      <circle
        cx={cx}
        cy={cy}
        r={r2}
        fill="none"
        stroke={color}
        strokeWidth="0.4"
      />

      {/* 8-Directional Sacred Rays & Petals */}
      {petals}

      {/* Shatkona (Purusha & Prakriti Intersecting Triangles) */}
      <polygon
        points={upTri}
        fill="none"
        stroke={color}
        strokeWidth="0.5"
      />
      <polygon
        points={downTri}
        fill="none"
        stroke={color}
        strokeWidth="0.5"
      />

      {/* Inner Sanctum Circle */}
      <circle
        cx={cx}
        cy={cy}
        r={r1}
        fill="none"
        stroke={color}
        strokeWidth="0.4"
      />

      {/* Central Bindu (परब्रह्म बिन्दु) */}
      <circle
        cx={cx}
        cy={cy}
        r="1"
        fill="#fae19c"
      />
    </g>
  );
};

export default YantraMotif;

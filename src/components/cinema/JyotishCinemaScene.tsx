import React, { useRef, useEffect, useState, useCallback } from 'react';
import { Volume2, VolumeX, RotateCcw, Sparkles } from 'lucide-react';
import { NavagrahaCinemaProfile } from '../../services/cinema/jyotishCinemaEngine';
import { cinemaAudio } from '../../services/cinema/cinemaAudioService';

interface JyotishCinemaSceneProps {
  profile: NavagrahaCinemaProfile;
  isSpeaking: boolean;
  language?: string;
  className?: string;
}

interface Particle {
  x: number;
  y: number;
  z: number;
  size: number;
  speed: number;
  opacity: number;
  angle: number;
}

export const JyotishCinemaScene: React.FC<JyotishCinemaSceneProps> = ({
  profile,
  isSpeaking,
  language = 'hi',
  className = ''
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  // Rotation angles for 3D sphere
  const rotationRef = useRef<{ x: number; y: number }>({ x: 0.15, y: 0 });
  const isDraggingRef = useRef<boolean>(false);
  const lastMousePosRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const animFrameIdRef = useRef<number | null>(null);

  const [isMuted, setIsMuted] = useState<boolean>(() => cinemaAudio.getMuted());
  const isHindi = language === 'hi' || (language as string) === 'Hindi' || language === 'sa';

  // Toggle ambient tone
  const handleToggleSound = useCallback(() => {
    const muted = cinemaAudio.toggleMute();
    setIsMuted(muted);
    if (!muted) {
      cinemaAudio.playPlanetAmbient(profile.key, profile.ambientToneHz);
    }
  }, [profile]);

  // Reset rotation
  const handleResetRotation = () => {
    rotationRef.current = { x: 0.15, y: 0 };
  };

  // Start ambient audio on mount or profile change
  useEffect(() => {
    if (!isMuted) {
      cinemaAudio.playPlanetAmbient(profile.key, profile.ambientToneHz);
    }
    return () => {
      cinemaAudio.stopAmbient();
    };
  }, [profile.key, profile.ambientToneHz, isMuted]);

  // Main 3D Canvas Rendering Loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let width = 300;
    let height = 300;

    const handleResize = () => {
      if (!containerRef.current || !canvas) return;
      const rect = containerRef.current.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = rect.width;
      height = rect.height;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      ctx.scale(dpr, dpr);
    };

    handleResize();
    const resizeObserver = new ResizeObserver(handleResize);
    if (containerRef.current) resizeObserver.observe(containerRef.current);

    // Initialize cosmic background stars
    const stars: Particle[] = Array.from({ length: 65 }, () => ({
      x: (Math.random() - 0.5) * 600,
      y: (Math.random() - 0.5) * 600,
      z: Math.random() * 400 + 50,
      size: Math.random() * 1.6 + 0.6,
      speed: Math.random() * 0.2 + 0.1,
      opacity: Math.random() * 0.7 + 0.3,
      angle: Math.random() * Math.PI * 2
    }));

    // Initialize orbital particles
    const orbitParticles: Particle[] = Array.from({ length: 40 }, () => ({
      x: 0,
      y: 0,
      z: Math.random() * 100,
      size: Math.random() * 2.2 + 0.8,
      speed: (Math.random() * 0.015 + 0.005) * (Math.random() > 0.5 ? 1 : -1),
      opacity: Math.random() * 0.6 + 0.4,
      angle: Math.random() * Math.PI * 2
    }));

    let time = 0;

    const render = () => {
      time += 0.016;
      ctx.clearRect(0, 0, width, height);

      const cx = width / 2;
      const cy = height / 2;
      const baseRadius = Math.min(width, height) * 0.24;

      // Pulse slightly if speaking
      const pulseScale = isSpeaking ? 1 + Math.sin(time * 3) * 0.025 : 1;
      const planetRadius = baseRadius * pulseScale;

      // 1. Deep Cosmic Background Gradient
      const bgGrad = ctx.createRadialGradient(cx, cy, 10, cx, cy, Math.max(width, height) * 0.7);
      bgGrad.addColorStop(0, '#04100b');
      bgGrad.addColorStop(0.5, '#020906');
      bgGrad.addColorStop(1, '#000302');
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, width, height);

      // 2. Cosmic Background Stars
      ctx.save();
      for (const s of stars) {
        const starX = cx + s.x;
        const starY = cy + s.y;
        const twinkle = Math.sin(time * 2 + s.angle) * 0.3 + 0.7;
        ctx.fillStyle = `rgba(255, 255, 255, ${s.opacity * twinkle})`;
        ctx.beginPath();
        ctx.arc(starX, starY, s.size, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();

      // Autonomous gentle rotation when not dragging
      if (!isDraggingRef.current) {
        rotationRef.current.y += 0.006;
      }

      const rotX = rotationRef.current.x;
      const rotY = rotationRef.current.y;

      // 3. Deep Atmospheric Ambient Back-Glow
      const haloGrad = ctx.createRadialGradient(
        cx,
        cy,
        planetRadius * 0.8,
        cx,
        cy,
        planetRadius * 2.3
      );
      haloGrad.addColorStop(0, profile.colors.glow);
      haloGrad.addColorStop(0.5, profile.colors.halo);
      haloGrad.addColorStop(1, 'transparent');
      ctx.fillStyle = haloGrad;
      ctx.beginPath();
      ctx.arc(cx, cy, planetRadius * 2.3, 0, Math.PI * 2);
      ctx.fill();

      // 4. PLANET-SPECIFIC BACK-LAYER VISUALS
      // 4A. Sun Solar Flares & Corona (Back)
      if (profile.key === 'Sun') {
        ctx.save();
        ctx.translate(cx, cy);
        const rays = 16;
        for (let i = 0; i < rays; i++) {
          const angle = (i / rays) * Math.PI * 2 + time * 0.3;
          const rayLen = planetRadius * (1.3 + Math.sin(time * 2 + i) * 0.22);
          const x1 = Math.cos(angle) * planetRadius;
          const y1 = Math.sin(angle) * planetRadius;
          const x2 = Math.cos(angle) * rayLen;
          const y2 = Math.sin(angle) * rayLen;

          const rayGrad = ctx.createLinearGradient(x1, y1, x2, y2);
          rayGrad.addColorStop(0, 'rgba(255, 200, 0, 0.75)');
          rayGrad.addColorStop(0.6, 'rgba(255, 100, 0, 0.35)');
          rayGrad.addColorStop(1, 'transparent');

          ctx.strokeStyle = rayGrad;
          ctx.lineWidth = 4 + Math.sin(i * 2 + time) * 2;
          ctx.beginPath();
          ctx.moveTo(x1, y1);
          ctx.lineTo(x2, y2);
          ctx.stroke();
        }
        ctx.restore();
      }

      // 4B. Saturn Concentric Planetary Rings (Back Half: -PI to 0)
      if (profile.key === 'Saturn') {
        ctx.save();
        ctx.translate(cx, cy);
        ctx.rotate(-0.35); // Axial tilt

        const ringInner = planetRadius * 1.45;
        const ringOuter = planetRadius * 2.25;

        // Clip to top half (behind sphere)
        ctx.save();
        ctx.beginPath();
        ctx.rect(-ringOuter * 1.5, -ringOuter * 1.5, ringOuter * 3, ringOuter * 1.5);
        ctx.clip();

        // Draw concentric rings
        const ringGrad = ctx.createRadialGradient(0, 0, ringInner, 0, 0, ringOuter);
        ringGrad.addColorStop(0, 'rgba(147, 197, 253, 0.25)');
        ringGrad.addColorStop(0.35, 'rgba(96, 165, 250, 0.65)');
        ringGrad.addColorStop(0.6, 'rgba(30, 58, 138, 0.3)'); // Cassini division gap
        ringGrad.addColorStop(0.85, 'rgba(191, 219, 254, 0.55)');
        ringGrad.addColorStop(1, 'transparent');

        ctx.fillStyle = ringGrad;
        ctx.beginPath();
        ctx.ellipse(0, 0, ringOuter, ringOuter * 0.32, 0, 0, Math.PI * 2);
        ctx.ellipse(0, 0, ringInner, ringInner * 0.32, 0, Math.PI * 2, 0, true);
        ctx.fill();
        ctx.restore();
        ctx.restore();
      }

      // 4C. Ketu Ethereal Comet Spiritual Tail (Back)
      if (profile.key === 'Ketu') {
        ctx.save();
        ctx.translate(cx, cy);
        for (let i = 0; i < 5; i++) {
          const tailAngle = -0.7 + i * 0.08;
          const tailGrad = ctx.createRadialGradient(0, 0, planetRadius * 0.8, -planetRadius * 2.2, -planetRadius * 2.2, planetRadius * 3);
          tailGrad.addColorStop(0, 'rgba(168, 85, 247, 0.55)');
          tailGrad.addColorStop(0.5, 'rgba(88, 28, 135, 0.3)');
          tailGrad.addColorStop(1, 'transparent');
          ctx.fillStyle = tailGrad;
          ctx.beginPath();
          ctx.ellipse(-planetRadius * 1.1, -planetRadius * 1.1, planetRadius * 1.8, planetRadius * 0.7, tailAngle + Math.sin(time + i) * 0.05, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.restore();
      }

      // 5. 3D SPHERE RENDERING WITH LIGHTING & LATITUDINAL SURFACE SHADING
      // Light source comes from top-left (x: -0.4, y: -0.4, z: 0.8)
      ctx.save();
      ctx.beginPath();
      ctx.arc(cx, cy, planetRadius, 0, Math.PI * 2);
      ctx.clip();

      // Base Planet Sphere Gradient
      const sphereGrad = ctx.createRadialGradient(
        cx - planetRadius * 0.32,
        cy - planetRadius * 0.32,
        planetRadius * 0.05,
        cx,
        cy,
        planetRadius
      );

      if (profile.key === 'Sun') {
        sphereGrad.addColorStop(0, '#fff4b8');
        sphereGrad.addColorStop(0.2, '#ffcc00');
        sphereGrad.addColorStop(0.65, '#ff6600');
        sphereGrad.addColorStop(1, '#992200');
      } else if (profile.key === 'Moon') {
        sphereGrad.addColorStop(0, '#ffffff');
        sphereGrad.addColorStop(0.3, '#e2e8f0');
        sphereGrad.addColorStop(0.7, '#94a3b8');
        sphereGrad.addColorStop(1, '#334155');
      } else if (profile.key === 'Mars') {
        sphereGrad.addColorStop(0, '#fca5a5');
        sphereGrad.addColorStop(0.3, '#ef4444');
        sphereGrad.addColorStop(0.7, '#b91c1c');
        sphereGrad.addColorStop(1, '#450a0a');
      } else if (profile.key === 'Mercury') {
        sphereGrad.addColorStop(0, '#a7f3d0');
        sphereGrad.addColorStop(0.3, '#10b981');
        sphereGrad.addColorStop(0.7, '#047857');
        sphereGrad.addColorStop(1, '#022c22');
      } else if (profile.key === 'Jupiter') {
        sphereGrad.addColorStop(0, '#fef08a');
        sphereGrad.addColorStop(0.25, '#f59e0b');
        sphereGrad.addColorStop(0.65, '#b45309');
        sphereGrad.addColorStop(1, '#451a03');
      } else if (profile.key === 'Venus') {
        sphereGrad.addColorStop(0, '#ffffff');
        sphereGrad.addColorStop(0.3, '#fbcfe8');
        sphereGrad.addColorStop(0.7, '#f472b6');
        sphereGrad.addColorStop(1, '#831843');
      } else if (profile.key === 'Saturn') {
        sphereGrad.addColorStop(0, '#bfdbfe');
        sphereGrad.addColorStop(0.3, '#60a5fa');
        sphereGrad.addColorStop(0.7, '#1e40af');
        sphereGrad.addColorStop(1, '#0f172a');
      } else if (profile.key === 'Rahu') {
        sphereGrad.addColorStop(0, '#c7d2fe');
        sphereGrad.addColorStop(0.25, '#6366f1');
        sphereGrad.addColorStop(0.65, '#312e81');
        sphereGrad.addColorStop(1, '#020617');
      } else {
        // Ketu
        sphereGrad.addColorStop(0, '#e9d5ff');
        sphereGrad.addColorStop(0.25, '#a855f7');
        sphereGrad.addColorStop(0.65, '#581c87');
        sphereGrad.addColorStop(1, '#1e1b4b');
      }

      ctx.fillStyle = sphereGrad;
      ctx.fillRect(cx - planetRadius, cy - planetRadius, planetRadius * 2, planetRadius * 2);

      // Latitudinal Cloud / Texture bands for 3D depth
      const bands = 7;
      for (let b = 0; b < bands; b++) {
        const latNorm = (b / (bands - 1) - 0.5) * 1.6;
        const latY = cy + Math.sin(latNorm + rotX) * planetRadius * 0.75;
        const bandH = (planetRadius * 0.16) * Math.cos(latNorm);

        ctx.fillStyle = `rgba(0, 0, 0, ${0.12 + Math.sin(b * 1.8 + rotY) * 0.08})`;
        ctx.fillRect(cx - planetRadius, latY - bandH / 2, planetRadius * 2, bandH);

        // Subtle lighter highlight bands
        ctx.fillStyle = `rgba(255, 255, 255, ${0.08 + Math.cos(b * 2.2 + rotY) * 0.05})`;
        ctx.fillRect(cx - planetRadius, latY + bandH * 0.4, planetRadius * 2, bandH * 0.35);
      }

      // 3D Shadow Overlay (Day/Night terminator for authentic 3D sphere)
      const shadowGrad = ctx.createRadialGradient(
        cx + planetRadius * 0.5,
        cy + planetRadius * 0.5,
        planetRadius * 0.2,
        cx,
        cy,
        planetRadius * 1.05
      );
      shadowGrad.addColorStop(0, 'rgba(0, 0, 0, 0.75)');
      shadowGrad.addColorStop(0.5, 'rgba(0, 0, 0, 0.35)');
      shadowGrad.addColorStop(1, 'transparent');
      ctx.fillStyle = shadowGrad;
      ctx.fillRect(cx - planetRadius, cy - planetRadius, planetRadius * 2, planetRadius * 2);

      // Specular Light Spot (Top Left)
      const specGrad = ctx.createRadialGradient(
        cx - planetRadius * 0.35,
        cy - planetRadius * 0.35,
        2,
        cx - planetRadius * 0.35,
        cy - planetRadius * 0.35,
        planetRadius * 0.55
      );
      specGrad.addColorStop(0, 'rgba(255, 255, 255, 0.65)');
      specGrad.addColorStop(0.4, 'rgba(255, 255, 255, 0.15)');
      specGrad.addColorStop(1, 'transparent');
      ctx.fillStyle = specGrad;
      ctx.fillRect(cx - planetRadius, cy - planetRadius, planetRadius * 2, planetRadius * 2);

      ctx.restore();

      // 6. PLANET-SPECIFIC FRONT-LAYER VISUALS
      // 6A. Saturn Concentric Rings (Front Half: 0 to PI)
      if (profile.key === 'Saturn') {
        ctx.save();
        ctx.translate(cx, cy);
        ctx.rotate(-0.35);

        const ringInner = planetRadius * 1.45;
        const ringOuter = planetRadius * 2.25;

        // Clip to bottom half (in front of sphere)
        ctx.save();
        ctx.beginPath();
        ctx.rect(-ringOuter * 1.5, 0, ringOuter * 3, ringOuter * 1.5);
        ctx.clip();

        const ringGrad = ctx.createRadialGradient(0, 0, ringInner, 0, 0, ringOuter);
        ringGrad.addColorStop(0, 'rgba(147, 197, 253, 0.35)');
        ringGrad.addColorStop(0.35, 'rgba(96, 165, 250, 0.85)');
        ringGrad.addColorStop(0.6, 'rgba(30, 58, 138, 0.4)');
        ringGrad.addColorStop(0.85, 'rgba(191, 219, 254, 0.7)');
        ringGrad.addColorStop(1, 'transparent');

        ctx.fillStyle = ringGrad;
        ctx.beginPath();
        ctx.ellipse(0, 0, ringOuter, ringOuter * 0.32, 0, 0, Math.PI * 2);
        ctx.ellipse(0, 0, ringInner, ringInner * 0.32, 0, Math.PI * 2, 0, true);
        ctx.fill();
        ctx.restore();
        ctx.restore();
      }

      // 6B. Rahu Eclipse Swirling Shadow Vortex (Front)
      if (profile.key === 'Rahu') {
        ctx.save();
        ctx.translate(cx, cy);
        for (let i = 0; i < 4; i++) {
          const swirlAngle = time * 0.8 + i * (Math.PI / 2);
          ctx.strokeStyle = `rgba(129, 140, 248, ${0.4 - i * 0.08})`;
          ctx.lineWidth = 2.5;
          ctx.beginPath();
          ctx.arc(0, 0, planetRadius * (1.1 + i * 0.2), swirlAngle, swirlAngle + 1.2);
          ctx.stroke();
        }
        ctx.restore();
      }

      // 6C. Mercury Intellectual Geometry Circuit Ring (Front)
      if (profile.key === 'Mercury') {
        ctx.save();
        ctx.translate(cx, cy);
        ctx.rotate(time * 0.4);
        ctx.strokeStyle = 'rgba(16, 185, 129, 0.55)';
        ctx.lineWidth = 1.2;
        ctx.setLineDash([4, 6]);
        ctx.beginPath();
        ctx.arc(0, 0, planetRadius * 1.35, 0, Math.PI * 2);
        ctx.stroke();
        ctx.setLineDash([]);
        ctx.restore();
      }

      // 7. Swirling Orbital Atmospheric Particles
      ctx.save();
      for (const p of orbitParticles) {
        p.angle += p.speed;
        const orbitRadius = planetRadius * (1.25 + Math.sin(p.z) * 0.45);
        const px = cx + Math.cos(p.angle) * orbitRadius;
        const py = cy + Math.sin(p.angle) * orbitRadius * 0.55; // Elliptical perspective
        const pulse = Math.sin(time * 3 + p.angle) * 0.3 + 0.7;

        ctx.fillStyle = profile.colors.particle;
        ctx.globalAlpha = p.opacity * pulse;
        ctx.beginPath();
        ctx.arc(px, py, p.size, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();

      // 8. Planet Name & Symbol Watermark in 3D Scene
      ctx.save();
      ctx.fillStyle = 'rgba(212, 175, 55, 0.3)';
      ctx.font = 'bold 36px serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(profile.symbol, cx, cy - planetRadius * 0.05);
      ctx.restore();

      animFrameIdRef.current = requestAnimationFrame(render);
    };

    render();

    return () => {
      if (animFrameIdRef.current) cancelAnimationFrame(animFrameIdRef.current);
      resizeObserver.disconnect();
    };
  }, [profile, isSpeaking]);

  // Touch and Mouse Drag handlers for 3D interaction
  const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    isDraggingRef.current = true;
    lastMousePosRef.current = { x: e.clientX, y: e.clientY };
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!isDraggingRef.current) return;
    const dx = e.clientX - lastMousePosRef.current.x;
    const dy = e.clientY - lastMousePosRef.current.y;
    rotationRef.current.y += dx * 0.015;
    rotationRef.current.x = Math.max(-0.8, Math.min(0.8, rotationRef.current.x + dy * 0.015));
    lastMousePosRef.current = { x: e.clientX, y: e.clientY };
  };

  const handlePointerUp = () => {
    isDraggingRef.current = false;
  };

  return (
    <div
      ref={containerRef}
      id="jyotish-cinema-scene-container"
      className={`relative w-full aspect-square max-w-[340px] sm:max-w-[380px] mx-auto rounded-2xl overflow-hidden border border-[#d4af37]/40 shadow-[0_8px_32px_rgba(0,0,0,0.9),0_0_24px_rgba(212,175,55,0.25)] select-none bg-black ${className}`}
    >
      <canvas
        ref={canvasRef}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        className="w-full h-full cursor-grab active:cursor-grabbing block touch-none"
        title={isHindi ? 'घुमाने के लिए स्पर्श करें (3D Drag to Rotate)' : 'Touch and drag to rotate in 3D'}
      />

      {/* Top Left: 3D Celestial Tag & Ambient Lighting Description */}
      <div className="absolute top-2.5 left-2.5 z-20 pointer-events-none flex flex-col items-start gap-1">
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-black/75 border border-[#d4af37]/40 backdrop-blur-md shadow-md text-[10px] text-[#fae19c] font-medium">
          <span className="text-xs">{profile.symbol}</span>
          <span>{isHindi ? profile.themeTitleHi : profile.themeTitleEn}</span>
        </div>
      </div>

      {/* Top Right: Scene Controls (Ambient Sound & Reset Rotation) */}
      <div className="absolute top-2.5 right-2.5 z-20 flex items-center gap-1.5">
        <button
          onClick={handleToggleSound}
          id="cinema-audio-toggle-btn"
          className={`p-1.5 rounded-lg border backdrop-blur-md transition-all text-xs flex items-center justify-center cursor-pointer min-h-[32px] min-w-[32px] ${
            isMuted
              ? 'bg-black/60 text-gray-400 border-gray-700/60 hover:text-white'
              : 'bg-[#0f3f2c]/90 text-emerald-300 border-emerald-500/50 shadow-[0_0_10px_rgba(16,185,129,0.4)]'
          }`}
          title={isMuted ? (isHindi ? 'नाद चालू करें' : 'Unmute Ambient Tone') : (isHindi ? 'नाद बंद करें' : 'Mute Ambient Tone')}
          aria-label="Toggle ambient cosmic tone"
        >
          {isMuted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5 animate-pulse" />}
        </button>

        <button
          onClick={handleResetRotation}
          id="cinema-reset-rotation-btn"
          className="p-1.5 rounded-lg border border-gray-700/60 bg-black/60 text-gray-300 hover:text-[#d4af37] hover:border-[#d4af37]/60 backdrop-blur-md transition-all text-xs flex items-center justify-center cursor-pointer min-h-[32px] min-w-[32px]"
          title={isHindi ? 'घूर्णन रीसेट करें' : 'Reset 3D Rotation'}
          aria-label="Reset 3D Rotation"
        >
          <RotateCcw className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Bottom Center: Cinematic Representation Disclaimer (Strictly Compliant with Prompt) */}
      <div className="absolute bottom-2 inset-x-2 z-20 pointer-events-none text-center">
        <span className="inline-block px-2 py-0.5 rounded bg-black/70 border border-gray-800/80 text-[8.5px] sm:text-[9px] text-gray-400/90 backdrop-blur-sm">
          {isHindi 
            ? '✨ दृश्य प्रभाव प्रतीकात्मक सिनेमैटिक निरूपण हैं, वैज्ञानिक भौतिक गुण नहीं' 
            : '✨ Visuals are cinematic educational representations, not scientific properties'}
        </span>
      </div>
    </div>
  );
};

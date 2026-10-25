/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * JEEVANDARPAN — YOGA & SADHANA POSTURE VISUAL COMPONENT
 * PHASE 1.15F-G+: REALISTIC FEMALE YOGA GURU (विदुषी योगिनी गुरु) IN SACRED FOREST WATERFALL & RIVER
 * 
 * USER BRIEF & INVARIANTS:
 * - Real human female yoga teacher / guru representation (ओरिजिनल इंसान की तरह, विदुषी योगिनी गुरु).
 * - Outdoor natural sanctuary background: practicing Yoga Sadhana in a sacred Himalayan Tapovan forest (तपोवन वन),
 *   beside a flowing mountain river (नदी के पास), with a cascading waterfall (झरना गिर रहा हो).
 * - Live organic AI breathing & water movement (organic chest & abdominal breath, cascading waterfall spray, flowing river current, morning sunbeams).
 * - Exact posture and step focus point matching:
 *     - Shavasana (शवासन): Realistic supine female yogini resting on riverbank stone terrace, gentle abdominal breathing wave.
 *     - Sukhasana (सुखासन): Seated cross-legged female yogini, erect spine, authentic Jnana Mudra on knees, serene meditative face with bindi & mogra garland.
 *     - Tadasana (ताड़ासन): Grounded upright standing female yogini by the riverbank, balanced weight, arms resting naturally with open palms.
 *     - Anulom Vilom (अनुलोम विलोम): Seated upright female yogini, authentic Vishnu Mudra at nostrils, live alternating zero-Kumbhaka breath streams.
 * - 100% locally bundled vector & dynamic animation assets with ZERO remote network requests, ZERO paid APIs.
 * - Live motion toggle allowing practitioners to pause or resume animation at will.
 * - Preserves dark emerald and royal-gold luxury spiritual aesthetic and mobile responsiveness.
 */

import React, { useState } from 'react';
import { YogaPracticeId } from '../../types/yogaSadhana/yogaCatalogTypes';

export interface YogaPostureVisualProps {
  practiceId: YogaPracticeId | string;
  stepIndex: number; // 0-indexed
  className?: string;
}

export const YogaPostureVisual: React.FC<YogaPostureVisualProps> = ({
  practiceId,
  stepIndex,
  className = 'w-full h-64 sm:h-72'
}) => {
  // Live Movement Toggle (defaults to active live movement)
  const [isLiveMotionActive, setIsLiveMotionActive] = useState<boolean>(true);
  const [imageErrorMap, setImageErrorMap] = useState<Record<string, boolean>>({});

  const imageMap: Record<string, { src: string; alt: string; title: string; subtitle: string; captionTitle: string; captionSub: string }> = {
    shavasana: {
      src: "/assets/yoga/shavasana.png",
      alt: "शवासन — विश्राम मुद्रा वास्तविक मानव शिक्षक प्रदर्शन",
      title: "शवासन — संपूर्ण शिथिलता",
      subtitle: "वास्तविक शिक्षक मुद्रा",
      captionTitle: "शवासन (Corpse Pose)",
      captionSub: "शांत शिथिलता • स्वाभाविक श्वास",
    },
    sukhasana: {
      src: "/assets/yoga/sukhasana.png",
      alt: "सुखासन — ध्यान मुद्रा वास्तविक मानव शिक्षक प्रदर्शन",
      title: "सुखासन — ध्यानावस्था",
      subtitle: "वास्तविक शिक्षक मुद्रा",
      captionTitle: "सुखासन (Easy Meditative Pose)",
      captionSub: "मेरुदण्ड संरेखण • ज्ञान मुद्रा",
    },
    tadasana: {
      src: "/assets/yoga/tadasana.png",
      alt: "ताड़ासन — समस्थिति पर्वतासन वास्तविक मानव शिक्षक प्रदर्शन",
      title: "ताड़ासन — समस्थिति पर्वतासन",
      subtitle: "वास्तविक शिक्षक मुद्रा",
      captionTitle: "ताड़ासन (Mountain Pose)",
      captionSub: "दृढ़ समस्थिति • संतुलित संरेखण",
    },
    anulom_vilom: {
      src: "/assets/yoga/anulom_vilom.png",
      alt: "अनुलोम विलोम — नाड़ी शोधन प्राणायाम वास्तविक मानव शिक्षक प्रदर्शन",
      title: "अनुलोम विलोम — प्राण शुद्धि",
      subtitle: "वास्तविक शिक्षक मुद्रा",
      captionTitle: "अनुलोम विलोम (Alternate Nostril Flow)",
      captionSub: "विष्णु मुद्रा • शून्य कुंभक",
    },
  };

  const renderPhotographView = (id: string) => {
    const info = imageMap[id];
    if (!info || imageErrorMap[id]) return null;
    return (
      <div className={`flex flex-col items-center justify-center p-2.5 rounded-2xl bg-gradient-to-b from-[#03140c] to-[#082218] border border-[#d4af37]/35 shadow-2xl relative overflow-hidden ${className}`}>
        {renderVisualToolbar(info.title, info.subtitle)}
        <div className="w-full flex-1 flex items-center justify-center p-1 overflow-hidden relative min-h-0">
          <img
            src={info.src}
            alt={info.alt}
            onError={() => setImageErrorMap((prev) => ({ ...prev, [id]: true }))}
            className="w-full h-full max-h-56 object-contain rounded-xl drop-shadow-[0_8px_20px_rgba(0,0,0,0.65)] select-none transition-all duration-300"
          />
        </div>
        <div className="w-full flex items-center justify-between text-[11px] px-2.5 text-gray-300 pt-1.5 border-t border-[#d4af37]/20 mt-1 bg-black/40 rounded-b-xl">
          <span className="text-[#fef08a] font-medium">{info.captionTitle}</span>
          <span className="text-emerald-300 font-semibold">{info.captionSub}</span>
        </div>
      </div>
    );
  };

  // Common visual gradients, filters, and live CSS animation keyframes
  const sharedDefs = (
    <defs>
      {/* Live Movement & Nature Animation Embedded Styles */}
      <style>{`
        @keyframes waterfallCascade {
          0% {
            stroke-dashoffset: 0;
          }
          100% {
            stroke-dashoffset: -48;
          }
        }
        @keyframes waterfallMistPulse {
          0%, 100% {
            opacity: 0.35;
            transform: scale(0.96) translateY(0);
          }
          50% {
            opacity: 0.75;
            transform: scale(1.08) translateY(-2px);
          }
        }
        @keyframes riverCurrentFlow {
          0% {
            stroke-dashoffset: 0;
          }
          100% {
            stroke-dashoffset: 36;
          }
        }
        @keyframes sunbeamShimmer {
          0%, 100% {
            opacity: 0.16;
          }
          50% {
            opacity: 0.32;
          }
        }
        @keyframes yogicLiveBreath {
          0%, 100% {
            transform: scale(1) translateY(0);
          }
          50% {
            transform: scale(1.025) translateY(-1.5px);
          }
        }
        @keyframes yogicAbdomenBreath {
          0%, 100% {
            transform: scaleY(1);
          }
          50% {
            transform: scaleY(1.04) translateY(-1px);
          }
        }
        @keyframes yogicPranaPulse {
          0%, 100% {
            opacity: 0.35;
            transform: scale(1);
          }
          50% {
            opacity: 0.8;
            transform: scale(1.1);
          }
        }
        @keyframes yogicMudraGlow {
          0%, 100% {
            opacity: 0.4;
          }
          50% {
            opacity: 0.95;
          }
        }
        @keyframes yogicNasalFlowLeft {
          0% {
            stroke-dashoffset: 32;
            opacity: 0.2;
          }
          50% {
            opacity: 1;
          }
          100% {
            stroke-dashoffset: 0;
            opacity: 0.3;
          }
        }
        @keyframes yogicNasalFlowRight {
          0% {
            stroke-dashoffset: 0;
            opacity: 0.3;
          }
          50% {
            opacity: 1;
          }
          100% {
            stroke-dashoffset: -32;
            opacity: 0.2;
          }
        }
        @keyframes yogicGroundingPulse {
          0%, 100% {
            opacity: 0.3;
            transform: scaleX(1);
          }
          50% {
            opacity: 0.85;
            transform: scaleX(1.08);
          }
        }

        .anim-waterfall {
          stroke-dasharray: 8, 4;
          animation: waterfallCascade 1.4s linear infinite;
        }
        .anim-waterfall-fast {
          stroke-dasharray: 6, 3;
          animation: waterfallCascade 0.9s linear infinite;
        }
        .anim-mist {
          animation: waterfallMistPulse 3.5s ease-in-out infinite;
          transform-origin: 290px 115px;
        }
        .anim-river {
          stroke-dasharray: 10, 6;
          animation: riverCurrentFlow 3s linear infinite;
        }
        .anim-sunbeam {
          animation: sunbeamShimmer 4s ease-in-out infinite;
        }
        .live-breath-active {
          animation: yogicLiveBreath 4.5s ease-in-out infinite;
          transform-origin: 150px 115px;
        }
        .live-breath-supine {
          animation: yogicAbdomenBreath 4.5s ease-in-out infinite;
          transform-origin: 155px 125px;
        }
        .live-prana-active {
          animation: yogicPranaPulse 4s ease-in-out infinite;
          transform-origin: 150px 65px;
        }
        .live-mudra-active {
          animation: yogicMudraGlow 3s ease-in-out infinite;
        }
        .live-flow-left {
          stroke-dasharray: 6, 4;
          animation: yogicNasalFlowLeft 2.8s linear infinite;
        }
        .live-flow-right {
          stroke-dasharray: 6, 4;
          animation: yogicNasalFlowRight 2.8s linear infinite;
        }
        .live-grounding-active {
          animation: yogicGroundingPulse 3.5s ease-in-out infinite;
          transform-origin: 140px 175px;
        }
      `}</style>

      {/* Atmospheric Dawn Forest Sky Gradient */}
      <linearGradient id="forestSkyGrad" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stopColor="#041610" />
        <stop offset="50%" stopColor="#0b2e22" />
        <stop offset="100%" stopColor="#134e3a" />
      </linearGradient>

      {/* Morning Sunbeam Golden Ray Gradient */}
      <linearGradient id="sunbeamGrad" x1="0%" y1="0%" x2="70%" y2="100%">
        <stop offset="0%" stopColor="#fef08a" stopOpacity="0.45" />
        <stop offset="60%" stopColor="#fde047" stopOpacity="0.15" />
        <stop offset="100%" stopColor="#ca8a04" stopOpacity="0" />
      </linearGradient>

      {/* Mountain Rock Cliff Gradient */}
      <linearGradient id="cliffRockGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#1e293b" />
        <stop offset="40%" stopColor="#0f172a" />
        <stop offset="70%" stopColor="#062e21" />
        <stop offset="100%" stopColor="#021f16" />
      </linearGradient>

      {/* Cascading Waterfall Water Gradients */}
      <linearGradient id="waterfallWaterGrad" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stopColor="#bae6fd" stopOpacity="0.95" />
        <stop offset="40%" stopColor="#e0f2fe" stopOpacity="0.98" />
        <stop offset="80%" stopColor="#38bdf8" stopOpacity="0.85" />
        <stop offset="100%" stopColor="#ffffff" stopOpacity="0.95" />
      </linearGradient>

      <radialGradient id="waterfallMistGrad" cx="50%" cy="50%" r="50%">
        <stop offset="0%" stopColor="#f0f9ff" stopOpacity="0.65" />
        <stop offset="50%" stopColor="#7dd3fc" stopOpacity="0.3" />
        <stop offset="100%" stopColor="#0284c7" stopOpacity="0" />
      </radialGradient>

      {/* Sacred Flowing River Gradient */}
      <linearGradient id="riverWaterGrad" x1="0%" y1="0%" x2="100%" y2="60%">
        <stop offset="0%" stopColor="#064e3b" stopOpacity="0.98" />
        <stop offset="45%" stopColor="#0f766e" stopOpacity="0.95" />
        <stop offset="75%" stopColor="#0369a1" stopOpacity="0.92" />
        <stop offset="100%" stopColor="#075985" stopOpacity="0.98" />
      </linearGradient>

      {/* Riverbed Stones & Rocks Gradient */}
      <linearGradient id="riverStoneGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#334155" />
        <stop offset="50%" stopColor="#1e293b" />
        <stop offset="100%" stopColor="#0f172a" />
      </linearGradient>

      {/* Dense Forest Trees Gradient */}
      <linearGradient id="pineTreeGrad" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stopColor="#047857" />
        <stop offset="50%" stopColor="#064e3b" />
        <stop offset="100%" stopColor="#022c22" />
      </linearGradient>

      {/* Natural Warm Indian Yogini Skin Tone (Lifelike Complexion) */}
      <linearGradient id="yoginiSkinTone" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stopColor="#fed7aa" stopOpacity="0.98" />
        <stop offset="40%" stopColor="#fba759" stopOpacity="0.92" />
        <stop offset="80%" stopColor="#c2631a" stopOpacity="0.88" />
        <stop offset="100%" stopColor="#9a3412" stopOpacity="0.85" />
      </linearGradient>

      {/* Royal Forest Emerald Yogic Attire (सद्गुरु योगिनी परिधान) */}
      <linearGradient id="yoginiKurtiGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#065f46" stopOpacity="0.98" />
        <stop offset="55%" stopColor="#047857" stopOpacity="0.95" />
        <stop offset="100%" stopColor="#064e3b" stopOpacity="0.98" />
      </linearGradient>

      {/* Flowing Gold-Bordered Dupatta / Uttariya */}
      <linearGradient id="yoginiDupattaGrad" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stopColor="#0d9488" stopOpacity="0.95" />
        <stop offset="50%" stopColor="#14b8a6" stopOpacity="0.88" />
        <stop offset="100%" stopColor="#0f766e" stopOpacity="0.95" />
      </linearGradient>

      {/* Sacred Kusha Meditation Mat with Gold Trim */}
      <linearGradient id="kushaMatGrad" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stopColor="#854d0e" />
        <stop offset="50%" stopColor="#a16207" />
        <stop offset="100%" stopColor="#713f12" />
      </linearGradient>

      {/* Pure Gold Zari & Body Shading */}
      <linearGradient id="goldBodyGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#fef08a" />
        <stop offset="50%" stopColor="#eab308" />
        <stop offset="100%" stopColor="#ca8a04" />
      </linearGradient>

      {/* Spiritual Prana Aura */}
      <radialGradient id="pranaAura" cx="50%" cy="50%" r="50%">
        <stop offset="0%" stopColor="#fef08a" stopOpacity="0.6" />
        <stop offset="60%" stopColor="#34d399" stopOpacity="0.25" />
        <stop offset="100%" stopColor="#064e3b" stopOpacity="0" />
      </radialGradient>

      {/* Contact & Soft Shadow Filters */}
      <filter id="softShadow" x="-20%" y="-20%" width="140%" height="140%">
        <feGaussianBlur in="SourceAlpha" stdDeviation="2.5" />
        <feOffset dx="0" dy="2.5" result="offsetblur" />
        <feComponentTransfer>
          <feFuncA type="linear" slope="0.4" />
        </feComponentTransfer>
        <feMerge>
          <feMergeNode />
          <feMergeNode in="SourceGraphic" />
        </feMerge>
      </filter>

      <filter id="contactShadow" x="-10%" y="-10%" width="120%" height="120%">
        <feGaussianBlur stdDeviation="3.5" />
      </filter>
    </defs>
  );

  // Common Header Toolbar for Guru Profile & Live Motion Toggle
  const renderVisualToolbar = (title: string, subtitle: string) => (
    <div className="w-full flex items-center justify-between px-2.5 pb-2 border-b border-[#d4af37]/25 text-[11px] bg-black/40 backdrop-blur-md rounded-t-xl">
      <div className="flex items-center gap-2">
        <span className="flex items-center justify-center w-6 h-6 rounded-full bg-[#d4af37]/20 border border-[#d4af37]/50 text-sm shadow-[0_0_8px_rgba(212,175,55,0.3)]">
          🧘‍♀️
        </span>
        <div className="text-left">
          <div className="flex items-center gap-1.5">
            <span className="text-[#fef08a] font-bold block leading-tight">विदुषी योगिनी गुरु</span>
            <span className="text-[9px] px-1.5 py-0.2 rounded-full bg-emerald-950/90 text-emerald-300 border border-emerald-500/30">
              सद्गुरु साधिका
            </span>
          </div>
          <span className="text-[10px] text-gray-300 block leading-tight mt-0.5">
            {title} • <span className="text-emerald-400">तपोवन वन, नदी व झरना</span>
          </span>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => setIsLiveMotionActive((prev) => !prev)}
          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-[10px] font-semibold transition-all cursor-pointer ${
            isLiveMotionActive
              ? 'bg-emerald-900/80 border-emerald-400 text-emerald-200 shadow-[0_0_10px_rgba(52,211,153,0.35)]'
              : 'bg-white/5 border-white/20 text-gray-400 hover:text-gray-200'
          }`}
          title={isLiveMotionActive ? 'लाइव गति रोकें' : 'लाइव गति चालू करें'}
        >
          <span
            className={`w-2 h-2 rounded-full ${
              isLiveMotionActive ? 'bg-emerald-400 animate-ping' : 'bg-gray-500'
            }`}
          />
          <span>{isLiveMotionActive ? 'लाइव एनिमेशन सक्रिय' : 'गति स्थिर'}</span>
        </button>
      </div>
    </div>
  );

  // Reusable Scenery Background Component: Forest (वन), Cascading Waterfall (झरना), and Flowing River (नदी)
  const renderNaturalForestWaterfallRiverBackdrop = () => (
    <g id="naturalEnvironment">
      {/* 1. Sky & Distant Mountain Layers */}
      <rect x="0" y="0" width="340" height="210" fill="url(#forestSkyGrad)" />
      
      {/* Distant Misty Mountain Ridge Silhouettes */}
      <path
        d="M 0,95 Q 60,65 130,85 Q 200,60 270,75 Q 310,65 340,80 L 340,140 L 0,140 Z"
        fill="#042017"
        opacity="0.7"
      />
      <path
        d="M 0,110 Q 70,85 150,105 Q 220,80 300,95 L 340,110 L 340,150 L 0,150 Z"
        fill="#062e21"
        opacity="0.85"
      />

      {/* 2. Forest Canopy & Majestic Pine Trees (तपोवन सघन वन) */}
      {/* Left Forest Pine Clusters */}
      <g opacity="0.95">
        {/* Deep background pine */}
        <polygon points="20,40 5,80 35,80" fill="url(#pineTreeGrad)" />
        <polygon points="20,55 0,95 40,95" fill="url(#pineTreeGrad)" />
        <polygon points="20,70 -5,115 45,115" fill="url(#pineTreeGrad)" />
        <rect x="17" y="115" width="6" height="25" fill="#1e293b" />

        {/* Mid pine tree */}
        <polygon points="50,30 35,68 65,68" fill="url(#pineTreeGrad)" />
        <polygon points="50,48 28,88 72,88" fill="url(#pineTreeGrad)" />
        <polygon points="50,68 22,110 78,110" fill="url(#pineTreeGrad)" />
        <rect x="47" y="110" width="6" height="30" fill="#1e293b" />
      </g>

      {/* Right Mountain Cliff & Forest (झरने का पर्वतीय आधार) */}
      <path
        d="M 235,50 L 265,45 L 340,65 L 340,175 L 240,175 Q 230,135 235,50 Z"
        fill="url(#cliffRockGrad)"
      />
      {/* Moss and vegetation on cliff */}
      <path
        d="M 245,60 Q 255,55 270,62 Q 285,58 300,66 L 305,80 Q 280,72 250,75 Z"
        fill="#047857"
        opacity="0.8"
      />
      <path
        d="M 238,95 Q 250,88 262,94 L 260,110 Q 242,108 238,95 Z"
        fill="#059669"
        opacity="0.75"
      />

      {/* Hanging Forest Vines */}
      <path d="M 252,65 Q 254,85 250,105" stroke="#10b981" strokeWidth="1.2" fill="none" opacity="0.8" />
      <path d="M 268,68 Q 272,92 266,115" stroke="#059669" strokeWidth="1" fill="none" opacity="0.75" />

      {/* 3. Cascading Waterfall (पर्वतीय जलप्रपात / गिरता हुआ झरना) */}
      {/* Waterfall Gorge Crevice */}
      <path d="M 278,55 L 295,55 L 298,138 L 275,138 Z" fill="#021f16" opacity="0.9" />

      {/* Cascading Water Fall Sheets */}
      <g>
        {/* Base blue-white torrent */}
        <polygon points="280,55 294,55 297,140 277,140" fill="url(#waterfallWaterGrad)" opacity="0.85" />
        
        {/* Animated Rushing Water Ribbons */}
        <line
          x1="282"
          y1="55"
          x2="280"
          y2="140"
          stroke="#ffffff"
          strokeWidth="2.5"
          className={isLiveMotionActive ? 'anim-waterfall' : ''}
          opacity="0.95"
        />
        <line
          x1="287"
          y1="55"
          x2="287"
          y2="140"
          stroke="#e0f2fe"
          strokeWidth="3.2"
          className={isLiveMotionActive ? 'anim-waterfall-fast' : ''}
          opacity="0.95"
        />
        <line
          x1="292"
          y1="55"
          x2="294"
          y2="140"
          stroke="#ffffff"
          strokeWidth="2.2"
          className={isLiveMotionActive ? 'anim-waterfall' : ''}
          opacity="0.9"
        />

        {/* Waterfall Plunge Pool Foam & Mist Cloud */}
        <ellipse
          cx="287"
          cy="140"
          rx="22"
          ry="9"
          fill="url(#waterfallMistGrad)"
          className={isLiveMotionActive ? 'anim-mist' : ''}
        />
        {/* Foaming Splash Bubbles */}
        <circle cx="282" cy="138" r="3" fill="#ffffff" opacity="0.8" />
        <circle cx="288" cy="139" r="4.5" fill="#f0f9ff" opacity="0.85" />
        <circle cx="294" cy="137" r="3.5" fill="#ffffff" opacity="0.8" />
      </g>

      {/* 4. Sacred Mountain River (प्रवाहमान पवित्र नदी) */}
      {/* River Basin */}
      <path
        d="M 0,140 Q 90,132 180,135 Q 240,136 340,138 L 340,210 L 0,210 Z"
        fill="url(#riverWaterGrad)"
      />
      {/* Animated River Current Ripples */}
      <g opacity="0.75">
        <line
          x1="220"
          y1="144"
          x2="330"
          y2="144"
          stroke="#7dd3fc"
          strokeWidth="1.6"
          strokeLinecap="round"
          className={isLiveMotionActive ? 'anim-river' : ''}
        />
        <line
          x1="140"
          y1="150"
          x2="270"
          y2="150"
          stroke="#e0f2fe"
          strokeWidth="1.8"
          strokeLinecap="round"
          className={isLiveMotionActive ? 'anim-river' : ''}
        />
        <line
          x1="50"
          y1="158"
          x2="210"
          y2="158"
          stroke="#7dd3fc"
          strokeWidth="1.5"
          strokeLinecap="round"
          className={isLiveMotionActive ? 'anim-river' : ''}
        />
        <line
          x1="110"
          y1="172"
          x2="290"
          y2="172"
          stroke="#e0f2fe"
          strokeWidth="2"
          strokeLinecap="round"
          className={isLiveMotionActive ? 'anim-river' : ''}
        />
        <line
          x1="10"
          y1="190"
          x2="230"
          y2="190"
          stroke="#7dd3fc"
          strokeWidth="2.2"
          strokeLinecap="round"
          className={isLiveMotionActive ? 'anim-river' : ''}
        />
      </g>

      {/* 5. Riverbank Stones, Mossy Boulders & Meditation Slab (तटशिला) */}
      {/* River Pebbles & Stones */}
      <ellipse cx="40" cy="198" rx="18" ry="8" fill="url(#riverStoneGrad)" />
      <ellipse cx="65" cy="202" rx="12" ry="6" fill="#1e293b" />
      <ellipse cx="25" cy="188" rx="9" ry="5" fill="#334155" />
      <ellipse cx="310" cy="195" rx="20" ry="9" fill="url(#riverStoneGrad)" />
      <ellipse cx="280" cy="200" rx="14" ry="7" fill="#1e293b" />

      {/* Flat Natural Stone Meditation Terrace (जहाँ योगिनी गुरु बैठी हैं) */}
      <path
        d="M 50,158 Q 150,148 245,158 Q 255,182 235,190 Q 150,196 55,190 Q 40,175 50,158 Z"
        fill="#1e293b"
        stroke="#334155"
        strokeWidth="1"
        opacity="0.95"
      />
      {/* Stone highlight top rim */}
      <path
        d="M 52,159 Q 150,149 243,159"
        stroke="#64748b"
        strokeWidth="1.2"
        fill="none"
        opacity="0.7"
      />

      {/* 6. Soft Morning Sunbeams Streaming from Forest Canopy (सूर्य किरणें) */}
      <g className={isLiveMotionActive ? 'anim-sunbeam' : ''} pointerEvents="none">
        <polygon points="40,0 75,0 180,210 130,210" fill="url(#sunbeamGrad)" />
        <polygon points="90,0 120,0 250,210 205,210" fill="url(#sunbeamGrad)" />
      </g>
    </g>
  );

  // -------------------------------------------------------------
  // 1. SHAVASANA (Corpse Pose / Supine Relaxation by Female Yogini Guru)
  // -------------------------------------------------------------
  if (practiceId === 'shavasana') {
    const photoView = renderPhotographView('shavasana');
    if (photoView) return photoView;
    return (
      <div className={`flex flex-col items-center justify-center p-2.5 rounded-2xl bg-gradient-to-b from-[#03140c] to-[#082218] border border-[#d4af37]/35 shadow-2xl relative overflow-hidden ${className}`}>
        {renderVisualToolbar('शवासन — संपूर्ण शिथिलता', 'तपोवन विश्रांति')}

        <svg viewBox="0 0 340 210" className="w-full h-full max-h-56 select-none" aria-label="शवासन विदुषी योगिनी गुरु वास्तविक शारीरिक मुद्रा रेखाचित्र">
          {sharedDefs}
          {renderNaturalForestWaterfallRiverBackdrop()}

          {/* Sacred Kusha Meditation Mat with Golden Zari Border */}
          <polygon
            points="38,172 262,172 250,155 50,155"
            fill="url(#kushaMatGrad)"
            stroke="#d4af37"
            strokeWidth="1.2"
            opacity="0.95"
          />
          <line x1="38" y1="172" x2="262" y2="172" stroke="#fef08a" strokeWidth="1" opacity="0.75" />

          {/* Contact Shadow under body */}
          <ellipse cx="150" cy="168" rx="95" ry="6" fill="#010a06" filter="url(#contactShadow)" opacity="0.8" />

          {/* Prana Aura around resting Yogini Guru */}
          <ellipse
            cx="150"
            cy="158"
            rx="100"
            ry="16"
            fill="url(#pranaAura)"
            className={isLiveMotionActive ? 'live-prana-active' : ''}
            opacity="0.4"
          />

          {/* Realistic Female Yogini Guru Figure in Supine Relaxation (ओरिजिनल इंसान की तरह) */}
          <g filter="url(#softShadow)" className={isLiveMotionActive ? 'live-breath-supine' : ''}>
            {/* Traditional Yogic Hair Bun (जूड़ा) resting comfortably on mat */}
            <path
              d="M 52,158 C 47,155 45,149 48,143 C 51,138 58,138 62,141 C 64,143 65,147 63,151 Z"
              fill="#18181b"
            />
            {/* Fresh White Mogra / Jasmine Flower Garland (गजरा) woven into hair */}
            <circle cx="53" cy="144" r="2.2" fill="#ffffff" />
            <circle cx="49" cy="147" r="2.2" fill="#ffffff" />
            <circle cx="50" cy="153" r="2.2" fill="#ffffff" />
            {/* Golden hair jewel pin */}
            <circle cx="56" cy="142" r="1.5" fill="#d4af37" />

            {/* Graceful Serene Female Face Profile resting upward */}
            <path
              d="M 60,147 C 64,141 71,140 75,143 C 79,146 80,151 77,156 C 74,160 67,161 61,160 C 58,158 58,153 60,147 Z"
              fill="url(#yoginiSkinTone)"
            />
            {/* Sacred Kumkum Bindi on forehead */}
            <circle cx="70" cy="143" r="1.5" fill="#dc2626" />

            {/* Meditative closed eye & serene calm lips */}
            <path d="M 67,148 Q 70,146 73,148" stroke="#78350f" strokeWidth="1.2" fill="none" strokeLinecap="round" />
            <path d="M 70,153 Q 73,153 75,152" stroke="#78350f" strokeWidth="1" fill="none" strokeLinecap="round" />

            {/* Slender Graceful Neck */}
            <path d="M 75,153 L 85,154 L 84,160 L 74,159 Z" fill="url(#yoginiSkinTone)" />

            {/* Left Arm (further back, resting with open palm facing sky) */}
            <path
              d="M 86,152 C 101,150 121,151 141,155 C 148,157 154,159 159,161 C 162,162 165,161 166,163 C 164,165 158,165 151,163 C 134,159 111,158 88,158 Z"
              fill="url(#yoginiSkinTone)"
              opacity="0.85"
            />
            <ellipse cx="166" cy="162" rx="4" ry="2.5" fill="url(#goldBodyGrad)" />

            {/* Upper Torso with Flowing Emerald Yogic Kurti */}
            <path
              d="M 82,153 C 94,149 114,149 131,152 C 146,155 158,158 168,160 C 166,166 151,169 131,168 C 106,168 88,165 81,159 Z"
              fill="url(#yoginiKurtiGrad)"
            />
            {/* Golden Zari Border on Kurti */}
            <path
              d="M 104,151 C 118,151 136,153 154,158 C 161,160 166,162 171,166 C 161,170 144,169 126,168 C 111,167 101,163 104,151 Z"
              fill="url(#yoginiDupattaGrad)"
              opacity="0.9"
            />
            <line x1="104" y1="151" x2="171" y2="166" stroke="#fef08a" strokeWidth="1" opacity="0.75" />

            {/* Right Arm (foreground, resting at 30 degrees, delicate wrist with gold bangle) */}
            <path
              d="M 90,158 C 104,160 124,163 144,167 C 152,169 160,171 168,173 C 170,174 171,176 169,177 C 164,178 156,176 146,173 C 126,168 106,165 88,162 Z"
              fill="url(#yoginiSkinTone)"
            />
            {/* Gold bangle on wrist */}
            <ellipse cx="162" cy="172" rx="2" ry="3.5" fill="#fef08a" stroke="#ca8a04" strokeWidth="0.8" />
            {/* Relaxed open palm facing sky */}
            <path
              d="M 168,173 C 172,172 178,173 180,175 C 179,178 174,179 169,178 Z"
              fill="url(#goldBodyGrad)"
            />

            {/* Relaxed Legs in Yogic Salwar */}
            {/* Left Leg */}
            <path
              d="M 161,161 C 181,161 206,162 231,163 C 241,163 251,163 261,164 C 261,168 246,168 226,167 C 201,167 176,166 161,165 Z"
              fill="url(#yoginiKurtiGrad)"
              opacity="0.8"
            />
            {/* Left foot rolling outward */}
            <path
              d="M 261,164 C 266,162 272,161 275,163 C 274,166 268,167 261,167 Z"
              fill="url(#yoginiSkinTone)"
              opacity="0.85"
            />

            {/* Right Leg */}
            <path
              d="M 164,164 C 186,164 211,165 236,167 C 248,168 258,169 268,170 C 267,175 254,174 236,173 C 211,172 186,170 162,169 Z"
              fill="url(#yoginiKurtiGrad)"
            />
            {/* Right foot relaxed outward */}
            <path
              d="M 268,170 C 274,169 280,170 283,173 C 281,176 274,176 267,174 Z"
              fill="url(#yoginiSkinTone)"
            />
          </g>

          {/* Dynamic Pedagogical Step Highlighting */}
          {stepIndex === 0 && (
            <g>
              <line x1="56" y1="130" x2="280" y2="130" stroke="#fef08a" strokeWidth="1.5" strokeDasharray="4,4" />
              <rect x="75" y="16" width="190" height="22" rx="11" fill="#03140c" stroke="#fef08a" strokeWidth="1" />
              <text x="170" y="31" fill="#fef08a" fontSize="10" textAnchor="middle" fontWeight="bold">
                • 1. समतल भूमि पर पीठ के बल सीधा लेटना •
              </text>
            </g>
          )}

          {stepIndex === 1 && (
            <g>
              <circle cx="272" cy="169" r="18" fill="none" stroke="#38bdf8" strokeWidth="2" strokeDasharray="3,3" />
              <rect x="65" y="16" width="210" height="22" rx="11" fill="#03140c" stroke="#38bdf8" strokeWidth="1" />
              <text x="170" y="31" fill="#38bdf8" fontSize="10" textAnchor="middle" fontWeight="bold">
                • 2. दोनों पैर अलग, पंजे बाहर की ओर ढीले •
              </text>
            </g>
          )}

          {stepIndex === 2 && (
            <g>
              <circle cx="174" cy="174" r="16" fill="none" stroke="#fef08a" strokeWidth="2" strokeDasharray="3,3" />
              <rect x="65" y="16" width="210" height="22" rx="11" fill="#03140c" stroke="#fef08a" strokeWidth="1" />
              <text x="170" y="31" fill="#fef08a" fontSize="10" textAnchor="middle" fontWeight="bold">
                • 3. भुजाएं दूर, हथेलियां आकाश की ओर खुली •
              </text>
            </g>
          )}

          {(stepIndex === 3 || stepIndex >= 4) && (
            <g>
              <ellipse cx="150" cy="158" rx="100" ry="16" fill="none" stroke="#34d399" strokeWidth="1.5" strokeDasharray="4,4" opacity="0.8" />
              <rect x="65" y="16" width="210" height="22" rx="11" fill="#03140c" stroke="#34d399" strokeWidth="1" />
              <text x="170" y="31" fill="#34d399" fontSize="10" textAnchor="middle" fontWeight="bold">
                • 4. शांत स्वाभाविक श्वास एवं संपूर्ण शिथिलता •
              </text>
            </g>
          )}
        </svg>

        {/* Caption */}
        <div className="w-full flex items-center justify-between text-[11px] px-2.5 text-gray-300 pt-1.5 border-t border-[#d4af37]/20 mt-1 bg-black/40 rounded-b-xl">
          <span className="text-[#fef08a] font-medium">वास्तविक मानव शरीर संरेखण (Anatomical Human Form)</span>
          <span className="text-emerald-300 font-semibold">तपोवन नदी तट • सजीव विश्रांति</span>
        </div>
      </div>
    );
  }

  // -------------------------------------------------------------
  // 2. SUKHASANA (Easy Seated Posture by Female Yogini Guru)
  // -------------------------------------------------------------
  if (practiceId === 'sukhasana') {
    const photoView = renderPhotographView('sukhasana');
    if (photoView) return photoView;
    return (
      <div className={`flex flex-col items-center justify-center p-2.5 rounded-2xl bg-gradient-to-b from-[#03140c] to-[#082218] border border-[#d4af37]/35 shadow-2xl relative overflow-hidden ${className}`}>
        {renderVisualToolbar('सुखासन — ध्यानावस्था', 'मेरुदण्ड संरेखण')}

        <svg viewBox="0 0 340 210" className="w-full h-full max-h-56 select-none" aria-label="सुखासन विदुषी योगिनी गुरु वास्तविक शारीरिक मुद्रा रेखाचित्र">
          {sharedDefs}
          {renderNaturalForestWaterfallRiverBackdrop()}

          {/* Sacred Meditation Kusha Mat on Riverside Stone */}
          <ellipse cx="145" cy="180" rx="65" ry="11" fill="url(#kushaMatGrad)" stroke="#d4af37" strokeWidth="1.2" opacity="0.95" />
          <ellipse cx="145" cy="180" rx="62" ry="9" fill="none" stroke="#fef08a" strokeWidth="0.8" opacity="0.4" />

          {/* Contact Shadow */}
          <ellipse cx="145" cy="179" rx="55" ry="7" fill="#010a06" filter="url(#contactShadow)" opacity="0.85" />

          {/* Spiritual Prana Aura behind Yogini Guru's head and heart */}
          <circle
            cx="145"
            cy="105"
            r="42"
            fill="url(#pranaAura)"
            className={isLiveMotionActive ? 'live-prana-active' : ''}
            opacity="0.55"
          />

          {/* Realistic Seated Female Yogini Guru with Live Diaphragmatic Breath (ओरिजिनल इंसान की तरह) */}
          <g filter="url(#softShadow)" className={isLiveMotionActive ? 'live-breath-active' : ''}>
            {/* Crossed Legs Base in Traditional Emerald Yogic Attire */}
            <path
              d="M 98,172 C 90,166 95,152 112,154 C 128,156 140,164 148,174 C 133,180 110,182 98,172 Z"
              fill="url(#yoginiKurtiGrad)"
            />
            <path
              d="M 192,172 C 200,166 195,152 178,154 C 162,156 150,164 142,174 C 157,180 180,182 192,172 Z"
              fill="url(#yoginiKurtiGrad)"
            />
            {/* Crossed Feet resting gently on mat */}
            <ellipse cx="116" cy="176" rx="12" ry="5.5" fill="url(#yoginiSkinTone)" />
            <ellipse cx="174" cy="176" rx="12" ry="5.5" fill="url(#yoginiSkinTone)" />

            {/* Erect Torso (Aligned Spine with Flowing Kurti) */}
            <path
              d="M 128,168 C 124,150 126,135 122,116 C 134,114 156,114 168,116 C 164,135 166,150 162,168 Z"
              fill="url(#yoginiKurtiGrad)"
            />
            {/* Flowing Gold-Bordered Dupatta draped gracefully over left shoulder */}
            <path
              d="M 122,116 C 132,116 152,124 160,142 C 162,154 156,168 145,170 C 135,166 129,148 122,116 Z"
              fill="url(#yoginiDupattaGrad)"
              opacity="0.92"
            />
            <path d="M 122,116 C 134,124 150,142 158,166" stroke="#fef08a" strokeWidth="1.2" fill="none" opacity="0.8" />

            {/* Natural Feminine Shoulders */}
            <path
              d="M 108,120 C 122,114 135,113 145,113 C 155,113 168,114 182,120 C 180,128 174,132 166,128 C 155,124 135,124 124,128 C 116,132 110,128 108,120 Z"
              fill="url(#yoginiSkinTone)"
            />

            {/* Left Arm with delicate wrist and Gold Bangle */}
            <path
              d="M 112,122 C 104,132 98,146 96,158 C 98,162 104,162 106,158 C 110,146 116,134 122,124 Z"
              fill="url(#yoginiSkinTone)"
            />
            <ellipse cx="101" cy="154" rx="2.5" ry="1.5" fill="#fef08a" stroke="#ca8a04" strokeWidth="0.8" />

            {/* Right Arm with Gold Bangle */}
            <path
              d="M 178,122 C 186,132 192,146 194,158 C 192,162 186,162 184,158 C 180,146 174,134 168,124 Z"
              fill="url(#yoginiSkinTone)"
            />
            <ellipse cx="189" cy="154" rx="2.5" ry="1.5" fill="#fef08a" stroke="#ca8a04" strokeWidth="0.8" />

            {/* Authentic Jnana Mudra Hands on Knees (Index and Thumb touching in a circle) */}
            <g transform="translate(93, 156)" className={isLiveMotionActive ? 'live-mudra-active' : ''}>
              <circle cx="5" cy="5" r="5" fill="url(#goldBodyGrad)" />
              <circle cx="3" cy="4" r="2.2" fill="none" stroke="#78350f" strokeWidth="1" />
              <circle cx="3" cy="4" r="3.5" fill="none" stroke="#fef08a" strokeWidth="0.8" opacity="0.6" />
            </g>
            <g transform="translate(187, 156)" className={isLiveMotionActive ? 'live-mudra-active' : ''}>
              <circle cx="5" cy="5" r="5" fill="url(#goldBodyGrad)" />
              <circle cx="7" cy="4" r="2.2" fill="none" stroke="#78350f" strokeWidth="1" />
              <circle cx="7" cy="4" r="3.5" fill="none" stroke="#fef08a" strokeWidth="0.8" opacity="0.6" />
            </g>

            {/* Graceful Slender Neck */}
            <path d="M 141,114 L 141,103 L 149,103 L 149,114 Z" fill="url(#yoginiSkinTone)" />

            {/* Traditional Yogic Hair Bun (जूड़ा) with Fresh White Mogra Flowers (गजरा) */}
            <circle cx="145" cy="76" r="13" fill="#18181b" />
            <circle cx="145" cy="76" r="13" fill="none" stroke="#ffffff" strokeWidth="2.2" strokeDasharray="3,3" opacity="0.95" />
            <circle cx="145" cy="68" r="1.8" fill="#d4af37" />

            {/* Dignified Lifelike Female Face Profile & Oval */}
            <path
              d="M 136,87 C 136,80 140,76 145,76 C 150,76 154,80 154,87 C 154,97 150,103 145,103 C 140,103 136,97 136,87 Z"
              fill="url(#yoginiSkinTone)"
            />
            {/* Sacred Kumkum Bindi on Ajna Chakra */}
            <circle cx="145" cy="83" r="1.5" fill="#dc2626" />

            {/* Meditative closed calm eyes & serene peaceful lips */}
            <path d="M 139,88 Q 142,90 144,88" stroke="#78350f" strokeWidth="1.1" fill="none" strokeLinecap="round" />
            <path d="M 146,88 Q 148,90 151,88" stroke="#78350f" strokeWidth="1.1" fill="none" strokeLinecap="round" />
            <path d="M 143,96 Q 145,97 147,96" stroke="#78350f" strokeWidth="1" fill="none" strokeLinecap="round" />
          </g>

          {/* Dynamic Pedagogical Step Highlighting */}
          {stepIndex === 0 && (
            <g>
              <ellipse cx="145" cy="180" rx="45" ry="8" fill="none" stroke="#fef08a" strokeWidth="2" strokeDasharray="3,3" />
              <rect x="70" y="14" width="200" height="22" rx="11" fill="#03140c" stroke="#fef08a" strokeWidth="1" />
              <text x="170" y="29" fill="#fef08a" fontSize="10" textAnchor="middle" fontWeight="bold">
                • 1. समतल आसन पर शांत बैठें •
              </text>
            </g>
          )}

          {stepIndex === 1 && (
            <g>
              <circle cx="112" cy="164" r="14" fill="none" stroke="#38bdf8" strokeWidth="2" strokeDasharray="3,3" />
              <circle cx="178" cy="164" r="14" fill="none" stroke="#38bdf8" strokeWidth="2" strokeDasharray="3,3" />
              <rect x="65" y="14" width="210" height="22" rx="11" fill="#03140c" stroke="#38bdf8" strokeWidth="1" />
              <text x="170" y="29" fill="#38bdf8" fontSize="10" textAnchor="middle" fontWeight="bold">
                • 2. दोनों घुटने मोड़कर सुखासन में बैठें •
              </text>
            </g>
          )}

          {stepIndex === 2 && (
            <g>
              <line x1="145" y1="76" x2="145" y2="168" stroke="#fef08a" strokeWidth="2" strokeDasharray="4,4" />
              <circle cx="145" cy="116" r="4" fill="#fef08a" />
              <rect x="65" y="14" width="210" height="22" rx="11" fill="#03140c" stroke="#fef08a" strokeWidth="1" />
              <text x="170" y="29" fill="#fef08a" fontSize="10" textAnchor="middle" fontWeight="bold">
                • 3. मेरुदण्ड सीधा, कंधे शिथिल रखें •
              </text>
            </g>
          )}

          {(stepIndex === 3 || stepIndex >= 4) && (
            <g>
              <circle cx="98" cy="160" r="12" fill="none" stroke="#34d399" strokeWidth="2" strokeDasharray="3,3" />
              <circle cx="192" cy="160" r="12" fill="none" stroke="#34d399" strokeWidth="2" strokeDasharray="3,3" />
              <rect x="55" y="14" width="230" height="22" rx="11" fill="#03140c" stroke="#34d399" strokeWidth="1" />
              <text x="170" y="29" fill="#34d399" fontSize="10" textAnchor="middle" fontWeight="bold">
                • 4. ज्ञान मुद्रा में हथेलियां घुटनों पर, शांत श्वास •
              </text>
            </g>
          )}
        </svg>

        {/* Caption */}
        <div className="w-full flex items-center justify-between text-[11px] px-2.5 text-gray-300 pt-1.5 border-t border-[#d4af37]/20 mt-1 bg-black/40 rounded-b-xl">
          <span className="text-[#fef08a] font-medium">सुखासन ज्ञान मुद्रा (Jnana Mudra)</span>
          <span className="text-emerald-300 font-semibold">नदी तट • सजीव प्राण प्रवाह</span>
        </div>
      </div>
    );
  }

  // -------------------------------------------------------------
  // 3. TADASANA (Mountain Pose by Female Yogini Guru)
  // -------------------------------------------------------------
  if (practiceId === 'tadasana') {
    const photoView = renderPhotographView('tadasana');
    if (photoView) return photoView;
    return (
      <div className={`flex flex-col items-center justify-center p-2.5 rounded-2xl bg-gradient-to-b from-[#03140c] to-[#082218] border border-[#d4af37]/35 shadow-2xl relative overflow-hidden ${className}`}>
        {renderVisualToolbar('ताड़ासन — समस्थिति पर्वतासन', 'स्थिरता एवं संतुलन')}

        <svg viewBox="0 0 340 210" className="w-full h-full max-h-56 select-none" aria-label="ताड़ासन विदुषी योगिनी गुरु वास्तविक शारीरिक मुद्रा रेखाचित्र">
          {sharedDefs}
          {renderNaturalForestWaterfallRiverBackdrop()}

          {/* Riverside Stone Mat Platform */}
          <line x1="105" y1="188" x2="185" y2="188" stroke="#d4af37" strokeWidth="2" opacity="0.9" />
          <line x1="110" y1="190" x2="180" y2="190" stroke="#fef08a" strokeWidth="0.8" opacity="0.5" />

          {/* Grounding Contact Shadows under feet */}
          <ellipse
            cx="138"
            cy="187"
            rx="9"
            ry="3.5"
            fill="#010a06"
            filter="url(#contactShadow)"
            opacity="0.85"
            className={isLiveMotionActive ? 'live-grounding-active' : ''}
          />
          <ellipse
            cx="152"
            cy="187"
            rx="9"
            ry="3.5"
            fill="#010a06"
            filter="url(#contactShadow)"
            opacity="0.85"
            className={isLiveMotionActive ? 'live-grounding-active' : ''}
          />

          {/* Soft Vertical Prana Stream */}
          <rect
            x="142"
            y="28"
            width="6"
            height="158"
            fill="url(#pranaAura)"
            className={isLiveMotionActive ? 'live-prana-active' : ''}
            opacity="0.35"
          />

          {/* Realistic Standing Yogini Guru in Tadasana (ओरिजिनल इंसान की तरह) */}
          <g filter="url(#softShadow)" className={isLiveMotionActive ? 'live-breath-active' : ''}>
            {/* Grounded Parallel Feet on riverside stone */}
            <path
              d="M 134,185 C 134,181 136,177 140,177 C 143,177 145,181 145,185 C 145,187 134,187 134,185 Z"
              fill="url(#yoginiSkinTone)"
            />
            <path
              d="M 146,185 C 146,181 148,177 151,177 C 154,177 156,181 156,185 C 156,187 146,187 146,185 Z"
              fill="url(#yoginiSkinTone)"
            />

            {/* Lower Legs in Yogic Salwar */}
            <path
              d="M 135,179 C 133,167 133,153 135,140 C 139,140 142,140 144,140 C 146,153 145,167 143,179 Z"
              fill="url(#yoginiKurtiGrad)"
            />
            <path
              d="M 147,179 C 145,167 144,153 146,140 C 148,140 151,140 155,140 C 157,153 157,167 155,179 Z"
              fill="url(#yoginiKurtiGrad)"
            />

            {/* Soft Knees Alignment */}
            <ellipse cx="139" cy="140" rx="4" ry="2.8" fill="url(#goldBodyGrad)" opacity="0.8" />
            <ellipse cx="151" cy="140" rx="4" ry="2.8" fill="url(#goldBodyGrad)" opacity="0.8" />

            {/* Thighs in Yogic Attire */}
            <path
              d="M 134,138 C 131,126 133,114 136,104 C 141,104 145,104 147,104 C 145,114 144,126 142,138 Z"
              fill="url(#yoginiKurtiGrad)"
            />
            <path
              d="M 148,138 C 147,126 149,114 151,104 C 154,104 158,104 161,104 C 163,114 162,126 160,138 Z"
              fill="url(#yoginiKurtiGrad)"
            />

            {/* Lengthened Torso with Elegant Emerald Kurti */}
            <path
              d="M 135,104 C 132,92 133,78 129,62 C 140,58 152,58 163,62 C 159,78 160,92 157,104 Z"
              fill="url(#yoginiKurtiGrad)"
            />
            {/* Elegant Draped Dupatta across chest */}
            <path
              d="M 131,64 C 142,68 153,80 156,102 C 148,104 140,104 132,102 C 131,90 130,76 131,64 Z"
              fill="url(#yoginiDupattaGrad)"
              opacity="0.9"
            />
            <line x1="131" y1="64" x2="156" y2="102" stroke="#fef08a" strokeWidth="1" opacity="0.75" />

            {/* Arms hanging naturally by sides with Gold Bangles */}
            {/* Left Arm */}
            <path
              d="M 129,64 C 124,76 120,90 118,105 C 117,110 119,115 121,115 C 123,115 125,110 125,105 C 127,92 130,78 133,67 Z"
              fill="url(#yoginiSkinTone)"
            />
            <ellipse cx="120" cy="109" rx="1.8" ry="2.5" fill="#fef08a" stroke="#ca8a04" strokeWidth="0.6" />
            <ellipse cx="121" cy="117" rx="3.5" ry="6" fill="url(#goldBodyGrad)" />

            {/* Right Arm */}
            <path
              d="M 163,64 C 168,76 172,90 174,105 C 175,110 173,115 171,115 C 169,115 167,110 167,105 C 165,92 161,78 159,67 Z"
              fill="url(#yoginiSkinTone)"
            />
            <ellipse cx="172" cy="109" rx="1.8" ry="2.5" fill="#fef08a" stroke="#ca8a04" strokeWidth="0.6" />
            <ellipse cx="171" cy="117" rx="3.5" ry="6" fill="url(#goldBodyGrad)" />

            {/* Upright Graceful Neck */}
            <path d="M 142,60 L 142,51 L 148,51 L 148,60 Z" fill="url(#yoginiSkinTone)" />

            {/* Traditional Yogic Hair Bun with Garland */}
            <circle cx="145" cy="32" r="9" fill="#18181b" />
            <circle cx="145" cy="32" r="9" fill="none" stroke="#ffffff" strokeWidth="1.8" strokeDasharray="2,2" opacity="0.9" />

            {/* Dignified Yogini Face Profile */}
            <path
              d="M 139,41 C 139,35 142,32 145,32 C 148,32 151,35 151,41 C 151,49 148,53 145,53 C 142,53 139,49 139,41 Z"
              fill="url(#yoginiSkinTone)"
            />
            {/* Kumkum Bindi */}
            <circle cx="145" cy="38" r="1.3" fill="#dc2626" />

            {/* Serene eyes gazing forward */}
            <circle cx="143" cy="42" r="0.9" fill="#78350f" />
            <circle cx="147" cy="42" r="0.9" fill="#78350f" />
            <line x1="143.5" y1="47" x2="146.5" y2="47" stroke="#78350f" strokeWidth="0.9" strokeLinecap="round" />
          </g>

          {/* Dynamic Pedagogical Step Highlighting */}
          {(stepIndex === 0 || stepIndex === 1) && (
            <g>
              <ellipse cx="145" cy="186" rx="24" ry="7" fill="none" stroke="#38bdf8" strokeWidth="2" strokeDasharray="3,3" />
              <rect x="70" y="12" width="200" height="20" rx="10" fill="#03140c" stroke="#38bdf8" strokeWidth="1" />
              <text x="170" y="26" fill="#38bdf8" fontSize="9" textAnchor="middle" fontWeight="bold">
                • 1. दोनों पैरों पर समान वजन संतुलन •
              </text>
            </g>
          )}

          {stepIndex === 2 && (
            <g>
              <circle cx="139" cy="140" r="9" fill="none" stroke="#fef08a" strokeWidth="1.8" strokeDasharray="2,2" />
              <circle cx="151" cy="140" r="9" fill="none" stroke="#fef08a" strokeWidth="1.8" strokeDasharray="2,2" />
              <rect x="75" y="12" width="190" height="20" rx="10" fill="#03140c" stroke="#fef08a" strokeWidth="1" />
              <text x="170" y="26" fill="#fef08a" fontSize="9" textAnchor="middle" fontWeight="bold">
                • 2. घुटने सहज, बिना अकड़न •
              </text>
            </g>
          )}

          {(stepIndex === 3 || stepIndex >= 4) && (
            <g>
              <line x1="145" y1="30" x2="145" y2="186" stroke="#34d399" strokeWidth="2" strokeDasharray="4,4" />
              <circle cx="145" cy="34" r="3" fill="#34d399" />
              <circle cx="145" cy="62" r="3" fill="#34d399" />
              <circle cx="145" cy="104" r="3" fill="#34d399" />
              <circle cx="145" cy="185" r="3" fill="#34d399" />
              <rect x="75" y="12" width="190" height="20" rx="10" fill="#03140c" stroke="#34d399" strokeWidth="1" />
              <text x="170" y="26" fill="#34d399" fontSize="9" textAnchor="middle" fontWeight="bold">
                • 3. रीढ़ की सीधी व स्थिर मुद्रा •
              </text>
            </g>
          )}
        </svg>

        {/* Caption */}
        <div className="w-full flex items-center justify-between text-[11px] px-2.5 text-gray-300 pt-1.5 border-t border-[#d4af37]/20 mt-1 bg-black/40 rounded-b-xl">
          <span className="text-[#fef08a] font-medium">समस्थिति संरेखण (Samasthiti Plumb Line)</span>
          <span className="text-emerald-300 font-semibold">तपोवन नदी तट • स्थिर आधार</span>
        </div>
      </div>
    );
  }

  // -------------------------------------------------------------
  // 4. ANULOM VILOM (Alternate Nostril Breath Awareness by Female Yogini Guru)
  // -------------------------------------------------------------
  if (practiceId === 'anulom_vilom') {
    const photoView = renderPhotographView('anulom_vilom');
    if (photoView) return photoView;
    return (
      <div className={`flex flex-col items-center justify-center p-2.5 rounded-2xl bg-gradient-to-b from-[#03140c] to-[#082218] border border-[#d4af37]/35 shadow-2xl relative overflow-hidden ${className}`}>
        {renderVisualToolbar('अनुलोम विलोम — प्राण शुद्धि', 'विष्णु मुद्रा व श्वास प्रवाह')}

        <svg viewBox="0 0 340 210" className="w-full h-full max-h-56 select-none" aria-label="अनुलोम विलोम विदुषी योगिनी गुरु वास्तविक शारीरिक मुद्रा रेखाचित्र">
          {sharedDefs}
          {renderNaturalForestWaterfallRiverBackdrop()}

          {/* Sacred Kusha Meditation Mat on Riverside Stone */}
          <ellipse cx="145" cy="180" rx="65" ry="11" fill="url(#kushaMatGrad)" stroke="#d4af37" strokeWidth="1.2" opacity="0.95" />

          {/* Contact Shadow */}
          <ellipse cx="145" cy="179" rx="55" ry="7" fill="#010a06" filter="url(#contactShadow)" opacity="0.85" />

          {/* Spiritual Prana Aura */}
          <circle
            cx="145"
            cy="105"
            r="42"
            fill="url(#pranaAura)"
            className={isLiveMotionActive ? 'live-prana-active' : ''}
            opacity="0.55"
          />

          {/* Realistic Seated Female Yogini Guru with Authentic VISHNU MUDRA (ओरिजिनल इंसान की तरह) */}
          <g filter="url(#softShadow)" className={isLiveMotionActive ? 'live-breath-active' : ''}>
            {/* Crossed Legs Base */}
            <path
              d="M 98,172 C 90,166 95,152 112,154 C 128,156 140,164 148,174 C 133,180 110,182 98,172 Z"
              fill="url(#yoginiKurtiGrad)"
            />
            <path
              d="M 192,172 C 200,166 195,152 178,154 C 162,156 150,164 142,174 C 157,180 180,182 192,172 Z"
              fill="url(#yoginiKurtiGrad)"
            />

            {/* Torso & Spine with Flowing Kurti & Dupatta */}
            <path
              d="M 124,118 C 134,116 156,116 166,118 C 164,136 166,149 161,163 C 150,166 139,166 128,163 C 124,149 126,136 124,118 Z"
              fill="url(#yoginiKurtiGrad)"
              opacity="0.95"
            />
            <path
              d="M 123,116 C 132,116 152,124 160,142 C 162,154 156,168 145,170 C 135,166 129,148 123,116 Z"
              fill="url(#yoginiDupattaGrad)"
              opacity="0.9"
            />

            {/* Shoulders */}
            <path
              d="M 108,120 C 122,114 135,113 145,113 C 155,113 168,114 182,120 C 180,128 174,132 166,128 C 155,124 135,124 124,128 C 116,132 110,128 108,120 Z"
              fill="url(#yoginiSkinTone)"
            />

            {/* Left Arm in Jnana Mudra on Left Knee */}
            <path
              d="M 112,122 C 104,132 98,146 96,158 C 98,162 104,162 106,158 C 110,146 116,134 122,124 Z"
              fill="url(#yoginiSkinTone)"
            />
            <circle cx="100" cy="160" r="4.5" fill="url(#goldBodyGrad)" />

            {/* Right Arm raised gracefully to Face in Authentic VISHNU MUDRA */}
            <path
              d="M 175,122 C 181,126 179,136 172,141 C 166,139 162,128 166,118 Z"
              fill="url(#yoginiSkinTone)"
            />
            <path
              d="M 172,141 C 175,130 171,114 160,99 C 156,101 160,118 164,138 Z"
              fill="url(#yoginiSkinTone)"
            />
            {/* Delicate gold bangle on right wrist */}
            <ellipse cx="163" cy="112" rx="1.8" ry="3.2" fill="#fef08a" stroke="#ca8a04" strokeWidth="0.7" />

            {/* Authentic Vishnu Mudra Hand framing Nostrils */}
            <g transform="translate(150, 90)" className={isLiveMotionActive ? 'live-mudra-active' : ''}>
              <ellipse cx="6" cy="7" rx="4.5" ry="3.5" fill="url(#goldBodyGrad)" />
              {/* Right Thumb gently placed at right nostril */}
              <path d="M 4,6 C 0,4 -2,3 -4,4" stroke="url(#yoginiSkinTone)" strokeWidth="2.8" strokeLinecap="round" />
              {/* Folded index and middle fingers */}
              <circle cx="5" cy="9" r="2.2" fill="#ca8a04" />
              {/* Ring finger framing left nostril */}
              <path d="M 6,4 C 4,1 0,-1 -3,0" stroke="url(#yoginiSkinTone)" strokeWidth="2.2" strokeLinecap="round" />
            </g>

            {/* Yogic Hair Bun with Fresh Mogra Garland */}
            <circle cx="145" cy="76" r="13" fill="#18181b" />
            <circle cx="145" cy="76" r="13" fill="none" stroke="#ffffff" strokeWidth="2.2" strokeDasharray="3,3" opacity="0.95" />

            {/* Meditative Face */}
            <path
              d="M 136,87 C 136,80 140,76 145,76 C 150,76 154,80 154,87 C 154,97 150,103 145,103 C 140,103 136,97 136,87 Z"
              fill="url(#yoginiSkinTone)"
            />
            {/* Kumkum Bindi */}
            <circle cx="145" cy="83" r="1.5" fill="#dc2626" />

            {/* Closed meditative eyes */}
            <path d="M 139,88 Q 142,90 144,88" stroke="#78350f" strokeWidth="1.1" fill="none" strokeLinecap="round" />
            <path d="M 146,88 Q 148,90 151,88" stroke="#78350f" strokeWidth="1.1" fill="none" strokeLinecap="round" />
          </g>

          {/* LIVE ALTERNATING NOSTRIL AIRFLOW STREAMS (Smooth Zero-Kumbhaka Breath Wave) */}
          {isLiveMotionActive && (
            <g>
              {/* Ida Nadi (Left Nostril Cooling Stream - Cyan) */}
              <path
                d="M 140,93 Q 132,106 138,124"
                stroke="#38bdf8"
                strokeWidth="2.5"
                strokeLinecap="round"
                fill="none"
                className="live-flow-left"
              />
              {/* Pingala Nadi (Right Nostril Warming Stream - Gold/Amber) */}
              <path
                d="M 151,93 Q 159,106 153,124"
                stroke="#fef08a"
                strokeWidth="2.5"
                strokeLinecap="round"
                fill="none"
                className="live-flow-right"
              />
            </g>
          )}

          {/* Dynamic Pedagogical Step Highlighting */}
          {stepIndex <= 1 && (
            <g>
              <circle cx="152" cy="91" r="14" fill="none" stroke="#fef08a" strokeWidth="2" strokeDasharray="3,3" />
              <rect x="65" y="14" width="210" height="22" rx="11" fill="#03140c" stroke="#fef08a" strokeWidth="1" />
              <text x="170" y="29" fill="#fef08a" fontSize="10" textAnchor="middle" fontWeight="bold">
                • 1. सुखासन में बैठें, दायां हाथ नासिका पर •
              </text>
            </g>
          )}

          {stepIndex === 2 && (
            <g>
              <path d="M 141,93 Q 135,103 139,113" stroke="#38bdf8" strokeWidth="2.5" strokeLinecap="round" strokeDasharray="4,2" fill="none" />
              <circle cx="141" cy="93" r="3" fill="#38bdf8" />
              <rect x="65" y="14" width="210" height="22" rx="11" fill="#03140c" stroke="#38bdf8" strokeWidth="1" />
              <text x="170" y="29" fill="#38bdf8" fontSize="10" textAnchor="middle" fontWeight="bold">
                • 2. बाईं नासिका से शांत सांस अंदर •
              </text>
            </g>
          )}

          {stepIndex === 3 && (
            <g>
              <path d="M 149,93 Q 155,103 151,113" stroke="#34d399" strokeWidth="2.5" strokeLinecap="round" strokeDasharray="4,2" fill="none" />
              <circle cx="149" cy="93" r="3" fill="#34d399" />
              <rect x="60" y="14" width="220" height="22" rx="11" fill="#03140c" stroke="#34d399" strokeWidth="1" />
              <text x="170" y="29" fill="#34d399" fontSize="10" textAnchor="middle" fontWeight="bold">
                • 3. शून्य कुंभक — दाहिनी से सहज बाहर •
              </text>
            </g>
          )}

          {stepIndex >= 4 && (
            <g>
              <path d="M 141,97 Q 146,107 151,97" stroke="#fef08a" strokeWidth="2" strokeDasharray="3,2" fill="none" />
              <rect x="65" y="14" width="210" height="22" rx="11" fill="#03140c" stroke="#fef08a" strokeWidth="1" />
              <text x="170" y="29" fill="#fef08a" fontSize="10" textAnchor="middle" fontWeight="bold">
                • 4. स्वाभाविक लय — बिना जोर या आवाज •
              </text>
            </g>
          )}
        </svg>

        {/* Provenance & Safety Caption */}
        <div className="w-full flex items-center justify-between text-[11px] px-2.5 text-gray-300 pt-1.5 border-t border-[#d4af37]/20 mt-1 bg-black/40 rounded-b-xl">
          <span className="text-[#fef08a] font-medium">विष्णु मुद्रा (Vishnu Mudra)</span>
          <span className="text-emerald-300 font-semibold">तपोवन नदी व झरना • शून्य कुंभक</span>
        </div>
      </div>
    );
  }

  // -------------------------------------------------------------
  // Safe Fallback Visual
  // -------------------------------------------------------------
  return (
    <div className={`flex flex-col items-center justify-center p-3 rounded-2xl bg-[#03140c]/90 border border-white/10 ${className}`}>
      <div className="text-center space-y-1">
        <p className="text-xs text-gray-300 font-medium">चरण {stepIndex + 1} अभ्यास प्रदर्शन</p>
        <p className="text-[11px] text-gray-400">शांत भाव से निर्देश का अनुसरण करें</p>
      </div>
    </div>
  );
};

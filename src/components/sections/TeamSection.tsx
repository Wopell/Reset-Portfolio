import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useLanguage } from '../../context/LanguageContext';
import { FadeIn } from '../FadeIn';

interface MemberPortraitProps {
  id: string;
  alt: string;
  className?: string;
}

function MemberPortrait({ id, alt, className = "" }: MemberPortraitProps) {
  // Check extensions: first .png, then .jpg, then fallback to .svg
  const extensions = ['png', 'jpg', 'svg'];
  const [extIndex, setExtIndex] = useState(0);

  const src = `/assets/team/portraits/${id}.${extensions[extIndex]}`;

  const handleError = () => {
    if (extIndex < extensions.length - 1) {
      setExtIndex(extIndex + 1);
    }
  };

  return (
    <img
      src={src}
      alt={alt}
      className={className}
      onError={handleError}
      referrerPolicy="no-referrer"
    />
  );
}

export function TeamSection() {
  const { t } = useLanguage();

  // Team members definition matching roles and custom calibrated badge sizing offsets
  const members = useMemo(() => [
    {
      id: "Lara",
      name: "Lara",
      role: t('member1Role'), // Programmer / Editor
      color: "#ffe806", // Yellow flower
      badgeFile: "Forma (1).svg",
      // Calibrated custom insets to keep heads barely overflowing
      satInset: "inset-[-18%]",
      satHeadInset: "inset-[-27%]",
      cntInset: "inset-[-28%]",
      cntHeadInset: "inset-[-30%]",
      roles: [
        { label: "EDICIÓN", positionClass: "absolute right-[115%] top-[30%] md:right-[125%] md:top-[25%] -translate-y-1/2", arrowClass: "rotate-[195deg]", dir: "left" },
        { label: "PROGRAMACIÓN", positionClass: "absolute left-[115%] top-[70%] md:left-[125%] md:top-[65%] -translate-y-1/2", arrowClass: "rotate-[-15deg]", dir: "right" }
      ]
    },
    {
      id: "Mayra",
      name: "Mayra",
      role: t('member2Role'), // Artista 3D & Diseñadora
      color: "#de0015", // Red
      badgeFile: "Forma (5).svg",
      // Calibrated custom insets to keep heads barely overflowing
      satInset: "inset-[-18%]",
      satHeadInset: "inset-[-23%]",
      cntInset: "inset-[-30%]",
      cntHeadInset: "inset-[-25%]",
      roles: [
        { label: "DISEÑO", positionClass: "absolute right-[115%] top-[30%] md:right-[125%] md:top-[25%] -translate-y-1/2", arrowClass: "rotate-[195deg]", dir: "left" },
        { label: "ARTISTA 3D", positionClass: "absolute left-[115%] top-[70%] md:left-[125%] md:top-[65%] -translate-y-1/2", arrowClass: "rotate-[-15deg]", dir: "right" }
      ]
    },
    {
      id: "Tomy",
      name: "Tomy",
      role: t('member3Role'), // Motion Graphics & IA
      color: "#25e22e", // Green
      badgeFile: "Forma (2).svg",
      // Calibrated custom insets to keep heads barely overflowing
      satInset: "inset-[-20%]",
      satHeadInset: "inset-[-33%]",
      cntInset: "inset-[-28%]",
      cntHeadInset: "inset-[-34%]",
      roles: [
        { label: "IA", positionClass: "absolute right-[115%] top-[30%] md:right-[125%] md:top-[25%] -translate-y-1/2", arrowClass: "rotate-[195deg]", dir: "left" },
        { label: "MOTION GRAPHICS", positionClass: "absolute left-[115%] top-[70%] md:left-[125%] md:top-[65%] -translate-y-1/2", arrowClass: "rotate-[-15deg]", dir: "right" }
      ]
    },
    {
      id: "Cami",
      name: "Cami",
      role: t('member4Role'), // Programadora & Diseñadora
      color: "#359df6", // Blue
      badgeFile: "Forma (4).svg",
      // Calibrated custom insets to keep heads barely overflowing
      satInset: "inset-[-20%]",
      satHeadInset: "inset-[-18%]",
      cntInset: "inset-[-28%]",
      cntHeadInset: "inset-[-18%]",
      roles: [
        { label: "PROGRAMACIÓN", positionClass: "absolute right-[115%] top-[30%] md:right-[125%] md:top-[25%] -translate-y-1/2", arrowClass: "rotate-[195deg]", dir: "left" },
        { label: "DISEÑO", positionClass: "absolute left-[115%] top-[70%] md:left-[125%] md:top-[65%] -translate-y-1/2", arrowClass: "rotate-[-15deg]", dir: "right" }
      ]
    },
    {
      id: "Caro",
      name: "Caro",
      role: t('member5Role'), // Project Manager & Diseñadora
      color: "#e64d9a", // Pink
      badgeFile: "Forma (3).svg",
      // Calibrated custom insets to keep heads barely overflowing
      satInset: "inset-[-42%]",
      satHeadInset: "inset-[-40%]",
      cntInset: "inset-[-40%]",
      cntHeadInset: "inset-[-30%]",
      roles: [
        { label: "PROJECT MANAGER", positionClass: "absolute right-[115%] top-[30%] md:right-[125%] md:top-[25%] -translate-y-1/2", arrowClass: "rotate-[195deg]", dir: "left" },
        { label: "DISEÑO", positionClass: "absolute left-[115%] top-[70%] md:left-[125%] md:top-[65%] -translate-y-1/2", arrowClass: "rotate-[-15deg]", dir: "right" }
      ]
    }
  ], [t]);

  // Positions state mapping member IDs to active slots:
  // [0]: Center (active), [1]: TL, [2]: TR, [3]: BL, [4]: BR
  const [positions, setPositions] = useState<string[]>([
    "Lara",  // Center (starts active)
    "Mayra", // TL
    "Tomy",  // TR
    "Cami",  // BL
    "Caro"   // BR
  ]);

  // Direct 2-element swap between the center (0) and the clicked corner (clickedPosIdx)
  const handleSelect = (memberId: string) => {
    const clickedPosIdx = positions.indexOf(memberId);
    if (clickedPosIdx === 0 || clickedPosIdx === -1) return; // Already center or not found

    const newPositions = [...positions];
    const oldCenterId = positions[0];

    // Swaps them directly
    newPositions[0] = memberId;
    newPositions[clickedPosIdx] = oldCenterId;

    setPositions(newPositions);
  };

  // Find active and satellite members from positions state
  const activeMember = useMemo(() => {
    return members.find(m => m.id === positions[0])!;
  }, [members, positions]);

  const memberTL = useMemo(() => members.find(m => m.id === positions[1])!, [members, positions]);
  const memberTR = useMemo(() => members.find(m => m.id === positions[2])!, [members, positions]);
  const memberBL = useMemo(() => members.find(m => m.id === positions[3])!, [members, positions]);
  const memberBR = useMemo(() => members.find(m => m.id === positions[4])!, [members, positions]);

  // Stop-motion frame index updating at 5 fps (200ms) for background shape wiggles
  const [stopMotionFrame, setStopMotionFrame] = useState(0);
  useEffect(() => {
    const interval = setInterval(() => {
      setStopMotionFrame((prev) => (prev + 1) % 4);
    }, 200);
    return () => clearInterval(interval);
  }, []);

  // Center selected face jiggle rotation alternating between 10 and -10 degrees at 3 fps (333ms)
  const [jiggleRotation, setJiggleRotation] = useState(10);
  useEffect(() => {
    const interval = setInterval(() => {
      setJiggleRotation((prev) => (prev === 10 ? -10 : 10));
    }, 333);
    return () => clearInterval(interval);
  }, []);

  // Jiggle offsets based on stop-motion frame loop
  const jiggleScales = [1.0, 0.97, 1.02, 0.98];
  const jiggleRotates = [0, -3, 2, -1];

  const getStopMotionStyle = (offsetSeed: number) => {
    const frame = (stopMotionFrame + offsetSeed) % 4;
    return {
      transform: `scale(${jiggleScales[frame]}) rotate(${jiggleRotates[frame]}deg)`,
      transition: 'transform 0.1s step-end' // Instant stop-motion transition feel
    };
  };

  // Snappy spring transition config for badge/portrait layout transitions
  const springTransition = {
    type: "spring",
    stiffness: 300,
    damping: 28,
    mass: 0.8
  };

  return (
    <section
      id="team"
      // Pushed upwards to bleed behind the ProjectsSection ripped bottom boundary
      className="relative w-full bg-transparent paper-noise-bg text-[#F5F5F5] px-6 md:px-10 pb-24 md:pb-32 pt-[140px] md:pt-[180px] -mt-[95px] overflow-hidden select-none"
    >
      {/* Black background layer at z-[1] */}
      <div className="absolute inset-0 bg-black z-[1] pointer-events-none" />

      {/* Scattered handwritten section titles */}
      <div className="relative z-10 max-w-7xl mx-auto mb-16 md:mb-20 flex flex-col items-center text-center">
        <FadeIn delay={0}>
          <span className="font-caveat text-[#df4581] text-2xl md:text-3xl lowercase mb-4 block">
            {t('teamEyebrow')}
          </span>
        </FadeIn>
        
        <FadeIn delay={0.1}>
          <h2
            className="font-display font-extrabold uppercase leading-[0.9] tracking-tight text-[#F5F5F5]"
            style={{ fontSize: 'clamp(2.5rem, 8vw, 6.5rem)' }}
          >
            {t('teamTitle')}
          </h2>
        </FadeIn>
      </div>

      {/* Constellation Orbit Interactive Grid */}
      <div className="relative z-10 w-full max-w-[420px] sm:max-w-[550px] md:max-w-[620px] aspect-square mx-auto flex items-center justify-center">
        
        {/* SATELLITE 1: Top-Left (TL, Position index 1) */}
        <div
          onClick={() => handleSelect(memberTL.id)}
          className="absolute left-[4%] top-[8%] sm:left-[6%] sm:top-[6%] z-10 w-20 h-20 sm:w-24 sm:h-24 md:w-28 md:h-28 flex items-center justify-center cursor-pointer active:scale-95 transition-transform duration-200 group"
        >
          {/* Jiggling color background shape loaded from SVG asset file with Layout Transition */}
          <motion.div
            layoutId={`badge-${memberTL.id}`}
            transition={springTransition}
            style={getStopMotionStyle(0)}
            className={`absolute ${memberTL.satInset} z-0`}
          >
            <img
              src={`/assets/team/badges/${memberTL.badgeFile}`}
              alt={`${memberTL.name} badge`}
              className="w-full h-full object-contain filter drop-shadow-md"
            />
          </motion.div>
          {/* Raw transparent PNG portrait overflowing the shape with Layout Transition */}
          <motion.div
            layoutId={`portrait-${memberTL.id}`}
            transition={springTransition}
            className={`absolute ${memberTL.satHeadInset} z-10 pointer-events-none`}
          >
            <MemberPortrait
              id={memberTL.id}
              alt={memberTL.name}
              className="w-full h-full object-contain filter grayscale contrast-110 brightness-105 transition-all duration-300 group-hover:grayscale-0 group-hover:scale-105"
            />
          </motion.div>
        </div>

        {/* SATELLITE 2: Top-Right (TR, Position index 2) */}
        <div
          onClick={() => handleSelect(memberTR.id)}
          className="absolute right-[4%] top-[8%] sm:right-[6%] sm:top-[6%] z-10 w-20 h-20 sm:w-24 sm:h-24 md:w-28 md:h-28 flex items-center justify-center cursor-pointer active:scale-95 transition-transform duration-200 group"
        >
          {/* Jiggling color background shape loaded from SVG asset file with Layout Transition */}
          <motion.div
            layoutId={`badge-${memberTR.id}`}
            transition={springTransition}
            style={getStopMotionStyle(1)}
            className={`absolute ${memberTR.satInset} z-0`}
          >
            <img
              src={`/assets/team/badges/${memberTR.badgeFile}`}
              alt={`${memberTR.name} badge`}
              className="w-full h-full object-contain filter drop-shadow-md"
            />
          </motion.div>
          {/* Raw transparent PNG portrait overflowing the shape with Layout Transition */}
          <motion.div
            layoutId={`portrait-${memberTR.id}`}
            transition={springTransition}
            className={`absolute ${memberTR.satHeadInset} z-10 pointer-events-none`}
          >
            <MemberPortrait
              id={memberTR.id}
              alt={memberTR.name}
              className="w-full h-full object-contain filter grayscale contrast-110 brightness-105 transition-all duration-300 group-hover:grayscale-0 group-hover:scale-105"
            />
          </motion.div>
        </div>

        {/* SATELLITE 3: Bottom-Left (BL, Position index 3) */}
        <div
          onClick={() => handleSelect(memberBL.id)}
          className="absolute left-[4%] bottom-[8%] sm:left-[6%] sm:bottom-[6%] z-10 w-20 h-20 sm:w-24 sm:h-24 md:w-28 md:h-28 flex items-center justify-center cursor-pointer active:scale-95 transition-transform duration-200 group"
        >
          {/* Jiggling color background shape loaded from SVG asset file with Layout Transition */}
          <motion.div
            layoutId={`badge-${memberBL.id}`}
            transition={springTransition}
            style={getStopMotionStyle(2)}
            className={`absolute ${memberBL.satInset} z-0`}
          >
            <img
              src={`/assets/team/badges/${memberBL.badgeFile}`}
              alt={`${memberBL.name} badge`}
              className="w-full h-full object-contain filter drop-shadow-md"
            />
          </motion.div>
          {/* Raw transparent PNG portrait overflowing the shape with Layout Transition */}
          <motion.div
            layoutId={`portrait-${memberBL.id}`}
            transition={springTransition}
            className={`absolute ${memberBL.satHeadInset} z-10 pointer-events-none`}
          >
            <MemberPortrait
              id={memberBL.id}
              alt={memberBL.name}
              className="w-full h-full object-contain filter grayscale contrast-110 brightness-105 transition-all duration-300 group-hover:grayscale-0 group-hover:scale-105"
            />
          </motion.div>
        </div>

        {/* SATELLITE 4: Bottom-Right (BR, Position index 4) */}
        <div
          onClick={() => handleSelect(memberBR.id)}
          className="absolute right-[4%] bottom-[8%] sm:right-[6%] sm:bottom-[6%] z-10 w-20 h-20 sm:w-24 sm:h-24 md:w-28 md:h-28 flex items-center justify-center cursor-pointer active:scale-95 transition-transform duration-200 group"
        >
          {/* Jiggling color background shape loaded from SVG asset file with Layout Transition */}
          <motion.div
            layoutId={`badge-${memberBR.id}`}
            transition={springTransition}
            style={getStopMotionStyle(3)}
            className={`absolute ${memberBR.satInset} z-0`}
          >
            <img
              src={`/assets/team/badges/${memberBR.badgeFile}`}
              alt={`${memberBR.name} badge`}
              className="w-full h-full object-contain filter drop-shadow-md"
            />
          </motion.div>
          {/* Raw transparent PNG portrait overflowing the shape with Layout Transition */}
          <motion.div
            layoutId={`portrait-${memberBR.id}`}
            transition={springTransition}
            className={`absolute ${memberBR.satHeadInset} z-10 pointer-events-none`}
          >
            <MemberPortrait
              id={memberBR.id}
              alt={memberBR.name}
              className="w-full h-full object-contain filter grayscale contrast-110 brightness-105 transition-all duration-300 group-hover:grayscale-0 group-hover:scale-105"
            />
          </motion.div>
        </div>

        {/* CENTRAL PORTRAIT CONTAINER: Selected active member with larger portrait */}
        <div className="relative w-36 h-36 sm:w-44 sm:h-44 md:w-56 md:h-56 z-20 flex items-center justify-center">
          
          {/* Jiggling large background shape loaded from SVG asset file with Layout Transition */}
          <motion.div
            layoutId={`badge-${activeMember.id}`}
            transition={springTransition}
            style={getStopMotionStyle(4)}
            className={`absolute ${activeMember.cntInset} z-0`}
          >
            <img
              src={`/assets/team/badges/${activeMember.badgeFile}`}
              alt={`${activeMember.name} badge`}
              className="w-full h-full object-contain filter drop-shadow-xl"
            />
          </motion.div>

          {/* Central Black & White portrait with Layout Transition (Jiggling alternating rotation, overflows shape barely, no outline, no clipping) */}
          <motion.div
            layoutId={`portrait-${activeMember.id}`}
            transition={springTransition}
            style={{
              transform: `rotate(${jiggleRotation}deg)`,
              transition: 'transform 0.1s step-end' // fast stop-motion switch
            }}
            className={`absolute ${activeMember.cntHeadInset} z-10 pointer-events-none`}
          >
            <MemberPortrait
              id={activeMember.id}
              alt={activeMember.name}
              className="w-full h-full object-contain filter grayscale contrast-115 brightness-110 scale-102"
            />
          </motion.div>

          {/* DYNAMIC HANDWRITTEN ANNOTATIONS & ARROWS */}
          <AnimatePresence mode="wait">
            <motion.div
              key={activeMember.id}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ duration: 0.25 }}
              className="absolute inset-0 pointer-events-none"
            >
              {/* Left Role Label */}
              <div className={activeMember.roles[0].positionClass}>
                <div className="flex items-center gap-1.5 md:gap-3">
                  <span
                    style={{ color: activeMember.color }}
                    className="font-caveat text-xl sm:text-2xl md:text-3xl font-extrabold whitespace-nowrap tracking-wide select-none drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]"
                  >
                    {activeMember.roles[0].label}
                  </span>
                  
                  {/* Handwritten arrow pointing leftward */}
                  <svg
                    width="45"
                    height="30"
                    viewBox="0 0 60 40"
                    fill="none"
                    stroke={activeMember.color}
                    strokeWidth="3.5"
                    strokeLinecap="round"
                    className={`${activeMember.roles[0].arrowClass} w-9 h-6 md:w-[45px] md:h-[30px]`}
                  >
                    <path d="M10,10 Q35,5 50,30" />
                    <path d="M38,28 L50,30 L48,18" />
                  </svg>
                </div>
              </div>

              {/* Right Role Label */}
              <div className={activeMember.roles[1].positionClass}>
                <div className="flex items-center gap-1.5 md:gap-3">
                  {/* Handwritten arrow pointing rightward */}
                  <svg
                    width="45"
                    height="30"
                    viewBox="0 0 60 40"
                    fill="none"
                    stroke={activeMember.color}
                    strokeWidth="3.5"
                    strokeLinecap="round"
                    className={`${activeMember.roles[1].arrowClass} w-9 h-6 md:w-[45px] md:h-[30px]`}
                  >
                    <path d="M10,10 Q35,5 50,30" />
                    <path d="M38,28 L50,30 L48,18" />
                  </svg>
                  
                  <span
                    style={{ color: activeMember.color }}
                    className="font-caveat text-xl sm:text-2xl md:text-3xl font-extrabold whitespace-nowrap tracking-wide select-none drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]"
                  >
                    {activeMember.roles[1].label}
                  </span>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>

        </div>

      </div>

      {/* Selected Member Text Panel underneath the constellation */}
      <div className="relative z-10 w-full max-w-sm mx-auto text-center mt-12 md:mt-16">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeMember.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
            className="flex flex-col items-center"
          >
            <h3 className="font-caveat text-3xl md:text-4xl text-[#F5F5F5] font-extrabold leading-none mb-1">
              {activeMember.name}
            </h3>
            <span
              className="font-mono text-xs font-semibold uppercase tracking-widest block mb-3 text-neutral-400"
            >
              {activeMember.role}
            </span>
          </motion.div>
        </AnimatePresence>
      </div>

    </section>
  );
}

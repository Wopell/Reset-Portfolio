import React, { useRef, useState, useMemo } from 'react';
import { motion, AnimatePresence, useScroll, useTransform, useSpring } from 'motion/react';
import { useLanguage } from '../../context/LanguageContext';

export function ProjectsSection() {
  const { t } = useLanguage();
  const [activeIdx, setActiveIdx] = useState(0);
  const sectionRef = useRef<HTMLDivElement>(null);

  // Monitor scroll progress relative to viewport to compute vertical parallax translation
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"]
  });

  // Transform scroll progress to raw vertical offset (-18% to 18% shift for a much more visible parallax)
  const rawY = useTransform(scrollYProgress, [0, 1], ["-18%", "18%"]);

  // Spring with extremely light mass and ultra-high stiffness for instant snap-to-stop (0.05s / 2 frames settle)
  const y = useSpring(rawY, {
    stiffness: 1000, // extremely stiff for instant snap
    damping: 55,     // critically damped to settle in 2 frames
    mass: 0.05       // ultra-light mass for zero lag
  });

  const projects = useMemo(() => [
    {
      num: "01",
      badge: "EXPERIMENTAL CHAOS",
      titleLine1: "TRASH",
      titleLine2: "POLKA",
      titleHighlight: "ARCHIVE",
      desc: t('project01Desc'),
      bgImage: "/assets/Referencias/Ilustracion (1).jpg",
      stickerImage: "/assets/Referencias/Ilustracion (2).jpg",
      highlightColor: "#df4581", // fuchsia
      badgeBorder: "#df4581"
    },
    {
      num: "02",
      badge: "3D DESIGN & LOOKDEV",
      titleLine1: "CYBERNETIC",
      titleLine2: "LOOKDEV",
      titleHighlight: "SIMULATIONS",
      desc: t('project02Desc'),
      bgImage: "/assets/Referencias/3D (1).jpg",
      stickerImage: "/assets/Referencias/3D (2).png",
      highlightColor: "#359df6", // electric blue
      badgeBorder: "#df4581"
    },
    {
      num: "03",
      badge: "INTEGRATED CAMPAIGN",
      titleLine1: "INTEGRATED",
      titleLine2: "BRAND",
      titleHighlight: "CAMPAIGN",
      desc: t('project03Desc'),
      bgImage: "/assets/Referencias/Campaña (1).png",
      stickerImage: "/assets/Referencias/Manifiesto.png",
      highlightColor: "#25e22e", // neon green
      badgeBorder: "#df4581"
    },
    {
      num: "04",
      badge: "MOTION GRAPHICS & IA",
      titleLine1: "MOTION",
      titleLine2: "DESIGN",
      titleHighlight: "REEL",
      desc: t('project04Desc'),
      bgImage: "/assets/Referencias/Reel.png",
      stickerImage: "/assets/Referencias/3D (3).png",
      highlightColor: "#ffe806", // neon yellow
      badgeBorder: "#df4581"
    }
  ], [t]);

  const handleNext = () => {
    setActiveIdx((prev) => (prev + 1) % projects.length);
  };

  const handlePrev = () => {
    setActiveIdx((prev) => (prev - 1 + projects.length) % projects.length);
  };

  // Touch Swipe Handlers for Mobile
  const touchStartX = useRef(0);
  const touchEndX = useRef(0);

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.targetTouches[0].clientX;
    touchEndX.current = e.targetTouches[0].clientX;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    touchEndX.current = e.targetTouches[0].clientX;
  };

  const handleTouchEnd = () => {
    const diff = touchStartX.current - touchEndX.current;
    if (diff > 50) {
      handleNext();
    } else if (diff < -50) {
      handlePrev();
    }
  };

  // Generate deterministic ripped paper path: wavy organic landscape (valley at x=200, peak at x=750)
  const paths = useMemo(() => {
    const linePoints: string[] = [];
    const clipPoints: string[] = [];
    const steps = 150; // 150 points is perfect for performance and smooth clipping

    for (let i = 0; i <= steps; i++) {
      const x = (i / steps) * 1000;
      const xPct = (i / steps) * 100;
      
      // Wavy landscape base height: valley at x=200 (Y=100), peak at x=750 (Y=25)
      const baseY = 62.5 + 32.5 * Math.sin(-0.0057 * x + 2.71) + 6.0 * Math.sin(x * 0.015);

      // Multi-frequency wave noise for organic paper tear crop look
      const noise =
        2.0 * Math.sin(x * 0.12) +
        1.0 * Math.cos(x * 0.28) +
        0.4 * Math.sin(x * 0.65) +
        0.18 * Math.cos(x * 1.5);

      const y = baseY + noise;
      linePoints.push(`${x.toFixed(1)},${y.toFixed(1)}`);
      
      const offsetFromBottom = 120 - y;
      clipPoints.push(`${xPct.toFixed(2)}% calc(100% - ${offsetFromBottom.toFixed(1)}px)`);
    }

    const lineD = `M ${linePoints.join(' L ')}`;
    const clipPolygon = `polygon(0% 75px, 20% 0%, 100% 0%, ${[...clipPoints].reverse().join(', ')})`;

    return { lineD, clipPolygon };
  }, []);

  return (
    <section
      id="projects"
      ref={sectionRef}
      className="relative w-full h-screen bg-transparent overflow-hidden select-none -mt-[95px]"
    >
      {/* Background Wrapper with ClipPath at z-[6] */}
      <div 
        style={{
          clipPath: paths.clipPolygon,
          WebkitClipPath: paths.clipPolygon
        }}
        className="absolute inset-0 pointer-events-none z-[6]"
      >
        {/* Black background layer */}
        <div className="absolute inset-0 bg-black pointer-events-none" />

        {/* Full-Screen Background Image Layer with Parallax Y offset & Cross-fade transition */}
        <div className="absolute inset-0 w-full h-full pointer-events-none overflow-hidden">
          <AnimatePresence mode="popLayout">
            <motion.img
              key={activeIdx}
              src={projects[activeIdx].bgImage}
              style={{ y }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.8, ease: "easeInOut" }}
              className="absolute -top-[18%] left-0 w-full h-[136%] object-cover filter grayscale contrast-[1.15] brightness-[0.35]"
            />
          </AnimatePresence>
        </div>

        {/* Background Halftone Overlay Grid */}
        <div className="absolute inset-0 bg-[radial-gradient(#ffffff02_1px,transparent_1px)] [background-size:24px_24px] pointer-events-none" />
      </div>

      {/* Content Wrapper with ClipPath and z-[7] */}
      <div
        style={{
          clipPath: paths.clipPolygon,
          WebkitClipPath: paths.clipPolygon
        }}
        className="absolute inset-0 z-[7] flex flex-col justify-between p-6 md:p-12 pt-[120px] md:pt-[140px]"
      >
        {/* VERTICAL SIDE NAVIGATION PANEL: Left sidebar previous arrow with visual glassmorphic backing circle */}
        <button
          onClick={handlePrev}
          className="absolute left-0 top-0 bottom-0 w-20 md:w-32 z-30 flex items-center justify-center bg-black/0 group cursor-pointer"
          aria-label="Previous project"
        >
          <div className="w-14 h-14 md:w-20 md:h-20 rounded-full bg-white/[0.07] backdrop-blur-md border border-white/10 flex items-center justify-center shadow-2xl transition-all duration-300 group-hover:border-[#df4581]/50 group-hover:bg-[#df4581]/15 group-hover:scale-110">
            {/* Crisp solid left triangle SVG */}
            <svg
              className="w-5 h-5 md:w-8 md:h-8 text-white transition-colors duration-300 group-hover:text-[#df4581]"
              viewBox="0 0 24 24"
              fill="currentColor"
            >
              <path d="M14 6l-6 6 6 6V6z" />
            </svg>
          </div>
        </button>

        {/* VERTICAL SIDE NAVIGATION PANEL: Right sidebar next arrow with visual glassmorphic backing circle */}
        <button
          onClick={handleNext}
          className="absolute right-0 top-0 bottom-0 w-20 md:w-32 z-30 flex items-center justify-center bg-black/0 group cursor-pointer"
          aria-label="Next project"
        >
          <div className="w-14 h-14 md:w-20 md:h-20 rounded-full bg-white/[0.07] backdrop-blur-md border border-white/10 flex items-center justify-center shadow-2xl transition-all duration-300 group-hover:border-[#df4581]/50 group-hover:bg-[#df4581]/15 group-hover:scale-110">
            {/* Crisp solid right triangle SVG */}
            <svg
              className="w-5 h-5 md:w-8 md:h-8 text-white transition-colors duration-300 group-hover:text-[#df4581]"
              viewBox="0 0 24 24"
              fill="currentColor"
            >
              <path d="M10 6l6 6-6 6V6z" />
            </svg>
          </div>
        </button>

        {/* TOP ROW: Header Navigation & Sticky-Note Description card on top-right (padded to avoid arrow sidebars) */}
        <div className="relative w-full flex justify-between items-start z-20 px-12 md:px-20">
          <div className="flex flex-col items-start pt-4">
            <span className="font-mono text-xs text-neutral-500 tracking-widest uppercase">
              RESET / WORK
            </span>
          </div>

          {/* Yellow Sticky Note Card (moved to top-right) */}
          <div className="w-64 sm:w-80">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeIdx}
                initial={{ opacity: 0, y: -20, rotate: -3 }}
                animate={{ opacity: 1, y: 0, rotate: 2 }}
                exit={{ opacity: 0, y: 20, rotate: 5 }}
                transition={{ duration: 0.5, ease: "easeOut" }}
                className="w-full bg-[#fdf0a6] text-[#111111] p-5 shadow-2xl rounded-xs font-sans text-xs md:text-sm font-medium border-t-2 border-[#fcd535] relative"
              >
                <p className="leading-relaxed">
                  {projects[activeIdx].desc}
                </p>
                <div className="absolute bottom-2 right-4 text-[10px] font-caveat text-neutral-500 opacity-60">
                  reset studio
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>

        {/* MIDDLE ROW: Centered but expanded (max-w-[85rem]) to push text closer to the left arrow */}
        <div className="relative w-full flex-grow flex items-center justify-center z-20 px-16 md:px-24">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-12 lg:gap-20 max-w-[85rem] w-full">
            
            {/* Left Side: Badge & Large display Title (pushed closer to left arrow) */}
            <div className="flex flex-col items-start text-left w-full lg:w-1/2">
              <div 
                style={{ borderColor: projects[activeIdx].badgeBorder }}
                className="border px-3 py-1 mb-6 rounded-full"
              >
                <span className="font-mono text-[9px] md:text-[10px] tracking-wider text-neutral-400 uppercase">
                  {projects[activeIdx].badge}
                </span>
              </div>
              
              <h2 className="font-display font-black text-6xl md:text-8xl tracking-tight text-white leading-none">
                {projects[activeIdx].titleLine1} <br />
                {projects[activeIdx].titleLine2} <br />
                <span
                  style={{
                    backgroundColor: projects[activeIdx].highlightColor,
                    color: '#000000'
                  }}
                  className="inline-block px-3 py-1 mt-2"
                >
                  {projects[activeIdx].titleHighlight}
                </span>
              </h2>
            </div>

            {/* Right Side: Draggable Floating Rotated Sticker */}
            <div className="relative flex justify-center items-center">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeIdx}
                  drag
                  dragConstraints={sectionRef}
                  dragElastic={0.1}
                  whileDrag={{ scale: 1.05, cursor: 'grabbing', zIndex: 50 }}
                  initial={{ opacity: 0, x: 50, rotate: 10, scale: 0.9 }}
                  animate={{ opacity: 1, x: 0, rotate: -5, scale: 1 }}
                  exit={{ opacity: 0, x: -50, rotate: -15, scale: 0.9 }}
                  transition={{ duration: 0.6, ease: "easeOut" }}
                  className="w-36 h-48 md:w-40 md:h-52 bg-[#111111] p-2.5 border border-neutral-800 shadow-2xl rounded-sm flex flex-col justify-between cursor-grab active:cursor-grabbing select-none relative z-20"
                >
                  <div className="w-full h-[82%] bg-neutral-950 overflow-hidden relative rounded-xs pointer-events-none">
                    <img
                      src={projects[activeIdx].stickerImage}
                      className="w-full h-full object-cover"
                      alt="Project collage asset"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent pointer-events-none" />
                  </div>
                  
                  <div className="w-full h-[18%] flex items-center justify-center pointer-events-none">
                    {/* Colored adhesive tape representation */}
                    <div
                      style={{ backgroundColor: projects[activeIdx].highlightColor }}
                      className="w-14 h-1 rounded-full opacity-80"
                    />
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>

          </div>
        </div>

        {/* BOTTOM ROW: Center Dots Slide Indicators (positioned above the wavy 95px paper cut boundary) */}
        <div className="absolute bottom-28 md:bottom-[115px] left-1/2 -translate-x-1/2 flex items-center gap-3.5 px-4 py-2 bg-black/40 backdrop-blur-md border border-neutral-800 rounded-full shadow-lg z-20">
          {projects.map((proj, idx) => (
            <button
              key={idx}
              onClick={() => setActiveIdx(idx)}
              style={{
                backgroundColor: idx === activeIdx ? proj.highlightColor : 'transparent',
                borderColor: idx === activeIdx ? proj.highlightColor : '#525252'
              }}
              className={`w-3 h-3 rounded-full border transition-all duration-300 cursor-pointer ${
                idx === activeIdx ? 'scale-110 shadow-md' : 'hover:border-neutral-400'
              }`}
              aria-label={`Go to slide ${idx + 1}`}
            />
          ))}
        </div>
      </div>

      {/* Visual Torn Paper (Paper Crop) slanted bottom mask overlay for transition to TeamSection */}
      <svg
        viewBox="0 0 1000 120"
        preserveAspectRatio="none"
        className="absolute bottom-0 left-0 w-full h-[120px] z-[8] pointer-events-none"
      >
        {/* Layer 1: White torn paper fiber edge (doubled in thickness) */}
        <path d={paths.lineD} fill="none" stroke="#FFFFFF" strokeWidth="11.0" />
        
        {/* Layer 2: Darker grey inner shadow fiber (scaled accordingly) */}
        <path d={paths.lineD} fill="none" stroke="#CCCCCC" strokeWidth="4.0" />
      </svg>
    </section>
  );
}

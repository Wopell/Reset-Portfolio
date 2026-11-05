import React, { ReactNode, useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, useMotionValue, useSpring, useScroll, useTransform, useVelocity } from 'motion/react';
import { useLanguage } from '../../context/LanguageContext';
import { InteractiveLogo } from '../InteractiveLogo';

export function RippedPaperLabel({ children, className = "", rotation = 2.5 }: { children: ReactNode; className?: string; rotation?: number }) {
  // A jagged polygon clip path representing highly authentic torn/ripped paper edges
  const clipPath = "polygon(2% 4%, 96% 2%, 99% 12%, 97% 28%, 99% 45%, 97% 68%, 99% 89%, 96% 97%, 82% 95%, 62% 98%, 44% 95%, 22% 97%, 3% 94%, 1% 75%, 4% 50%, 1% 25%)";
  
  return (
    <div className={`relative ${className}`} style={{ transform: `rotate(${rotation}deg)` }}>
      {/* Dynamic dual-layer paper shadow matching the torn profile */}
      <div 
        className="absolute inset-0 bg-[#000000] opacity-85 translate-x-[4px] translate-y-[5px] pointer-events-none"
        style={{ clipPath }}
      />
      {/* Main off-white paper body */}
      <div 
        className="relative bg-[#f6f6f0] text-[#0D0D0D] px-6 py-4 border border-neutral-300/20 shadow-md"
        style={{ clipPath }}
      >
        {children}
      </div>
    </div>
  );
}

interface HeroSectionProps {
  onOpenReel: () => void;
}

export function HeroSection({ onOpenReel }: HeroSectionProps) {
  const { lang, setLang, t } = useLanguage();
  const [showLens, setShowLens] = useState(false);
  const [isReelHovering, setIsReelHovering] = useState(false);
  const containerRef = useRef(null);
  const mouseX = useMotionValue(-9999);
  const mouseY = useMotionValue(-9999);
  const hoverTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Scroll position mapping to a beautiful spring lag effect
  // When scrolling DOWN (scrollY increases, page moves up), we want the preview to stay UP (negative Y offset) and then catch up
  // When scrolling UP (scrollY decreases, page moves down), we want the preview to stay DOWN (positive Y offset) and then catch up
  const { scrollY } = useScroll();
  const scrollVelocity = useVelocity(scrollY);
  // Map scroll velocity directly to scroll lag displacement. Faster scroll = larger displacement.
  // When velocity is positive (scrolling down), offset is negative (drifts upwards, lagging behind)
  const velocityOffset = useTransform(scrollVelocity, [-4000, 4000], [70, -70]);
  // Use a soft, high-mass spring to make the catch-up return feel ultra-smooth and floaty
  const parallaxOffset = useSpring(velocityOffset, { damping: 18, stiffness: 60, mass: 1.4 });

  // Cleanup hover timeout on unmount
  useEffect(() => {
    return () => {
      if (hoverTimeoutRef.current) {
        clearTimeout(hoverTimeoutRef.current);
      }
    };
  }, []);

  // Smooth spring physics for organic cursor tracking
  const springConfig = { damping: 40, stiffness: 220, mass: 0.5 };
  const smoothX = useSpring(mouseX, springConfig);
  const smoothY = useSpring(mouseY, springConfig);



  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    mouseX.set(e.clientX - rect.left);
    mouseY.set(e.clientY - rect.top);
    if (!showLens) setShowLens(true);
  };

  const handleMouseLeave = () => {
    setShowLens(false);
  };

  return (
    <section
      ref={containerRef}
      id="hero"
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className="relative min-h-[140vh] w-full flex flex-col justify-between overflow-hidden paper-noise-bg bg-transparent text-[#F5F5F5] select-none"
    >
      {/* Black background layer at z-0 */}
      <div className="absolute inset-0 bg-black z-0 pointer-events-none" />

      {/* Hand-drawn SVG filters for authentic dry-brush and sketchy pencil look */}
      <svg style={{ position: 'absolute', width: 0, height: 0, pointerEvents: 'none' }} aria-hidden="true">
        <defs>
          <filter id="highlighter-brush" x="-20%" y="-20%" width="140%" height="140%">
            {/* Generate medium-sized structural waving noise */}
            <feTurbulence type="fractalNoise" baseFrequency="0.03 0.08" numOctaves="3" result="waveNoise" />
            <feDisplacementMap in="SourceGraphic" in2="waveNoise" scale="8" xChannelSelector="R" yChannelSelector="G" result="displaced" />
            {/* Generate high-frequency bristle edge noise */}
            <feTurbulence type="fractalNoise" baseFrequency="0.15 0.35" numOctaves="2" result="fineNoise" />
            <feDisplacementMap in="displaced" in2="fineNoise" scale="3" xChannelSelector="R" yChannelSelector="G" />
          </filter>
          <filter id="sketchy-pencil" x="-10%" y="-10%" width="120%" height="120%">
            <feTurbulence type="fractalNoise" baseFrequency="0.06" numOctaves="2" result="pencilNoise" />
            <feDisplacementMap in="SourceGraphic" in2="pencilNoise" scale="2" xChannelSelector="R" yChannelSelector="G" />
          </filter>
        </defs>
      </svg>

      {/* Dynamic Frosted Lens Blur Overlay tracking the cursor */}
      <motion.div
        className="absolute pointer-events-none rounded-full z-25"
        style={{
          width: 320,
          height: 320,
          left: smoothX,
          top: smoothY,
          translateX: '-50%',
          translateY: '-50%',
          backdropFilter: 'blur(8px)',
          WebkitBackdropFilter: 'blur(8px)',
          maskImage: 'radial-gradient(circle, rgba(0,0,0,1) 0%, rgba(0,0,0,0) 70%)',
          WebkitMaskImage: 'radial-gradient(circle, rgba(0,0,0,1) 0%, rgba(0,0,0,0) 70%)',
          opacity: showLens ? 0.95 : 0,
          transition: 'opacity 0.4s ease-out'
        }}
      />

      {/* Navbar */}
      <motion.nav
        initial={{ opacity: 0, y: -20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: false }}
        transition={{ duration: 0.6, ease: [0.25, 0.1, 0.25, 1] }}
        className="relative z-50 flex justify-between items-center w-full px-6 md:px-10 pt-6 md:pt-8"
      >
        {/* Left Logo */}
        <InteractiveLogo className="w-[125px] sm:w-[145px] md:w-[160px] shadow-lg transition-all duration-300 hover:scale-[1.03]" />

        {/* Right Menu */}
        <div className="flex items-center gap-4 sm:gap-6 md:gap-10">
          <div className="flex items-center gap-2 sm:gap-4 md:gap-6">
            <NavLink href="#studio" type="ellipse">{t('studio')}</NavLink>
            <NavLink href="#proyectos" type="ellipse">{t('projects')}</NavLink>
            <NavLink href="#team" type="ellipse">{t('team')}</NavLink>
            <NavLink href="#contacto" type="ellipse">{t('contact')}</NavLink>
          </div>

          {/* Language Toggle */}
          <div className="flex items-center">
            <button
              onClick={() => setLang(lang === 'es' ? 'en' : 'es')}
              className="relative flex items-center justify-center p-1 rounded-full border border-[#b6e82f] bg-transparent text-[#b6e82f] text-xs font-bold uppercase transition-all duration-300 cursor-pointer overflow-hidden group select-none"
              data-hover-expand
            >
              <span className={`px-2.5 py-1 rounded-full transition-all duration-300 ${lang === 'es' ? 'bg-[#b6e82f] text-[#0D0D0D]' : 'text-[#b6e82f]'}`}>ES</span>
              <span className={`px-2.5 py-1 rounded-full transition-all duration-300 ${lang === 'en' ? 'bg-[#b6e82f] text-[#0D0D0D]' : 'text-[#b6e82f]'}`}>EN</span>
            </button>
          </div>
        </div>
      </motion.nav>

      {/* Hero Heading and Tagline Container - Lowered and enlarged to match the splines */}
      <div className="relative z-20 flex flex-col justify-end flex-grow pl-6 pr-6 md:pl-12 lg:pl-16 pb-[15vh] pt-[10vh]">
        <div 
          className="max-w-max relative pl-[0.3em] pr-[0.1em]"
          style={{ fontSize: 'clamp(2.5rem, 11.8vw, 12.5rem)', lineHeight: '0.88' }}
        >
          {/* Decorative Green Brushstrokes (Radial burst fanning outward from a single point closer to the left edge, positioned beautifully behind the text) */}
          <div 
            className="absolute pointer-events-none z-10"
            style={{
              left: '-0.15em',
              top: '0.75em',
              width: 0,
              height: 0,
            }}
          >
            {/* 1. First stroke: 85° Cartesian (-85° CSS) - Slightly longer as it goes almost straight up */}
            <div 
              className="absolute text-[#b6e82f]"
              style={{
                width: '0.92em',
                height: '0.27em',
                top: '-0.135em',
                left: 0,
                transformOrigin: '0% 50%',
                transform: 'rotate(-85deg) translateX(0.36em)',
              }}
            >
              <svg viewBox="0 0 120 30" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full spline-boil-anim" style={{ filter: 'url(#highlighter-brush)' }}>
                {/* Spline 1 - Main Core */}
                <motion.path
                  d="M10,15 C45,11 75,18 110,13"
                  stroke="currentColor"
                  strokeWidth="18"
                  strokeLinecap="round"
                  initial={{ pathLength: 0, opacity: 0 }}
                  whileInView={{ pathLength: 1, opacity: 0.85 }}
                  viewport={{ once: false }}
                  transition={{ delay: 0.5, duration: 0.6, ease: "easeOut" }}
                />
                {/* Spline 2 - Secondary Offset */}
                <motion.path
                  d="M14,11 C47,8 72,15 106,10"
                  stroke="currentColor"
                  strokeWidth="6"
                  strokeLinecap="round"
                  initial={{ pathLength: 0, opacity: 0 }}
                  whileInView={{ pathLength: 1, opacity: 0.6 }}
                  viewport={{ once: false }}
                  transition={{ delay: 0.53, duration: 0.55, ease: "easeOut" }}
                />
                {/* Spline 3 - Dry-Brush Edge Bristle */}
                <motion.path
                  d="M8,18 C43,14 77,21 112,16"
                  stroke="currentColor"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeDasharray="15 10 5 15"
                  initial={{ pathLength: 0, opacity: 0 }}
                  whileInView={{ pathLength: 1, opacity: 0.5 }}
                  viewport={{ once: false }}
                  transition={{ delay: 0.56, duration: 0.5, ease: "easeOut" }}
                />
              </svg>
            </div>

            {/* 2. Second stroke: 35° Cartesian (-35° CSS) - Tailored length to fan near the 'E' without overlap */}
            <div 
              className="absolute text-[#b6e82f]"
              style={{
                width: '0.82em',
                height: '0.27em',
                top: '-0.135em',
                left: 0,
                transformOrigin: '0% 50%',
                transform: 'rotate(-35deg) translateX(0.36em)',
              }}
            >
              <svg viewBox="0 0 120 30" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full spline-boil-anim" style={{ filter: 'url(#highlighter-brush)' }}>
                {/* Spline 1 - Main Core */}
                <motion.path
                  d="M10,15 C45,11 75,18 110,13"
                  stroke="currentColor"
                  strokeWidth="18"
                  strokeLinecap="round"
                  initial={{ pathLength: 0, opacity: 0 }}
                  whileInView={{ pathLength: 1, opacity: 0.85 }}
                  viewport={{ once: false }}
                  transition={{ delay: 0.62, duration: 0.6, ease: "easeOut" }}
                />
                {/* Spline 2 - Secondary Offset */}
                <motion.path
                  d="M14,11 C47,8 72,15 106,10"
                  stroke="currentColor"
                  strokeWidth="6"
                  strokeLinecap="round"
                  initial={{ pathLength: 0, opacity: 0 }}
                  whileInView={{ pathLength: 1, opacity: 0.6 }}
                  viewport={{ once: false }}
                  transition={{ delay: 0.65, duration: 0.55, ease: "easeOut" }}
                />
                {/* Spline 3 - Dry-Brush Edge Bristle */}
                <motion.path
                  d="M8,18 C43,14 77,21 112,16"
                  stroke="currentColor"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeDasharray="15 10 5 15"
                  initial={{ pathLength: 0, opacity: 0 }}
                  whileInView={{ pathLength: 1, opacity: 0.5 }}
                  viewport={{ once: false }}
                  transition={{ delay: 0.68, duration: 0.5, ease: "easeOut" }}
                />
              </svg>
            </div>

            {/* 3. Third stroke: 0° Cartesian (0° CSS) - Sized perfectly to end right before 'ELEGIMOS' begins */}
            <div 
              className="absolute text-[#b6e82f]"
              style={{
                width: '0.78em',
                height: '0.27em',
                top: '-0.135em',
                left: 0,
                transformOrigin: '0% 50%',
                transform: 'rotate(0deg) translateX(0.36em)',
              }}
            >
              <svg viewBox="0 0 120 30" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full spline-boil-anim" style={{ filter: 'url(#highlighter-brush)' }}>
                {/* Spline 1 - Main Core */}
                <motion.path
                  d="M10,15 C45,11 75,18 110,13"
                  stroke="currentColor"
                  strokeWidth="18"
                  strokeLinecap="round"
                  initial={{ pathLength: 0, opacity: 0 }}
                  whileInView={{ pathLength: 1, opacity: 0.85 }}
                  viewport={{ once: false }}
                  transition={{ delay: 0.74, duration: 0.6, ease: "easeOut" }}
                />
                {/* Spline 2 - Secondary Offset */}
                <motion.path
                  d="M14,11 C47,8 72,15 106,10"
                  stroke="currentColor"
                  strokeWidth="6"
                  strokeLinecap="round"
                  initial={{ pathLength: 0, opacity: 0 }}
                  whileInView={{ pathLength: 1, opacity: 0.6 }}
                  viewport={{ once: false }}
                  transition={{ delay: 0.77, duration: 0.55, ease: "easeOut" }}
                />
                {/* Spline 3 - Dry-Brush Edge Bristle */}
                <motion.path
                  d="M8,18 C43,14 77,21 112,16"
                  stroke="currentColor"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeDasharray="15 10 5 15"
                  initial={{ pathLength: 0, opacity: 0 }}
                  whileInView={{ pathLength: 1, opacity: 0.5 }}
                  viewport={{ once: false }}
                  transition={{ delay: 0.8, duration: 0.5, ease: "easeOut" }}
                />
              </svg>
            </div>

            {/* 4. Fourth stroke: 300° Cartesian (60° CSS) - Beautifully fanning out towards the lower left margin */}
            <div 
              className="absolute text-[#b6e82f]"
              style={{
                width: '0.88em',
                height: '0.27em',
                top: '-0.135em',
                left: 0,
                transformOrigin: '0% 50%',
                transform: 'rotate(60deg) translateX(0.36em)',
              }}
            >
              <svg viewBox="0 0 120 30" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full spline-boil-anim" style={{ filter: 'url(#highlighter-brush)' }}>
                {/* Spline 1 - Main Core */}
                <motion.path
                  d="M10,15 C45,11 75,18 110,13"
                  stroke="currentColor"
                  strokeWidth="18"
                  strokeLinecap="round"
                  initial={{ pathLength: 0, opacity: 0 }}
                  whileInView={{ pathLength: 1, opacity: 0.85 }}
                  viewport={{ once: false }}
                  transition={{ delay: 0.86, duration: 0.6, ease: "easeOut" }}
                />
                {/* Spline 2 - Secondary Offset */}
                <motion.path
                  d="M14,11 C47,8 72,15 106,10"
                  stroke="currentColor"
                  strokeWidth="6"
                  strokeLinecap="round"
                  initial={{ pathLength: 0, opacity: 0 }}
                  whileInView={{ pathLength: 1, opacity: 0.6 }}
                  viewport={{ once: false }}
                  transition={{ delay: 0.89, duration: 0.55, ease: "easeOut" }}
                />
                {/* Spline 3 - Dry-Brush Edge Bristle */}
                <motion.path
                  d="M8,18 C43,14 77,21 112,16"
                  stroke="currentColor"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeDasharray="15 10 5 15"
                  initial={{ pathLength: 0, opacity: 0 }}
                  whileInView={{ pathLength: 1, opacity: 0.5 }}
                  viewport={{ once: false }}
                  transition={{ delay: 0.92, duration: 0.5, ease: "easeOut" }}
                />
              </svg>
            </div>
          </div>

          {/* Line 1 (Using em padding and negative margins to prevent accent marks like É from getting cut off at large font sizes) */}
          <div className=" py-[0.12em] -my-[0.12em] mb-6 md:mb-10 relative z-20">
            <motion.h1
              initial={{ opacity: 0, y: 60 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: false, amount: 0.1 }}
              transition={{ delay: 0.1, duration: 0.7, ease: [0.25, 0.1, 0.25, 1] }}
              className="font-display font-black leading-[0.98] tracking-tighter text-[#F5F5F5] whitespace-nowrap"
            >
              <AnimatePresence mode="wait">
                <motion.span
                  key={lang}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  transition={{ duration: 0.3 }}
                >
                  {t('heroLine1')}
                </motion.span>
              </AnimatePresence>
            </motion.h1>
          </div>

          {/* Line 2 with Brand Reel Button and Pink Arrow (Wrapper is inline-block to align absolute tooltip exactly next to the arrow) */}
          <div className="relative inline-block z-20">
            <div className="overflow-hidden py-[0.12em] -my-[0.12em]">
              <motion.h1
                initial={{ opacity: 0, y: 60 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: false, amount: 0.1 }}
                transition={{ delay: 0.2, duration: 0.7, ease: [0.25, 0.1, 0.25, 1] }}
                className="font-display font-black leading-[0.98] tracking-tighter text-[#F5F5F5] whitespace-nowrap"
              >
                <button
                  onClick={onOpenReel}
                  onMouseEnter={() => {
                    if (hoverTimeoutRef.current) {
                      clearTimeout(hoverTimeoutRef.current);
                      hoverTimeoutRef.current = null;
                    }
                    setIsReelHovering(true);
                  }}
                  onMouseLeave={() => {
                    if (hoverTimeoutRef.current) {
                      clearTimeout(hoverTimeoutRef.current);
                    }
                    hoverTimeoutRef.current = setTimeout(() => {
                      setIsReelHovering(false);
                    }, 2000); // Keep preview visible for 2 seconds to notice scroll lag
                  }}
                  className="relative inline-block cursor-pointer select-none group focus:outline-none pr-[0.6em]"
                >
                  <AnimatePresence mode="wait">
                    <motion.span
                      key={lang}
                      initial={{ opacity: 0, y: 15 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -15 }}
                      transition={{ duration: 0.3 }}
                      className="inline-block transition-colors duration-300 group-hover:text-[#df4581]"
                    >
                      {t('heroLine2')}
                    </motion.span>
                  </AnimatePresence>
                  
                  {/* Custom Pink Link Arrow Icon pointing up-right ↗ (Absolutely positioned at the bottom of the box) */}
                  <motion.span
                    className="absolute bottom-0 right-0 w-[0.52em] h-[0.52em] text-[#df4581] flex items-center justify-center transition-transform duration-300 group-hover:scale-110 group-hover:translate-x-2 group-hover:-translate-y-2"
                  >
                    <svg viewBox="0 0 24 14" fill="none" stroke="currentColor" strokeWidth="3" className="w-full h-full">
                      <line x1="11" y1="13" x2="18" y2="6" />
                      <polyline points="9,6 18,6 18,15" />
                    </svg>
                  </motion.span>
                </button>
              </motion.h1>
            </div>

            {/* Video Preview Tooltip (Outside overflow-hidden, positioned relative to the inline-block wrapper) */}
            <AnimatePresence>
              {isReelHovering && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.3, x: -30, rotate: -8 }}
                  animate={{ opacity: 1, scale: 1, x: 0, rotate: 0 }}
                  exit={{ opacity: 0, scale: 0.3, x: -30, rotate: -8 }}
                  transition={{ 
                    type: "spring",
                    damping: 24,
                    stiffness: 110,
                    mass: 0.8,
                    duration: 0.7 // Longer, more premium spring motion
                  }}
                  className="absolute md:left-full md:bottom-[0.05em] md:ml-4 bottom-full left-0 mb-3 md:mb-0 pointer-events-none z-30"
                >
                  <motion.div 
                    className="relative w-[0.85em] h-[0.6em] md:w-[0.65em] md:h-[0.4em] md:min-w-[0.425em] md:min-h-[0.3em] rounded-lg overflow-hidden shadow-2xl border border-[#df4581]/30 bg-black"
                    style={{ y: parallaxOffset }}
                  >
                    <img
                      src="/assets/reel-thumbnail.png"
                      alt="Demo Reel Thumbnail"
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                      <div className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 rounded-full bg-[#df4581] flex items-center justify-center">
                        <svg viewBox="0 0 24 24" fill="currentColor" className="w-2 h-2 sm:w-2.5 sm:h-2.5 md:w-3 md:h-3 text-white ml-0.5">
                          <polygon points="5 3 19 12 5 21" />
                        </svg>
                      </div>
                    </div>
                    <div className="absolute bottom-0.5 left-0.5 text-xs text-[#b6e82f] font-bold">REEL</div>
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Tagline on sticky note (post-it) background, aligned on the right */}
        <div className="relative mt-12 md:absolute md:bottom-[3vh] lg:bottom-[4vh] md:right-12 lg:right-24 z-20 self-end md:self-auto">
          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.95, rotate: -2 }}
            whileInView={{ opacity: 1, y: 0, scale: 1, rotate: 2.5 }}
            viewport={{ once: false, amount: 0.1 }}
            transition={{ delay: 0.4, duration: 0.6, ease: [0.25, 0.1, 0.25, 1] }}
            className="relative max-w-[90vw] sm:max-w-[320px] md:max-w-[380px] p-6 bg-[#cafb42] text-[#0D0D0D] shadow-lg"
            style={{
              boxShadow: '4px 6px 20px rgba(0, 0, 0, 0.15), 0 1px 3px rgba(0, 0, 0, 0.1)'
            }}
          >
            {/* Subtle fold effect on corner */}
            <div 
              className="absolute top-0 right-0 w-0 h-0 border-l-[40px] border-b-[40px] border-l-transparent border-b-[#b6e82f] opacity-80"
              style={{ borderLeftColor: 'transparent', borderBottomColor: 'rgba(0, 0, 0, 0.08)' }}
            />
            
            <AnimatePresence mode="wait">
              <motion.span
                key={lang}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="font-sans font-black text-sm sm:text-base md:text-lg tracking-wide uppercase block text-center leading-relaxed relative z-10"
              >
                {t('tagline')}
              </motion.span>
            </AnimatePresence>
          </motion.div>
        </div>
      </div>

      {/* Fullscreen Video Overlay is now rendered in App.tsx */}

    </section>
  );
}

interface NavLinkProps {
  href: string;
  children: ReactNode;
  type?: 'ellipse' | 'line';
}


function NavLink({ href, children, type = 'ellipse' }: NavLinkProps) {
  return (
    <motion.a
      href={href}
      className="relative text-xs sm:text-sm md:text-base lowercase font-bold tracking-wider text-[#F5F5F5] py-1 px-3 block select-none group"
      initial="initial"
      whileHover="hover"
      data-hover-expand
    >
      <span className="relative z-10 transition-colors duration-300 group-hover:text-[#b6e82f]">{children}</span>
      
      {type === 'ellipse' ? (
        /* Animated sketchy ellipse SVG overlay - Double layered loop with sketchy pencil filter */
        <svg
          className="absolute inset-x-[-12px] inset-y-[-6px] w-[calc(100%+24px)] h-[calc(100%+12px)] pointer-events-none"
          viewBox="0 0 100 40"
          preserveAspectRatio="none"
          style={{ filter: 'url(#sketchy-pencil)' }}
        >
          {/* First loop */}
          <motion.path
            d="M 6,21 C 5,6 93,5 94,19 C 95,33 7,34 9,22"
            stroke="#b6e82f"
            strokeWidth="1.8"
            strokeLinecap="round"
            fill="transparent"
            variants={{
              initial: { pathLength: 0, opacity: 0 },
              hover: { pathLength: 1.05, opacity: 0.95 }
            }}
            transition={{ duration: 0.42, ease: 'easeOut' }}
          />
          {/* Second overlapping loop for authentic sketchy outline */}
          <motion.path
            d="M 8,18 C 7,8 95,7 93,21 C 91,35 5,32 7,17"
            stroke="#b6e82f"
            strokeWidth="1.2"
            strokeLinecap="round"
            fill="transparent"
            variants={{
              initial: { pathLength: 0, opacity: 0 },
              hover: { pathLength: 1.05, opacity: 0.75 }
            }}
            transition={{ duration: 0.48, delay: 0.05, ease: 'easeOut' }}
          />
        </svg>
      ) : (
        /* Animated hand-drawn highlighter line straight through/under text */
        <svg
          className="absolute inset-x-[-6px] top-1/2 -translate-y-[2px] w-[calc(100%+12px)] h-2 pointer-events-none"
          viewBox="0 0 100 10"
          preserveAspectRatio="none"
        >
          <motion.path
            d="M 2,5 Q 50,3 98,5"
            stroke="#b6e82f"
            strokeWidth="3.5"
            strokeLinecap="round"
            fill="transparent"
            variants={{
              initial: { pathLength: 0, opacity: 0 },
              hover: { pathLength: 1, opacity: 1 }
            }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
          />
        </svg>
      )}
    </motion.a>
  );
}

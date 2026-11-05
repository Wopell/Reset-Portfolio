import { useState, useEffect, useRef } from 'react';
import { useScroll, useMotionValueEvent, motion, AnimatePresence, useSpring, useMotionValue, useTransform, animate } from 'motion/react';
import { LanguageProvider } from './context/LanguageContext';
import { CustomCursor } from './components/CustomCursor';
import { HeroSection } from './components/sections/HeroSection';
import { StudioSection } from './components/sections/StudioSection';
import { PhysicsSection } from './components/sections/PhysicsSection';
import { ProjectsSection } from './components/sections/ProjectsSection';
import { TeamSection } from './components/sections/TeamSection';
import { ContactSection } from './components/sections/ContactSection';

export default function App() {
  const [showWatermark, setShowWatermark] = useState(false);
  const [isSecretSectionOpen, setIsSecretSectionOpen] = useState(false);
  const isSecretSectionOpenRef = useRef(false);
  useEffect(() => {
    isSecretSectionOpenRef.current = isSecretSectionOpen;
  }, [isSecretSectionOpen]);

  const bottomTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const secretSectionEndRef = useRef<HTMLDivElement | null>(null);
  const prevScrollYRef = useRef(0);
  const { scrollY, scrollYProgress } = useScroll();
  const lineOpacity = useTransform(scrollY, [0, 50], [0, 1]);
  const lastInteractionTimeRef = useRef(0);
  const [isReelOpen, setIsReelOpen] = useState(false);
  const [isReelLoading, setIsReelLoading] = useState(false);
  const REEL_URL = 'https://kzcblqdchoaqmuywppav.supabase.co/storage/v1/object/public/Reels/Demoreel%20lite.mp4';
  const isResettingRef = useRef(false);
  const isSnappingRef = useRef(false);
  const snapAnimationRef = useRef<any>(null);
  const snapTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const mainRef = useRef<HTMLElement | null>(null);

  // Dynamic dimensions for the full page SVG scroll guide
  const [dimensions, setDimensions] = useState({ w: 1200, h: 6000, vh: 800 });
  const [sectionOffsets, setSectionOffsets] = useState({
    physicsTop: 1920,
    physicsBottom: 2320,
    projectsBottom: 3120
  });

  // Damped spring scroll follower - tuned to be ultra-responsive and catch up in under 0.3s while retaining smooth ease-in-out properties
  const smoothScrollProgress = useSpring(scrollYProgress, { stiffness: 110, damping: 23 });

  // Triggered Trim-Path States
  const [isLineMerged, setIsLineMerged] = useState(false);

  // Merge animation progress control (0 = normal scroll mode, 1 = fully merged)
  const mergeProgress = useMotionValue(0);

  // Horizontal endpoint calculation to target the center of the "escribinos" post-it note (statically positioned)
  const finalX = dimensions.w < 768 ? 96 : 155;

  // Dynamic path length & offset computed mathematically on every frame
  // The path ends at the post-it note vertically (dimensions.h - 390)
  const baseMaxScroll = dimensions.h - dimensions.vh - (isSecretSectionOpen ? 160 : 0) - 390;
  const maxScroll = dimensions.h - dimensions.vh;
  const endProgress = maxScroll > 0 ? baseMaxScroll / maxScroll : 0.85;

  const pathL = useTransform([smoothScrollProgress, mergeProgress], ([scroll, merge]) => {
    const scaled = Math.min(1.0, (scroll as number) / endProgress);
    const value = scaled * (1 - (merge as number));
    return Math.max(0, Math.min(1, value));
  });
  const pathO = useTransform([smoothScrollProgress, mergeProgress], ([scroll, merge]) => {
    const value = merge as number;
    return Math.max(0, Math.min(1, value));
  });

  // Theme states
  const [activeFilter, setActiveFilter] = useState('');
  const [showFlash, setShowFlash] = useState(false);

  // Track dynamic coordinates and resize limits
  useEffect(() => {
    const updateDimensions = () => {
      const mainHeight = mainRef.current ? mainRef.current.offsetHeight : 6000;
      const W = Math.max(320, window.innerWidth);
      const H = window.innerHeight;
      const H_phys = W < 768 ? 320 : 400;

      const physicsEl = document.getElementById('physics');
      const projectsEl = document.getElementById('projects');

      let physicsTop = H * 2.4;
      let physicsBottom = H * 2.4 + H_phys;
      let projectsBottom = H * 3.4 + H_phys;

      if (physicsEl) {
        physicsTop = physicsEl.offsetTop;
        physicsBottom = physicsTop + physicsEl.offsetHeight;
      }

      if (projectsEl) {
        const projTop = projectsEl.offsetTop;
        projectsBottom = projTop + projectsEl.offsetHeight;
      }

      setSectionOffsets({
        physicsTop,
        physicsBottom,
        projectsBottom
      });

      setDimensions({
        w: W,
        h: mainHeight + (isSecretSectionOpen ? 160 : 0),
        vh: H
      });
    };
    updateDimensions();
    window.addEventListener('resize', updateDimensions);
    window.addEventListener('load', updateDimensions);
    
    // Setup ResizeObserver to run updateDimensions only when main container dimensions change
    let resizeObserver: ResizeObserver | null = null;
    if (mainRef.current) {
      resizeObserver = new ResizeObserver(() => {
        updateDimensions();
      });
      resizeObserver.observe(mainRef.current);
    }

    const timeout = setTimeout(updateDimensions, 400); // Trigger again after collapse/expand completes

    return () => {
      window.removeEventListener('resize', updateDimensions);
      window.removeEventListener('load', updateDimensions);
      if (resizeObserver) {
        resizeObserver.disconnect();
      }
      clearTimeout(timeout);
    };
  }, [isSecretSectionOpen]);

  // Sync scroll position events to update overscroll progress
  useMotionValueEvent(scrollY, "change", (latest) => {
    const prevScroll = prevScrollYRef.current;
    prevScrollYRef.current = latest;
    const isScrollingDown = latest > prevScroll;

    if (isResettingRef.current) {
      if (latest <= 10) {
        isResettingRef.current = false;
      }
      return;
    }

    const baseMaxScroll = dimensions.h - dimensions.vh - (isSecretSectionOpen ? 160 : 0) - 390;

    // 1. Bottom detection timer for secret section
    const maxScrollPos = dimensions.h - dimensions.vh;
    const isAtBottom = latest >= maxScrollPos - 5;

    if (isAtBottom && !isSecretSectionOpenRef.current) {
      if (!bottomTimeoutRef.current) {
        bottomTimeoutRef.current = setTimeout(() => {
          setIsSecretSectionOpen(true);
          
          // Smoothly track the expanding bottom panel by scrolling to the bottom at 60fps for 800ms
          let elapsed = 0;
          const interval = setInterval(() => {
            window.scrollTo(0, document.documentElement.scrollHeight);
            elapsed += 16;
            if (elapsed >= 800) {
              clearInterval(interval);
            }
          }, 16);
        }, 2500);
      }
    } else if (!isAtBottom) {
      if (bottomTimeoutRef.current) {
        clearTimeout(bottomTimeoutRef.current);
        bottomTimeoutRef.current = null;
      }
    }

    // 2. Magnet/snap effect at the bottom of the contact section (within 350px of the footer bottom, when "Buenos Aires, Argentina" is visible)
    const distanceToBottom = maxScrollPos - latest;
    
    if (snapTimeoutRef.current) {
      clearTimeout(snapTimeoutRef.current);
      snapTimeoutRef.current = null;
    }

    if (!isScrollingDown && isSnappingRef.current) {
      if (snapAnimationRef.current) {
        snapAnimationRef.current.stop();
        snapAnimationRef.current = null;
      }
      isSnappingRef.current = false;
    }

    if (!isSecretSectionOpen && !isSnappingRef.current && distanceToBottom < 350 && distanceToBottom > 5) {
      snapTimeoutRef.current = setTimeout(() => {
        const currentScroll = scrollY.get();
        const currentDistance = (dimensions.h - dimensions.vh) - currentScroll;
        if (currentDistance < 350 && currentDistance > 5 && !isSecretSectionOpen && !isSnappingRef.current) {
          isSnappingRef.current = true;
          snapAnimationRef.current = animate(currentScroll, dimensions.h - dimensions.vh, {
            duration: 1.0,
            ease: "easeInOut",
            onUpdate: (val) => {
              window.scrollTo(0, val);
            },
            onComplete: () => {
              isSnappingRef.current = false;
              snapAnimationRef.current = null;
            }
          });
        }
      }, 150);
    }

    if (distanceToBottom >= 380) {
      if (snapAnimationRef.current) {
        snapAnimationRef.current.stop();
        snapAnimationRef.current = null;
      }
      isSnappingRef.current = false;
    }

    // 3. Trigger one-shot morphing animation when reaching the lineEndScroll
    if (latest >= baseMaxScroll - 5) {
      setIsLineMerged(true);
    } else if (latest < baseMaxScroll - 40) {
      setIsLineMerged(false);
    }

    // 4. Show watermark only if scrolled past 120px from top and NOT within 380px of bottom (footer area)
    const docRemaining = dimensions.h - dimensions.vh - latest;
    if (latest > 120 && docRemaining > 380) {
      setShowWatermark(true);
    } else {
      setShowWatermark(false);
    }
  });

  // Triggered Smooth Morphs & Bottom Bar Scale animations on reach/leave
  useEffect(() => {
    if (isLineMerged) {
      // Vertical line retreats down via spring progress
      animate(mergeProgress, 1, { duration: 0.6, ease: [0.25, 0.1, 0.25, 1] });
    } else {
      // Restore vertical line to the current scroll progress
      animate(mergeProgress, 0, { duration: 0.5, ease: "easeOut" });
    }
  }, [isLineMerged]);

  // Lock body scroll when reel is open
  useEffect(() => {
    if (isReelOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isReelOpen]);

  // Listener to yield magnetic snap to manual scrolls immediately
  useEffect(() => {
    const handleUserInteraction = () => {
      lastInteractionTimeRef.current = Date.now();
      if (snapTimeoutRef.current) {
        clearTimeout(snapTimeoutRef.current);
        snapTimeoutRef.current = null;
      }
      if (snapAnimationRef.current) {
        snapAnimationRef.current.stop();
        snapAnimationRef.current = null;
      }
      isSnappingRef.current = false;
    };

    window.addEventListener('wheel', handleUserInteraction, { passive: true });
    window.addEventListener('touchmove', handleUserInteraction, { passive: true });
    window.addEventListener('mousedown', handleUserInteraction, { passive: true });
    window.addEventListener('keydown', handleUserInteraction, { passive: true });

    return () => {
      window.removeEventListener('wheel', handleUserInteraction);
      window.removeEventListener('touchmove', handleUserInteraction);
      window.removeEventListener('mousedown', handleUserInteraction);
      window.removeEventListener('keydown', handleUserInteraction);
    };
  }, []);

  // Trigger global random brand color shifting theme
  const triggerColorShift = () => {
    isResettingRef.current = true;

    if (snapTimeoutRef.current) {
      clearTimeout(snapTimeoutRef.current);
      snapTimeoutRef.current = null;
    }
    if (snapAnimationRef.current) {
      snapAnimationRef.current.stop();
      snapAnimationRef.current = null;
    }
    isSnappingRef.current = false;

    // 1. Play flash reload animation
    setShowFlash(true);
    setTimeout(() => {
      setShowFlash(false);
    }, 850);

    // 2. Select a new random brand color filter preset
    const filters = [
      'hue-rotate(60deg) saturate(1.3) contrast(1.05)',  // Cyan/Orange
      'hue-rotate(150deg) saturate(1.55) contrast(1.15)', // Lime/Purple
      'hue-rotate(270deg) saturate(1.4) contrast(1.1)',  // Cyberpunk Violet
      'hue-rotate(110deg) invert(0.04) saturate(1.5)',   // Acid Green
      'hue-rotate(320deg) contrast(1.1) saturate(1.2)',  // Electric Pink
      'invert(0.92) hue-rotate(180deg) contrast(1.12) saturate(1.5) brightness(1.02)', // Inverse Light Mode!
      '' // Reset default
    ];

    const available = filters.filter(f => f !== activeFilter);
    const chosen = available[Math.floor(Math.random() * available.length)];
    setActiveFilter(chosen);

    // 3. Close the secret section
    setIsSecretSectionOpen(false);
    if (bottomTimeoutRef.current) {
      clearTimeout(bottomTimeoutRef.current);
      bottomTimeoutRef.current = null;
    }

    // 4. Scroll back to top instantly during flash
    window.scrollTo(0, 0);
  };

  // Helper variables for path coordinate planning
  const W = dimensions.w;
  const H = dimensions.vh;

  // Position the line under the projects sticky note (top right in projects)
  const projectX = W < 768 ? W * 0.72 : W * 0.78;

  // Curvature-pen style perfectly smooth S-curves centered in the viewport
  // The path curves left at the bottom to end exactly inside the yellow post-it note
  const finalY = baseMaxScroll + dimensions.vh;
  const svgPathD = `
    M ${W * 0.58} ${H * 0.15} 
    C ${W * 0.58} ${H * 0.52}, ${W * 0.42} ${H * 0.52}, ${W * 0.42} ${H * 0.9} 
    C ${W * 0.42} ${H * 1.4}, ${W * 0.58} ${H * 1.4}, ${W * 0.58} ${H * 1.9} 
    C ${W * 0.58} ${H * 2.4}, ${projectX} ${H * 2.4}, ${projectX} ${H * 2.9} 
    C ${projectX} ${H * 3.4}, ${W * 0.58} ${H * 3.4}, ${W * 0.58} ${H * 3.9} 
    C ${W * 0.58} ${H * 4.4}, ${W * 0.42} ${H * 4.4}, ${W * 0.42} ${H * 4.9} 
    C ${W * 0.42} ${H * 5.4}, ${finalX} ${H * 5.45}, ${finalX} ${finalY}
  `.trim();

  return (
    <LanguageProvider>
      {/* Non-filtered Global overlays */}
      <CustomCursor />

      {/* Fullscreen Video Reel Overlay */}
      <AnimatePresence>
        {isReelOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsReelOpen(false)}
            className="fixed inset-0 bg-black/95 z-[9999] flex items-center justify-center p-4 md:p-8 cursor-pointer"
          >
            {/* Close Button */}
            <button
              onClick={() => setIsReelOpen(false)}
              className="absolute top-6 right-6 text-white hover:text-[#df4581] transition-colors duration-300 z-50 p-2 cursor-pointer focus:outline-none"
              aria-label="Cerrar Reel"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-8 h-8 sm:w-10 sm:h-10">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>

            {/* Video Player */}
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              transition={{ type: "spring", damping: 25, stiffness: 180 }}
              onClick={(e) => e.stopPropagation()}
              className="relative w-full max-w-5xl aspect-video bg-black rounded-2xl overflow-hidden shadow-2xl border border-white/10 cursor-default"
            >
              {isReelLoading && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/50 z-10">
                  <div className="w-8 h-8 border-2 border-[#b6e82f] border-t-transparent rounded-full animate-spin" />
                </div>
              )}
              <video
                src={REEL_URL}
                className="w-full h-full object-cover"
                autoPlay
                controls
                playsInline
                onLoadStart={() => setIsReelLoading(true)}
                onCanPlay={() => setIsReelLoading(false)}
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Fixed Watermark Corner Tag */}
      <AnimatePresence>
        {showWatermark && (
          <motion.div 
            className="fixed bottom-6 left-6 md:left-12 pointer-events-none z-50 flex items-center gap-3 select-none"
            style={{ mixBlendMode: 'difference' }}
            initial={{ opacity: 0, x: -40 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -40 }}
            transition={{ type: "spring", damping: 15, stiffness: 100 }}
          >
            <span className="font-sans text-xs tracking-widest text-[#FFFFFF] font-medium uppercase">BA/ARG</span>
            <div className="h-[1px] w-8 bg-[#FFFFFF]/60" />
            <span className="font-mono text-xs text-[#FFFFFF] font-medium uppercase">RESET. 2025</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Camera flash reload effect */}
      <AnimatePresence>
        {showFlash && (
          <motion.div
            initial={{ opacity: 1 }}
            animate={{ opacity: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.85, ease: "easeOut" }}
            className="fixed inset-0 bg-white z-[99999] pointer-events-none"
          />
        )}
      </AnimatePresence>

      <div 
        style={{ filter: activeFilter }}
        className="relative min-h-screen bg-[#0D0D0D] text-[#F5F5F5] font-sans overflow-x-clip selection:bg-[#b6e82f] selection:text-[#0D0D0D] transition-all duration-300"
      >
        {/* Vintage Film Scratches (faint vertical lines across the page) */}
        <div className="fixed inset-0 pointer-events-none z-40">
          <div className="absolute left-[18%] top-0 w-[1px] h-full bg-white/[0.03]" />
          <div className="absolute left-[52%] top-0 w-[1px] h-full bg-white/[0.04]" />
          <div className="absolute left-[82%] top-0 w-[1px] h-full bg-white/[0.025]" />
        </div>

        {/* Portfolio Sections (main tag has z-10 to establish a stacking context allowing children cards to stack above SVG at z-[15]) */}
        <main ref={mainRef} className="relative z-10">
          {/* Dynamic Scroll-driven Guide Path Arrow Overlay */}
          <svg 
            className="absolute inset-0 pointer-events-none z-[5] w-full h-full"
          >
            <defs>
              <marker
                id="arrowhead"
                viewBox="0 0 10 10"
                refX="2"
                refY="5"
                markerWidth="2.5"
                markerHeight="2.5"
                orient="auto-start-reverse"
              >
                <path 
                  d="M 1.5 2.5 Q 1.5 1.5 2.5 2 L 7.8 4.6 Q 8.5 5 7.8 5.4 L 2.5 8 Q 1.5 8.5 1.5 7.5 Z" 
                  fill="currentColor" 
                />
              </marker>
            </defs>
            <motion.path
              d={svgPathD}
              className="text-[#b6e82f] fill-none"
              stroke="currentColor"
              strokeWidth={25.6} // 1.6rem = 25.6px bold solid vertical line
              strokeLinecap="round"
              strokeLinejoin="round"
              markerEnd={isLineMerged ? undefined : "url(#arrowhead)"}
              style={{ 
                pathLength: pathL,
                pathOffset: pathO,
                opacity: lineOpacity
              }}
            />
          </svg>
          {/* 1. Hero Section */}
          <HeroSection onOpenReel={() => setIsReelOpen(true)} />

          {/* 2. Studio Section */}
          <StudioSection />

          {/* 2.5. Physics Section */}
          <PhysicsSection />

          {/* 3. Projects Section */}
          <ProjectsSection />

          {/* 4. Team Section */}
          <TeamSection />

          {/* 5. Contact / Footer Section */}
          <ContactSection />
        </main>

        {/* Compact Native Overscroll Solid Green Canvas extension container (compacted to 160px) */}
        <motion.div
          animate={{ height: isSecretSectionOpen ? 160 : 0 }}
          transition={{ type: "spring", stiffness: 100, damping: 20 }}
          className="w-full bg-[#b6e82f] overflow-hidden flex flex-col items-center justify-center relative z-20"
        >
          {isSecretSectionOpen && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.15, duration: 0.3 }}
              className="flex flex-col items-center justify-center gap-1 text-black py-1 w-full max-w-md px-4"
            >
              <button
                onClick={triggerColorShift}
                className="group cursor-pointer flex flex-col items-center gap-3 p-4 hover:scale-105 transition-all duration-300 active:scale-95"
              >
                <div className="w-12 h-12 rounded-full bg-black text-[#b6e82f] flex items-center justify-center shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] group-hover:shadow-none group-hover:translate-x-0.5 group-hover:translate-y-0.5 transition-all duration-300">
                  <svg 
                    className="w-6 h-6 transform group-hover:rotate-180 transition-transform duration-700 ease-out"
                    fill="none" 
                    stroke="currentColor" 
                    strokeWidth="3" 
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
                  </svg>
                </div>
                <span className="font-display font-black text-base md:text-lg uppercase tracking-widest text-black group-hover:text-black/80 transition-colors">
                  ¿Reseteamos?
                </span>
              </button>
            </motion.div>
          )}
          <div ref={secretSectionEndRef} className="h-0 w-0" />
        </motion.div>

      </div>
    </LanguageProvider>
  );
}

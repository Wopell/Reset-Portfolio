import { useRef } from 'react';
import { motion, useScroll, useTransform, useSpring } from 'motion/react';
import { useLanguage } from '../../context/LanguageContext';
import { TramaOverlay } from '../TramaOverlay';
import { AnimatedText } from '../AnimatedText';
import { FadeIn } from '../FadeIn';
import { ScrollSequence } from '../ScrollSequence';
import { ReactiveHalftone } from '../ReactiveHalftone';


export function StudioSection() {
  const { lang, t } = useLanguage();
  const sectionRef = useRef<HTMLDivElement>(null);

  // Scroll tracking of the section for parallax elements
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start end', 'end start']
  });

  // Smooth spring parallax offsets for desktop text layers (different speeds for 3D effect)
  const y1Value = useTransform(scrollYProgress, [0, 1], [60, -60]);
  const y2Value = useTransform(scrollYProgress, [0, 1], [20, -20]);
  const y3Value = useTransform(scrollYProgress, [0, 1], [80, -80]);

  const y1 = useSpring(y1Value, { damping: 25, stiffness: 70 });
  const y2 = useSpring(y2Value, { damping: 25, stiffness: 70 });
  const y3 = useSpring(y3Value, { damping: 25, stiffness: 70 });

  return (
    <section id="studio" ref={sectionRef} className="relative w-full bg-transparent text-[#0D0D0D] pt-48 pb-52 md:pt-[320px] md:pb-[340px] overflow-hidden select-none">
      
      {/* Absolute White background layer at z-0 */}
      <div className="absolute inset-0 bg-[#FFFFFF] z-0" />
      
      {/* ---------------------------------------------------- */}
      {/* Blurry Mountain-like Transition (Black to White)     */}
      {/* ---------------------------------------------------- */}
      <div className="absolute top-0 left-0 w-full overflow-visible pointer-events-none z-[2]" style={{ height: '30%', width: '200%', transform: 'translate(-25%, -25%)'  }}>
        <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none" style={{ filter: 'blur(45px)' }}>
          <path
            d="M0 0 L100 0 L100 35 Q50 150 0 35 Z"
            fill="#000000"
          />
        </svg>
      </div>

      {/* Interactive Reactive Halftone WebGL Background */}
      <ReactiveHalftone />

      <div className="relative z-20 max-w-7xl mx-auto px-6 md:px-10">
        
        {/* Mobile Layout: Vertical stacked column flow */}
        <div className="block md:hidden space-y-16 mt-10">
          
          {/* Pillar 01 */}
          <div className="flex flex-col items-start">
            <motion.span
              initial={{ x: 40, opacity: 0 }}
              whileInView={{ x: 0, opacity: 1 }}
              viewport={{ once: false, amount: 0.15 }}
              transition={{ delay: 0.0, duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
              className="font-mono text-xs text-neutral-400 mb-1 tracking-widest uppercase"
            >
              ( 01 )
            </motion.span>
            <motion.h4
              initial={{ x: 40, opacity: 0 }}
              whileInView={{ x: 0, opacity: 1 }}
              viewport={{ once: false, amount: 0.15 }}
              transition={{ delay: 0.15, duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
              className="font-display font-extrabold text-2xl uppercase text-[#0D0D0D] mb-3"
            >
              {t('studioPillar1Title')}
            </motion.h4>
            <motion.div
              initial={{ x: 40, opacity: 0 }}
              whileInView={{ x: 0, opacity: 1 }}
              viewport={{ once: false, amount: 0.15 }}
              transition={{ delay: 0.3, duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
            >
              <AnimatedText
                text={t('studioPillar1Desc')}
                className="text-sm font-sans leading-relaxed max-w-md"
                baseColor="text-[#8C8C8C]"
                activeColor="text-[#df4581]"
              />
            </motion.div>
          </div>

          {/* Scroll-Linked PNG Sequence Animation (replaces silhouettes image) */}
          <div className="w-full max-w-[380px] mx-auto opacity-95 mix-blend-multiply">
            <ScrollSequence className="w-full h-auto" />
          </div>

          {/* Pillar 02 */}
          <div className="flex flex-col items-start">
            <motion.span
              initial={{ x: 40, opacity: 0 }}
              whileInView={{ x: 0, opacity: 1 }}
              viewport={{ once: false, amount: 0.15 }}
              transition={{ delay: 0.1, duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
              className="font-mono text-xs text-neutral-400 mb-1 tracking-widest uppercase"
            >
              ( 02 )
            </motion.span>
            <motion.h4
              initial={{ x: 40, opacity: 0 }}
              whileInView={{ x: 0, opacity: 1 }}
              viewport={{ once: false, amount: 0.15 }}
              transition={{ delay: 0.25, duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
              className="font-display font-extrabold text-2xl uppercase text-[#0D0D0D] mb-3"
            >
              {t('studioPillar2Title')}
            </motion.h4>
            <motion.div
              initial={{ x: 40, opacity: 0 }}
              whileInView={{ x: 0, opacity: 1 }}
              viewport={{ once: false, amount: 0.15 }}
              transition={{ delay: 0.4, duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
            >
              <AnimatedText
                text={t('studioPillar2Desc')}
                className="text-sm font-sans leading-relaxed max-w-md"
                baseColor="text-[#8C8C8C]"
                activeColor="text-[#df4581]"
              />
            </motion.div>
          </div>

          {/* Pillar 03 */}
          <div className="flex flex-col items-start">
            <motion.span
              initial={{ x: 40, opacity: 0 }}
              whileInView={{ x: 0, opacity: 1 }}
              viewport={{ once: false, amount: 0.15 }}
              transition={{ delay: 0.2, duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
              className="font-mono text-xs text-neutral-400 mb-1 tracking-widest uppercase"
            >
              ( 03 )
            </motion.span>
            <motion.h4
              initial={{ x: 40, opacity: 0 }}
              whileInView={{ x: 0, opacity: 1 }}
              viewport={{ once: false, amount: 0.15 }}
              transition={{ delay: 0.35, duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
              className="font-display font-extrabold text-2xl uppercase text-[#0D0D0D] mb-3"
            >
              {t('studioPillar3Title')}
            </motion.h4>
            <motion.div
              initial={{ x: 40, opacity: 0 }}
              whileInView={{ x: 0, opacity: 1 }}
              viewport={{ once: false, amount: 0.15 }}
              transition={{ delay: 0.5, duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
            >
              <AnimatedText
                text={t('studioPillar3Desc')}
                className="text-sm font-sans leading-relaxed max-w-md"
                baseColor="text-[#8C8C8C]"
                activeColor="text-[#df4581]"
              />
            </motion.div>
          </div>

        </div>

        {/* Desktop Layout: Asymmetrical Staggered Collage Layout */}
        <div className="hidden md:block relative w-full min-h-[1100px] mt-10">
          
          {/* Scroll-Linked PNG Sequence Animation (replaces silhouettes image) */}
          <div className="absolute left-[50%] top-[40%] -translate-x-[50%] -translate-y-[50%] w-full max-w-[550px] opacity-85 z-10 pointer-events-none select-none mix-blend-multiply">
            <ScrollSequence className="w-full h-auto" />
          </div>

          {/* Pillar 01 (Top Left) */}
          <motion.div 
            style={{ y: y1 }}
            className="absolute left-[5%] top-[5%] max-w-[340px] z-20 flex flex-col items-start"
          >
            {/* Number */}
            <motion.span
              initial={{ x: 120, opacity: 0 }}
              whileInView={{ x: 0, opacity: 1 }}
              viewport={{ once: false, amount: 0.15 }}
              transition={{ delay: 0.1, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
              className="font-mono text-xs text-neutral-400 mb-1.5 tracking-widest uppercase"
            >
              ( 01 )
            </motion.span>
            
            {/* Title */}
            <motion.h4
              initial={{ x: 120, opacity: 0 }}
              whileInView={{ x: 0, opacity: 1 }}
              viewport={{ once: false, amount: 0.15 }}
              transition={{ delay: 0.25, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
              className="font-display font-black text-3xl uppercase text-[#0D0D0D] mb-4 tracking-tight"
            >
              {t('studioPillar1Title')}
            </motion.h4>
            
            {/* Text */}
            <motion.div
              initial={{ x: 120, opacity: 0 }}
              whileInView={{ x: 0, opacity: 1 }}
              viewport={{ once: false, amount: 0.15 }}
              transition={{ delay: 0.4, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            >
              <AnimatedText
                text={t('studioPillar1Desc')}
                className="text-[15px] font-sans font-medium text-[#8C8C8C] leading-relaxed"
                baseColor="text-[#8C8C8C]"
                activeColor="text-[#df4581]"
              />
            </motion.div>
          </motion.div>

          {/* Pillar 02 (Middle Right) */}
          <motion.div 
            style={{ y: y2 }}
            className="absolute right-[5%] top-[35%] max-w-[340px] z-20 flex flex-col items-start"
          >
            {/* Number */}
            <motion.span
              initial={{ x: -120, opacity: 0 }}
              whileInView={{ x: 0, opacity: 1 }}
              viewport={{ once: false, amount: 0.15 }}
              transition={{ delay: 0.2, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
              className="font-mono text-xs text-neutral-400 mb-1.5 tracking-widest uppercase"
            >
              ( 02 )
            </motion.span>
            
            {/* Title */}
            <motion.h4
              initial={{ x: -120, opacity: 0 }}
              whileInView={{ x: 0, opacity: 1 }}
              viewport={{ once: false, amount: 0.15 }}
              transition={{ delay: 0.35, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
              className="font-display font-black text-3xl uppercase text-[#0D0D0D] mb-4 tracking-tight"
            >
              {t('studioPillar2Title')}
            </motion.h4>
            
            {/* Text */}
            <motion.div
              initial={{ x: -120, opacity: 0 }}
              whileInView={{ x: 0, opacity: 1 }}
              viewport={{ once: false, amount: 0.15 }}
              transition={{ delay: 0.5, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            >
              <AnimatedText
                text={t('studioPillar2Desc')}
                className="text-[15px] font-sans font-medium text-[#8C8C8C] leading-relaxed"
                baseColor="text-[#8C8C8C]"
                activeColor="text-[#df4581]"
              />
            </motion.div>
          </motion.div>

          {/* Pillar 03 (Bottom Left) */}
          <motion.div 
            style={{ y: y3 }}
            className="absolute left-[5%] top-[72%] max-w-[340px] z-20 flex flex-col items-start"
          >
            {/* Number */}
            <motion.span
              initial={{ x: 120, opacity: 0 }}
              whileInView={{ x: 0, opacity: 1 }}
              viewport={{ once: false, amount: 0.15 }}
              transition={{ delay: 0.3, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
              className="font-mono text-xs text-neutral-400 mb-1.5 tracking-widest uppercase"
            >
              ( 03 )
            </motion.span>
            
            {/* Title */}25
            <motion.h4
              initial={{ x: 120, opacity: 0 }}
              whileInView={{ x: 0, opacity: 1 }}
              viewport={{ once: false, amount: 0.15 }}
              transition={{ delay: 0.45, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
              className="font-display font-black text-3xl uppercase text-[#0D0D0D] mb-4 tracking-tight"
            >
              {t('studioPillar3Title')}
            </motion.h4>
            
            {/* Text */}
            <motion.div
              initial={{ x: 120, opacity: 0 }}
              whileInView={{ x: 0, opacity: 1 }}
              viewport={{ once: false, amount: 0.15 }}
              transition={{ delay: 0.6, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            >
              <AnimatedText
                text={t('studioPillar3Desc')}
                className="text-[15px] font-sans font-medium text-[#8C8C8C] leading-relaxed"
                baseColor="text-[#8C8C8C]"
                activeColor="text-[#df4581]"
              />
            </motion.div>
          </motion.div>



        </div>

      </div>

      {/* ---------------------------------------------------- */}
      {/* Blurry Mountain-like Transition (White to Black)     */}
      {/* ---------------------------------------------------- */}      
      <div className="absolute bottom-0 left-0 w-full overflow-visible pointer-events-none z-[2]" style={{ height: '30%', width: '200%', transform: 'translate(-25%, 25%)'  }}>
        <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none" style={{ filter: 'blur(45px)' }}>
          <path
            d="M0 100 L100 100 L100 65 Q50 -50 0 65 Z"
            fill="#000000"
          />
        </svg>
      </div>
    </section>
  );
}

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { FadeIn } from '../FadeIn';

export function ContactSection() {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [formSubmitted, setFormSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormSubmitted(true);
    setTimeout(() => {
      setFormSubmitted(false);
      setIsFormOpen(false);
    }, 2000);
  };

  return (
    <footer
      id="contacto"
      className="relative w-full bg-transparent paper-noise-bg text-[#df4581] px-6 md:px-12 lg:px-16 pt-24 pb-8 md:pb-12 overflow-hidden select-none"
    >
      {/* Black background layer at z-0 */}
      <div className="absolute inset-0 bg-black z-0 pointer-events-none" />

      {/* FORM MODAL BACKDROP & EXPANDED CARD */}
      <AnimatePresence>
        {isFormOpen && (
          <div className="fixed inset-0 bg-black/75 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            {/* Click backdrop to close */}
            <div 
              className="absolute inset-0 cursor-default" 
              onClick={() => setIsFormOpen(false)}
            />

            <motion.div
              layoutId="post-it-card"
              className="relative w-full max-w-md bg-[#ffe806] text-black p-6 md:p-8 shadow-2xl rounded-sm font-sans flex flex-col z-10"
              transition={{ type: "spring", stiffness: 300, damping: 26 }}
            >
              {/* Close button inside modal */}
              <button
                type="button"
                onClick={() => setIsFormOpen(false)}
                className="absolute top-4 right-4 text-black hover:opacity-75 text-2xl font-bold font-sans cursor-pointer focus:outline-none"
              >
                ✕
              </button>

              <h3 className="font-caveat text-3xl md:text-4xl font-extrabold mb-4 uppercase tracking-wide">
                ¡Hablamos! ✍️
              </h3>

              {formSubmitted ? (
                <div className="flex flex-col items-center justify-center py-10 text-center font-caveat">
                  <span className="text-4xl mb-2">⚡</span>
                  <span className="text-2xl font-extrabold uppercase">¡Mensaje Enviado!</span>
                  <span className="text-sm font-sans text-black/60 mt-1">Te responderemos muy pronto.</span>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                  <div>
                    <input
                      required
                      type="text"
                      placeholder="Tu Nombre"
                      className="w-full bg-white/60 border border-black/15 px-3 py-2.5 rounded-sm text-sm focus:outline-none focus:border-black font-sans placeholder:text-black/50"
                    />
                  </div>
                  <div>
                    <input
                      required
                      type="email"
                      placeholder="Tu Email"
                      className="w-full bg-white/60 border border-black/15 px-3 py-2.5 rounded-sm text-sm focus:outline-none focus:border-black font-sans placeholder:text-black/50"
                    />
                  </div>
                  <div>
                    <textarea
                      required
                      placeholder="Tu Mensaje..."
                      rows={4}
                      className="w-full bg-white/60 border border-black/15 px-3 py-2.5 rounded-sm text-sm focus:outline-none focus:border-black font-sans placeholder:text-black/50 resize-none"
                    />
                  </div>
                  <button
                    type="submit"
                    className="w-full bg-black text-white hover:bg-neutral-800 py-3 rounded-sm font-bold uppercase tracking-wider text-xs sm:text-sm transition-colors duration-300 cursor-pointer shadow-md"
                  >
                    Enviar Mensaje
                  </button>
                </form>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Full width container to utilize left space and prevent right overflow - raised to z-20 to draw above SVG */}
      <div className="relative z-20 w-full flex flex-col justify-between min-h-[320px] md:min-h-[400px]">
        
        {/* Middle Row: Location & Stacked Social Links */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end w-full gap-8 md:gap-4 mt-auto mb-8 md:mb-12">
          
          {/* Left Column: Note + Location */}
          <div className="flex flex-col items-start gap-12 md:gap-20">
            {/* Note placeholder container - shifted right (ml-4 md:ml-8) to match user reference mockup */}
            <div className="w-28 h-28 md:w-32 md:h-32 ml-4 md:ml-8 relative">
              {!isFormOpen && (
                <motion.div
                  layoutId="post-it-card"
                  onClick={() => setIsFormOpen(true)}
                  className="absolute inset-0 bg-[#ffe806] text-black p-3 shadow-[5px_5px_15px_rgba(0,0,0,0.5)] hover:scale-105 hover:rotate-[6deg] transition-all duration-300 flex items-center justify-center font-caveat cursor-pointer rounded-sm rotate-[3deg]"
                >
                  <div className="text-lg md:text-xl font-extrabold uppercase tracking-wide text-center select-none">
                    escribinos
                  </div>
                </motion.div>
              )}
            </div>

            {/* Location */}
            <FadeIn delay={0}>
              <span className="font-sans text-xl md:text-2xl lg:text-3xl font-extrabold uppercase tracking-wide">
                Buenos Aires, Argentina
              </span>
            </FadeIn>
          </div>

          {/* Right Column: Social Links */}
          <div className="flex flex-col items-start md:items-end gap-3 md:gap-4">
            <FadeIn delay={0.1}>
              <SocialLink href="https://instagram.com/reset.multimedia" label="Instagram" />
            </FadeIn>
          </div>

        </div>

        {/* Bottom Row: Giant Email Link stretching full width with calibrated clamp size to avoid overflow */}
        <FadeIn delay={0.2} className="w-full">
          <a
            href="mailto:resetmultimedial@gmail.com"
            className="font-display font-extrabold uppercase leading-[0.8] tracking-tighter text-[#df4581] hover:text-[#b6e82f] transition-colors duration-300 block select-none cursor-pointer"
            style={{ 
              fontSize: 'clamp(1.3rem, 5.7vw, 7.8rem)', 
              letterSpacing: '-0.04em'
            }}
          >
            resetmultimedial@gmail.com
          </a>
        </FadeIn>

      </div>
    </footer>
  );
}

// Reusable Social Link with Arrow Icon
interface SocialLinkProps {
  href: string;
  label: string;
}

// Reusable Social Link component remains the same
function SocialLink({ href, label }: SocialLinkProps) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="font-sans text-xl md:text-2xl lg:text-3xl font-extrabold text-[#df4581] hover:text-[#b6e82f] flex items-center gap-1.5 md:gap-2 transition-colors duration-300 select-none group uppercase"
    >
      <span>{label}</span>
      <svg 
        viewBox="0 0 24 24" 
        fill="none" 
        stroke="currentColor" 
        strokeWidth="3.5" 
        className="w-5 h-5 md:w-6 h-6 lg:w-7 lg:h-7 text-[#df4581] group-hover:text-[#b6e82f] group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all duration-300"
      >
        <path d="M7 17L17 7M17 7H7M17 7V17" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    </a>
  );
}

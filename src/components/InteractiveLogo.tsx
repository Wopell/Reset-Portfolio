import { useState } from 'react';
import { motion } from 'motion/react';

interface InteractiveLogoProps {
  className?: string;
}

export function InteractiveLogo({ className }: InteractiveLogoProps) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <a
      href="#"
      onClick={(e) => {
        e.preventDefault();
        window.location.reload();
      }}
      className={`relative block select-none cursor-pointer ${className}`}
      data-hover-expand
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="relative w-full h-auto">
        {/* Default Logo Asset (Lime background) */}
        <img
          src="/assets/logo-lime.svg"
          alt="RESET Logo"
          className="w-full h-auto block"
          referrerPolicy="no-referrer"
        />
        
        {/* Hover Logo Asset (Pink background) fading in */}
        <motion.div
          className="absolute inset-0 w-full h-full"
          initial={{ opacity: 0 }}
          animate={{ opacity: isHovered ? 1 : 0 }}
          transition={{ duration: 0.25, ease: 'easeInOut' }}
        >
          <img
            src="/assets/logo-pink.svg"
            alt="RESET Logo Hover"
            className="w-full h-auto block"
            referrerPolicy="no-referrer"
          />
        </motion.div>
      </div>
    </a>
  );
}

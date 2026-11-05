import React, { useRef } from 'react';
import { motion, useScroll, useTransform, MotionValue } from 'motion/react';

interface AnimatedTextProps {
  text: string;
  className?: string;
  baseColor?: string;
  activeColor?: string;
}

export function AnimatedText({ 
  text, 
  className = '', 
  baseColor = 'opacity-15', 
  activeColor = 'opacity-100' 
}: AnimatedTextProps) {
  const containerRef = useRef<HTMLParagraphElement>(null);
  
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start 0.85', 'end 0.35']
  });

  // Split into words to prevent breaking words across lines
  const words = text.split(' ');
  const totalChars = text.length;

  let globalCharIndex = 0;

  return (
    <p ref={containerRef} className={`flex flex-wrap leading-relaxed ${className}`}>
      {words.map((word, wordIndex) => {
        const chars = word.split('');
        return (
          <span key={wordIndex} className="inline-block whitespace-nowrap">
            {chars.map((char, charIndex) => {
              const i = globalCharIndex;
              globalCharIndex++;

              // Calculate activation range for each character
              const start = i / totalChars;
              const end = Math.min(1, (i + 4) / totalChars); // slight overlap of characters for a smoother reveal

              return (
                <Char
                  key={charIndex}
                  char={char}
                  progress={scrollYProgress}
                  range={[start, end]}
                  baseColor={baseColor}
                  activeColor={activeColor}
                />
              );
            })}
            {/* Add space after each word except the last */}
            {wordIndex < words.length - 1 && (
              <span className="inline-block select-none">&nbsp;</span>
            )}
          </span>
        );
      })}
    </p>
  );
}

interface CharProps {
  key?: React.Key;
  char: string;
  progress: MotionValue<number>;
  range: [number, number];
  baseColor: string;
  activeColor: string;
}

function Char({ char, progress, range, baseColor, activeColor }: CharProps) {
  const opacity = useTransform(progress, range, [0, 1]);

  return (
    <span className="relative inline-block">
      {/* Base character (always visible, gray or low-opacity white) */}
      <span className={`inline-block ${baseColor}`}>{char}</span>
      {/* Overlay character (animating opacity, pink or full white) */}
      <motion.span
        style={{ opacity }}
        className={`absolute inset-0 select-none ${activeColor}`}
      >
        {char}
      </motion.span>
    </span>
  );
}

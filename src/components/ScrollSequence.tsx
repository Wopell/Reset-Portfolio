import { useEffect, useRef, useState } from 'react';
import { useScroll, useInView, useSpring } from 'motion/react';

interface ScrollSequenceProps {
  totalFrames?: number;
  className?: string;
}

export function ScrollSequence({ totalFrames = 149, className = '' }: ScrollSequenceProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const imagesRef = useRef<HTMLImageElement[]>([]);
  const [imagesLoaded, setImagesLoaded] = useState(0);
  const [isReady, setIsReady] = useState(false);
  const currentFrameRef = useRef(-1);
  const isInView = useInView(containerRef);

  // Track scroll progress of the canvas element itself (from enter to exit viewport)
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start 1.4', 'end 0.8']
  });

  // Apply spring smoothing for a beautiful inertial catch-up animation when scrolling starts/stops
  const smoothProgress = useSpring(scrollYProgress, {
    damping: 26,
    stiffness: 55,
    mass: 1
  });

  // Helper to format frame path.
  // Maps 0-indexed frame count (0 to 148) to 1-indexed filename "Frame (1).png" to "Frame (149).png"
  const getFrameUrl = (index: number) => {
    const frameNumber = index + 1; // 1-indexed: 1 to 149
    return `/assets/studio-sequence/Frame (${frameNumber}).png`;
  };

  // Preload images
  useEffect(() => {
    let loadedCount = 0;
    const loadedImages: HTMLImageElement[] = [];

    for (let i = 0; i < totalFrames; i++) {
      const img = new Image();
      img.src = getFrameUrl(i);
      img.onload = () => {
        loadedCount++;
        setImagesLoaded(loadedCount);
        if (loadedCount === totalFrames) {
          setIsReady(true);
        }
      };
      img.onerror = () => {
        // Fallback for missing frames during development or setup
        loadedCount++;
        setImagesLoaded(loadedCount);
        if (loadedCount === totalFrames) {
          setIsReady(true);
        }
      };
      loadedImages.push(img);
    }

    imagesRef.current = loadedImages;
  }, [totalFrames]);

  // Handle rendering of current frame
  const renderFrame = (index: number) => {
    const canvas = canvasRef.current;
    if (!canvas || !imagesRef.current[index]) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const img = imagesRef.current[index];
    
    // Set canvas dimensions to match image natural aspect ratio
    if (canvas.width !== img.naturalWidth || canvas.height !== img.naturalHeight) {
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;
    }

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    currentFrameRef.current = index;
  };

  // Subscribe to the smoothed scroll progress motion value
  useEffect(() => {
    if (!isReady || !isInView) return;

    // Draw frame on activation/entering viewport
    if (currentFrameRef.current === -1) {
      renderFrame(0);
    } else {
      renderFrame(currentFrameRef.current);
    }

    const unsubscribe = smoothProgress.on('change', (latestProgress) => {
      // Map scroll progress (0 to 1) to frame index (0 to totalFrames - 1)
      const frameIndex = Math.min(
        totalFrames - 1,
        Math.max(0, Math.floor(latestProgress * totalFrames))
      );

      if (frameIndex !== currentFrameRef.current) {
        currentFrameRef.current = frameIndex; // update immediately to prevent duplicate RAF calls
        requestAnimationFrame(() => renderFrame(frameIndex));
      }
    });

    return () => unsubscribe();
  }, [isReady, smoothProgress, totalFrames, isInView]);

  return (
    <div ref={containerRef} className={`relative w-full h-full flex items-center justify-center ${className}`}>
      {!isReady && (
        <div className="absolute inset-0 flex flex-col items-center justify-center text-xs font-mono text-neutral-400 gap-2 pointer-events-none">
          <div className="w-6 h-6 border-2 border-[#df4581] border-t-transparent rounded-full animate-spin" />
          <span>LOADING ANIMATION: {Math.round((imagesLoaded / totalFrames) * 100)}%</span>
        </div>
      )}
      <canvas
        ref={canvasRef}
        className={`w-full h-auto max-w-full max-h-full transition-opacity duration-300 ${
          isReady ? 'opacity-100' : 'opacity-0'
        }`}
      />
    </div>
  );
}

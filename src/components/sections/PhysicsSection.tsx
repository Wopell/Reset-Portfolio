import { useRef, useEffect, useState, useMemo } from 'react';
import { useScroll, useVelocity, useInView } from 'motion/react';
import Matter from 'matter-js';
import { useLanguage } from '../../context/LanguageContext';

const IMAGE_CACHE: Record<string, HTMLImageElement> = {};

const PROGRAMS = [
  { name: 'After Effects', path: '/assets/Programs/After effects.svg' },
  { name: 'Blender', path: '/assets/Programs/Blender.svg' },
  { name: 'CSS', path: '/assets/Programs/CSS.svg' },
  { name: 'Comfy UI', path: '/assets/Programs/Comfy UI.svg' },
  { name: 'HTML', path: '/assets/Programs/HTML.svg' },
  { name: 'Illustrator', path: '/assets/Programs/Illustrator.svg' },
  { name: 'Photoshop', path: '/assets/Programs/Photoshop.svg' },
  { name: 'SQL', path: '/assets/Programs/Sql.svg' },
  { name: 'Substance', path: '/assets/Programs/Substance.svg' },
  { name: 'Unity', path: '/assets/Programs/UNITY.svg' },
  { name: 'Visual Studio', path: '/assets/Programs/Visual Studio.svg' },
  { name: 'ZBrush', path: '/assets/Programs/Zbrush.svg' },
  { name: 'Premiere', path: '/assets/Programs/premiere.svg' },
];

export function PhysicsSection() {
  const { t } = useLanguage();
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  // Matter.js Refs
  const engineRef = useRef<Matter.Engine | null>(null);
  const runnerRef = useRef<Matter.Runner | null>(null);
  
  // Boundary Refs to dynamically update positions on resize without resetting simulation
  const leftWallRef = useRef<Matter.Body | null>(null);
  const rightWallRef = useRef<Matter.Body | null>(null);
  const ceilingRef = useRef<Matter.Body | null>(null);
  const leftSlantRef = useRef<Matter.Body | null>(null);
  const flatFloorRef = useRef<Matter.Body | null>(null);

  const isInView = useInView(containerRef, { margin: '200px' });
  const isInViewRef = useRef(isInView);
  const renderRef = useRef<() => void>(null);

  useEffect(() => {
    isInViewRef.current = isInView;
  }, [isInView]);

  const [images, setImages] = useState<Record<string, HTMLImageElement>>({});
  const [isImagesLoaded, setIsImagesLoaded] = useState(false);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

  // Stagger and animation timing refs
  const mountTimeRef = useRef(Date.now());
  const velocityQueueRef = useRef<number[]>([]);
  const lastScrollTimeRef = useRef(Date.now());
  const lastUpdateTickRef = useRef(Date.now());
  const diminishMultiplierRef = useRef(1.0);

  // Track scroll velocity and acceleration
  const { scrollY } = useScroll();
  const scrollVelocity = useVelocity(scrollY);
  const lastVelocityRef = useRef(0);

  // Map paths to program names for the text fallback tags
  const programNameMap = useMemo(() => {
    const map: Record<string, string> = {};
    PROGRAMS.forEach(p => {
      map[p.path] = p.name;
    });
    return map;
  }, []);

  // Preload SVG icons (Concurrent/StrictMode safe using a global cache)
  useEffect(() => {
    let active = true;
    const cachedKeys = Object.keys(IMAGE_CACHE);
    if (cachedKeys.length === PROGRAMS.length) {
      setImages(IMAGE_CACHE);
      setIsImagesLoaded(true);
      return;
    }

    let loaded = 0;
    PROGRAMS.forEach((program) => {
      if (IMAGE_CACHE[program.path]) {
        loaded++;
        if (loaded === PROGRAMS.length && active) {
          setImages({ ...IMAGE_CACHE });
          setIsImagesLoaded(true);
        }
        return;
      }

      const img = new Image();
      img.src = program.path;
      img.onload = () => {
        IMAGE_CACHE[program.path] = img;
        if (!active) return;
        loaded++;
        if (loaded === PROGRAMS.length) {
          setImages({ ...IMAGE_CACHE });
          setIsImagesLoaded(true);
        }
      };
      img.onerror = (err) => {
        console.error("Failed to load SVG:", program.path, err);
        if (!active) return;
        loaded++;
        if (loaded === PROGRAMS.length) {
          setImages({ ...IMAGE_CACHE });
          setIsImagesLoaded(true);
        }
      };
    });

    return () => {
      active = false;
    };
  }, []);

  // Track container dimensions with resize listener
  useEffect(() => {
    if (!containerRef.current) return;
    const handleResize = () => {
      if (containerRef.current) {
        setDimensions({
          width: containerRef.current.clientWidth,
          height: containerRef.current.clientHeight,
        });
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Initialize Matter.js physics engine ONCE when images load
  useEffect(() => {
    if (!isImagesLoaded || !canvasRef.current || !containerRef.current) return;

    // Reset mount time to sync fresh intro on load/reload
    mountTimeRef.current = Date.now();

    const width = containerRef.current.clientWidth;
    const height = containerRef.current.clientHeight;
    const canvas = canvasRef.current;
    canvas.width = width;
    canvas.height = height;

    // Create physics engine with higher gravity for a heavy, realistic feel
    const engine = Matter.Engine.create({
      gravity: { x: 0, y: 1.8 } // higher gravity (heavier icons)
    });
    engineRef.current = engine;

    const runner = Matter.Runner.create();
    runnerRef.current = runner;

    const thickness = 60;
    const isMobile = width < 768;
    
    // Medium-large visual size for SVGs
    const visualRadius = isMobile ? 32 : 45;
    // Add 15% padding to physical colliders to prevent visual corner overlapping
    const collisionRadius = visualRadius * 1.15;

    // 1. Create Left and Right static walls
    const leftWall = Matter.Bodies.rectangle(-thickness / 2, height / 2, thickness, height * 2, {
      isStatic: true,
      friction: 0.9, // high friction
      restitution: 0.1 // very low bounciness
    });
    leftWallRef.current = leftWall;

    const rightWall = Matter.Bodies.rectangle(width + thickness / 2, height / 2, thickness, height * 2, {
      isStatic: true,
      friction: 0.9,
      restitution: 0.1
    });
    rightWallRef.current = rightWall;

    // 2. Create Top ceiling (blocks SVGs from escaping, set exactly at y = -thickness/2 so bottom is y = 0)
    const ceiling = Matter.Bodies.rectangle(width / 2, -thickness / 2, width * 2, thickness, {
      isStatic: true,
      friction: 0.1,
      restitution: 0.1
    });
    ceilingRef.current = ceiling;

    // 3. Create Bottom boundaries matching the right-triangle (left) + horizontal flat floor (middle/right)
    // Left Slant (goes UP-right): from (0, height - 20) to (width * 0.20, height - 95)
    const slantWidth = width * 0.20;
    const slantHeight = -75; // slope goes up by 75px
    const slantLen = Math.sqrt(slantWidth * slantWidth + slantHeight * slantHeight);
    const slantAngle = Math.atan2(slantHeight, slantWidth);
    const slantShiftX = -Math.sin(slantAngle) * (thickness / 2);
    const slantShiftY = Math.cos(slantAngle) * (thickness / 2);
    const leftSlant = Matter.Bodies.rectangle(
      slantWidth / 2 + slantShiftX,
      (height - 20) + slantHeight / 2 + slantShiftY,
      slantLen + 10, // slight extension to prevent gap
      thickness,
      {
        isStatic: true,
        angle: slantAngle,
        friction: 0.08, // low friction so they slide easily
        restitution: 0.1, // low bounciness
        label: 'boundary_ramp'
      }
    );
    leftSlantRef.current = leftSlant;

    // Flat Floor (horizontal flat base): from (width * 0.20, height - 95) to (width, height - 95)
    const floorWidth = width * 0.82; // slightly wider to create overlap and prevent gaps
    const flatFloor = Matter.Bodies.rectangle(
      width - floorWidth / 2,
      height - 95 + thickness / 2,
      floorWidth,
      thickness,
      {
        isStatic: true,
        friction: 0.08, // low friction so they slide easily
        restitution: 0.1,
        label: 'boundary_ramp'
      }
    );
    flatFloorRef.current = flatFloor;

    // Spawn exactly 13 dynamic circular bodies staggered inside the visible section
    const bodies = PROGRAMS.map((program, idx) => {
      // Keep within wall boundaries
      const x = collisionRadius + 20 + Math.random() * (width - collisionRadius * 2 - 40);
      // Spawn staggered inside the top half of the visible area
      const y = 60 + (idx % 4) * 20;

      const body = Matter.Bodies.circle(x, y, collisionRadius, {
        restitution: 0.25, // low bounciness for solid weight
        friction: 0.08, // reduced sliding friction
        frictionStatic: 0.15, // reduced static friction
        frictionAir: 0.008, // reduced air drag for faster, longer slides
        density: 0.001,
        label: 'program_body'
      });

      // Disable standard collisions initially so they don't pop/glitch during entry
      body.collisionFilter.mask = 0;

      // Pass visual parameters to the plugin for custom rendering
      body.plugin = { 
        path: program.path, 
        visualRadius, 
        collisionRadius,
        index: idx,
        spawnX: x,
        spawnY: y
      };
      return body;
    });

    // Mouse control to throw and drag elements
    const mouse = Matter.Mouse.create(canvas);
    const mouseConstraint = Matter.MouseConstraint.create(engine, {
      mouse: mouse,
      constraint: {
        stiffness: 0.15,
        render: { visible: false }
      }
    });

    // Remove scroll-blocking wheel listeners from mouse constraint elements so scroll wheel still works
    const mouseAny = mouseConstraint.mouse as any;
    const scrollEvents = ['wheel', 'mousewheel', 'DOMMouseScroll'];
    scrollEvents.forEach(event => {
      if (mouseAny.mousewheel) {
        mouseConstraint.mouse.element.removeEventListener(event, mouseAny.mousewheel);
      }
      if (mouseAny.wheel) {
        mouseConstraint.mouse.element.removeEventListener(event, mouseAny.wheel);
      }
    });

    // Add all elements to Matter.js world
    Matter.Composite.add(engine.world, [
      leftWall,
      rightWall,
      ceiling,
      leftSlant,
      flatFloor,
      mouseConstraint,
      ...bodies
    ]);

    // Start simulation runner only if in view
    if (isInViewRef.current) {
      Matter.Runner.run(runner, engine);
    }

    // Calculate scroll acceleration on every physics tick (Newtonian inertia forces)
    Matter.Events.on(engine, 'beforeUpdate', () => {
      const now = Date.now();
      const currentVelocity = scrollVelocity.get(); // pixels per second
      
      // Enforce lock-position and disable collision filters for bodies in their entry phase
      const worldBodies = Matter.Composite.allBodies(engine.world);
      worldBodies.forEach((body) => {
        if (body.label === 'program_body') {
          const delay = body.plugin.index * 120;
          const duration = 650;
          const elapsed = now - (mountTimeRef.current + delay);

          if (elapsed < duration) {
            // Force keep static at spawn position
            Matter.Body.setPosition(body, { x: body.plugin.spawnX, y: body.plugin.spawnY });
            Matter.Body.setVelocity(body, { x: 0, y: 0 });
            Matter.Body.setAngularVelocity(body, 0);
            body.collisionFilter.mask = 0; // block any collision response
          } else {
            // Restore default collisions once entrance completes
            body.collisionFilter.mask = 0xFFFFFFFF;
          }
        }
      });

      // Direct instant scroll velocity calculation (no delay lag queue)
      const deltaVelocity = currentVelocity - lastVelocityRef.current;
      lastVelocityRef.current = currentVelocity;

      // Anti-spam filter: diminish force on consecutive inputs within 500ms
      if (Math.abs(deltaVelocity) > 2.0) {
        const timeDiff = now - lastScrollTimeRef.current;
        if (timeDiff < 500) {
          // Reduce influence by 25% per rapid change, minimum coefficient of 0.15
          diminishMultiplierRef.current = Math.max(0.15, diminishMultiplierRef.current - 0.25);
        } else {
          diminishMultiplierRef.current = 1.0;
        }
        lastScrollTimeRef.current = now;
      } else {
        // Gradually recover scroll influence multiplier back to 1.0
        const elapsedSec = (now - lastScrollTimeRef.current) / 1000;
        if (elapsedSec > 0.5) {
          const dT = now - lastUpdateTickRef.current;
          diminishMultiplierRef.current = Math.min(1.0, diminishMultiplierRef.current + dT * 0.0015);
        }
      }
      lastUpdateTickRef.current = now;

      // Newtonian inertia force (instant application):
      const forceMultiplier = Math.max(-0.08, Math.min(0.08, deltaVelocity * 0.000046)) * diminishMultiplierRef.current;

      worldBodies.forEach(body => {
        if (body.label === 'program_body') {
          const delay = body.plugin.index * 120;
          const elapsed = now - (mountTimeRef.current + delay);
          // Only apply force to active bodies that have finished their intro animation
          if (elapsed >= 650) {
            const forceY = forceMultiplier;
            // Add a boosted random horizontal force vector (multiplier 2.0) to scatter them wide and far
            const forceX = (Math.random() - 0.5) * 2 * Math.abs(forceMultiplier) * 2.0;

            Matter.Body.applyForce(body, body.position, {
              x: forceX * body.mass,
              y: forceY * body.mass
            });
          }
        }
      });
    });

    // Custom Canvas rendering loop
    const ctx = canvas.getContext('2d')!;
    let animFrameId: number;

    const render = () => {
      // Clear canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const currentTime = Date.now();
      const worldBodies = Matter.Composite.allBodies(engine.world);

      // Limit maximum velocity of all active program bodies to prevent clipping and glitchy rendering
      worldBodies.forEach(body => {
        if (body.label === 'program_body') {
          const maxSpeed = 15;
          if (body.speed > maxSpeed) {
            Matter.Body.setVelocity(body, {
              x: (body.velocity.x / body.speed) * maxSpeed,
              y: (body.velocity.y / body.speed) * maxSpeed
            });
          }
        }
      });

      // Draw program icons
      worldBodies.forEach((body) => {
        if (body.label === 'program_body') {
          const { path, visualRadius: vr, index } = body.plugin;
          const img = images[path];

          // Compute easeOutBack staggered scale progress
          const delay = index * 120;
          const duration = 650;
          const elapsed = currentTime - (mountTimeRef.current + delay);
          let scale = 0;

          if (elapsed >= 0) {
            if (elapsed < duration) {
              const t = elapsed / duration;
              const c1 = 1.70158;
              const c3 = c1 + 1;
              scale = 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2); // easeOutBack overshoot
            } else {
              scale = 1.0;
            }
          }

          // Do not draw if body has not popped/entered yet
          if (scale > 0) {
            ctx.save();
            ctx.translate(body.position.x, body.position.y);
            ctx.rotate(body.angle);

            const currentRadius = vr * scale;

            // Draw clean, high-performance offset shadow circle (no blur)
            ctx.beginPath();
            ctx.arc(2, 4, currentRadius * 0.96, 0, Math.PI * 2);
            ctx.fillStyle = 'rgba(0, 0, 0, 0.18)';
            ctx.fill();

            if (img) {
              ctx.drawImage(img, -currentRadius, -currentRadius, currentRadius * 2, currentRadius * 2);
            } else {
              // Draw a beautiful fallback circle with border and text if SVG loading fails/delays
              ctx.beginPath();
              ctx.arc(0, 0, vr * scale, 0, Math.PI * 2);
              ctx.fillStyle = '#1A1A1A';
              ctx.strokeStyle = '#df4581';
              ctx.lineWidth = 2.5 * scale;
              ctx.fill();
              ctx.stroke();

              ctx.fillStyle = '#E5E5E5';
              ctx.font = `bold ${Math.max(6, 10 * scale)}px sans-serif`;
              ctx.textAlign = 'center';
              ctx.textBaseline = 'middle';
              const name = programNameMap[path] || 'Tool';
              const displayName = name.length > 8 ? name.substring(0, 7) + '.' : name;
              ctx.fillText(displayName.toUpperCase(), 0, 0);
            }
            ctx.restore();
          }
        }
      });

      if (isInViewRef.current) {
        animFrameId = requestAnimationFrame(render);
      }
    };

    renderRef.current = render;
    render();

    return () => {
      // Cleanup Matter.js engine, runner, and render animation frame
      cancelAnimationFrame(animFrameId);
      Matter.Runner.stop(runner);
      Matter.World.clear(engine.world, false);
      Matter.Engine.clear(engine);
    };
  }, [isImagesLoaded]); // Only runs once on image load!

  // Update boundary positions dynamically on screen resize without destroying simulation state
  useEffect(() => {
    if (!engineRef.current || dimensions.width === 0 || dimensions.height === 0) return;

    const { width, height } = dimensions;
    const canvas = canvasRef.current;
    if (canvas) {
      canvas.width = width;
      canvas.height = height;
    }

    const thickness = 60;

    // Update left wall position
    if (leftWallRef.current) {
      Matter.Body.setPosition(leftWallRef.current, { x: -thickness / 2, y: height / 2 });
    }
    // Update right wall position
    if (rightWallRef.current) {
      Matter.Body.setPosition(rightWallRef.current, { x: width + thickness / 2, y: height / 2 });
    }
    // Update ceiling position (placed exactly at y = -thickness/2)
    if (ceilingRef.current) {
      Matter.Body.setPosition(ceilingRef.current, { x: width / 2, y: -thickness / 2 });
    }

    // Update Left Slant position and angle
    const slantWidth = width * 0.20;
    const slantHeight = -75;
    const slantLen = Math.sqrt(slantWidth * slantWidth + slantHeight * slantHeight);
    const slantAngle = Math.atan2(slantHeight, slantWidth);
    if (leftSlantRef.current) {
      const slantShiftX = -Math.sin(slantAngle) * (thickness / 2);
      const slantShiftY = Math.cos(slantAngle) * (thickness / 2);
      Matter.Body.setAngle(leftSlantRef.current, slantAngle);
      Matter.Body.setPosition(leftSlantRef.current, {
        x: slantWidth / 2 + slantShiftX,
        y: (height - 20) + slantHeight / 2 + slantShiftY
      });
    }

    // Update Flat Floor position
    const floorWidth = width * 0.82;
    if (flatFloorRef.current) {
      Matter.Body.setPosition(flatFloorRef.current, {
        x: width - floorWidth / 2,
        y: height - 95 + thickness / 2
      });
    }
  }, [dimensions]);

  // Generate deterministic ripped paper path: slanted on the left, horizontal on the right
  const paths = useMemo(() => {
    const points: string[] = [];
    const peakY = 25; // Top base height (flat area)
    const leftY = 100; // Bottom slant starting point on the left
    const steps = 250;

    for (let i = 0; i <= steps; i++) {
      const x = (i / steps) * 1000;
      
      // Slanted left ramp for first 20% (from leftY to peakY), horizontal flat line for the rest
      let baseY = 0;
      if (x <= 200) {
        baseY = leftY - (x / 200) * (leftY - peakY);
      } else {
        baseY = peakY;
      }

      // Multi-frequency wave noise for organic paper tear crop look
      const noise =
        2.0 * Math.sin(x * 0.12) +
        1.0 * Math.cos(x * 0.28) +
        0.4 * Math.sin(x * 0.65) +
        0.18 * Math.cos(x * 1.5);

      const y = baseY + noise;
      points.push(`${x.toFixed(1)},${y.toFixed(1)}`);
    }

    const lineD = `M ${points.join(' L ')}`;
    const maskD = `M 0,120 L ${points.join(' L ')} L 1000,120 Z`;

    return { lineD, maskD };
  }, []);

  // Dynamically start/stop the Matter.js simulation and animation ticks based on viewport visibility
  useEffect(() => {
    const runner = runnerRef.current;
    const engine = engineRef.current;
    if (!runner || !engine) return;

    if (isInView) {
      // Resume simulation runner
      Matter.Runner.run(runner, engine);
      // Trigger render tick
      renderRef.current?.();
    } else {
      // Pause simulation runner to save idle CPU
      Matter.Runner.stop(runner);
    }
  }, [isInView]);

  return (
    <section
      ref={containerRef}
      id="physics"
      className="relative w-full h-[320px] md:h-[400px] bg-transparent overflow-hidden select-none"
    >
      {/* Background Wrapper with ClipPath at z-[2] */}
      <div 
        style={{
          clipPath: 'polygon(0% 0%, 100% 0%, 100% calc(100% - 95px), 20% calc(100% - 95px), 0% calc(100% - 20px))',
          WebkitClipPath: 'polygon(0% 0%, 100% 0%, 100% calc(100% - 95px), 20% calc(100% - 95px), 0% calc(100% - 20px))'
        }}
        className="absolute inset-0 z-[2] pointer-events-none"
      >
        {/* Black background layer */}
        <div className="absolute inset-0 bg-black pointer-events-none" />

        {/* Background Halftone Overlay Grid */}
        <div className="absolute inset-0 bg-[radial-gradient(#ffffff03_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none" />
      </div>

      {/* Canvas Wrapper with ClipPath at z-[6] to render logos in front of the scroll guide line */}
      <div 
        style={{
          clipPath: 'polygon(0% 0%, 100% 0%, 100% calc(100% - 95px), 20% calc(100% - 95px), 0% calc(100% - 20px))',
          WebkitClipPath: 'polygon(0% 0%, 100% 0%, 100% calc(100% - 95px), 20% calc(100% - 95px), 0% calc(100% - 20px))'
        }}
        className="absolute inset-0 z-[6] pointer-events-none"
      >
        {/* Physics Simulation Engine Canvas */}
        <canvas
          ref={canvasRef}
          style={{ touchAction: 'pan-y' }}
          className="absolute inset-0 w-full h-full block cursor-grab active:cursor-grabbing pointer-events-auto"
        />
      </div>

      {/* Stack Section Header - Minimalist (programas) text label */}
      <div className="absolute top-12 left-6 md:left-12 z-20 pointer-events-none">
        <span className="font-mono text-xs text-neutral-400 tracking-widest uppercase">
          ( {t('programsLabel')} )
        </span>
      </div>

      {/* Visual Torn Paper (Paper Crop) slanted bottom mask overlay at z-[7] */}
      <svg
        viewBox="0 0 1000 120"
        preserveAspectRatio="none"
        className="absolute bottom-0 left-0 w-full h-[120px] z-[7] pointer-events-none"
      >
        {/* Layer 1: White torn paper fiber edge (doubled in thickness) */}
        <path d={paths.lineD} fill="none" stroke="#FFFFFF" strokeWidth="11.0" />
        
        {/* Layer 2: Darker grey inner shadow fiber (scaled accordingly) */}
        <path d={paths.lineD} fill="none" stroke="#CCCCCC" strokeWidth="4.0" />

        {/* Layer 3: Made transparent to allow underlying ProjectsSection background to bleed through */}
        <path d={paths.maskD} fill="transparent" stroke="transparent" strokeWidth="1.0" />
      </svg>
    </section>
  );
}

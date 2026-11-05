interface TramaOverlayProps {
  pattern: 'reset-text' | 'arrows' | 'r-letter' | 'circles';
  color?: string; // e.g. '#ffffff' or '#df4581'
  opacity?: number; // e.g. 0.08 to 0.15
}

export function TramaOverlay({ pattern, color = '#ffffff', opacity = 0.1 }: TramaOverlayProps) {
  // Helper to escape special characters for svg data uri
  const getSvgUri = (svgContent: string) => {
    return `url("data:image/svg+xml;utf8,${encodeURIComponent(svgContent)}")`;
  };

  // Generate pattern SVG based on the prop
  let svgString = '';

  if (pattern === 'reset-text') {
    svgString = `
      <svg xmlns="http://www.w3.org/2000/svg" width="140" height="70" viewBox="0 0 140 70">
        <text x="35" y="30" fill="${color}" font-family="'Plus Jakarta Sans', sans-serif" font-weight="800" font-size="10" transform="rotate(-15 35 30)" opacity="1">RESET</text>
        <text x="105" y="60" fill="${color}" font-family="'Plus Jakarta Sans', sans-serif" font-weight="800" font-size="10" transform="rotate(-15 105 60)" opacity="1">RESET</text>
      </svg>
    `;
  } else if (pattern === 'r-letter') {
    svgString = `
      <svg xmlns="http://www.w3.org/2000/svg" width="50" height="50" viewBox="0 0 50 50">
        <text x="25" y="30" fill="${color}" font-family="'Plus Jakarta Sans', sans-serif" font-weight="800" font-size="14" text-anchor="middle" opacity="1">R</text>
      </svg>
    `;
  } else if (pattern === 'arrows') {
    svgString = `
      <svg xmlns="http://www.w3.org/2000/svg" width="80" height="80" viewBox="0 0 80 80">
        <g stroke="${color}" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" fill="none" opacity="1">
          <path d="M15 25 h20 M20 20 l-5 5 5 5 M30 20 l5-5 -5-5" transform="rotate(-30 25 25)"/>
          <path d="M55 65 h20 M60 60 l-5 5 5 5 M70 60 l5-5 -5-5" transform="rotate(-30 65 65)"/>
        </g>
      </svg>
    `;
  } else if (pattern === 'circles') {
    // Reset circular loop icon
    svgString = `
      <svg xmlns="http://www.w3.org/2000/svg" width="80" height="80" viewBox="0 0 80 80">
        <g stroke="${color}" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" fill="none" opacity="1">
          <path d="M25 25 A 10 10 0 1 1 25 35 M 20 25 L 25 25 L 25 20" />
          <path d="M65 55 A 10 10 0 1 1 65 65 M 60 55 L 65 55 L 65 50" />
        </g>
      </svg>
    `;
  }

  const bgImageValue = getSvgUri(svgString.trim());

  return (
    <div
      className="absolute inset-0 pointer-events-none z-0"
      style={{
        backgroundImage: bgImageValue,
        backgroundRepeat: 'repeat',
        opacity: opacity,
      }}
    />
  );
}

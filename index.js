function getDisplacementMap({ height, width, radius, depth }) {
  const svg = `<svg height="${height}" width="${width}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">
    <style>
        .mix { mix-blend-mode: screen; }
    </style>
    <defs>
        <linearGradient 
          id="Y" 
          x1="0" 
          x2="0" 
          y1="${Math.ceil((radius / height) * 15)}%" 
          y2="${Math.floor(100 - (radius / height) * 15)}%">
            <stop offset="0%" stop-color="#0F0" />
            <stop offset="100%" stop-color="#000" />
        </linearGradient>
        <linearGradient 
          id="X" 
          x1="${Math.ceil((radius / width) * 15)}%" 
          x2="${Math.floor(100 - (radius / width) * 15)}%"
          y1="0" 
          y2="0">
            <stop offset="0%" stop-color="#F00" />
            <stop offset="100%" stop-color="#000" />
        </linearGradient>
    </defs>

    <rect x="0" y="0" height="${height}" width="${width}" fill="#808080" />
    <g filter="blur(2px)">
      <rect x="0" y="0" height="${height}" width="${width}" fill="#000080" />
      <rect
          x="0"
          y="0"
          height="${height}"
          width="${width}"
          fill="url(#Y)"
          class="mix"
      />
      <rect
          x="0"
          y="0"
          height="${height}"
          width="${width}"
          fill="url(#X)"
          class="mix"
      />
      <rect
          x="${depth}"
          y="${depth}"
          height="${height - 2 * depth}"
          width="${width - 2 * depth}"
          fill="#808080"
          rx="${radius}"
          ry="${radius}"
          filter="blur(${depth}px)"
      />
    </g>
</svg>`;

  return "data:image/svg+xml;utf8," + encodeURIComponent(svg);
}

function getDisplacementFilter({
  height,
  width,
  radius,
  depth,
  strength = 100,
  chromaticAberration = 0,
}) {
  const dispMapURL = getDisplacementMap({ height, width, radius, depth });
  const svg = `<svg height="${height}" width="${width}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <filter id="glass-distortion" color-interpolation-filters="sRGB">
            <feImage x="0" y="0" height="${height}" width="${width}" href="${dispMapURL}" result="displacementMap" />
            <feDisplacementMap in="SourceGraphic" in2="displacementMap"
              scale="${strength + chromaticAberration * 2}"
              xChannelSelector="R" yChannelSelector="G" result="dR"/>
            <feColorMatrix in="dR" type="matrix"
              values="1 0 0 0 0
                      0 0 0 0 0
                      0 0 0 0 0
                      0 0 0 1 0" result="displacedR"/>
            <feDisplacementMap in="SourceGraphic" in2="displacementMap"
              scale="${strength + chromaticAberration}"
              xChannelSelector="R" yChannelSelector="G" result="dG"/>
            <feColorMatrix in="dG" type="matrix"
              values="0 0 0 0 0
                      0 1 0 0 0
                      0 0 0 0 0
                      0 0 0 1 0" result="displacedG"/>
            <feDisplacementMap in="SourceGraphic" in2="displacementMap"
              scale="${strength}"
              xChannelSelector="R" yChannelSelector="G" result="dB"/>
            <feColorMatrix in="dB" type="matrix"
              values="0 0 0 0 0
                      0 0 0 0 0
                      0 0 1 0 0
                      0 0 0 1 0" result="displacedB"/>
            <feBlend in="displacedR" in2="displacedG" mode="screen" result="rg"/>
            <feBlend in="rg" in2="displacedB" mode="screen"/>
          </filter>
        </defs>
      </svg>`;

  return (
    "data:image/svg+xml;utf8," + encodeURIComponent(svg) + "#glass-distortion"
  );
}

(function applyGlass() {
  const el = document.querySelector(".my-glass");
  if (!el) return;

  const width = Math.max(
    document.documentElement.clientWidth,
    window.innerWidth || 0
  );
  const height = Math.max(
    document.documentElement.clientHeight,
    window.innerHeight || 0
  );

  const filterURL = getDisplacementFilter({
    height,
    width,
    radius: 8,
    depth: 64,
    chromaticAberration: 1,
  });

  el.style.backdropFilter = `url("${filterURL}")`;
  el.style.webkitBackdropFilter = `url("${filterURL}")`;
})();

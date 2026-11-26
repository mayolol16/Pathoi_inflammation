/**
 * Deterministic PRNG so SVG histology cells never jump on re-render.
 */
function makeRng(seed) {
  let s = seed % 2147483647;
  if (s <= 0) s += 2147483646;
  return () => {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

function neutrophilGlyph(x, y, scale = 1, rot = 0) {
  return `<g transform="translate(${x.toFixed(1)},${y.toFixed(1)}) rotate(${rot.toFixed(0)}) scale(${scale})">
    <circle r="7.5" fill="#f0d9df" stroke="#b98395" stroke-width="0.6" opacity="0.92"/>
    <path d="M-4.2,-2.2 C-2.5,-4.5 0.5,-4.2 1.2,-1.5 C2.8,-3.5 5.2,-1.5 4.2,1.6 C3.2,4.2 0.2,3.8 -0.8,1.4 C-2.2,4.2 -5.0,2.5 -4.2,-2.2 Z" fill="#2b1e4a"/>
  </g>`;
}

function lymphocyteGlyph(x, y, scale = 1) {
  return `<g transform="translate(${x.toFixed(1)},${y.toFixed(1)}) scale(${scale})">
    <circle r="6.2" fill="#d9c6db" stroke="#8b6b96" stroke-width="0.5"/>
    <circle r="4.9" fill="#2b1d47"/>
  </g>`;
}

function plasmaCellGlyph(x, y, scale = 1, rot = 0) {
  return `<g transform="translate(${x.toFixed(1)},${y.toFixed(1)}) rotate(${rot.toFixed(0)}) scale(${scale})">
    <ellipse rx="10" ry="7.8" fill="#c795b4" stroke="#854f74" stroke-width="0.7"/>
    <ellipse cx="1.8" cy="0.5" rx="3.2" ry="2.4" fill="#efdce8" opacity="0.85"/>
    <circle cx="-4.2" cy="-0.6" r="4.1" fill="#2c1b45"/>
    <circle cx="-5.1" cy="-1.2" r="0.9" fill="#9a7eb8"/>
    <circle cx="-3.3" cy="0.3" r="0.9" fill="#9a7eb8"/>
  </g>`;
}

export function renderOrientationModelSVG(itemId, shown) {
  const abn = shown === 'abnormal';
  const rand = makeRng(itemId.length * 101 + (abn ? 77 : 13));

  if (itemId === 'ori-gross-appendix') {
    if (!abn) {
      return `
        <svg viewBox="0 0 360 200" style="width:100%; max-width:440px; display:block;" aria-label="Schematic normal appendix">
          <rect width="360" height="200" fill="#171512"/>
          <path d="M55,65 Q75,55 95,88 Q125,132 195,128 Q265,124 300,104 Q312,96 306,86 Q298,76 280,82 Q220,104 165,104 Q122,102 104,68 Q95,48 75,46 Z"
            fill="#d9a693" stroke="#8f5c4c" stroke-width="2"/>
          <path d="M110,82 Q170,112 285,90" fill="none" stroke="#f0cabd" stroke-width="2" opacity="0.65"/>
          <text x="16" y="185" fill="#cfc8b6" font-family="Courier New, monospace" font-size="10">Slim · Uniform pink-tan · Smooth serosa</text>
        </svg>`;
    }
    return `
      <svg viewBox="0 0 360 200" style="width:100%; max-width:440px; display:block;" aria-label="Schematic acutely inflamed appendix">
        <rect width="360" height="200" fill="#171512"/>
        <path d="M52,70 Q72,48 106,84 Q142,138 220,136 Q295,134 316,102 Q328,80 302,66 Q266,54 205,74 Q146,90 112,56 Q90,38 66,46 Z"
          fill="#7a2626" stroke="#3c0e0e" stroke-width="2.5"/>
        <path d="M140,86 Q210,74 282,82" fill="none" stroke="#b33d3d" stroke-width="3" opacity="0.7"/>
        <ellipse cx="235" cy="96" rx="22" ry="9" fill="#efe2b6" opacity="0.72" transform="rotate(-8 235 96)"/>
        <ellipse cx="280" cy="86" rx="16" ry="7" fill="#efe2b6" opacity="0.78" transform="rotate(14 280 86)"/>
        <ellipse cx="180" cy="112" rx="14" ry="5" fill="#e8d6a2" opacity="0.65"/>
        <text x="16" y="185" fill="#cfc8b6" font-family="Courier New, monospace" font-size="10">Swollen · Dusky red congestion · Fibrinopurulent exudate</text>
      </svg>`;
  }

  if (itemId === 'ori-micro-gi-wall') {
    const crypts = Array.from({ length: 7 }).map((_, i) => {
      const cx = 42 + i * 44;
      if (abn && (i === 2 || i === 3 || i === 4)) {
        return `<path d="M${cx - 10},32 L${cx - 6},54 L${cx + 8},48 L${cx + 12},34" fill="#9c4855" opacity="0.65"/>`;
      }
      return `<rect x="${cx - 12}" y="22" width="24" height="36" rx="10" fill="#d9b4d0" stroke="#784b7a" stroke-width="1.4"/>
              <rect x="${cx - 5}" y="26" width="10" height="28" rx="5" fill="#f7eef4"/>`;
    }).join('');

    const wallPMNs = abn
      ? Array.from({ length: 34 }).map(() => {
          const x = 35 + rand() * 290;
          const y = 96 + rand() * 52;
          return `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="2.3" fill="#271742"/>`;
        }).join('')
      : '';

    const lumenContent = abn
      ? Array.from({ length: 28 }).map(() => {
          const x = 45 + rand() * 270;
          const y = 166 + rand() * 18;
          return `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="2" fill="#3a284e" opacity="0.85"/>`;
        }).join('')
      : '';

    return `
      <svg viewBox="0 0 360 205" style="width:100%; max-width:440px; display:block;" aria-label="Schematic GI wall layers">
        <rect width="360" height="205" fill="#171512"/>
        <!-- Mucosa -->
        <rect x="20" y="18" width="320" height="44" fill="${abn ? '#c98da2' : '#e6bfd4'}"/>
        ${crypts}
        <!-- Submucosa -->
        <rect x="20" y="62" width="320" height="30" fill="${abn ? '#eedbe0' : '#f2e6ea'}"/>
        ${abn ? '<ellipse cx="110" cy="77" rx="18" ry="6" fill="#c93838" opacity="0.75"/><ellipse cx="250" cy="76" rx="22" ry="7" fill="#c93838" opacity="0.75"/>' : '<circle cx="110" cy="77" r="4" fill="#d47272" opacity="0.6"/><circle cx="250" cy="77" r="4" fill="#d47272" opacity="0.6"/>'}
        <!-- Muscularis propria -->
        <rect x="20" y="92" width="320" height="58" fill="#d97d8e"/>
        <path d="M20,112 L340,112 M20,130 L340,130" stroke="#c45c70" stroke-width="1" opacity="0.6"/>
        ${wallPMNs}
        <!-- Lumen -->
        <rect x="20" y="154" width="320" height="32" fill="${abn ? '#d4c3b4' : '#0f0e0c'}"/>
        ${lumenContent}
        <text x="24" y="199" fill="#cfc8b6" font-family="Courier New, monospace" font-size="9.5">Mucosa → Submucosa → Muscularis → Lumen ${abn ? '(purulent + PMNs in wall)' : '(intact, clear lumen)'}</text>
      </svg>`;
  }

  if (itemId === 'ori-gross-stomach') {
    if (!abn) {
      return `
        <svg viewBox="0 0 360 200" style="width:100%; max-width:440px; display:block;" aria-label="Schematic normal stomach rugae">
          <rect width="360" height="200" fill="#171512"/>
          <rect x="28" y="22" width="304" height="148" rx="18" fill="#c9857d" stroke="#7d4640" stroke-width="2"/>
          <path d="M45,52 Q115,44 180,55 T315,52 M45,78 Q115,70 180,81 T315,78 M45,104 Q115,96 180,107 T315,104 M45,130 Q115,122 180,133 T315,130"
            fill="none" stroke="#9e5850" stroke-width="5" stroke-linecap="round"/>
          <path d="M45,50 Q115,42 180,53 T315,50 M45,76 Q115,68 180,79 T315,76 M45,102 Q115,94 180,105 T315,102 M45,128 Q115,120 180,131 T315,128"
            fill="none" stroke="#e4a9a2" stroke-width="2" opacity="0.6"/>
          <text x="18" y="190" fill="#cfc8b6" font-family="Courier New, monospace" font-size="10">Velvety pink-tan mucosa · Regular uninterrupted rugal folds</text>
        </svg>`;
    }
    return `
      <svg viewBox="0 0 360 200" style="width:100%; max-width:440px; display:block;" aria-label="Schematic chronic peptic ulcer">
        <rect width="360" height="200" fill="#171512"/>
        <rect x="28" y="22" width="304" height="148" rx="18" fill="#bf7d76" stroke="#6e3d38" stroke-width="2"/>
        <path d="M45,55 Q100,52 135,76 M225,76 Q260,52 315,55 M45,96 L128,96 M232,96 L315,96 M45,134 Q100,136 138,118 M222,118 Q260,136 315,134"
          fill="none" stroke="#94524c" stroke-width="4.5" stroke-linecap="round"/>
        <ellipse cx="180" cy="96" rx="44" ry="30" fill="#8f4640" stroke="#f0dcd5" stroke-width="2"/>
        <ellipse cx="180" cy="96" rx="34" ry="22" fill="#4f221f"/>
        <ellipse cx="180" cy="98" rx="22" ry="13" fill="#cfc1a8" opacity="0.75"/>
        <circle cx="186" cy="97" r="4" fill="#a81d1d"/>
        <text x="18" y="190" fill="#cfc8b6" font-family="Courier New, monospace" font-size="10">Sharp punched-out crater · Flat clean margins · Radiating folds</text>
      </svg>`;
  }

  if (itemId === 'ori-micro-neutrophil') {
    if (!abn) {
      const sparse = Array.from({ length: 14 }).map((_, i) => {
        const x = 40 + (i % 5) * 68 + (rand() * 14 - 7);
        const y = 40 + Math.floor(i / 5) * 48 + (rand() * 14 - 7);
        return `<ellipse cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" rx="8" ry="4" fill="#6e4b8a" opacity="0.7" transform="rotate(${(rand() * 40 - 20).toFixed(0)} ${x.toFixed(1)} ${y.toFixed(1)})"/>`;
      }).join('');
      return `
        <svg viewBox="0 0 360 190" style="width:100%; max-width:440px; display:block;" aria-label="Schematic normal high power field">
          <rect width="360" height="190" fill="#f2dce6"/>
          <path d="M0,45 Q180,35 360,55 M0,115 Q180,128 360,108" stroke="#e2b9cb" stroke-width="6" fill="none"/>
          ${sparse}
          <rect y="166" width="360" height="24" fill="#171512" opacity="0.88"/>
          <text x="14" y="182" fill="#cfc8b6" font-family="Courier New, monospace" font-size="10">Clean pink stroma · Few spaced stromal nuclei · No PMNs</text>
        </svg>`;
    }
    const pmns = Array.from({ length: 34 }).map((_, i) => {
      const x = 28 + (i % 8) * 42 + (rand() * 14 - 7);
      const y = 24 + Math.floor(i / 8) * 32 + (rand() * 12 - 6);
      return neutrophilGlyph(x, y, 1.05, rand() * 360);
    }).join('');
    return `
      <svg viewBox="0 0 360 190" style="width:100%; max-width:440px; display:block;" aria-label="Schematic neutrophils high power">
        <rect width="360" height="190" fill="#e8cfd6"/>
        <path d="M15,40 Q175,65 345,35 M20,120 Q190,100 340,132" stroke="#c996a5" stroke-width="5" fill="none" opacity="0.6"/>
        ${pmns}
        <rect y="166" width="360" height="24" fill="#171512" opacity="0.88"/>
        <text x="14" y="182" fill="#cfc8b6" font-family="Courier New, monospace" font-size="10">Dense neutrophils with multi-lobed segmented nuclei + fibrin debris</text>
      </svg>`;
  }

  // ori-micro-chronic: Acute vs Chronic cells
  if (!abn) {
    const pmns = Array.from({ length: 30 }).map((_, i) => {
      const x = 32 + (i % 7) * 48 + (rand() * 14 - 7);
      const y = 26 + Math.floor(i / 7) * 32 + (rand() * 10 - 5);
      return neutrophilGlyph(x, y, 1.05, rand() * 360);
    }).join('');
    return `
      <svg viewBox="0 0 360 190" style="width:100%; max-width:440px; display:block;" aria-label="Schematic acute neutrophil field">
        <rect width="360" height="190" fill="#edd6de"/>
        ${pmns}
        <rect y="166" width="360" height="24" fill="#171512" opacity="0.88"/>
        <text x="14" y="182" fill="#cfc8b6" font-family="Courier New, monospace" font-size="10">ACUTE: Multi-lobed segmented nuclei (neutrophils) · Innate · Hours</text>
      </svg>`;
  }

  const chronics = Array.from({ length: 26 }).map((_, i) => {
    const x = 34 + (i % 6) * 54 + (rand() * 16 - 8);
    const y = 26 + Math.floor(i / 6) * 32 + (rand() * 10 - 5);
    return i % 2 === 0
      ? plasmaCellGlyph(x, y, 1.05, rand() * 40 - 20)
      : lymphocyteGlyph(x, y, 1.05);
  }).join('');
  return `
    <svg viewBox="0 0 360 190" style="width:100%; max-width:440px; display:block;" aria-label="Schematic chronic lymphocytes and plasma cells">
      <rect width="360" height="190" fill="#ebd9e6"/>
      ${chronics}
      <rect y="166" width="360" height="24" fill="#171512" opacity="0.88"/>
      <text x="14" y="182" fill="#cfc8b6" font-family="Courier New, monospace" font-size="10">CHRONIC: Round lymphocytes + eccentric clock-face plasma cells · Weeks</text>
    </svg>`;
}

/**
 * Detailed representative H&E SVG models for Cases 1–3, aligned with CASES zone coordinates.
 */
export function renderCaseModelSVG(caseId) {
  const rand = makeRng(caseId.charCodeAt(4) * 313);

  if (caseId === 'case1') {
    // Zones: lumen (50,38 -> 200,152), mucosa (40,58 -> 160,232), wall (62,70 -> 248,280), serosa (78,50 -> 312,200)
    const lumenPMNs = Array.from({ length: 48 }).map(() => {
      const a = rand() * Math.PI * 2;
      const r = rand() * 42;
      return `<circle cx="${(200 + Math.cos(a) * r).toFixed(1)}" cy="${(165 + Math.sin(a) * r * 0.9).toFixed(1)}" r="2.2" fill="#2a1b47" opacity="0.85"/>`;
    }).join('');

    const wallPMNs = Array.from({ length: 70 }).map(() => {
      const a = rand() * Math.PI * 2;
      const r = 82 + rand() * 36;
      return `<circle cx="${(200 + Math.cos(a) * r * 0.92).toFixed(1)}" cy="${(200 + Math.sin(a) * r * 1.1).toFixed(1)}" r="2.1" fill="#23143d" opacity="0.88"/>`;
    }).join('');

    return `
      <svg viewBox="0 0 400 400" style="width:100%; display:block; background:#14120f;" aria-label="Representative H&E cross-section of acute appendicitis">
        <!-- Outer Serosa with hemorrhage & congestion -->
        <ellipse cx="200" cy="200" rx="134" ry="158" fill="#c95b68" stroke="#7d2531" stroke-width="3"/>
        <path d="M312,135 Q332,200 306,275" fill="none" stroke="#8f141e" stroke-width="11" opacity="0.65" stroke-linecap="round"/>
        <!-- Muscularis propria -->
        <ellipse cx="200" cy="200" rx="116" ry="138" fill="#d9798e" stroke="#b34d64" stroke-width="1.5"/>
        ${wallPMNs}
        <!-- Submucosa (edematous) -->
        <ellipse cx="200" cy="196" rx="84" ry="102" fill="#f0d3dc" stroke="#c995a6" stroke-width="1"/>
        <circle cx="146" cy="150" r="7" fill="#b32934" opacity="0.7"/>
        <circle cx="255" cy="240" r="8" fill="#b32934" opacity="0.7"/>
        <!-- Eroded Mucosa / Lymphoid follicles -->
        <path d="M142,145 Q170,112 215,120 Q255,128 258,175 Q260,225 225,252 Q175,270 144,238 Q126,200 142,145 Z"
          fill="#c28ab0" stroke="#6e3e63" stroke-width="2" stroke-dasharray="14 6"/>
        <circle cx="152" cy="228" r="14" fill="#6b4478" opacity="0.55"/>
        <circle cx="242" cy="168" r="12" fill="#6b4478" opacity="0.55"/>
        <!-- Purulent Lumen -->
        <ellipse cx="200" cy="166" rx="46" ry="44" fill="#d9c6c0" stroke="#875d58" stroke-width="1.5"/>
        ${lumenPMNs}
        <text x="14" y="388" fill="#cfc8b6" font-family="Courier New, monospace" font-size="10">Representative H&amp;E whole-mount · Appendix cross-section</text>
      </svg>`;
  }

  if (caseId === 'case2') {
    // Zones: mucosa (30,30 -> 120,120), submucosa (55,42 -> 220,168), muscularis (38,62 -> 152,248), fibrosis (60,80 -> 240,320)
    const exudateDots = Array.from({ length: 42 }).map(() => {
      const x = 158 + rand() * 140;
      const y = 148 + rand() * 34;
      return `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="2" fill="#2c1942" opacity="0.85"/>`;
    }).join('');

    const scarLines = Array.from({ length: 16 }).map((_, i) => {
      const y = 266 + i * 5.5;
      return `<path d="M125,${y} Q215,${y - 4} 330,${y + 2}" stroke="#cf8aa0" stroke-width="2" fill="none" opacity="0.7"/>`;
    }).join('');

    return `
      <svg viewBox="0 0 400 400" style="width:100%; display:block; background:#14120f;" aria-label="Representative H&E cross-section of chronic peptic ulcer">
        <!-- Gastric wall base / fibrosis -->
        <rect x="24" y="24" width="352" height="346" fill="#eed9e2"/>
        <!-- Deep fibrotic scar replacing muscularis in ulcer base -->
        <path d="M120,245 L376,245 L376,370 L105,370 Z" fill="#e8bfd0"/>
        ${scarLines}
        <!-- Intact Muscularis propria on left side, breached in center/right -->
        <path d="M24,205 L182,205 L164,288 L24,288 Z" fill="#cc6b82" stroke="#9e4359" stroke-width="1.5"/>
        <path d="M310,215 L376,215 L376,288 L322,288 Z" fill="#cc6b82" stroke="#9e4359" stroke-width="1.5"/>
        <!-- Submucosa + granulation tissue + capillaries -->
        <rect x="24" y="138" width="352" height="68" fill="#f3e0e7"/>
        <path d="M168,185 Q215,172 252,190 M228,175 Q270,192 296,178" stroke="#c93640" stroke-width="2.5" fill="none"/>
        <!-- Intact Mucosa shoulder on left -->
        <path d="M24,62 L148,62 L162,140 L24,140 Z" fill="#b86b99" stroke="#753860" stroke-width="1.5"/>
        ${Array.from({ length: 6 }).map((_, i) => `<rect x="${34 + i * 19}" y="70" width="11" height="58" rx="5" fill="#edd2e3"/>`).join('')}
        <!-- Ulcer crater + acute necroinflammatory exudate -->
        <path d="M148,62 L168,144 L315,148 L345,78 L376,78 L376,24 L24,24 L24,62 Z" fill="#171512" opacity="0.9"/>
        <path d="M156,142 Q235,160 322,144 L310,185 Q235,196 164,182 Z" fill="#d9c0b8" stroke="#9c7166" stroke-width="1"/>
        ${exudateDots}
        <!-- Eroded artery at ulcer base -->
        <circle cx="242" cy="316" r="16" fill="#d67883" stroke="#7a1b24" stroke-width="3"/>
        <circle cx="242" cy="316" r="8" fill="#8f1119"/>
        <text x="14" y="388" fill="#cfc8b6" font-family="Courier New, monospace" font-size="10">Representative H&amp;E · Gastric ulcer wall &amp; fibrotic base</text>
      </svg>`;
  }

  // Case 3: TB caseating granuloma
  // Zones: center (50,42 -> 200,168), histiocytes (32,60 -> 128,240), giant-cells (66,58 -> 264,232), lymphocyte-rim (50,80 -> 200,320)
  const lymphCuff = Array.from({ length: 120 }).map(() => {
    const a = rand() * Math.PI * 2;
    const r = 114 + rand() * 44;
    const x = 200 + Math.cos(a) * r;
    const y = 195 + Math.sin(a) * r;
    return `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="3.1" fill="#2c1d4c" opacity="0.85"/>`;
  }).join('');

  const epithelioidCells = Array.from({ length: 34 }).map((_, i) => {
    const a = (i / 34) * Math.PI * 2 + 0.15;
    const r = 82 + (i % 3) * 14;
    const x = 200 + Math.cos(a) * r;
    const y = 192 + Math.sin(a) * r;
    return `<g transform="translate(${x.toFixed(1)},${y.toFixed(1)}) rotate(${((a * 180) / Math.PI + 90).toFixed(0)})">
      <ellipse rx="14" ry="7.5" fill="#e6a8bc" stroke="#b06982" stroke-width="0.8"/>
      <ellipse rx="4.5" ry="2.2" fill="#5e3e75"/>
    </g>`;
  }).join('');

  const giantCell = (cx, cy, rot) => {
    const nuclei = Array.from({ length: 10 }).map((_, i) => {
      const a = -0.8 + (i / 9) * Math.PI * 1.15;
      const nx = Math.cos(a) * 14;
      const ny = Math.sin(a) * 11;
      return `<circle cx="${nx.toFixed(1)}" cy="${ny.toFixed(1)}" r="2.3" fill="#321f54"/>`;
    }).join('');
    return `<g transform="translate(${cx},${cy}) rotate(${rot})">
      <ellipse rx="21" ry="16" fill="#df93ad" stroke="#8f4660" stroke-width="1.2"/>
      ${nuclei}
    </g>`;
  };

  return `
    <svg viewBox="0 0 400 400" style="width:100%; display:block; background:#14120f;" aria-label="Representative H&E caseating granuloma">
      <rect x="14" y="14" width="372" height="360" fill="#dfc4d6"/>
      <!-- Lymphocyte cuff -->
      <circle cx="200" cy="195" r="158" fill="#d9b4cb" opacity="0.5"/>
      ${lymphCuff}
      <!-- Epithelioid histiocyte rim -->
      <circle cx="200" cy="192" r="112" fill="#e8bfd0" stroke="#bd7f98" stroke-width="1"/>
      ${epithelioidCells}
      <!-- Langhans multinucleated giant cells -->
      ${giantCell(264, 228, 35)}
      ${giantCell(142, 134, -40)}
      ${giantCell(252, 136, 120)}
      <!-- Central caseous necrosis -->
      <path d="M150,150 Q200,124 246,154 Q266,192 238,224 Q192,238 156,214 Q134,182 150,150 Z"
        fill="#f2c4cf" stroke="#c98597" stroke-width="1.5"/>
      <ellipse cx="198" cy="178" rx="34" ry="24" fill="#f5d3dc" opacity="0.85"/>
      <circle cx="185" cy="172" r="1.4" fill="#8f5c6c"/><circle cx="212" cy="184" r="1.2" fill="#8f5c6c"/>
      <circle cx="196" cy="192" r="1.3" fill="#8f5c6c"/><circle cx="206" cy="166" r="1.1" fill="#8f5c6c"/>
      <text x="14" y="390" fill="#cfc8b6" font-family="Courier New, monospace" font-size="10">Representative H&amp;E · Caseating granuloma (TB lymph node)</text>
    </svg>`;
}

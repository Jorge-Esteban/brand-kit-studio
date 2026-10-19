// Catálogo curado de Google Fonts. `weights` = pesos disponibles (para no pedir pesos inexistentes).
const R = (a, b, step = 100) => Array.from({ length: (b - a) / step + 1 }, (_, i) => a + i * step);

export const FONT_CATEGORIES = [
  { id: 'all', label: 'Todas' },
  { id: 'sans', label: 'Sans serif' },
  { id: 'serif', label: 'Serif' },
  { id: 'display', label: 'Display' },
  { id: 'handwriting', label: 'Manuscrita' },
  { id: 'mono', label: 'Monoespaciada' },
];

export const FONTS = [
  // Sans serif
  { family: 'Inter', category: 'sans', weights: R(100, 900), tags: 'neutral, interfaces' },
  { family: 'Roboto', category: 'sans', weights: [100, 300, 400, 500, 700, 900], tags: 'neutral, android' },
  { family: 'Open Sans', category: 'sans', weights: R(300, 800), tags: 'legible, amable' },
  { family: 'Montserrat', category: 'sans', weights: R(100, 900), tags: 'geométrica, corporativa' },
  { family: 'Poppins', category: 'sans', weights: R(100, 900), tags: 'geométrica, moderna' },
  { family: 'Lato', category: 'sans', weights: [100, 300, 400, 700, 900], tags: 'cálida, corporativa' },
  { family: 'Nunito', category: 'sans', weights: R(200, 900), tags: 'redondeada, amable' },
  { family: 'Work Sans', category: 'sans', weights: R(100, 900), tags: 'grotesca, versátil' },
  { family: 'DM Sans', category: 'sans', weights: R(100, 900), tags: 'geométrica, startup' },
  { family: 'Manrope', category: 'sans', weights: R(200, 800), tags: 'moderna, tech' },
  { family: 'Plus Jakarta Sans', category: 'sans', weights: R(200, 800), tags: 'moderna, producto' },
  { family: 'Outfit', category: 'sans', weights: R(100, 900), tags: 'geométrica, limpia' },
  { family: 'Space Grotesk', category: 'sans', weights: R(300, 700), tags: 'tech, peculiar' },
  { family: 'Sora', category: 'sans', weights: R(100, 800), tags: 'tech, futurista' },
  { family: 'Figtree', category: 'sans', weights: R(300, 900), tags: 'amable, limpia' },
  { family: 'Raleway', category: 'sans', weights: R(100, 900), tags: 'elegante, fina' },
  { family: 'Rubik', category: 'sans', weights: R(300, 900), tags: 'redondeada, lúdica' },
  { family: 'IBM Plex Sans', category: 'sans', weights: R(100, 700), tags: 'técnica, corporativa' },
  { family: 'Source Sans 3', category: 'sans', weights: R(200, 900), tags: 'legible, editorial' },
  { family: 'Archivo', category: 'sans', weights: R(100, 900), tags: 'grotesca, fuerte' },
  { family: 'Urbanist', category: 'sans', weights: R(100, 900), tags: 'geométrica, minimal' },
  { family: 'Lexend', category: 'sans', weights: R(100, 900), tags: 'accesible, legible' },
  { family: 'Barlow', category: 'sans', weights: R(100, 900), tags: 'industrial, compacta' },
  { family: 'Karla', category: 'sans', weights: R(200, 800), tags: 'grotesca, peculiar' },
  // Serif
  { family: 'Playfair Display', category: 'serif', weights: R(400, 900), tags: 'editorial, elegante' },
  { family: 'Merriweather', category: 'serif', weights: [300, 400, 700, 900], tags: 'lectura, sólida' },
  { family: 'Lora', category: 'serif', weights: R(400, 700), tags: 'literaria, cálida' },
  { family: 'Libre Baskerville', category: 'serif', weights: [400, 700], tags: 'clásica, lectura' },
  { family: 'EB Garamond', category: 'serif', weights: R(400, 800), tags: 'clásica, libro' },
  { family: 'Cormorant Garamond', category: 'serif', weights: R(300, 700), tags: 'lujo, delicada' },
  { family: 'DM Serif Display', category: 'serif', weights: [400], tags: 'titulares, contraste' },
  { family: 'Fraunces', category: 'serif', weights: R(100, 900), tags: 'retro, con carácter' },
  { family: 'Crimson Pro', category: 'serif', weights: R(200, 900), tags: 'libro, sobria' },
  { family: 'Source Serif 4', category: 'serif', weights: R(200, 900), tags: 'editorial, legible' },
  { family: 'Bitter', category: 'serif', weights: R(100, 900), tags: 'slab, pantalla' },
  { family: 'Spectral', category: 'serif', weights: R(200, 800), tags: 'lectura, elegante' },
  { family: 'Instrument Serif', category: 'serif', weights: [400], tags: 'moda, editorial' },
  { family: 'Noto Serif', category: 'serif', weights: R(100, 900), tags: 'neutral, multilingüe' },
  // Display
  { family: 'Bebas Neue', category: 'display', weights: [400], tags: 'condensada, impacto' },
  { family: 'Anton', category: 'display', weights: [400], tags: 'condensada, póster' },
  { family: 'Abril Fatface', category: 'display', weights: [400], tags: 'didona, revista' },
  { family: 'Righteous', category: 'display', weights: [400], tags: 'retro, redondeada' },
  { family: 'Archivo Black', category: 'display', weights: [400], tags: 'pesada, contundente' },
  { family: 'Unbounded', category: 'display', weights: R(200, 900), tags: 'ancha, web3' },
  { family: 'Syne', category: 'display', weights: R(400, 800), tags: 'artística, experimental' },
  { family: 'Bricolage Grotesque', category: 'display', weights: R(200, 800), tags: 'peculiar, moderna' },
  { family: 'Lobster', category: 'display', weights: [400], tags: 'script, retro' },
  { family: 'Bungee', category: 'display', weights: [400], tags: 'urbana, señalética' },
  { family: 'Fredoka', category: 'display', weights: R(300, 700), tags: 'redondeada, infantil' },
  { family: 'Chakra Petch', category: 'display', weights: R(300, 700), tags: 'gaming, tech' },
  { family: 'Orbitron', category: 'display', weights: R(400, 900), tags: 'sci-fi, futurista' },
  { family: 'Press Start 2P', category: 'display', weights: [400], tags: 'pixel, 8 bits' },
  { family: 'Russo One', category: 'display', weights: [400], tags: 'deportiva, gaming' },
  { family: 'Alfa Slab One', category: 'display', weights: [400], tags: 'slab, vintage' },
  { family: 'Big Shoulders Display', category: 'display', weights: R(100, 900), tags: 'condensada, urbana' },
  // Manuscrita
  { family: 'Caveat', category: 'handwriting', weights: R(400, 700), tags: 'notas, informal' },
  { family: 'Pacifico', category: 'handwriting', weights: [400], tags: 'surf, divertida' },
  { family: 'Dancing Script', category: 'handwriting', weights: R(400, 700), tags: 'caligráfica, romántica' },
  { family: 'Kalam', category: 'handwriting', weights: [300, 400, 700], tags: 'rotulador, cercana' },
  { family: 'Permanent Marker', category: 'handwriting', weights: [400], tags: 'rotulador, urbana' },
  { family: 'Satisfy', category: 'handwriting', weights: [400], tags: 'script, elegante' },
  // Monoespaciada
  { family: 'JetBrains Mono', category: 'mono', weights: R(100, 800), tags: 'código' },
  { family: 'Fira Code', category: 'mono', weights: R(300, 700), tags: 'código, ligaduras' },
  { family: 'IBM Plex Mono', category: 'mono', weights: R(100, 700), tags: 'técnica' },
  { family: 'Space Mono', category: 'mono', weights: [400, 700], tags: 'retro, peculiar' },
  { family: 'Roboto Mono', category: 'mono', weights: R(100, 700), tags: 'neutral' },
  { family: 'Source Code Pro', category: 'mono', weights: R(200, 900), tags: 'código, legible' },
  { family: 'DM Mono', category: 'mono', weights: [300, 400, 500], tags: 'minimal' },
];

export const FONT_PAIRINGS = [
  { name: 'Moderno tech', heading: 'Space Grotesk', body: 'Inter' },
  { name: 'Editorial', heading: 'Playfair Display', body: 'Source Sans 3' },
  { name: 'Amigable', heading: 'Fredoka', body: 'Nunito' },
  { name: 'Corporativo', heading: 'Montserrat', body: 'Open Sans' },
  { name: 'Elegante', heading: 'Cormorant Garamond', body: 'Lato' },
  { name: 'Startup', heading: 'Sora', body: 'DM Sans' },
  { name: 'Clásico', heading: 'Lora', body: 'Work Sans' },
  { name: 'Impacto', heading: 'Bebas Neue', body: 'Rubik' },
  { name: 'Literario', heading: 'Fraunces', body: 'Figtree' },
  { name: 'Lujo', heading: 'DM Serif Display', body: 'Manrope' },
  { name: 'Gaming', heading: 'Chakra Petch', body: 'Barlow' },
  { name: 'Retro', heading: 'Alfa Slab One', body: 'Bitter' },
];

export const GENERIC_FALLBACK = {
  sans: 'system-ui, -apple-system, "Segoe UI", sans-serif',
  serif: 'Georgia, "Times New Roman", serif',
  display: 'system-ui, sans-serif',
  handwriting: 'cursive',
  mono: 'ui-monospace, "SFMono-Regular", Menlo, Consolas, monospace',
};

export function findFont(family) {
  return FONTS.find((f) => f.family.toLowerCase() === String(family || '').toLowerCase());
}

export function fontStack(font) {
  if (!font?.family) return GENERIC_FALLBACK.sans;
  const cat = font.category || findFont(font.family)?.category || 'sans';
  return `"${font.family}", ${GENERIC_FALLBACK[cat] || GENERIC_FALLBACK.sans}`;
}

export function availableWeights(family) {
  return findFont(family)?.weights || [400, 700];
}

export const TYPE_SCALES = [
  { value: 1.125, label: 'Segunda mayor (1.125) · sutil' },
  { value: 1.2, label: 'Tercera menor (1.2) · equilibrada' },
  { value: 1.25, label: 'Tercera mayor (1.25) · clásica web' },
  { value: 1.333, label: 'Cuarta justa (1.333) · marcada' },
  { value: 1.414, label: 'Cuarta aumentada (1.414) · editorial' },
  { value: 1.5, label: 'Quinta justa (1.5) · dramática' },
];

// Escala tipográfica a partir de tamaño base y ratio.
export function typeScale(base = 16, ratio = 1.25) {
  const steps = { xs: -2, sm: -1, base: 0, lg: 1, xl: 2, '2xl': 3, '3xl': 4, '4xl': 5, '5xl': 6 };
  const out = {};
  for (const [k, n] of Object.entries(steps)) out[k] = Math.round(base * Math.pow(ratio, n) * 10) / 10;
  return out;
}

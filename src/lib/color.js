// Utilidades de color: conversiones, contraste WCAG, escalas y armonías.

export function normalizeHex(input) {
  if (!input) return null;
  let h = String(input).trim().replace(/^#/, '');
  if (/^[0-9a-f]{3}$/i.test(h)) h = h.split('').map((c) => c + c).join('');
  if (!/^[0-9a-f]{6}$/i.test(h)) return null;
  return '#' + h.toLowerCase();
}

export function hexToRgb(hex) {
  const h = normalizeHex(hex) || '#000000';
  const n = parseInt(h.slice(1), 16);
  return { r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255 };
}

export function rgbToHex({ r, g, b }) {
  const c = (v) => Math.round(Math.max(0, Math.min(255, v))).toString(16).padStart(2, '0');
  return '#' + c(r) + c(g) + c(b);
}

export function rgbToHsl({ r, g, b }) {
  r /= 255; g /= 255; b /= 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  let h = 0, s = 0;
  const l = (max + min) / 2;
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    if (max === r) h = (g - b) / d + (g < b ? 6 : 0);
    else if (max === g) h = (b - r) / d + 2;
    else h = (r - g) / d + 4;
    h *= 60;
  }
  return { h, s: s * 100, l: l * 100 };
}

export function hslToRgb({ h, s, l }) {
  h = ((h % 360) + 360) % 360; s /= 100; l /= 100;
  const k = (n) => (n + h / 30) % 12;
  const a = s * Math.min(l, 1 - l);
  const f = (n) => l - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)));
  return { r: f(0) * 255, g: f(8) * 255, b: f(4) * 255 };
}

export const hexToHsl = (hex) => rgbToHsl(hexToRgb(hex));
export const hslToHex = (hsl) => rgbToHex(hslToRgb(hsl));

export function formatRgb(hex) {
  const { r, g, b } = hexToRgb(hex);
  return `rgb(${r}, ${g}, ${b})`;
}

export function formatHsl(hex) {
  const { h, s, l } = hexToHsl(hex);
  return `hsl(${Math.round(h)}, ${Math.round(s)}%, ${Math.round(l)}%)`;
}

function channel(v) {
  v /= 255;
  return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
}

export function luminance(hex) {
  const { r, g, b } = hexToRgb(hex);
  return 0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b);
}

export function contrast(a, b) {
  const la = luminance(a), lb = luminance(b);
  return (Math.max(la, lb) + 0.05) / (Math.min(la, lb) + 0.05);
}

export function wcagLevel(ratio) {
  if (ratio >= 7) return 'AAA';
  if (ratio >= 4.5) return 'AA';
  if (ratio >= 3) return 'AA grande';
  return 'Insuficiente';
}

export function readableOn(bg) {
  return contrast(bg, '#ffffff') >= contrast(bg, '#111111') ? '#ffffff' : '#111111';
}

export function mix(a, b, t) {
  const x = hexToRgb(a), y = hexToRgb(b);
  return rgbToHex({ r: x.r + (y.r - x.r) * t, g: x.g + (y.g - x.g) * t, b: x.b + (y.b - x.b) * t });
}

export function withAlpha(hex, alpha) {
  const { r, g, b } = hexToRgb(hex);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

// Escala 50–950 mezclando con blanco (tonos claros) y con negro (tonos oscuros).
export const SHADE_STEPS = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950];
export function shades(hex) {
  const amounts = { 50: 0.95, 100: 0.88, 200: 0.75, 300: 0.58, 400: 0.3, 500: 0, 600: 0.15, 700: 0.32, 800: 0.48, 900: 0.62, 950: 0.75 };
  const dark = '#0a0a0a';
  const out = {};
  for (const step of SHADE_STEPS) {
    const t = amounts[step];
    out[step] = step < 500 ? mix(hex, '#ffffff', t) : step === 500 ? normalizeHex(hex) : mix(hex, dark, t);
  }
  return out;
}

export const HARMONIES = [
  { id: 'complementary', label: 'Complementaria', offsets: [0, 180] },
  { id: 'analogous', label: 'Análoga', offsets: [-30, 0, 30] },
  { id: 'triadic', label: 'Triádica', offsets: [0, 120, 240] },
  { id: 'split', label: 'Complementaria dividida', offsets: [0, 150, 210] },
  { id: 'tetradic', label: 'Tetrádica', offsets: [0, 90, 180, 270] },
  { id: 'mono', label: 'Monocromática', offsets: null },
];

export function harmony(baseHex, id) {
  const base = hexToHsl(baseHex);
  const scheme = HARMONIES.find((h) => h.id === id) || HARMONIES[0];
  if (!scheme.offsets) {
    return [-30, -15, 0, 15, 30].map((dl) => hslToHex({ ...base, l: Math.max(8, Math.min(92, base.l + dl)) }));
  }
  return scheme.offsets.map((o) => hslToHex({ ...base, h: base.h + o }));
}

export function randomPalette() {
  const h = Math.random() * 360;
  const s = 55 + Math.random() * 30;
  const schemes = ['complementary', 'analogous', 'triadic', 'split'];
  const id = schemes[Math.floor(Math.random() * schemes.length)];
  const base = hslToHex({ h, s, l: 45 + Math.random() * 10 });
  const main = harmony(base, id).slice(0, 3);
  const bg = hslToHex({ h, s: 20, l: 97 });
  const text = hslToHex({ h, s: 25, l: 12 });
  return { colors: [...main, bg, text], scheme: id };
}

// Modelo de marca, roles de color y cálculo del "tema" que usan la vista previa y los exportadores.
import { mix, readableOn, withAlpha, normalizeHex } from './color.js';
import { findPreset, DENSITIES } from '../data/styles.js';
import { fontStack, typeScale } from '../data/fonts.js';

export const uid = () => Math.random().toString(36).slice(2, 10);

export const COLOR_ROLES = [
  { id: 'primary', label: 'Primario', hint: 'Color principal de la marca: botones, enlaces, elementos clave.' },
  { id: 'secondary', label: 'Secundario', hint: 'Apoya al primario en elementos de segundo nivel.' },
  { id: 'accent', label: 'Acento', hint: 'Para destacar: insignias, llamadas a la acción puntuales.' },
  { id: 'background', label: 'Fondo', hint: 'Fondo general de páginas y pantallas.' },
  { id: 'surface', label: 'Superficie', hint: 'Tarjetas, paneles y modales.' },
  { id: 'text', label: 'Texto', hint: 'Texto principal.' },
  { id: 'muted', label: 'Texto secundario', hint: 'Textos de apoyo, leyendas.' },
  { id: 'border', label: 'Bordes', hint: 'Líneas divisorias y bordes.' },
  { id: 'success', label: 'Éxito', hint: 'Estados correctos y confirmaciones.' },
  { id: 'warning', label: 'Aviso', hint: 'Advertencias.' },
  { id: 'danger', label: 'Error', hint: 'Errores y acciones destructivas.' },
  { id: 'other', label: 'Otro', hint: 'Color adicional de la paleta.' },
];

export const roleLabel = (id) => COLOR_ROLES.find((r) => r.id === id)?.label || 'Otro';

export const LOGO_VARIANTS = [
  { id: 'primary', label: 'Principal' },
  { id: 'secondary', label: 'Secundario / horizontal' },
  { id: 'isotype', label: 'Isotipo (símbolo)' },
  { id: 'wordmark', label: 'Logotipo (solo texto)' },
  { id: 'mono-dark', label: 'Monocromo oscuro' },
  { id: 'mono-light', label: 'Monocromo claro (sobre fondo oscuro)' },
  { id: 'favicon', label: 'Favicon / icono de app' },
  { id: 'other', label: 'Otro' },
];

export const variantLabel = (id) => LOGO_VARIANTS.find((v) => v.id === id)?.label || 'Otro';

export function newBrand(name = 'Nueva marca') {
  const now = new Date().toISOString();
  const preset = findPreset('minimal');
  return {
    id: uid(),
    schema: 'brand-kit-studio/v1',
    createdAt: now,
    updatedAt: now,
    identity: { name, tagline: '', description: '', audience: '', values: '', keywords: '', industry: '' },
    voice: {
      traits: [],
      formality: 50, // 0 = muy cercano · 100 = muy formal
      humor: 30, // 0 = serio · 100 = divertido
      enthusiasm: 50, // 0 = sobrio · 100 = entusiasta
      complexity: 30, // 0 = sencillo · 100 = técnico
      address: 'tú',
      languages: 'Español',
      tone: '',
      doWords: '',
      dontWords: '',
      sample: '',
    },
    colors: [
      { id: uid(), name: 'Azul marca', hex: '#3b5bdb', role: 'primary', usage: '' },
      { id: uid(), name: 'Violeta', hex: '#7048e8', role: 'secondary', usage: '' },
      { id: uid(), name: 'Coral', hex: '#ff6b6b', role: 'accent', usage: '' },
      { id: uid(), name: 'Blanco roto', hex: '#f8f9fc', role: 'background', usage: '' },
      { id: uid(), name: 'Tinta', hex: '#1a1b25', role: 'text', usage: '' },
    ],
    fonts: {
      heading: { family: 'Space Grotesk', category: 'sans', weight: 700 },
      body: { family: 'Inter', category: 'sans', weight: 400, boldWeight: 600 },
      mono: { family: 'JetBrains Mono', category: 'mono', weight: 400 },
      baseSize: 16,
      scale: 1.25,
    },
    style: { preset: 'minimal', ...preset.tokens, notes: '' },
    logos: [],
    imagery: { photo: '', illustration: '', iconStyle: 'line', iconLibrary: '', icons: '', avoid: '' },
    notes: '',
  };
}

// Completa campos que falten en marcas antiguas o importadas.
export function normalizeBrand(raw) {
  const base = newBrand();
  const b = raw && typeof raw === 'object' ? raw : {};
  return {
    ...base,
    ...b,
    id: b.id || base.id,
    identity: { ...base.identity, ...(b.identity || {}) },
    voice: { ...base.voice, ...(b.voice || {}) },
    colors: Array.isArray(b.colors)
      ? b.colors.map((c) => ({ id: c.id || uid(), name: c.name || 'Color', hex: normalizeHex(c.hex) || '#888888', role: c.role || 'other', usage: c.usage || '' }))
      : base.colors,
    fonts: {
      ...base.fonts,
      ...(b.fonts || {}),
      heading: { ...base.fonts.heading, ...(b.fonts?.heading || {}) },
      body: { ...base.fonts.body, ...(b.fonts?.body || {}) },
      mono: { ...base.fonts.mono, ...(b.fonts?.mono || {}) },
    },
    style: { ...base.style, ...(b.style || {}) },
    logos: Array.isArray(b.logos) ? b.logos.filter((l) => l && (l.svg || l.dataUrl)).map((l) => ({ id: l.id || uid(), ...l })) : [],
    imagery: { ...base.imagery, ...(b.imagery || {}) },
  };
}

export function colorByRole(colors, role) {
  return colors.find((c) => c.role === role)?.hex;
}

// Resuelve todos los roles con valores por defecto razonables.
export function resolveTheme(brand) {
  const cs = brand.colors || [];
  const pick = (role) => colorByRole(cs, role);
  const background = pick('background') || '#ffffff';
  const text = pick('text') || readableOn(background);
  const primary = pick('primary') || cs[0]?.hex || '#3b5bdb';
  const secondary = pick('secondary') || cs.find((c) => c.hex !== primary)?.hex || primary;
  const accent = pick('accent') || cs.find((c) => c.hex !== primary && c.hex !== secondary)?.hex || secondary;
  const surface = pick('surface') || mix(background, text, 0.04);
  const muted = pick('muted') || mix(text, background, 0.42);
  const border = pick('border') || mix(background, text, 0.14);
  const success = pick('success') || '#2f9e44';
  const warning = pick('warning') || '#f59f00';
  const danger = pick('danger') || '#e03131';
  const s = brand.style || {};
  const density = DENSITIES.find((d) => d.id === s.density)?.factor || 1;
  return {
    colors: { primary, secondary, accent, background, surface, text, muted, border, success, warning, danger },
    onPrimary: readableOn(primary),
    onSecondary: readableOn(secondary),
    onAccent: readableOn(accent),
    radius: Number(s.radius ?? 8),
    borderWidth: Number(s.borderWidth ?? 1),
    shadow: shadowCss(s.shadow, { primary, text, background }),
    shadowId: s.shadow || 'none',
    density,
    space: Math.round(8 * density * 10) / 10,
    headingCase: s.headingCase || 'none',
    headingTracking: Number(s.headingTracking ?? 0),
    surfaceType: s.surface || 'solid',
    pillButtons: !!s.pillButtons,
    gradients: !!s.gradients,
    fonts: {
      heading: fontStack(brand.fonts?.heading),
      body: fontStack(brand.fonts?.body),
      mono: fontStack(brand.fonts?.mono),
      headingWeight: brand.fonts?.heading?.weight || 700,
      bodyWeight: brand.fonts?.body?.weight || 400,
      bodyBold: brand.fonts?.body?.boldWeight || 700,
    },
    sizes: typeScale(brand.fonts?.baseSize || 16, brand.fonts?.scale || 1.25),
  };
}

export function shadowCss(id, { primary, text, background }) {
  switch (id) {
    case 'soft':
      return '0 1px 2px rgba(16, 24, 40, 0.06), 0 4px 12px rgba(16, 24, 40, 0.08)';
    case 'medium':
      return '0 4px 8px rgba(16, 24, 40, 0.08), 0 12px 28px rgba(16, 24, 40, 0.14)';
    case 'hard':
      return `4px 4px 0 ${text}`;
    case 'glow':
      return `0 0 0 1px ${withAlpha(primary, 0.25)}, 0 8px 30px ${withAlpha(primary, 0.35)}`;
    case 'neu':
      return `6px 6px 14px ${mix(background, '#000000', 0.16)}, -6px -6px 14px ${mix(background, '#ffffff', 0.7)}`;
    default:
      return 'none';
  }
}

export function slugify(s) {
  return (
    String(s || '')
      .normalize('NFD')
      .replace(/[̀-ͯ]/g, '')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '') || 'item'
  );
}

// Exportadores: Markdown para Claude, JSON reimportable, tokens, CSS, Tailwind y ZIP.
import { contrast, formatHsl, formatRgb, shades, wcagLevel, SHADE_STEPS } from './color.js';
import { resolveTheme, roleLabel, slugify, variantLabel } from './brand.js';
import { findPreset, SHADOWS, DENSITIES } from '../data/styles.js';
import { availableWeights, fontStack } from '../data/fonts.js';
import { googleFontsUrl } from './fontLoader.js';
import { logoSrc, rasterize } from './svg.js';

const SCALE_ROLES = ['primary', 'secondary', 'accent'];

function fontFamilies(brand) {
  const f = brand.fonts;
  const byFamily = new Map();
  for (const role of ['heading', 'body', 'mono']) {
    const r = f[role];
    if (!r?.family) continue;
    const avail = availableWeights(r.family);
    const wanted = [r.weight, r.boldWeight].filter((w) => w && avail.includes(w));
    const prev = byFamily.get(r.family) || [];
    byFamily.set(r.family, [...new Set([...prev, ...wanted])]);
  }
  return [...byFamily.entries()].map(([family, weights]) => ({ family, weights: weights.length ? weights : [400] }));
}

export function fontsUrl(brand) {
  return googleFontsUrl(fontFamilies(brand));
}

function logoFileBase(logo, i) {
  return `${String(i + 1).padStart(2, '0')}-${slugify(logo.name || variantLabel(logo.variant))}`;
}

function uniqueSlugs(colors) {
  const seen = {};
  return colors.map((c) => {
    let s = slugify(c.name);
    seen[s] = (seen[s] || 0) + 1;
    if (seen[s] > 1) s = `${s}-${seen[s]}`;
    return s;
  });
}

// ---------- CSS ----------
export function buildCss(brand) {
  const t = resolveTheme(brand);
  const slugs = uniqueSlugs(brand.colors);
  const lines = [`@import url('${fontsUrl(brand)}');`, '', ':root {', '  /* Colores semánticos */'];
  for (const [role, hex] of Object.entries(t.colors)) lines.push(`  --brand-${role}: ${hex};`);
  lines.push(`  --brand-on-primary: ${t.onPrimary};`, `  --brand-on-secondary: ${t.onSecondary};`, `  --brand-on-accent: ${t.onAccent};`);
  lines.push('', '  /* Escalas de tonos */');
  for (const role of SCALE_ROLES) {
    const sc = shades(t.colors[role]);
    for (const step of SHADE_STEPS) lines.push(`  --brand-${role}-${step}: ${sc[step]};`);
  }
  lines.push('', '  /* Paleta completa */');
  brand.colors.forEach((c, i) => lines.push(`  --color-${slugs[i]}: ${c.hex};`));
  lines.push('', '  /* Tipografía */');
  lines.push(`  --font-heading: ${t.fonts.heading};`, `  --font-body: ${t.fonts.body};`, `  --font-mono: ${t.fonts.mono};`);
  lines.push(`  --font-weight-heading: ${t.fonts.headingWeight};`, `  --font-weight-body: ${t.fonts.bodyWeight};`, `  --font-weight-bold: ${t.fonts.bodyBold};`);
  for (const [k, v] of Object.entries(t.sizes)) lines.push(`  --text-${k}: ${(v / 16).toFixed(3).replace(/\.?0+$/, '')}rem;`);
  lines.push(`  --heading-letter-spacing: ${t.headingTracking}em;`, `  --heading-text-transform: ${t.headingCase};`);
  lines.push('', '  /* Forma y profundidad */');
  lines.push(`  --radius: ${t.radius}px;`, `  --radius-button: ${t.pillButtons ? '999px' : `${t.radius}px`};`, `  --border-width: ${t.borderWidth}px;`, `  --shadow: ${t.shadow};`);
  lines.push(`  --space: ${t.space}px; /* unidad base de espaciado */`);
  lines.push('}');
  return lines.join('\n');
}

// ---------- Tailwind ----------
export function buildTailwindV3(brand) {
  const t = resolveTheme(brand);
  const colors = {};
  for (const [role, hex] of Object.entries(t.colors)) {
    colors[role] = SCALE_ROLES.includes(role) ? { DEFAULT: hex, ...shades(hex) } : hex;
  }
  const slugs = uniqueSlugs(brand.colors);
  const palette = Object.fromEntries(brand.colors.map((c, i) => [slugs[i], c.hex]));
  const config = {
    theme: {
      extend: {
        colors: { brand: colors, palette },
        fontFamily: {
          heading: t.fonts.heading.split(',').map((s) => s.trim().replace(/"/g, '')),
          body: t.fonts.body.split(',').map((s) => s.trim().replace(/"/g, '')),
          mono: t.fonts.mono.split(',').map((s) => s.trim().replace(/"/g, '')),
        },
        fontSize: Object.fromEntries(Object.entries(t.sizes).map(([k, v]) => [k, `${v / 16}rem`])),
        borderRadius: { brand: `${t.radius}px`, button: t.pillButtons ? '9999px' : `${t.radius}px` },
        borderWidth: { brand: `${t.borderWidth}px` },
        boxShadow: { brand: t.shadow },
      },
    },
  };
  return `// tailwind.config.js (Tailwind v3) — fusiona "theme.extend" con tu configuración\n/** @type {import('tailwindcss').Config} */\nmodule.exports = ${JSON.stringify(config, null, 2)};\n`;
}

export function buildTailwindV4(brand) {
  const t = resolveTheme(brand);
  const lines = [`@import url('${fontsUrl(brand)}');`, '@import "tailwindcss";', '', '@theme {'];
  for (const [role, hex] of Object.entries(t.colors)) lines.push(`  --color-brand-${role}: ${hex};`);
  for (const role of SCALE_ROLES) {
    const sc = shades(t.colors[role]);
    for (const step of SHADE_STEPS) lines.push(`  --color-brand-${role}-${step}: ${sc[step]};`);
  }
  lines.push(`  --font-heading: ${t.fonts.heading};`, `  --font-body: ${t.fonts.body};`, `  --font-mono: ${t.fonts.mono};`);
  lines.push(`  --radius-brand: ${t.radius}px;`, `  --shadow-brand: ${t.shadow};`);
  lines.push('}');
  return lines.join('\n');
}

// ---------- Tokens (formato W3C Design Tokens) ----------
export function buildTokens(brand) {
  const t = resolveTheme(brand);
  const slugs = uniqueSlugs(brand.colors);
  const color = { semantic: {}, palette: {}, scale: {} };
  for (const [role, hex] of Object.entries(t.colors)) color.semantic[role] = { $type: 'color', $value: hex };
  brand.colors.forEach((c, i) => (color.palette[slugs[i]] = { $type: 'color', $value: c.hex, $description: `${c.name} · ${roleLabel(c.role)}${c.usage ? ' · ' + c.usage : ''}` }));
  for (const role of SCALE_ROLES) {
    const sc = shades(t.colors[role]);
    color.scale[role] = Object.fromEntries(SHADE_STEPS.map((s) => [s, { $type: 'color', $value: sc[s] }]));
  }
  return {
    $description: `Design tokens de ${brand.identity.name}`,
    color,
    font: {
      family: {
        heading: { $type: 'fontFamily', $value: t.fonts.heading },
        body: { $type: 'fontFamily', $value: t.fonts.body },
        mono: { $type: 'fontFamily', $value: t.fonts.mono },
      },
      weight: {
        heading: { $type: 'fontWeight', $value: t.fonts.headingWeight },
        body: { $type: 'fontWeight', $value: t.fonts.bodyWeight },
        bold: { $type: 'fontWeight', $value: t.fonts.bodyBold },
      },
      size: Object.fromEntries(Object.entries(t.sizes).map(([k, v]) => [k, { $type: 'dimension', $value: `${v}px` }])),
    },
    radius: { base: { $type: 'dimension', $value: `${t.radius}px` }, button: { $type: 'dimension', $value: t.pillButtons ? '9999px' : `${t.radius}px` } },
    border: { width: { $type: 'dimension', $value: `${t.borderWidth}px` } },
    shadow: { base: { $type: 'shadow', $value: t.shadow } },
    space: { unit: { $type: 'dimension', $value: `${t.space}px` } },
  };
}

// ---------- JSON reimportable ----------
export function buildBrandJson(brand) {
  return JSON.stringify({ app: 'brand-kit-studio', exportedAt: new Date().toISOString(), brand }, null, 2);
}

// ---------- Markdown para Claude ----------
const scaleWord = (v, low, high) => (v < 25 ? `muy ${low}` : v < 45 ? low : v <= 55 ? `equilibrio entre ${low} y ${high}` : v <= 75 ? high : `muy ${high}`);

function contrastPairs(theme) {
  const c = theme.colors;
  const pairs = [
    ['Texto sobre fondo', c.text, c.background],
    ['Texto secundario sobre fondo', c.muted, c.background],
    ['Texto sobre superficie', c.text, c.surface],
    ['Texto sobre primario', theme.onPrimary, c.primary],
    ['Primario sobre fondo (enlaces)', c.primary, c.background],
    ['Texto sobre acento', theme.onAccent, c.accent],
  ];
  return pairs.map(([label, fg, bg]) => {
    const r = contrast(fg, bg);
    return `| ${label} | ${fg} sobre ${bg} | ${r.toFixed(2)}:1 | ${wcagLevel(r)} |`;
  });
}

export function buildMarkdown(brand, { includeSvg = true, includeCss = true } = {}) {
  const { identity: id, voice: v, colors, fonts, style, logos, imagery } = brand;
  const t = resolveTheme(brand);
  const preset = findPreset(style.preset);
  const name = id.name || 'Marca sin nombre';
  const L = [];
  const push = (...xs) => L.push(...xs);
  const field = (label, val) => val && String(val).trim() && push(`- **${label}:** ${String(val).trim()}`);

  push(`# Guía de marca: ${name}`, '');
  push(`> Generada con Brand Kit Studio el ${new Date().toLocaleDateString('es-ES')}. Este documento es la **fuente de verdad** de la identidad de ${name}.`, '');

  push('## Instrucciones para Claude', '');
  push(
    `- Aplica esta guía en cualquier diseño, interfaz, código o texto que generes para ${name}.`,
    '- Usa **solo** los colores definidos aquí. Si necesitas variantes más claras u oscuras, usa las escalas de tonos indicadas; no inventes colores nuevos.',
    `- Usa las tipografías indicadas (cárgalas desde Google Fonts con la URL incluida). Títulos en ${fonts.heading.family}, texto en ${fonts.body.family}.`,
    `- Sigue el estilo de diseño **${preset?.name || style.preset}** y sus tokens (radios, bordes, sombras, espaciado).`,
    '- Usa los logos tal como se proporcionan. No los redibujes, deformes, recolorees ni les añadas efectos.',
    '- Escribe todos los textos con la voz y el tono descritos.',
    '- Garantiza un contraste mínimo WCAG AA (4,5:1 para texto normal).',
    '- Si algo no está definido en esta guía, elige la opción más coherente con ella y explícalo brevemente.',
    '',
  );

  push('## 1. Identidad', '');
  field('Nombre', id.name);
  field('Eslogan', id.tagline);
  field('Descripción', id.description);
  field('Sector', id.industry);
  field('Público objetivo', id.audience);
  field('Valores / misión', id.values);
  field('Palabras clave', id.keywords);
  push('');

  push('## 2. Voz y tono', '');
  field('Personalidad', v.traits.join(', '));
  push(`- **Registro:** ${scaleWord(v.formality, 'cercano', 'formal')}`);
  push(`- **Humor:** ${scaleWord(v.humor, 'serio', 'divertido')}`);
  push(`- **Energía:** ${scaleWord(v.enthusiasm, 'sobrio', 'entusiasta')}`);
  push(`- **Complejidad del lenguaje:** ${scaleWord(v.complexity, 'sencillo', 'técnico')}`);
  field('Tratamiento al lector', v.address);
  field('Idiomas', v.languages);
  field('Descripción del tono', v.tone);
  field('Palabras y expresiones a usar', v.doWords);
  field('Palabras y expresiones a evitar', v.dontWords);
  if (v.sample?.trim()) push('', '**Texto de ejemplo con la voz de la marca:**', '', ...v.sample.trim().split('\n').map((l) => `> ${l}`));
  push('');

  push('## 3. Colores', '');
  push('| Color | Rol | HEX | RGB | HSL | Uso |', '|---|---|---|---|---|---|');
  for (const c of colors) push(`| ${c.name} | ${roleLabel(c.role)} | \`${c.hex}\` | ${formatRgb(c.hex)} | ${formatHsl(c.hex)} | ${c.usage || '—'} |`);
  push('', '**Roles resueltos** (los que no tienen color asignado se derivan automáticamente):', '');
  push(Object.entries(t.colors).map(([r, hex]) => `\`${r}\`: ${hex}`).join(' · '));
  push('', '**Escalas de tonos** (50 = más claro, 950 = más oscuro):', '');
  push(`| Rol | ${SHADE_STEPS.join(' | ')} |`, `|---|${SHADE_STEPS.map(() => '---').join('|')}|`);
  for (const role of SCALE_ROLES) {
    const sc = shades(t.colors[role]);
    push(`| ${roleLabel(role)} | ${SHADE_STEPS.map((s) => sc[s]).join(' | ')} |`);
  }
  push('', '**Contraste de combinaciones clave:**', '', '| Combinación | Colores | Ratio | WCAG |', '|---|---|---|---|', ...contrastPairs(t), '');

  push('## 4. Tipografía', '');
  push('| Uso | Fuente | Peso | Pila CSS |', '|---|---|---|---|');
  push(`| Títulos | ${fonts.heading.family} | ${fonts.heading.weight} | \`${fontStack(fonts.heading)}\` |`);
  push(`| Texto | ${fonts.body.family} | ${fonts.body.weight} (negrita ${fonts.body.boldWeight}) | \`${fontStack(fonts.body)}\` |`);
  push(`| Código / datos | ${fonts.mono.family} | ${fonts.mono.weight || 400} | \`${fontStack(fonts.mono)}\` |`);
  push('', `- **Cargar fuentes:** \`<link rel="stylesheet" href="${fontsUrl(brand)}">\``);
  push(`- **Escala tipográfica:** base ${fonts.baseSize}px, ratio ${fonts.scale} → ${Object.entries(t.sizes).map(([k, val]) => `${k} ${val}px`).join(', ')}`);
  push(`- **Titulares:** ${t.headingCase === 'uppercase' ? 'en MAYÚSCULAS' : 'en tipo oración (sin mayúsculas forzadas)'}, espaciado entre letras ${t.headingTracking}em.`);
  push('');

  push(`## 5. Estilo de diseño: ${preset?.name || style.preset}`, '');
  if (preset) push(preset.description, '');
  push('| Token | Valor |', '|---|---|');
  push(`| Radio de esquinas | ${t.radius}px |`);
  push(`| Botones | ${t.pillButtons ? 'píldora (radio completo)' : `radio ${t.radius}px`} |`);
  push(`| Grosor de borde | ${t.borderWidth}px |`);
  push(`| Sombra | ${SHADOWS.find((s) => s.id === t.shadowId)?.label} → \`${t.shadow}\` |`);
  push(`| Densidad | ${DENSITIES.find((d) => d.id === style.density)?.label} (unidad de espaciado ${t.space}px) |`);
  push(`| Superficies | ${t.surfaceType === 'glass' ? 'translúcidas con desenfoque (glass)' : 'sólidas'} |`);
  push(`| Degradados | ${t.gradients ? 'permitidos, usando colores de la marca' : 'no; colores planos'} |`);
  if (preset?.rules?.length) push('', '**Reglas del estilo:**', '', ...preset.rules.map((r) => `- ${r}`));
  if (style.notes?.trim()) push('', '**Notas adicionales de estilo:**', '', style.notes.trim());
  push('');

  push('## 6. Logos', '');
  if (!logos.length) push('_Todavía no hay logos definidos._', '');
  else {
    push(
      '- Respeta un área de seguridad alrededor del logo equivalente, como mínimo, al 25 % de su altura.',
      '- Tamaño mínimo recomendado: 24 px de alto en pantalla.',
      '- Sobre fondos oscuros usa la variante clara o monocroma clara.',
      '- Los archivos están en la carpeta `logos/` del ZIP exportado.',
      '',
    );
    logos.forEach((logo, i) => {
      const base = logoFileBase(logo, i);
      push(`### ${logo.name || `Logo ${i + 1}`}${logo.id === brand.primaryLogoId ? ' ⭐ (principal)' : ''}`, '');
      push(`- **Variante:** ${variantLabel(logo.variant)}`);
      if (logo.usage) push(`- **Uso:** ${logo.usage}`);
      push(`- **Archivos:** ${logo.svg ? `\`logos/${base}.svg\`, ` : ''}\`logos/${base}.png\``);
      if (logo.svg && includeSvg) push('', '```svg', logo.svg, '```');
      push('');
    });
  }

  push('## 7. Imagen e iconografía', '');
  field('Fotografía', imagery.photo);
  field('Ilustración', imagery.illustration);
  const iconStyles = { line: 'lineal (outline)', filled: 'relleno (solid)', duotone: 'duotono', '3d': '3D', hand: 'dibujado a mano', pixel: 'pixel art' };
  field('Estilo de iconos', iconStyles[imagery.iconStyle] || imagery.iconStyle);
  field('Librería de iconos', imagery.iconLibrary);
  field('Notas de iconografía', imagery.icons);
  field('Evitar', imagery.avoid);
  push('');

  if (brand.notes?.trim()) push('## 8. Notas adicionales', '', brand.notes.trim(), '');

  if (includeCss) push('## Anexo: variables CSS', '', '```css', buildCss(brand), '```', '');

  return L.join('\n');
}

// ---------- ZIP ----------
export async function buildZip(brand, options) {
  const { default: JSZip } = await import('jszip');
  const zip = new JSZip();
  const md = buildMarkdown(brand, options);
  zip.file('brand.md', md);
  zip.file('brand.json', buildBrandJson(brand));
  zip.file('tokens.json', JSON.stringify(buildTokens(brand), null, 2));
  zip.file('brand.css', buildCss(brand));
  zip.file('tailwind.config.js', buildTailwindV3(brand));
  zip.file('tailwind-v4.css', buildTailwindV4(brand));
  const logosDir = zip.folder('logos');
  const failures = [];
  for (const [i, logo] of brand.logos.entries()) {
    const base = logoFileBase(logo, i);
    if (logo.svg) logosDir.file(`${base}.svg`, logo.svg);
    try {
      logosDir.file(`${base}.png`, await rasterize(logoSrc(logo), 1024));
      logosDir.file(`${base}-256.png`, await rasterize(logoSrc(logo), 256));
    } catch {
      failures.push(logo.name);
    }
  }
  zip.file(
    'README.md',
    `# Kit de marca: ${brand.identity.name}

- **brand.md**: guía completa para Claude. Súbela al conocimiento de un Proyecto de Claude, pégala en un chat o guárdala en tu repositorio (por ejemplo \`docs/brand.md\`) y referénciala desde \`CLAUDE.md\` con \`@docs/brand.md\`.
- **brand.json**: archivo para volver a abrir y editar esta marca en Brand Kit Studio.
- **tokens.json**: design tokens en formato W3C (Style Dictionary, Figma Tokens…).
- **brand.css**: variables CSS listas para usar.
- **tailwind.config.js / tailwind-v4.css**: tema para Tailwind v3 y v4.
- **logos/**: logos en SVG y PNG (1024 px y 256 px).
`,
  );
  const blob = await zip.generateAsync({ type: 'blob' });
  return { blob, failures };
}

export function download(filename, content, type = 'text/plain;charset=utf-8') {
  const blob = content instanceof Blob ? content : new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export async function copyText(text) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    const ta = document.createElement('textarea');
    ta.value = text;
    document.body.appendChild(ta);
    ta.select();
    const ok = document.execCommand('copy');
    ta.remove();
    return ok;
  }
}

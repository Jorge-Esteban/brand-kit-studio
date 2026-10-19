// Generación de logos SVG con Claude: modo API (key del usuario) y modo manual (prompt para claude.ai).
import { roleLabel } from './brand.js';
import { findPreset } from '../data/styles.js';
import { safeGet, safeSet } from './store.js';

export const MODELS = [
  { id: 'claude-opus-5-5', label: 'Claude Opus 5.5 · máxima calidad' },
  { id: 'claude-sonnet-5-5', label: 'Claude Sonnet 5.5 · equilibrado' },
  { id: 'claude-haiku-5-5', label: 'Claude Haiku 5.5 · el más económico' },
];

export const LOGO_TYPES = [
  { id: 'auto', label: 'Que decida Claude' },
  { id: 'isotype', label: 'Isotipo (solo símbolo)' },
  { id: 'wordmark', label: 'Logotipo (solo texto)' },
  { id: 'combination', label: 'Imagotipo (símbolo + texto)' },
  { id: 'monogram', label: 'Monograma (iniciales)' },
  { id: 'emblem', label: 'Emblema / insignia' },
  { id: 'mascot', label: 'Mascota sencilla' },
];

const KEY_STORE = 'bks:apiKey';
const MODEL_STORE = 'bks:model';

export function getSettings() {
  const session = safeGet(KEY_STORE, null, 'session');
  const local = safeGet(KEY_STORE, null, 'local');
  return { apiKey: session || local || '', remember: !!local, model: safeGet(MODEL_STORE) || MODELS[0].id };
}

export function saveSettings({ apiKey, remember, model }) {
  safeSet(KEY_STORE, null, 'local');
  safeSet(KEY_STORE, null, 'session');
  if (apiKey) safeSet(KEY_STORE, apiKey, remember ? 'local' : 'session');
  safeSet(MODEL_STORE, model);
}

export const LOGO_SYSTEM = `Eres un diseñador de identidad visual senior especializado en logotipos vectoriales.
Diseñas logos memorables, sencillos y escalables, y los entregas como código SVG limpio y válido.

Reglas técnicas obligatorias para cada SVG:
- Elemento raíz <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"> (puedes usar otra proporción si es un logo horizontal, por ejemplo viewBox="0 0 1024 512").
- Solo formas vectoriales (path, circle, rect, polygon, line, g, text, linearGradient/radialGradient). Nada de <image>, scripts, enlaces externos, filtros pesados ni foreignObject.
- Usa únicamente los colores de la paleta de la marca indicada (en HEX). Fondo transparente salvo que el concepto lo requiera.
- Si incluyes texto, usa <text> con font-family igual a la tipografía de títulos de la marca seguida de una genérica (p. ej. font-family="'Space Grotesk', sans-serif") y céntralo con text-anchor="middle".
- Geometría limpia, pocos nodos, legible a 32 px. Nada de detalles diminutos.

Formato de respuesta, para cada propuesta:
### Propuesta N: <nombre corto del concepto>
<una o dos frases explicando la idea y por qué encaja con la marca>
\`\`\`svg
<svg ...>...</svg>
\`\`\`
No añadas nada más fuera de las propuestas.`;

export function brandBrief(brand) {
  const { identity: id, colors, fonts, style, voice } = brand;
  const preset = findPreset(style.preset);
  const lines = [
    `Marca: ${id.name || 'Sin nombre'}`,
    id.tagline && `Eslogan: ${id.tagline}`,
    id.description && `Descripción: ${id.description}`,
    id.industry && `Sector: ${id.industry}`,
    id.audience && `Público: ${id.audience}`,
    id.keywords && `Palabras clave: ${id.keywords}`,
    voice.traits.length && `Personalidad: ${voice.traits.join(', ')}`,
    `Paleta: ${colors.map((c) => `${c.name} ${c.hex} (${roleLabel(c.role)})`).join('; ')}`,
    `Tipografía de títulos: ${fonts.heading.family}`,
    preset && `Estilo de diseño: ${preset.name} (${preset.description})`,
  ];
  return lines.filter(Boolean).join('\n');
}

export function buildLogoPrompt(brand, { prompt, type = 'auto', count = 3 }) {
  const t = LOGO_TYPES.find((x) => x.id === type);
  return `${brandBrief(brand)}

Tipo de logo: ${type === 'auto' ? 'elige el más adecuado para cada propuesta (varía entre propuestas)' : t.label}
Número de propuestas: ${count} (conceptos claramente distintos entre sí)

Petición del usuario:
${prompt || 'Diseña un logo que represente la esencia de la marca.'}`;
}

export function buildRefinePrompt(brand, svg, instruction) {
  return `${brandBrief(brand)}

Este es el logo actual:
\`\`\`svg
${svg}
\`\`\`

Modifícalo siguiendo esta indicación: ${instruction}
Devuelve una única propuesta con el formato indicado.`;
}

export function manualPrompt(userPrompt) {
  return `${LOGO_SYSTEM}\n\n---\n\n${userPrompt}`;
}

export async function askClaude({ apiKey, model, user }) {
  if (!apiKey) throw new Error('Configura tu API key en Ajustes o usa el modo manual.');
  // El SDK se carga bajo demanda para no engordar la carga inicial.
  const { default: Anthropic } = await import('@anthropic-ai/sdk');
  const client = new Anthropic({ apiKey, dangerouslyAllowBrowser: true });
  const params = {
    model,
    max_tokens: 16000,
    system: LOGO_SYSTEM,
    messages: [{ role: 'user', content: user }],
    output_config: { effort: 'medium' },
  };
  // Reintento automático en otro modelo si un filtro de seguridad rechaza la petición (no existe para Haiku).
  if (!model.startsWith('claude-haiku')) {
    params.betas = ['server-side-fallback-2026-07-01'];
    params.fallbacks = 'default';
  }
  try {
    const res = await client.beta.messages.create(params);
    if (res.stop_reason === 'refusal') {
      throw new Error('Claude ha rechazado la petición. Prueba a reformular el prompt.');
    }
    const text = res.content.filter((b) => b.type === 'text').map((b) => b.text).join('\n');
    return { text, truncated: res.stop_reason === 'max_tokens', usage: res.usage };
  } catch (err) {
    if (err instanceof Anthropic.AuthenticationError) throw new Error('API key no válida. Revísala en Ajustes.');
    if (err instanceof Anthropic.PermissionDeniedError) throw new Error('Tu API key no tiene permiso para usar este modelo.');
    if (err instanceof Anthropic.RateLimitError) throw new Error('Límite de uso alcanzado. Espera un momento y vuelve a intentarlo.');
    if (err instanceof Anthropic.BadRequestError) throw new Error(`Petición rechazada por la API: ${err.message}`);
    if (err instanceof Anthropic.APIConnectionError) throw new Error('No se pudo conectar con la API de Anthropic. Revisa tu conexión.');
    if (err instanceof Anthropic.APIError) throw new Error(`Error de la API (${err.status ?? '?'}): ${err.message}`);
    throw err;
  }
}

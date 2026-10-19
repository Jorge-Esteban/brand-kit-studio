// Carga de Google Fonts bajo demanda (una <link> por familia para aislar errores).
import { findFont } from '../data/fonts.js';

const loaded = new Map();

export function googleFontsUrl(families) {
  const parts = families
    .filter((f) => f?.family)
    .map((f) => {
      const name = f.family.trim().replace(/ /g, '+');
      const ws = (f.weights || []).filter(Boolean);
      return ws.length && !(ws.length === 1 && ws[0] === 400) ? `family=${name}:wght@${[...new Set(ws)].sort((a, b) => a - b).join(';')}` : `family=${name}`;
    });
  return `https://fonts.googleapis.com/css2?${parts.join('&')}&display=swap`;
}

function inject(href) {
  return new Promise((resolve) => {
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = href;
    link.onload = () => resolve(true);
    link.onerror = () => {
      link.remove();
      resolve(false);
    };
    document.head.appendChild(link);
  });
}

// full=true carga todos los pesos conocidos; si falla, reintenta solo el regular.
export function loadFont(family, { full = false } = {}) {
  if (!family) return Promise.resolve(false);
  const key = `${family}|${full}`;
  if (loaded.has(key)) return loaded.get(key);
  const known = findFont(family);
  const weights = full ? known?.weights || [400, 700] : [400];
  const p = inject(googleFontsUrl([{ family, weights }])).then((ok) => (ok || !full ? ok : inject(googleFontsUrl([{ family }]))));
  loaded.set(key, p);
  return p;
}

export function loadBrandFonts(fonts) {
  ['heading', 'body', 'mono'].forEach((r) => fonts?.[r]?.family && loadFont(fonts[r].family, { full: true }));
}

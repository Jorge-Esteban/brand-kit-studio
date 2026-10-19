import { useEffect, useMemo, useState } from 'react';
import { StepHeader, Select, Disclosure, useToast } from './ui.jsx';
import { FONTS, FONT_CATEGORIES, FONT_PAIRINGS, TYPE_SCALES, availableWeights, findFont, fontStack } from '../data/fonts.js';
import { loadFont } from '../lib/fontLoader.js';

const ROLES = [
  { id: 'heading', label: 'Títulos' },
  { id: 'body', label: 'Texto' },
  { id: 'mono', label: 'Código' },
];

export default function TypographySection({ brand, update }) {
  const toast = useToast();
  const f = brand.fonts;
  const [query, setQuery] = useState('');
  const [cat, setCat] = useState('all');
  const [custom, setCustom] = useState('');
  const [catalogOpen, setCatalogOpen] = useState(false);

  useEffect(() => {
    FONT_PAIRINGS.forEach((p) => {
      loadFont(p.heading, { full: true });
      loadFont(p.body);
    });
  }, []);

  useEffect(() => {
    if (catalogOpen) FONTS.forEach((font) => loadFont(font.family));
  }, [catalogOpen]);

  const setFonts = (vals) => update((b) => ({ ...b, fonts: { ...b.fonts, ...vals } }));

  const assign = (role, family) => {
    const weights = availableWeights(family);
    const pickW = (pref) => (weights.includes(pref) ? pref : weights.reduce((a, w) => (Math.abs(w - pref) < Math.abs(a - pref) ? w : a), weights[0]));
    const next = { family, category: findFont(family)?.category || 'sans', weight: pickW(role === 'heading' ? 700 : 400) };
    if (role === 'body') next.boldWeight = pickW(600);
    setFonts({ [role]: next });
    loadFont(family, { full: true });
  };

  const addCustom = async (role) => {
    const name = custom.trim();
    if (!name) return;
    if (!(await loadFont(name, { full: true }))) return toast(`No encuentro «${name}» en Google Fonts`, 'error');
    assign(role, name);
    toast(`${name} → ${ROLES.find((r) => r.id === role).label.toLowerCase()}`);
  };

  const list = useMemo(() => {
    const q = query.trim().toLowerCase();
    return FONTS.filter((x) => (cat === 'all' || x.category === cat) && (!q || x.family.toLowerCase().includes(q) || x.tags.includes(q)));
  }, [query, cat]);

  const name = brand.identity.name || 'Tu marca';

  return (
    <>
      <StepHeader step="Paso 3" title="Tipografía" subtitle="Elige una pareja de fuentes: una para títulos y otra para el texto." />

      <div className="pairing-grid">
        {FONT_PAIRINGS.map((p) => {
          const on = f.heading.family === p.heading && f.body.family === p.body;
          return (
            <button
              key={p.name}
              className={`pairing ${on ? 'on' : ''}`}
              onClick={() => {
                assign('heading', p.heading);
                assign('body', p.body);
              }}
            >
              <span className="pairing-aa" style={{ fontFamily: fontStack(findFont(p.heading)) }}>
                {name}
              </span>
              <span className="pairing-text" style={{ fontFamily: fontStack(findFont(p.body)) }}>
                Así se leerá el texto de tu web.
              </span>
              <span className="pairing-meta">
                {p.name} · {p.heading} + {p.body}
              </span>
            </button>
          );
        })}
      </div>

      <Disclosure title="Elegir fuentes una a una" hint={`Ahora: ${f.heading.family} · ${f.body.family} · ${f.mono.family}`}>
        <div className="grid-3">
          {ROLES.map((r) => {
            const font = f[r.id];
            return (
              <Select
                key={r.id}
                label={`Peso de ${r.label.toLowerCase()} (${font.family})`}
                value={font.weight}
                onChange={(w) => setFonts({ [r.id]: { ...font, weight: Number(w) } })}
                options={availableWeights(font.family).map((w) => ({ value: w, label: String(w) }))}
              />
            );
          })}
        </div>
        <div className="grid-2">
          <Select label="Escala de tamaños" value={f.scale} onChange={(v) => setFonts({ scale: Number(v) })} options={TYPE_SCALES.map((s) => ({ value: s.value, label: s.label }))} />
          <Select label="Tamaño base" value={f.baseSize} onChange={(v) => setFonts({ baseSize: Number(v) })} options={[14, 15, 16, 17, 18, 20].map((n) => ({ value: n, label: `${n}px` }))} />
        </div>

        <details className="catalog" onToggle={(e) => setCatalogOpen(e.currentTarget.open)}>
          <summary>Ver las {FONTS.length} fuentes del catálogo</summary>
          <div className="row gap-s wrap mt-s">
            <input className="grow" type="search" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Buscar: elegante, gaming, código…" />
          </div>
          <div className="seg mt-s">
            {FONT_CATEGORIES.map((c) => (
              <button key={c.id} className={cat === c.id ? 'on' : ''} onClick={() => setCat(c.id)}>
                {c.label}
              </button>
            ))}
          </div>
          <div className="font-list">
            {list.map((font) => (
              <div key={font.family} className="font-row">
                <span className="font-row-sample" style={{ fontFamily: fontStack(font) }}>
                  {font.family}
                </span>
                <span className="row gap-xs">
                  {ROLES.map((r) => (
                    <button key={r.id} className={`btn xs ${f[r.id].family === font.family ? 'dark' : ''}`} onClick={() => assign(r.id, font.family)}>
                      {r.label}
                    </button>
                  ))}
                </span>
              </div>
            ))}
          </div>
          <div className="field mt">
            <span className="field-label">¿Otra de Google Fonts?</span>
            <div className="row gap-s wrap">
              <input className="grow" value={custom} onChange={(e) => setCustom(e.target.value)} placeholder="Nombre exacto, p. ej. Quicksand" />
              {ROLES.map((r) => (
                <button key={r.id} className="btn xs" onClick={() => addCustom(r.id)}>
                  {r.label}
                </button>
              ))}
            </div>
          </div>
        </details>
      </Disclosure>
    </>
  );
}

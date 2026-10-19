import { useEffect, useMemo, useState } from 'react';
import { SectionHeader, Card, Select, useToast } from './ui.jsx';
import { FONTS, FONT_CATEGORIES, FONT_PAIRINGS, TYPE_SCALES, availableWeights, findFont, fontStack, typeScale } from '../data/fonts.js';
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
  const [sample, setSample] = useState('');
  const [custom, setCustom] = useState('');

  // Precarga del catálogo (solo peso regular) para las vistas previas.
  useEffect(() => {
    FONTS.forEach((font) => loadFont(font.family));
  }, []);

  const setFonts = (vals) => update((b) => ({ ...b, fonts: { ...b.fonts, ...vals } }));

  const assign = (role, family) => {
    const known = findFont(family);
    const weights = availableWeights(family);
    const pickW = (pref) => (weights.includes(pref) ? pref : weights.reduce((a, w) => (Math.abs(w - pref) < Math.abs(a - pref) ? w : a), weights[0]));
    const next = { family, category: known?.category || 'sans', weight: pickW(role === 'heading' ? 700 : 400) };
    if (role === 'body') next.boldWeight = pickW(600);
    setFonts({ [role]: next });
    loadFont(family, { full: true });
  };

  const addCustom = async (role) => {
    const name = custom.trim();
    if (!name) return;
    const ok = await loadFont(name, { full: true });
    if (!ok) return toast(`No encuentro "${name}" en Google Fonts`, 'error');
    assign(role, name);
    toast(`${name} asignada a ${ROLES.find((r) => r.id === role).label}`);
  };

  const list = useMemo(() => {
    const q = query.trim().toLowerCase();
    return FONTS.filter((x) => (cat === 'all' || x.category === cat) && (!q || x.family.toLowerCase().includes(q) || x.tags.includes(q)));
  }, [query, cat]);

  const sizes = typeScale(f.baseSize, f.scale);
  const name = brand.identity.name || 'Tu marca';

  return (
    <>
      <SectionHeader title="Tipografía" subtitle="Elige las fuentes de títulos, texto y código. Todas son de Google Fonts, gratuitas." />

      <Card title="Selección actual">
        <div className="font-roles">
          {ROLES.map((r) => {
            const font = f[r.id];
            const weights = availableWeights(font.family);
            return (
              <div key={r.id} className="font-role">
                <span className="eyebrow">{r.label}</span>
                <div className="font-role-name" style={{ fontFamily: fontStack(font), fontWeight: font.weight }}>
                  {font.family}
                </div>
                <div className="row gap-s wrap">
                  <Select
                    label="Peso"
                    value={font.weight}
                    onChange={(w) => setFonts({ [r.id]: { ...font, weight: Number(w) } })}
                    options={weights.map((w) => ({ value: w, label: String(w) }))}
                  />
                  {r.id === 'body' && (
                    <Select
                      label="Negrita"
                      value={font.boldWeight}
                      onChange={(w) => setFonts({ body: { ...font, boldWeight: Number(w) } })}
                      options={weights.map((w) => ({ value: w, label: String(w) }))}
                    />
                  )}
                </div>
              </div>
            );
          })}
        </div>
        <div className="grid-2 mt">
          <Select label="Escala tipográfica" value={f.scale} onChange={(v) => setFonts({ scale: Number(v) })} options={TYPE_SCALES.map((s) => ({ value: s.value, label: s.label }))} />
          <Select label="Tamaño base" value={f.baseSize} onChange={(v) => setFonts({ baseSize: Number(v) })} options={[14, 15, 16, 17, 18, 20].map((n) => ({ value: n, label: `${n}px` }))} />
        </div>
      </Card>

      <Card title="Muestra">
        <div className="specimen">
          <div style={{ fontFamily: fontStack(f.heading), fontWeight: f.heading.weight, fontSize: sizes['4xl'], lineHeight: 1.1 }}>{name}</div>
          <div style={{ fontFamily: fontStack(f.heading), fontWeight: f.heading.weight, fontSize: sizes['2xl'], lineHeight: 1.2 }}>
            {brand.identity.tagline || 'Un titular para comprobar el carácter'}
          </div>
          <p style={{ fontFamily: fontStack(f.body), fontWeight: f.body.weight, fontSize: sizes.base, lineHeight: 1.6, maxWidth: '62ch' }}>
            {brand.identity.description ||
              'El texto de párrafo debe ser cómodo de leer en pantallas pequeñas y grandes. Comprueba el interlineado, el ancho de columna y cómo combina con los titulares.'}{' '}
            <strong style={{ fontWeight: f.body.boldWeight }}>Este fragmento va en negrita.</strong>
          </p>
          <code style={{ fontFamily: fontStack(f.mono), fontSize: sizes.sm }}>const marca = "{name}";</code>
        </div>
        <div className="scale-list">
          {Object.entries(sizes)
            .reverse()
            .map(([k, v]) => (
              <div key={k} className="row gap-m">
                <span className="muted small scale-key">
                  {k} · {v}px
                </span>
                <span style={{ fontFamily: fontStack(f.heading), fontSize: v, lineHeight: 1.2 }} className="ellipsis">
                  Aa Bb Cc
                </span>
              </div>
            ))}
        </div>
      </Card>

      <Card title="Combinaciones sugeridas">
        <div className="pairings">
          {FONT_PAIRINGS.map((p) => (
            <button
              key={p.name}
              className={`pairing ${f.heading.family === p.heading && f.body.family === p.body ? 'on' : ''}`}
              onClick={() => {
                assign('heading', p.heading);
                assign('body', p.body);
              }}
            >
              <span className="pairing-title" style={{ fontFamily: fontStack(findFont(p.heading)) }}>
                {p.heading}
              </span>
              <span className="pairing-body" style={{ fontFamily: fontStack(findFont(p.body)) }}>
                {p.body} · {p.name}
              </span>
            </button>
          ))}
        </div>
      </Card>

      <Card title="Catálogo">
        <div className="row gap-s wrap">
          <input className="grow" type="search" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Buscar por nombre o estilo (p. ej. elegante, gaming)…" />
          <input className="grow" type="text" value={sample} onChange={(e) => setSample(e.target.value)} placeholder="Texto de muestra" />
        </div>
        <div className="tabs mt-s">
          {FONT_CATEGORIES.map((c) => (
            <button key={c.id} className={`tab ${cat === c.id ? 'on' : ''}`} onClick={() => setCat(c.id)}>
              {c.label}
            </button>
          ))}
        </div>
        <div className="font-grid">
          {list.map((font) => (
            <div key={font.family} className="font-card">
              <div className="font-sample" style={{ fontFamily: fontStack(font) }}>
                {sample || name}
              </div>
              <div className="row between wrap gap-s">
                <span className="small">
                  <strong>{font.family}</strong> <span className="muted">· {font.tags}</span>
                </span>
                <span className="row gap-xs">
                  {ROLES.map((r) => (
                    <button key={r.id} className={`btn xs ${f[r.id].family === font.family ? 'primary' : ''}`} onClick={() => assign(r.id, font.family)}>
                      {r.label}
                    </button>
                  ))}
                </span>
              </div>
            </div>
          ))}
        </div>
        <div className="custom-font mt">
          <span className="field-label">¿Otra fuente de Google Fonts?</span>
          <div className="row gap-s wrap">
            <input className="grow" value={custom} onChange={(e) => setCustom(e.target.value)} placeholder="Nombre exacto, p. ej. Quicksand" />
            {ROLES.map((r) => (
              <button key={r.id} className="btn" onClick={() => addCustom(r.id)}>
                Usar en {r.label.toLowerCase()}
              </button>
            ))}
          </div>
        </div>
      </Card>
    </>
  );
}

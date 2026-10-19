import { useState } from 'react';
import { StepHeader, Select, Disclosure, useToast } from './ui.jsx';
import { COLOR_ROLES, roleLabel, uid } from '../lib/brand.js';
import { contrast, harmony, HARMONIES, normalizeHex, randomPalette, readableOn, wcagLevel } from '../lib/color.js';
import { PALETTES, PALETTE_NAMES, PALETTE_ROLES } from '../data/palettes.js';

function HexInput({ value, onChange }) {
  const [draft, setDraft] = useState(value);
  const [prev, setPrev] = useState(value);
  if (prev !== value) {
    setPrev(value);
    setDraft(value);
  }
  return (
    <input
      className="mono"
      value={draft}
      onChange={(e) => {
        setDraft(e.target.value);
        const n = normalizeHex(e.target.value);
        if (n) onChange(n);
      }}
      onBlur={() => setDraft(value)}
      aria-label="Código HEX"
    />
  );
}

const fromHexes = (hexes) => hexes.map((hex, i) => ({ id: uid(), name: PALETTE_NAMES[i] || `Color ${i + 1}`, hex, role: PALETTE_ROLES[i] || 'other', usage: '' }));

export default function ColorsSection({ brand, update }) {
  const toast = useToast();
  const colors = brand.colors;
  const setColors = (fn) => update((b) => ({ ...b, colors: typeof fn === 'function' ? fn(b.colors) : fn }));
  const [selectedId, setSelectedId] = useState(null);
  const [baseId, setBaseId] = useState(colors[0]?.id || '');
  const [scheme, setScheme] = useState('complementary');
  const [paste, setPaste] = useState('');

  const selected = colors.find((c) => c.id === selectedId);
  const base = colors.find((c) => c.id === baseId) || colors[0];
  const change = (vals) => setColors((cs) => cs.map((c) => (c.id === selectedId ? { ...c, ...vals } : c)));

  const addColor = (hex = '#a3a3a3') => {
    const c = { id: uid(), name: `Color ${colors.length + 1}`, hex, role: 'other', usage: '' };
    setColors((cs) => [...cs, c]);
    setSelectedId(c.id);
  };

  const importPaste = () => {
    const found = (paste.match(/#?[0-9a-f]{6}\b|#[0-9a-f]{3}\b/gi) || []).map(normalizeHex).filter(Boolean);
    if (!found.length) return toast('No he encontrado códigos HEX', 'error');
    setColors((cs) => [...cs, ...found.map((hex, i) => ({ id: uid(), name: `Color ${cs.length + i + 1}`, hex, role: 'other', usage: '' }))]);
    setPaste('');
    toast(`${found.length} colores añadidos`);
  };

  const currentKey = colors.map((c) => c.hex).join();

  return (
    <>
      <StepHeader step="Paso 2" title="Colores" subtitle="Toca un color para editarlo. Añade tantos como quieras." />

      <div className="swatches">
        {colors.map((c) => (
          <button key={c.id} className={`swatch ${selectedId === c.id ? 'on' : ''}`} onClick={() => setSelectedId(selectedId === c.id ? null : c.id)}>
            <span className="swatch-color" style={{ background: c.hex }} />
            <span className="swatch-name">{c.name}</span>
            <span className="swatch-meta">
              {c.hex} · {roleLabel(c.role)}
            </span>
          </button>
        ))}
        <button className="swatch swatch-add" onClick={() => addColor()} aria-label="Añadir color">
          <span className="swatch-color">+</span>
          <span className="swatch-name">Añadir</span>
        </button>
      </div>

      {selected && (
        <div className="swatch-editor">
          <label className="color-well" style={{ background: selected.hex }}>
            <input type="color" value={selected.hex} onChange={(e) => change({ hex: e.target.value })} aria-label="Elegir color" />
          </label>
          <div className="swatch-editor-fields">
            <input value={selected.name} onChange={(e) => change({ name: e.target.value })} aria-label="Nombre" />
            <HexInput value={selected.hex} onChange={(hex) => change({ hex })} />
            <select value={selected.role} onChange={(e) => change({ role: e.target.value })} aria-label="Rol">
              {COLOR_ROLES.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.label}
                </option>
              ))}
            </select>
            <input value={selected.usage} placeholder="Uso (opcional)" onChange={(e) => change({ usage: e.target.value })} aria-label="Uso" />
          </div>
          <button
            className="btn ghost"
            onClick={() => {
              setColors((cs) => cs.filter((c) => c.id !== selected.id));
              setSelectedId(null);
            }}
          >
            Eliminar
          </button>
        </div>
      )}

      <h3 className="subhead">Inspiración</h3>
      <div className="palette-grid">
        {PALETTES.map((p) => (
          <button
            key={p.name}
            className={`palette ${currentKey === p.colors.join() ? 'on' : ''}`}
            onClick={() => {
              setColors(fromHexes(p.colors));
              setSelectedId(null);
              toast(`Paleta «${p.name}» aplicada`);
            }}
          >
            <span className="palette-strip">
              {p.colors.map((h) => (
                <span key={h} style={{ background: h }} />
              ))}
            </span>
            <span className="palette-name">{p.name}</span>
          </button>
        ))}
        <button
          className="palette"
          onClick={() => {
            setColors(fromHexes(randomPalette().colors));
            setSelectedId(null);
          }}
        >
          <span className="palette-strip random">🎲</span>
          <span className="palette-name">Sorpréndeme</span>
        </button>
      </div>

      <Disclosure title="Herramientas avanzadas" hint="Armonías, pegar códigos, contraste">
        {base && (
          <>
            <div className="grid-2">
              <Select label="Armonía a partir de" value={base.id} onChange={setBaseId} options={colors.map((c) => ({ value: c.id, label: `${c.name} (${c.hex})` }))} />
              <Select label="Tipo" value={scheme} onChange={setScheme} options={HARMONIES.map((h) => ({ value: h.id, label: h.label }))} />
            </div>
            <div className="suggestions">
              {harmony(base.hex, scheme)
                .filter((h) => h !== base.hex)
                .map((hex) => (
                  <button key={hex} className="suggestion" style={{ background: hex, color: readableOn(hex) }} onClick={() => addColor(hex)} title="Añadir">
                    {hex} +
                  </button>
                ))}
            </div>
          </>
        )}

        <div className="field">
          <span className="field-label">Pegar códigos HEX</span>
          <div className="row gap-s">
            <input className="grow" value={paste} onChange={(e) => setPaste(e.target.value)} placeholder="#264653 #2a9d8f #e9c46a" />
            <button className="btn" onClick={importPaste}>
              Añadir
            </button>
          </div>
        </div>

        {colors.length > 1 && (
          <div className="field">
            <span className="field-label">Contraste (texto en filas sobre fondo en columnas · AA ≥ 4,5)</span>
            <div className="table-scroll">
              <table className="contrast-table">
                <tbody>
                  {colors.slice(0, 8).map((fg) => (
                    <tr key={fg.id}>
                      {colors.slice(0, 8).map((bg) => {
                        const r = contrast(fg.hex, bg.hex);
                        return (
                          <td key={bg.id} style={{ background: bg.hex, color: fg.hex }} title={`${fg.name} sobre ${bg.name}: ${wcagLevel(r)}`}>
                            {fg.id === bg.id ? '' : r.toFixed(1)}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </Disclosure>
    </>
  );
}

import { useState } from 'react';
import { SectionHeader, Card, Select, useToast } from './ui.jsx';
import { COLOR_ROLES, uid } from '../lib/brand.js';
import { contrast, harmony, HARMONIES, normalizeHex, randomPalette, readableOn, shades, SHADE_STEPS, wcagLevel } from '../lib/color.js';

function HexInput({ value, onChange }) {
  const [draft, setDraft] = useState(value);
  const [prev, setPrev] = useState(value);
  if (prev !== value) {
    setPrev(value);
    setDraft(value);
  }
  return (
    <input
      className="hex-input"
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

function ColorRow({ color, index, total, onChange, onMove, onRemove }) {
  const sc = shades(color.hex);
  const cw = contrast(color.hex, '#ffffff');
  const cb = contrast(color.hex, '#111111');
  return (
    <div className="color-row">
      <label className="swatch-picker" style={{ background: color.hex }}>
        <input type="color" value={color.hex} onChange={(e) => onChange({ hex: e.target.value })} aria-label={`Elegir color ${color.name}`} />
      </label>
      <div className="color-fields">
        <div className="row gap-s wrap">
          <input className="grow" value={color.name} onChange={(e) => onChange({ name: e.target.value })} aria-label="Nombre del color" />
          <HexInput value={color.hex} onChange={(hex) => onChange({ hex })} />
          <select value={color.role} onChange={(e) => onChange({ role: e.target.value })} aria-label="Rol del color">
            {COLOR_ROLES.map((r) => (
              <option key={r.id} value={r.id}>
                {r.label}
              </option>
            ))}
          </select>
        </div>
        <input className="mt-s" value={color.usage} placeholder="Uso (opcional): p. ej. solo para botones principales" onChange={(e) => onChange({ usage: e.target.value })} aria-label="Uso del color" />
        <div className="shade-strip" title="Escala de tonos 50–950">
          {SHADE_STEPS.map((s) => (
            <span key={s} style={{ background: sc[s] }} title={`${s}: ${sc[s]}`} />
          ))}
        </div>
        <div className="row gap-s small muted wrap">
          <span className={`badge lvl-${wcagLevel(cw).replace(' ', '-')}`}>Blanco {cw.toFixed(1)}:1 · {wcagLevel(cw)}</span>
          <span className={`badge lvl-${wcagLevel(cb).replace(' ', '-')}`}>Negro {cb.toFixed(1)}:1 · {wcagLevel(cb)}</span>
        </div>
      </div>
      <div className="color-actions">
        <button className="btn ghost icon" disabled={index === 0} onClick={() => onMove(-1)} aria-label="Subir">↑</button>
        <button className="btn ghost icon" disabled={index === total - 1} onClick={() => onMove(1)} aria-label="Bajar">↓</button>
        <button className="btn ghost icon danger" onClick={onRemove} aria-label="Eliminar color">✕</button>
      </div>
    </div>
  );
}

export default function ColorsSection({ brand, update }) {
  const toast = useToast();
  const colors = brand.colors;
  const setColors = (fn) => update((b) => ({ ...b, colors: typeof fn === 'function' ? fn(b.colors) : fn }));
  const [baseId, setBaseId] = useState(colors[0]?.id || '');
  const [scheme, setScheme] = useState('complementary');
  const [paste, setPaste] = useState('');

  const base = colors.find((c) => c.id === baseId) || colors[0];
  const suggestions = base ? harmony(base.hex, scheme).filter((h) => h !== base.hex) : [];

  const addColor = (hex = '#888888', name, role = 'other') =>
    setColors((cs) => [...cs, { id: uid(), name: name || `Color ${cs.length + 1}`, hex, role, usage: '' }]);

  const move = (i, dir) =>
    setColors((cs) => {
      const next = [...cs];
      [next[i], next[i + dir]] = [next[i + dir], next[i]];
      return next;
    });

  const applyRandom = () => {
    const { colors: hexes } = randomPalette();
    const roles = ['primary', 'secondary', 'accent', 'background', 'text'];
    const names = ['Primario', 'Secundario', 'Acento', 'Fondo', 'Texto'];
    setColors(hexes.map((hex, i) => ({ id: uid(), name: names[i], hex, role: roles[i], usage: '' })));
    toast('Paleta aleatoria generada');
  };

  const importPaste = () => {
    const found = (paste.match(/#?[0-9a-f]{6}\b|#[0-9a-f]{3}\b/gi) || []).map(normalizeHex).filter(Boolean);
    if (!found.length) return toast('No he encontrado códigos HEX', 'error');
    setColors((cs) => [...cs, ...found.map((hex, i) => ({ id: uid(), name: `Color ${cs.length + i + 1}`, hex, role: 'other', usage: '' }))]);
    setPaste('');
    toast(`${found.length} colores añadidos`);
  };

  const matrix = colors.slice(0, 10);

  return (
    <>
      <SectionHeader title="Colores" subtitle="Añade tantos colores como quieras y asigna a cada uno un rol.">
        <button className="btn" onClick={applyRandom}>🎲 Paleta aleatoria</button>
        <button className="btn primary" onClick={() => addColor()}>+ Añadir color</button>
      </SectionHeader>

      <Card>
        {colors.length === 0 && <p className="muted">No hay colores todavía.</p>}
        <div className="color-list">
          {colors.map((c, i) => (
            <ColorRow
              key={c.id}
              color={c}
              index={i}
              total={colors.length}
              onChange={(vals) => setColors((cs) => cs.map((x) => (x.id === c.id ? { ...x, ...vals } : x)))}
              onMove={(dir) => move(i, dir)}
              onRemove={() => setColors((cs) => cs.filter((x) => x.id !== c.id))}
            />
          ))}
        </div>
      </Card>

      <div className="grid-2 align-start">
        <Card title="Generador de armonías" subtitle="Sugerencias a partir de un color de tu paleta.">
          {base ? (
            <>
              <div className="grid-2">
                <Select label="Color base" value={base.id} onChange={setBaseId} options={colors.map((c) => ({ value: c.id, label: `${c.name} (${c.hex})` }))} />
                <Select label="Armonía" value={scheme} onChange={setScheme} options={HARMONIES.map((h) => ({ value: h.id, label: h.label }))} />
              </div>
              <div className="suggestions">
                {suggestions.map((hex) => (
                  <button key={hex} className="suggestion" style={{ background: hex, color: readableOn(hex) }} onClick={() => addColor(hex)} title="Añadir a la paleta">
                    {hex}
                    <span>+ añadir</span>
                  </button>
                ))}
              </div>
            </>
          ) : (
            <p className="muted">Añade un color para generar armonías.</p>
          )}
        </Card>
        <Card title="Pegar colores" subtitle="Pega una lista de códigos HEX (de Coolors, Figma, una web…).">
          <textarea rows={3} value={paste} onChange={(e) => setPaste(e.target.value)} placeholder="#264653, #2a9d8f, #e9c46a, #f4a261, #e76f51" />
          <button className="btn mt-s" onClick={importPaste}>Importar colores</button>
        </Card>
      </div>

      {matrix.length > 1 && (
        <Card title="Matriz de contraste" subtitle="Texto (filas) sobre fondo (columnas). AA requiere 4,5:1 para texto normal.">
          <div className="table-scroll">
            <table className="contrast-table">
              <thead>
                <tr>
                  <th />
                  {matrix.map((bg) => (
                    <th key={bg.id}>
                      <span className="dot" style={{ background: bg.hex }} /> {bg.name}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {matrix.map((fg) => (
                  <tr key={fg.id}>
                    <th>
                      <span className="dot" style={{ background: fg.hex }} /> {fg.name}
                    </th>
                    {matrix.map((bg) => {
                      const r = contrast(fg.hex, bg.hex);
                      return (
                        <td key={bg.id} style={{ background: bg.hex, color: fg.hex }} title={wcagLevel(r)}>
                          {fg.id === bg.id ? '—' : (
                            <>
                              <strong>Aa</strong> <small>{r.toFixed(1)}</small>
                            </>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </>
  );
}

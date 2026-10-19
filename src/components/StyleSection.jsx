import { useEffect } from 'react';
import { StepHeader, Select, Slider, Toggle, TextArea, Disclosure } from './ui.jsx';
import { STYLE_PRESETS, SHADOWS, DENSITIES, findPreset } from '../data/styles.js';
import { resolveTheme } from '../lib/brand.js';
import { readableOn } from '../lib/color.js';
import { loadFont } from '../lib/fontLoader.js';

// Fuentes que usan las miniaturas para que cada estilo tenga su carácter.
const THUMB_FONTS = ['Instrument Serif', 'Cormorant Garamond', 'Alfa Slab One', 'JetBrains Mono', 'Fredoka', 'Archivo Black'];

// Miniatura visual de un estilo, teñida con el color primario y el acento de la marca.
export function StyleThumb({ preset, brand }) {
  const t = resolveTheme(brand);
  const { primary, accent, secondary } = t.colors;
  return (
    <div className={`st st-${preset.id}`} style={{ '--p': primary, '--a': accent, '--s': secondary, '--on': readableOn(primary) }} aria-hidden="true">
      <span className="st-deco d1" />
      <span className="st-deco d2" />
      <div className="st-card">
        <span className="st-eyebrow">Nuevo</span>
        <span className="st-title">Tu idea</span>
        <span className="st-line" />
        <span className="st-line short" />
        <span className="st-btns">
          <span className="st-btn">Empezar</span>
          <span className="st-btn alt">Ver más</span>
        </span>
      </div>
    </div>
  );
}

export default function StyleSection({ brand, patch }) {
  const s = brand.style;
  const set = (k) => (v) => patch('style', { [k]: v });
  const preset = findPreset(s.preset);

  useEffect(() => {
    THUMB_FONTS.forEach((f) => loadFont(f));
  }, []);

  return (
    <>
      <StepHeader step="Paso 4" title="Estilo" subtitle="¿Cómo quieres que se sienta tu interfaz? Elige el que más se parezca." />

      <div className="style-gallery">
        {STYLE_PRESETS.map((p) => (
          <button key={p.id} className={`style-tile ${s.preset === p.id ? 'on' : ''}`} onClick={() => patch('style', { preset: p.id, ...p.tokens })} title={p.description}>
            <StyleThumb preset={p} brand={brand} />
            <span className="style-name">{p.name}</span>
          </button>
        ))}
      </div>

      <Disclosure title="Ajustes finos" hint={preset ? `Basado en ${preset.name}` : ''}>
        <div className="grid-2">
          <Slider label="Esquinas" min={0} max={32} value={s.radius} onChange={set('radius')} format={(v) => `${v}px`} />
          <Slider label="Bordes" min={0} max={4} value={s.borderWidth} onChange={set('borderWidth')} format={(v) => `${v}px`} />
          <Select label="Sombra" value={s.shadow} onChange={set('shadow')} options={SHADOWS} />
          <Select label="Espaciado" value={s.density} onChange={set('density')} options={DENSITIES} />
          <Select
            label="Titulares"
            value={s.headingCase}
            onChange={set('headingCase')}
            options={[
              { value: 'none', label: 'Normal' },
              { value: 'uppercase', label: 'MAYÚSCULAS' },
            ]}
          />
          <Slider label="Espacio entre letras" min={-0.05} max={0.2} step={0.01} value={s.headingTracking} onChange={set('headingTracking')} format={(v) => `${v.toFixed(2)}em`} />
        </div>
        <div className="row gap-m wrap">
          <Toggle label="Botones redondos" checked={s.pillButtons} onChange={set('pillButtons')} />
          <Toggle label="Degradados" checked={s.gradients} onChange={set('gradients')} />
          <Toggle label="Efecto cristal" checked={s.surface === 'glass'} onChange={(v) => set('surface')(v ? 'glass' : 'solid')} />
        </div>
        {preset && (
          <div className="rules">
            <span className="field-label">Reglas que recibirá Claude</span>
            <ul>
              {preset.rules.map((r) => (
                <li key={r}>{r}</li>
              ))}
            </ul>
          </div>
        )}
        <TextArea label="Tus reglas" rows={2} value={s.notes} onChange={set('notes')} placeholder="p. ej. Nada de emojis en la interfaz." />
      </Disclosure>
    </>
  );
}

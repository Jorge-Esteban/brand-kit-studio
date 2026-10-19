import { SectionHeader, Card, Select, Slider, Toggle, TextArea } from './ui.jsx';
import { STYLE_PRESETS, SHADOWS, DENSITIES, findPreset } from '../data/styles.js';
import BrandPreview, { MiniPreview } from './BrandPreview.jsx';

export default function StyleSection({ brand, patch }) {
  const s = brand.style;
  const set = (k) => (v) => patch('style', { [k]: v });
  const preset = findPreset(s.preset);
  const modified = preset && Object.entries(preset.tokens).some(([k, v]) => s[k] !== v);

  return (
    <>
      <SectionHeader title="Estilo de diseño" subtitle="Elige un estilo base y ajusta sus tokens. La vista previa usa tus colores y fuentes." />
      <Card title="Estilos">
        <div className="preset-grid">
          {STYLE_PRESETS.map((p) => (
            <button key={p.id} className={`preset ${s.preset === p.id ? 'on' : ''}`} onClick={() => patch('style', { preset: p.id, ...p.tokens })}>
              <MiniPreview brand={brand} tokens={p.tokens} />
              <span className="preset-name">{p.name}</span>
              <span className="preset-desc">{p.description}</span>
            </button>
          ))}
        </div>
      </Card>

      <div className="grid-2 align-start">
        <Card
          title="Ajustes finos"
          subtitle={modified ? `Basado en «${preset.name}» con cambios.` : preset ? `Valores del estilo «${preset.name}».` : ''}
          actions={
            modified && (
              <button className="btn xs" onClick={() => patch('style', { ...preset.tokens })}>
                Restablecer
              </button>
            )
          }
        >
          <Slider label="Radio de esquinas" min={0} max={32} value={s.radius} onChange={set('radius')} format={(v) => `${v}px`} />
          <Slider label="Grosor de borde" min={0} max={4} value={s.borderWidth} onChange={set('borderWidth')} format={(v) => `${v}px`} />
          <Slider label="Espaciado entre letras (titulares)" min={-0.05} max={0.2} step={0.01} value={s.headingTracking} onChange={set('headingTracking')} format={(v) => `${v.toFixed(2)}em`} />
          <div className="grid-2">
            <Select label="Sombra" value={s.shadow} onChange={set('shadow')} options={SHADOWS} />
            <Select label="Densidad" value={s.density} onChange={set('density')} options={DENSITIES} />
            <Select
              label="Titulares"
              value={s.headingCase}
              onChange={set('headingCase')}
              options={[
                { value: 'none', label: 'Tipo oración' },
                { value: 'uppercase', label: 'MAYÚSCULAS' },
              ]}
            />
            <Select
              label="Superficies"
              value={s.surface}
              onChange={set('surface')}
              options={[
                { value: 'solid', label: 'Sólidas' },
                { value: 'glass', label: 'Cristal (glass)' },
              ]}
            />
          </div>
          <div className="row gap-m wrap">
            <Toggle label="Botones tipo píldora" checked={s.pillButtons} onChange={set('pillButtons')} />
            <Toggle label="Degradados de marca" checked={s.gradients} onChange={set('gradients')} />
          </div>
          {preset && (
            <div className="rules">
              <span className="field-label">Reglas del estilo (se exportan para Claude)</span>
              <ul>
                {preset.rules.map((r) => (
                  <li key={r}>{r}</li>
                ))}
              </ul>
            </div>
          )}
          <TextArea label="Notas de estilo propias" value={s.notes} onChange={set('notes')} placeholder="p. ej. Usar ilustraciones isométricas en las cabeceras; nada de emojis en la interfaz." />
        </Card>
        <Card title="Vista previa" className="sticky-card">
          <div className="preview-frame compact">
            <BrandPreview brand={brand} />
          </div>
        </Card>
      </div>
    </>
  );
}

import { SectionHeader, Card, TextInput, TextArea } from './ui.jsx';

const ICON_STYLES = [
  { id: 'line', label: 'Lineal', glyph: '◯' },
  { id: 'filled', label: 'Relleno', glyph: '●' },
  { id: 'duotone', label: 'Duotono', glyph: '◐' },
  { id: '3d', label: '3D', glyph: '⬢' },
  { id: 'hand', label: 'A mano', glyph: '✎' },
  { id: 'pixel', label: 'Pixel art', glyph: '▦' },
];

export default function ImagerySection({ brand, patch }) {
  const im = brand.imagery;
  const set = (k) => (v) => patch('imagery', { [k]: v });
  return (
    <>
      <SectionHeader title="Imagen e iconos" subtitle="Indicaciones visuales para fotos, ilustraciones e iconografía." />
      <Card title="Fotografía e ilustración">
        <TextArea label="Estilo fotográfico" value={im.photo} onChange={set('photo')} placeholder="p. ej. Luz natural cálida, personas reales en contexto, colores ligeramente desaturados." />
        <TextArea label="Estilo de ilustración" value={im.illustration} onChange={set('illustration')} placeholder="p. ej. Ilustración plana con formas geométricas y la paleta de marca; sin contornos." />
      </Card>
      <Card title="Iconografía">
        <div className="icon-styles">
          {ICON_STYLES.map((s) => (
            <button key={s.id} className={`option-tile ${im.iconStyle === s.id ? 'on' : ''}`} onClick={() => set('iconStyle')(s.id)}>
              <span className="glyph">{s.glyph}</span>
              {s.label}
            </button>
          ))}
        </div>
        <div className="grid-2 mt">
          <TextInput label="Librería de iconos preferida" value={im.iconLibrary} onChange={set('iconLibrary')} placeholder="Lucide, Phosphor, Material Symbols, Heroicons…" />
          <TextInput label="Notas de iconografía" value={im.icons} onChange={set('icons')} placeholder="Trazo de 2 px, esquinas redondeadas…" />
        </div>
      </Card>
      <Card title="Qué evitar">
        <TextArea label="Evitar" value={im.avoid} onChange={set('avoid')} placeholder="p. ej. Fotos de stock genéricas, clipart, sombras exageradas…" />
      </Card>
    </>
  );
}

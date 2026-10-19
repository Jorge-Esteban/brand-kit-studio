import { useState } from 'react';
import { SectionHeader } from './ui.jsx';
import BrandPreview from './BrandPreview.jsx';

export default function PreviewSection({ brand }) {
  const [dark, setDark] = useState(false);
  const [width, setWidth] = useState('desktop');
  return (
    <>
      <SectionHeader title="Vista previa" subtitle="Tu marca aplicada a una página de ejemplo.">
        <div className="tabs compact">
          <button className={`tab ${!dark ? 'on' : ''}`} onClick={() => setDark(false)}>Claro</button>
          <button className={`tab ${dark ? 'on' : ''}`} onClick={() => setDark(true)}>Oscuro</button>
        </div>
        <div className="tabs compact">
          <button className={`tab ${width === 'desktop' ? 'on' : ''}`} onClick={() => setWidth('desktop')}>Escritorio</button>
          <button className={`tab ${width === 'mobile' ? 'on' : ''}`} onClick={() => setWidth('mobile')}>Móvil</button>
        </div>
      </SectionHeader>
      <div className={`preview-frame ${width}`}>
        <BrandPreview brand={brand} dark={dark} />
      </div>
    </>
  );
}

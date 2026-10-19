import { useState } from 'react';
import { StepHeader, TextInput, TextArea, Select, Slider, Chips, Disclosure, Field } from './ui.jsx';

const TRAITS = ['Cercana', 'Profesional', 'Divertida', 'Elegante', 'Atrevida', 'Minimalista', 'Técnica', 'Cálida', 'Innovadora', 'Lúdica', 'Sofisticada', 'Honesta'];

const ICON_STYLES = [
  { value: 'line', label: 'Lineales' },
  { value: 'filled', label: 'Rellenos' },
  { value: 'duotone', label: 'Duotono' },
  { value: '3d', label: '3D' },
  { value: 'hand', label: 'Dibujados a mano' },
  { value: 'pixel', label: 'Pixel art' },
];

export default function BrandSection({ brand, patch, update }) {
  const id = brand.identity;
  const v = brand.voice;
  const im = brand.imagery;
  const setId = (k) => (val) => patch('identity', { [k]: val });
  const setV = (k) => (val) => patch('voice', { [k]: val });
  const setIm = (k) => (val) => patch('imagery', { [k]: val });
  const [custom, setCustom] = useState('');

  const toggleTrait = (t) => setV('traits')(v.traits.includes(t) ? v.traits.filter((x) => x !== t) : [...v.traits, t]);
  const addCustom = () => {
    const t = custom.trim();
    if (t && !v.traits.includes(t)) setV('traits')([...v.traits, t]);
    setCustom('');
  };

  return (
    <>
      <StepHeader step="Paso 1" title="Tu marca" subtitle="Lo básico para que Claude entienda de qué va tu proyecto." />

      <div className="form">
        <TextInput big label="Nombre" value={id.name} onChange={setId('name')} placeholder="Lumen" />
        <TextInput label="Eslogan" value={id.tagline} onChange={setId('tagline')} placeholder="Ideas que iluminan" />
        <TextArea label="¿Qué es?" rows={3} value={id.description} onChange={setId('description')} placeholder="Una app que… para… En dos o tres frases." />
        <Field group label="Personalidad">
          <Chips options={[...new Set([...TRAITS, ...v.traits])]} selected={v.traits} onToggle={toggleTrait} />
          <input
            className="input-inline"
            value={custom}
            placeholder="+ Añadir otra y pulsar Enter"
            onChange={(e) => setCustom(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addCustom())}
          />
        </Field>
      </div>

      <Disclosure title="Más detalles" hint="Opcional · público, tono de voz, imagen">
        <div className="grid-2">
          <TextInput label="Público" value={id.audience} onChange={setId('audience')} placeholder="¿Para quién es?" />
          <TextInput label="Sector" value={id.industry} onChange={setId('industry')} placeholder="App, juego, tienda…" />
          <TextInput label="Palabras clave" value={id.keywords} onChange={setId('keywords')} placeholder="luz, foco, calma" />
          <TextInput label="Valores" value={id.values} onChange={setId('values')} placeholder="¿Qué defiende?" />
        </div>

        <h3 className="subhead">Tono de voz</h3>
        <div className="grid-2">
          <Slider label="Registro" value={v.formality} onChange={setV('formality')} left="Cercano" right="Formal" />
          <Slider label="Humor" value={v.humor} onChange={setV('humor')} left="Serio" right="Divertido" />
          <Slider label="Energía" value={v.enthusiasm} onChange={setV('enthusiasm')} left="Sobrio" right="Entusiasta" />
          <Slider label="Lenguaje" value={v.complexity} onChange={setV('complexity')} left="Sencillo" right="Técnico" />
          <Select
            label="Trato al lector"
            value={v.address}
            onChange={setV('address')}
            options={['tú', 'usted', 'vosotros', 'ustedes', 'impersonal'].map((x) => ({ value: x, label: x }))}
          />
          <TextInput label="Idiomas" value={v.languages} onChange={setV('languages')} placeholder="Español" />
        </div>
        <TextArea label="Cómo habla la marca" rows={2} value={v.tone} onChange={setV('tone')} placeholder="Como un amigo que sabe del tema: claro y con un toque de humor." />
        <div className="grid-2">
          <TextInput label="Palabras que usamos" value={v.doWords} onChange={setV('doWords')} placeholder="descubre, juntos, fácil" />
          <TextInput label="Palabras que evitamos" value={v.dontWords} onChange={setV('dontWords')} placeholder="sinergia, barato" />
        </div>
        <TextArea label="Texto de ejemplo" rows={3} value={v.sample} onChange={setV('sample')} placeholder="Un párrafo escrito con la voz de la marca." />

        <h3 className="subhead">Imagen e iconos</h3>
        <div className="grid-2">
          <TextInput label="Fotografía" value={im.photo} onChange={setIm('photo')} placeholder="Luz natural, personas reales…" />
          <TextInput label="Ilustración" value={im.illustration} onChange={setIm('illustration')} placeholder="Plana, geométrica…" />
          <Select label="Iconos" value={im.iconStyle} onChange={setIm('iconStyle')} options={ICON_STYLES} />
          <TextInput label="Librería de iconos" value={im.iconLibrary} onChange={setIm('iconLibrary')} placeholder="Lucide, Phosphor…" />
        </div>
        <TextInput label="Evitar" value={im.avoid} onChange={setIm('avoid')} placeholder="Fotos de stock, clipart…" />
        <TextArea label="Notas para Claude" rows={2} value={brand.notes} onChange={(val) => update((b) => ({ ...b, notes: val }))} placeholder="Cualquier otra cosa que deba saber." />
      </Disclosure>
    </>
  );
}

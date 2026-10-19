import { useState } from 'react';
import { SectionHeader, Card, TextInput, TextArea, Select, Slider, Chips } from './ui.jsx';

const TRAITS = [
  'Cercana', 'Profesional', 'Divertida', 'Inspiradora', 'Atrevida', 'Elegante', 'Técnica', 'Optimista',
  'Honesta', 'Rebelde', 'Tranquila', 'Experta', 'Cálida', 'Minimalista', 'Juvenil', 'Sofisticada',
  'Ingeniosa', 'Empática', 'Directa', 'Misteriosa', 'Nostálgica', 'Innovadora', 'Ecológica', 'Lúdica',
];

export default function VoiceSection({ brand, patch }) {
  const v = brand.voice;
  const set = (k) => (val) => patch('voice', { [k]: val });
  const [custom, setCustom] = useState('');
  const toggle = (t) => set('traits')(v.traits.includes(t) ? v.traits.filter((x) => x !== t) : [...v.traits, t]);
  const addCustom = () => {
    const t = custom.trim();
    if (t && !v.traits.includes(t)) set('traits')([...v.traits, t]);
    setCustom('');
  };
  const options = [...new Set([...TRAITS, ...v.traits])];

  return (
    <>
      <SectionHeader title="Voz y tono" subtitle="Cómo habla la marca. Así Claude podrá escribir textos coherentes con ella." />
      <Card title="Personalidad" subtitle="Elige de 3 a 5 rasgos que definan la marca.">
        <Chips options={options} selected={v.traits} onToggle={toggle} />
        <div className="row gap-s mt">
          <input type="text" value={custom} placeholder="Añadir rasgo propio…" onChange={(e) => setCustom(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && addCustom()} />
          <button className="btn" onClick={addCustom}>Añadir</button>
        </div>
      </Card>
      <Card title="Dimensiones del tono">
        <div className="grid-2">
          <Slider label="Registro" value={v.formality} onChange={set('formality')} left="Cercano" right="Formal" />
          <Slider label="Humor" value={v.humor} onChange={set('humor')} left="Serio" right="Divertido" />
          <Slider label="Energía" value={v.enthusiasm} onChange={set('enthusiasm')} left="Sobrio" right="Entusiasta" />
          <Slider label="Lenguaje" value={v.complexity} onChange={set('complexity')} left="Sencillo" right="Técnico" />
        </div>
        <div className="grid-2">
          <Select
            label="Tratamiento"
            value={v.address}
            onChange={set('address')}
            options={['tú', 'usted', 'vosotros', 'ustedes', 'impersonal'].map((x) => ({ value: x, label: x }))}
          />
          <TextInput label="Idiomas" value={v.languages} onChange={set('languages')} placeholder="Español, inglés…" />
        </div>
      </Card>
      <Card title="Guía de redacción">
        <TextArea label="Descripción del tono" value={v.tone} onChange={set('tone')} placeholder="p. ej. Hablamos como un amigo que sabe del tema: claro, sin tecnicismos y con un toque de humor." />
        <div className="grid-2">
          <TextArea label="Palabras y expresiones que SÍ usamos" value={v.doWords} onChange={set('doWords')} placeholder="descubre, juntos, fácil…" />
          <TextArea label="Palabras y expresiones que NO usamos" value={v.dontWords} onChange={set('dontWords')} placeholder="sinergia, disruptivo, barato…" />
        </div>
        <TextArea label="Texto de ejemplo" rows={4} value={v.sample} onChange={set('sample')} placeholder="Un párrafo escrito con la voz de la marca (un post, la bienvenida de la app…)" />
      </Card>
    </>
  );
}

import { SectionHeader, Card, TextInput, TextArea } from './ui.jsx';

export default function IdentitySection({ brand, patch, update }) {
  const id = brand.identity;
  const set = (k) => (v) => patch('identity', { [k]: v });
  return (
    <>
      <SectionHeader title="Identidad" subtitle="Lo esencial de la marca: quién es, qué hace y para quién." />
      <Card>
        <div className="grid-2">
          <TextInput label="Nombre de la marca" value={id.name} onChange={set('name')} placeholder="p. ej. Lumen" />
          <TextInput label="Eslogan / tagline" value={id.tagline} onChange={set('tagline')} placeholder="p. ej. Ideas que iluminan" />
        </div>
        <TextArea
          label="Descripción"
          rows={3}
          value={id.description}
          onChange={set('description')}
          placeholder="¿Qué es el proyecto? ¿Qué problema resuelve? Dos o tres frases bastan."
        />
        <div className="grid-2">
          <TextInput label="Sector / categoría" value={id.industry} onChange={set('industry')} placeholder="p. ej. App de productividad, juego móvil, tienda POD…" />
          <TextInput label="Palabras clave" value={id.keywords} onChange={set('keywords')} placeholder="p. ej. luz, claridad, foco, calma" hint="Separadas por comas. Ayudan a Claude a generar logos." />
        </div>
        <TextArea label="Público objetivo" rows={2} value={id.audience} onChange={set('audience')} placeholder="¿A quién se dirige? Edad, intereses, contexto de uso…" />
        <TextArea label="Valores / misión" rows={2} value={id.values} onChange={set('values')} placeholder="¿Qué defiende la marca? ¿Qué promete?" />
      </Card>
      <Card title="Notas generales" subtitle="Cualquier otra cosa que Claude deba saber sobre la marca. Se incluye al final del Markdown.">
        <TextArea
          label="Notas"
          rows={4}
          value={brand.notes}
          onChange={(v) => update((b) => ({ ...b, notes: v }))}
          placeholder="p. ej. El proyecto es un juego para Android; la marca debe funcionar bien en iconos pequeños."
        />
      </Card>
    </>
  );
}

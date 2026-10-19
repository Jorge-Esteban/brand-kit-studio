import { useMemo, useState } from 'react';
import { SectionHeader, Card, Toggle, useToast } from './ui.jsx';
import { buildBrandJson, buildCss, buildMarkdown, buildTailwindV3, buildTailwindV4, buildTokens, buildZip, copyText, download } from '../lib/export.js';
import { slugify } from '../lib/brand.js';

export default function ExportSection({ brand }) {
  const toast = useToast();
  const [includeSvg, setIncludeSvg] = useState(true);
  const [includeCss, setIncludeCss] = useState(true);
  const [view, setView] = useState('md');
  const [zipping, setZipping] = useState(false);
  const slug = slugify(brand.identity.name || 'marca');
  const opts = { includeSvg, includeCss };

  const outputs = useMemo(
    () => ({
      md: { label: 'brand.md', file: `${slug}-brand.md`, content: buildMarkdown(brand, opts), type: 'text/markdown' },
      css: { label: 'CSS', file: `${slug}-brand.css`, content: buildCss(brand), type: 'text/css' },
      tw3: { label: 'Tailwind v3', file: 'tailwind.config.js', content: buildTailwindV3(brand), type: 'text/javascript' },
      tw4: { label: 'Tailwind v4', file: `${slug}-tailwind-v4.css`, content: buildTailwindV4(brand), type: 'text/css' },
      tokens: { label: 'tokens.json', file: `${slug}-tokens.json`, content: JSON.stringify(buildTokens(brand), null, 2), type: 'application/json' },
      json: { label: 'brand.json', file: `${slug}.brand.json`, content: buildBrandJson(brand), type: 'application/json' },
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [brand, includeSvg, includeCss],
  );
  const current = outputs[view];
  const kb = (s) => `${Math.max(1, Math.round(new Blob([s]).size / 1024))} KB`;

  const zip = async () => {
    setZipping(true);
    try {
      const { blob, failures } = await buildZip(brand, opts);
      download(`${slug}-brand-kit.zip`, blob);
      toast(failures.length ? `ZIP listo, pero no se pudo convertir a PNG: ${failures.join(', ')}` : 'ZIP descargado', failures.length ? 'error' : 'ok');
    } catch (e) {
      toast(e.message, 'error');
    } finally {
      setZipping(false);
    }
  };

  return (
    <>
      <SectionHeader title="Exportar" subtitle="Lleva tu marca a un Proyecto de Claude, a un chat o a tu código." />

      <div className="export-grid">
        <Card title="📦 Kit completo (ZIP)" subtitle="brand.md + JSON + tokens + CSS + Tailwind + logos en SVG y PNG.">
          <button className="btn primary block" onClick={zip} disabled={zipping}>
            {zipping ? 'Preparando…' : 'Descargar ZIP'}
          </button>
        </Card>
        <Card title="🤖 Markdown para Claude" subtitle={`Guía completa en un solo archivo (${kb(outputs.md.content)}).`}>
          <div className="row gap-s">
            <button className="btn primary grow" onClick={async () => (await copyText(outputs.md.content)) && toast('Markdown copiado')}>
              Copiar
            </button>
            <button className="btn grow" onClick={() => download(outputs.md.file, outputs.md.content, outputs.md.type)}>
              Descargar .md
            </button>
          </div>
        </Card>
        <Card title="💾 JSON reimportable" subtitle="Para volver a abrir y editar esta marca más adelante.">
          <button className="btn block" onClick={() => download(outputs.json.file, outputs.json.content, outputs.json.type)}>
            Descargar brand.json
          </button>
        </Card>
      </div>

      <Card title="Cómo usarlo con Claude">
        <ol className="howto">
          <li>
            <strong>Proyecto de Claude (claude.ai):</strong> abre el proyecto → <em>Conocimiento del proyecto</em> → sube <code>brand.md</code>. Todas las conversaciones del proyecto
            usarán tu marca.
          </li>
          <li>
            <strong>Chat suelto:</strong> pulsa «Copiar» y pega el Markdown al principio del chat, o adjunta el archivo <code>.md</code>.
          </li>
          <li>
            <strong>Claude Code:</strong> guarda el archivo como <code>docs/brand.md</code> en tu repositorio y añade a <code>CLAUDE.md</code> la línea <code>@docs/brand.md</code>. Para
            proyectos web, copia también <code>brand.css</code> o la configuración de Tailwind.
          </li>
        </ol>
      </Card>

      <Card
        title="Contenido"
        actions={
          <div className="row gap-s wrap">
            <button className="btn xs" onClick={async () => (await copyText(current.content)) && toast(`${current.label} copiado`)}>
              Copiar
            </button>
            <button className="btn xs" onClick={() => download(current.file, current.content, current.type)}>
              Descargar
            </button>
          </div>
        }
      >
        <div className="tabs">
          {Object.entries(outputs).map(([id, o]) => (
            <button key={id} className={`tab ${view === id ? 'on' : ''}`} onClick={() => setView(id)}>
              {o.label}
            </button>
          ))}
        </div>
        {view === 'md' && (
          <div className="row gap-m wrap mt-s">
            <Toggle label="Incluir el código SVG de los logos" checked={includeSvg} onChange={setIncludeSvg} />
            <Toggle label="Incluir variables CSS como anexo" checked={includeCss} onChange={setIncludeCss} />
          </div>
        )}
        <pre className="code-view">{current.content}</pre>
      </Card>
    </>
  );
}

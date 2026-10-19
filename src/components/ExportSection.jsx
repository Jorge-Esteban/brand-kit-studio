import { useMemo, useState } from 'react';
import { StepHeader, Toggle, Disclosure, useToast } from './ui.jsx';
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
      md: { label: 'Markdown', file: `${slug}-brand.md`, content: buildMarkdown(brand, opts), type: 'text/markdown' },
      css: { label: 'CSS', file: `${slug}-brand.css`, content: buildCss(brand), type: 'text/css' },
      tw3: { label: 'Tailwind 3', file: 'tailwind.config.js', content: buildTailwindV3(brand), type: 'text/javascript' },
      tw4: { label: 'Tailwind 4', file: `${slug}-tailwind-v4.css`, content: buildTailwindV4(brand), type: 'text/css' },
      tokens: { label: 'Tokens', file: `${slug}-tokens.json`, content: JSON.stringify(buildTokens(brand), null, 2), type: 'application/json' },
      json: { label: 'JSON', file: `${slug}.brand.json`, content: buildBrandJson(brand), type: 'application/json' },
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [brand, includeSvg, includeCss],
  );
  const current = outputs[view];

  const zip = async () => {
    setZipping(true);
    try {
      const { blob, failures } = await buildZip(brand, opts);
      download(`${slug}-brand-kit.zip`, blob);
      if (failures.length) toast(`No se pudo convertir a PNG: ${failures.join(', ')}`, 'error');
    } catch (e) {
      toast(e.message, 'error');
    } finally {
      setZipping(false);
    }
  };

  return (
    <>
      <StepHeader step="Paso 6" title="Llévalo a Claude" subtitle="Todo lo que Claude necesita saber de tu marca, en un solo archivo." />

      <div className="export-actions">
        <button className="btn dark lg" onClick={async () => (await copyText(outputs.md.content)) && toast('Copiado. Pégalo en Claude')}>
          Copiar para Claude
        </button>
        <button className="btn lg" onClick={() => download(outputs.md.file, outputs.md.content, outputs.md.type)}>
          Descargar brand.md
        </button>
        <button className="btn lg" onClick={zip} disabled={zipping}>
          {zipping ? 'Preparando…' : 'Kit completo .zip'}
        </button>
      </div>

      <ol className="howto">
        <li>
          <strong>Proyecto de Claude</strong>
          <span>Sube brand.md en «Conocimiento del proyecto».</span>
        </li>
        <li>
          <strong>Chat</strong>
          <span>Pega el texto copiado al empezar la conversación.</span>
        </li>
        <li>
          <strong>Claude Code</strong>
          <span>
            Guarda <code>docs/brand.md</code> y añade <code>@docs/brand.md</code> a tu <code>CLAUDE.md</code>.
          </span>
        </li>
      </ol>

      <Disclosure title="Otros formatos" hint="CSS, Tailwind, tokens, JSON para reabrir la marca">
        <div className="seg">
          {Object.entries(outputs).map(([id, o]) => (
            <button key={id} className={view === id ? 'on' : ''} onClick={() => setView(id)}>
              {o.label}
            </button>
          ))}
        </div>
        {view === 'md' && (
          <div className="row gap-m wrap">
            <Toggle label="Incluir el código de los logos" checked={includeSvg} onChange={setIncludeSvg} />
            <Toggle label="Incluir variables CSS" checked={includeCss} onChange={setIncludeCss} />
          </div>
        )}
        <div className="code-wrap">
          <div className="code-actions">
            <button className="btn xs" onClick={async () => (await copyText(current.content)) && toast('Copiado')}>
              Copiar
            </button>
            <button className="btn xs" onClick={() => download(current.file, current.content, current.type)}>
              Descargar
            </button>
          </div>
          <pre className="code-view">{current.content}</pre>
        </div>
      </Disclosure>
    </>
  );
}

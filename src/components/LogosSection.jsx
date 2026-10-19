import { useState } from 'react';
import { SectionHeader, Card, Select, useToast } from './ui.jsx';
import { LOGO_VARIANTS, resolveTheme, slugify, uid } from '../lib/brand.js';
import { LOGO_TYPES, askClaude, buildLogoPrompt, buildRefinePrompt, manualPrompt } from '../lib/claude.js';
import { extractProposals, logoSrc, rasterize, readFile, recolorSvg, sanitizeSvg } from '../lib/svg.js';
import { copyText, download } from '../lib/export.js';

const BACKGROUNDS = [
  { id: 'checker', label: 'Transparente' },
  { id: 'light', label: 'Claro' },
  { id: 'dark', label: 'Oscuro' },
  { id: 'brand', label: 'Primario' },
];

async function shrinkImage(dataUrl, max = 1024) {
  const img = await new Promise((res, rej) => {
    const i = new Image();
    i.onload = () => res(i);
    i.onerror = rej;
    i.src = dataUrl;
  });
  const scale = Math.min(1, max / Math.max(img.naturalWidth, img.naturalHeight));
  if (scale === 1) return dataUrl;
  const c = document.createElement('canvas');
  c.width = Math.round(img.naturalWidth * scale);
  c.height = Math.round(img.naturalHeight * scale);
  c.getContext('2d').drawImage(img, 0, 0, c.width, c.height);
  return c.toDataURL('image/png');
}

function RefineBox({ onSubmit, onCancel, busy, apiReady, onManual }) {
  const [text, setText] = useState('');
  return (
    <div className="refine-box">
      <textarea rows={2} value={text} onChange={(e) => setText(e.target.value)} placeholder="p. ej. Hazlo más geométrico, usa solo el color primario, quita el texto…" />
      <div className="row gap-s wrap">
        {apiReady && (
          <button className="btn primary xs" disabled={busy || !text.trim()} onClick={() => onSubmit(text)}>
            {busy ? 'Refinando…' : 'Refinar con Claude'}
          </button>
        )}
        <button className="btn xs" disabled={!text.trim()} onClick={() => onManual(text)}>
          Copiar prompt
        </button>
        <button className="btn ghost xs" onClick={onCancel}>
          Cancelar
        </button>
      </div>
    </div>
  );
}

export default function LogosSection({ brand, update, settings, openSettings }) {
  const toast = useToast();
  const [tab, setTab] = useState('ai');
  const [prompt, setPrompt] = useState('');
  const [type, setType] = useState('auto');
  const [count, setCount] = useState(3);
  const [busy, setBusy] = useState(null); // 'generate' | id en refinado
  const [error, setError] = useState('');
  const [candidates, setCandidates] = useState([]);
  const [manualText, setManualText] = useState('');
  const [pasteSvg, setPasteSvg] = useState('');
  const [refining, setRefining] = useState(null);
  const [bg, setBg] = useState('checker');
  const apiReady = !!settings.apiKey;
  const theme = resolveTheme(brand);
  const bgStyle = { light: '#ffffff', dark: '#16171d', brand: theme.colors.primary }[bg];

  const setLogos = (fn) => update((b) => ({ ...b, logos: fn(b.logos) }));
  const addLogo = (logo) => {
    const l = { id: uid(), name: logo.name || 'Logo', variant: logo.variant || 'primary', usage: '', ...logo };
    update((b) => ({ ...b, logos: [...b.logos, l], primaryLogoId: b.primaryLogoId || l.id }));
    return l;
  };

  const generate = async () => {
    setError('');
    setBusy('generate');
    try {
      const { text, truncated } = await askClaude({ ...settings, user: buildLogoPrompt(brand, { prompt, type, count }) });
      const found = extractProposals(text);
      if (!found.length) throw new Error('Claude no devolvió ningún SVG válido. Prueba de nuevo o reformula el prompt.');
      setCandidates((cs) => [...found.map((p) => ({ ...p, id: uid(), prompt })), ...cs]);
      toast(`${found.length} propuestas generadas${truncated ? ' (respuesta cortada: puede faltar alguna)' : ''}`);
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(null);
    }
  };

  const copyManual = async (userPrompt) => {
    await copyText(manualPrompt(userPrompt));
    toast('Prompt copiado. Pégalo en claude.ai y luego pega aquí la respuesta.');
    setTab('ai');
  };

  const importManual = () => {
    const found = extractProposals(manualText);
    if (!found.length) return toast('No encuentro ningún <svg> en el texto pegado', 'error');
    setCandidates((cs) => [...found.map((p) => ({ ...p, id: uid(), prompt })), ...cs]);
    setManualText('');
    toast(`${found.length} propuestas importadas`);
  };

  const refine = async (target, instruction) => {
    setBusy(target.id);
    setError('');
    try {
      const { text } = await askClaude({ ...settings, user: buildRefinePrompt(brand, target.svg, instruction) });
      const [first] = extractProposals(text);
      if (!first) throw new Error('La respuesta no contenía un SVG válido.');
      setCandidates((cs) => [{ ...first, id: uid(), prompt: instruction, title: `${first.title} (refinado)` }, ...cs]);
      setRefining(null);
      toast('Nueva versión añadida a las propuestas');
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(null);
    }
  };

  const onUpload = async (files) => {
    for (const file of Array.from(files || [])) {
      try {
        const base = file.name.replace(/\.[^.]+$/, '');
        if (file.type === 'image/svg+xml' || file.name.toLowerCase().endsWith('.svg')) {
          addLogo({ name: base, svg: sanitizeSvg(await readFile(file)), source: 'upload' });
        } else if (file.type.startsWith('image/')) {
          addLogo({ name: base, dataUrl: await shrinkImage(await readFile(file, 'dataUrl')), source: 'upload' });
        } else throw new Error('Formato no admitido');
        toast(`«${base}» añadido`);
      } catch (e) {
        toast(`${file.name}: ${e.message}`, 'error');
      }
    }
  };

  const addPasted = () => {
    try {
      addLogo({ name: 'Logo pegado', svg: sanitizeSvg(pasteSvg), source: 'paste' });
      setPasteSvg('');
      toast('Logo añadido');
    } catch (e) {
      toast(e.message, 'error');
    }
  };

  const makeMono = (logo, light) => {
    const color = light ? '#ffffff' : theme.colors.text;
    addLogo({ name: `${logo.name} · monocromo ${light ? 'claro' : 'oscuro'}`, svg: recolorSvg(logo.svg, color), variant: light ? 'mono-light' : 'mono-dark', source: 'derived' });
    toast('Variante creada');
  };

  const downloadPng = async (logo) => {
    try {
      download(`${slugify(logo.name)}.png`, await rasterize(logoSrc(logo), 1024));
    } catch (e) {
      toast(e.message, 'error');
    }
  };

  const userPromptNow = buildLogoPrompt(brand, { prompt, type, count });

  return (
    <>
      <SectionHeader title="Logos" subtitle="Genera propuestas con Claude, sube tus archivos o pega código SVG." />

      <Card>
        <div className="tabs">
          {[
            ['ai', '✨ Generar con Claude'],
            ['upload', '⬆ Subir archivo'],
            ['paste', '</> Pegar SVG'],
          ].map(([id, label]) => (
            <button key={id} className={`tab ${tab === id ? 'on' : ''}`} onClick={() => setTab(id)}>
              {label}
            </button>
          ))}
        </div>

        {tab === 'ai' && (
          <div className="stack mt">
            <div className="callout">
              Claude dibuja logos <strong>vectoriales (SVG)</strong>: funciona muy bien con isotipos geométricos, monogramas y logotipos tipográficos, y peor con
              ilustraciones detalladas. Usa la identidad, la paleta y el estilo que has definido.
            </div>
            <label className="field">
              <span className="field-label">Describe el logo que quieres</span>
              <textarea rows={3} value={prompt} onChange={(e) => setPrompt(e.target.value)} placeholder="p. ej. Un faro minimalista formado por la letra L, transmite calma y claridad" />
            </label>
            <div className="grid-3">
              <Select label="Tipo de logo" value={type} onChange={setType} options={LOGO_TYPES} />
              <Select label="Propuestas" value={count} onChange={(v) => setCount(Number(v))} options={[1, 2, 3, 4, 6].map((n) => ({ value: n, label: String(n) }))} />
              <div className="field">
                <span className="field-label">Modo</span>
                <span className="small muted">{apiReady ? `API · ${settings.model}` : 'Manual (sin API key)'}</span>
              </div>
            </div>
            <div className="row gap-s wrap">
              {apiReady ? (
                <button className="btn primary" disabled={busy === 'generate'} onClick={generate}>
                  {busy === 'generate' ? 'Generando… (puede tardar un minuto)' : `Generar ${count} propuesta${count > 1 ? 's' : ''}`}
                </button>
              ) : (
                <button className="btn primary" onClick={openSettings}>
                  Configurar API key
                </button>
              )}
              <button className="btn" onClick={() => copyManual(userPromptNow)}>
                📋 Copiar prompt para claude.ai
              </button>
            </div>
            {error && <div className="callout error">{error}</div>}
            <details className="manual-box">
              <summary>Modo manual: pega aquí la respuesta de Claude</summary>
              <p className="small muted">
                1. Pulsa «Copiar prompt para claude.ai». 2. Pégalo en un chat de{' '}
                <a href="https://claude.ai/new" target="_blank" rel="noreferrer">
                  claude.ai
                </a>
                . 3. Copia la respuesta completa y pégala aquí.
              </p>
              <textarea rows={5} value={manualText} onChange={(e) => setManualText(e.target.value)} placeholder="Pega la respuesta con los bloques ```svg …```" />
              <button className="btn mt-s" onClick={importManual} disabled={!manualText.trim()}>
                Importar propuestas
              </button>
            </details>
          </div>
        )}

        {tab === 'upload' && (
          <div className="stack mt">
            <label className="dropzone" onDragOver={(e) => e.preventDefault()} onDrop={(e) => (e.preventDefault(), onUpload(e.dataTransfer.files))}>
              <input type="file" accept=".svg,image/svg+xml,image/png,image/jpeg,image/webp" multiple onChange={(e) => (onUpload(e.target.files), (e.target.value = ''))} />
              <strong>Arrastra aquí tus logos o haz clic para elegirlos</strong>
              <span className="small muted">SVG (recomendado), PNG, JPG o WebP. Las imágenes se reducen a 1024 px para ahorrar espacio.</span>
            </label>
          </div>
        )}

        {tab === 'paste' && (
          <div className="stack mt">
            <textarea rows={6} value={pasteSvg} onChange={(e) => setPasteSvg(e.target.value)} placeholder='<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">…</svg>' />
            <button className="btn primary" onClick={addPasted} disabled={!pasteSvg.trim()}>
              Añadir logo
            </button>
          </div>
        )}
      </Card>

      {candidates.length > 0 && (
        <Card
          title="Propuestas"
          subtitle="Guarda las que te gusten en la marca. Las propuestas no guardadas se pierden al recargar."
          actions={
            <button className="btn ghost xs" onClick={() => setCandidates([])}>
              Descartar todas
            </button>
          }
        >
          <div className="logo-grid">
            {candidates.map((c) => (
              <div key={c.id} className="logo-card">
                <div className={`logo-stage bg-${bg}`} style={bgStyle ? { background: bgStyle } : undefined}>
                  <img src={logoSrc(c)} alt={c.title} />
                </div>
                <strong className="small">{c.title}</strong>
                {c.rationale && <p className="small muted clamp">{c.rationale}</p>}
                <div className="row gap-xs wrap">
                  <button
                    className="btn primary xs"
                    onClick={() => {
                      addLogo({ name: c.title.replace(/^Propuesta \d+:\s*/i, ''), svg: c.svg, source: 'claude', prompt: c.prompt });
                      setCandidates((cs) => cs.filter((x) => x.id !== c.id));
                      toast('Guardado en la marca');
                    }}
                  >
                    Guardar
                  </button>
                  <button className="btn xs" onClick={() => setRefining(refining === c.id ? null : c.id)}>
                    Refinar
                  </button>
                  <button className="btn ghost xs" onClick={() => setCandidates((cs) => cs.filter((x) => x.id !== c.id))}>
                    Descartar
                  </button>
                </div>
                {refining === c.id && (
                  <RefineBox
                    apiReady={apiReady}
                    busy={busy === c.id}
                    onSubmit={(t) => refine(c, t)}
                    onManual={(t) => copyManual(buildRefinePrompt(brand, c.svg, t))}
                    onCancel={() => setRefining(null)}
                  />
                )}
              </div>
            ))}
          </div>
        </Card>
      )}

      <Card
        title={`Logos de la marca (${brand.logos.length})`}
        actions={
          <div className="tabs compact">
            {BACKGROUNDS.map((b) => (
              <button key={b.id} className={`tab ${bg === b.id ? 'on' : ''}`} onClick={() => setBg(b.id)}>
                {b.label}
              </button>
            ))}
          </div>
        }
      >
        {brand.logos.length === 0 && <p className="muted">Aún no hay logos guardados. Genera, sube o pega uno.</p>}
        <div className="logo-grid">
          {brand.logos.map((logo) => {
            const isPrimary = brand.primaryLogoId === logo.id;
            const change = (vals) => setLogos((ls) => ls.map((l) => (l.id === logo.id ? { ...l, ...vals } : l)));
            return (
              <div key={logo.id} className={`logo-card ${isPrimary ? 'primary' : ''}`}>
                <div className={`logo-stage bg-${bg}`} style={bgStyle ? { background: bgStyle } : undefined}>
                  <img src={logoSrc(logo)} alt={logo.name} />
                  {isPrimary && <span className="star" title="Logo principal">★</span>}
                </div>
                <input value={logo.name} onChange={(e) => change({ name: e.target.value })} aria-label="Nombre del logo" />
                <select value={logo.variant} onChange={(e) => change({ variant: e.target.value })} aria-label="Variante">
                  {LOGO_VARIANTS.map((v) => (
                    <option key={v.id} value={v.id}>
                      {v.label}
                    </option>
                  ))}
                </select>
                <input value={logo.usage || ''} placeholder="Uso (opcional)" onChange={(e) => change({ usage: e.target.value })} aria-label="Uso del logo" />
                <div className="row gap-xs wrap">
                  {!isPrimary && (
                    <button className="btn xs" onClick={() => update((b) => ({ ...b, primaryLogoId: logo.id }))}>
                      ★ Principal
                    </button>
                  )}
                  {logo.svg && (
                    <>
                      <button className="btn xs" onClick={() => download(`${slugify(logo.name)}.svg`, logo.svg, 'image/svg+xml')}>
                        SVG
                      </button>
                      <button className="btn xs" onClick={() => makeMono(logo, false)} title="Crear variante monocroma oscura">
                        ◐ Oscuro
                      </button>
                      <button className="btn xs" onClick={() => makeMono(logo, true)} title="Crear variante monocroma clara">
                        ◑ Claro
                      </button>
                      <button className="btn xs" onClick={() => setRefining(refining === logo.id ? null : logo.id)}>
                        Refinar
                      </button>
                    </>
                  )}
                  <button className="btn xs" onClick={() => downloadPng(logo)}>
                    PNG
                  </button>
                  <button
                    className="btn ghost xs danger"
                    onClick={() =>
                      update((b) => {
                        const logos = b.logos.filter((l) => l.id !== logo.id);
                        return { ...b, logos, primaryLogoId: b.primaryLogoId === logo.id ? logos[0]?.id || null : b.primaryLogoId };
                      })
                    }
                  >
                    Eliminar
                  </button>
                </div>
                {refining === logo.id && logo.svg && (
                  <RefineBox
                    apiReady={apiReady}
                    busy={busy === logo.id}
                    onSubmit={(t) => refine(logo, t)}
                    onManual={(t) => copyManual(buildRefinePrompt(brand, logo.svg, t))}
                    onCancel={() => setRefining(null)}
                  />
                )}
              </div>
            );
          })}
        </div>
        {brand.logos.some((l) => l.svg?.includes('<text')) && (
          <p className="small muted mt">
            ℹ️ Algunos logos contienen texto SVG. Aquí y en los PNG se dibuja con una fuente genérica, salvo que la fuente de la marca esté instalada en tu equipo. Para un
            archivo definitivo, convierte el texto a trazados en Figma o Inkscape.
          </p>
        )}
      </Card>
    </>
  );
}

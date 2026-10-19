import { useRef, useState } from 'react';
import { StepHeader, Menu, MenuItem, useToast } from './ui.jsx';
import { LOGO_VARIANTS, resolveTheme, slugify, uid } from '../lib/brand.js';
import { LOGO_TYPES, askClaude, buildLogoPrompt, buildRefinePrompt, manualPrompt } from '../lib/claude.js';
import { extractProposals, logoSrc, rasterize, readFile, recolorSvg, sanitizeSvg } from '../lib/svg.js';
import { copyText, download } from '../lib/export.js';

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

function RefineBox({ onSubmit, onManual, onCancel, busy, apiReady }) {
  const [text, setText] = useState('');
  return (
    <div className="refine-box">
      <textarea rows={2} autoFocus value={text} onChange={(e) => setText(e.target.value)} placeholder="¿Qué cambiarías? Más simple, sin texto, solo el color primario…" />
      <div className="row gap-xs wrap">
        {apiReady ? (
          <button className="btn dark xs" disabled={busy || !text.trim()} onClick={() => onSubmit(text)}>
            {busy ? 'Refinando…' : 'Refinar'}
          </button>
        ) : (
          <button className="btn dark xs" disabled={!text.trim()} onClick={() => onManual(text)}>
            Copiar prompt
          </button>
        )}
        <button className="btn ghost xs" onClick={onCancel}>
          Cancelar
        </button>
      </div>
    </div>
  );
}

export default function LogosSection({ brand, update, settings, openSettings }) {
  const toast = useToast();
  const fileRef = useRef(null);
  const [prompt, setPrompt] = useState('');
  const [type, setType] = useState('auto');
  const [count, setCount] = useState(3);
  const [busy, setBusy] = useState(null);
  const [error, setError] = useState('');
  const [candidates, setCandidates] = useState([]);
  const [panel, setPanel] = useState(null); // 'paste' | 'manual'
  const [pasteText, setPasteText] = useState('');
  const [refining, setRefining] = useState(null);
  const apiReady = !!settings.apiKey;
  const theme = resolveTheme(brand);

  const addLogo = (logo) => {
    const l = { id: uid(), name: logo.name || 'Logo', variant: logo.variant || 'primary', usage: '', ...logo };
    update((b) => ({ ...b, logos: [...b.logos, l], primaryLogoId: b.primaryLogoId || l.id }));
  };
  const changeLogo = (id, vals) => update((b) => ({ ...b, logos: b.logos.map((l) => (l.id === id ? { ...l, ...vals } : l)) }));
  const removeLogo = (id) =>
    update((b) => {
      const logos = b.logos.filter((l) => l.id !== id);
      return { ...b, logos, primaryLogoId: b.primaryLogoId === id ? logos[0]?.id || null : b.primaryLogoId };
    });

  const addCandidates = (found, fromPrompt) => setCandidates((cs) => [...found.map((p) => ({ ...p, id: uid(), prompt: fromPrompt })), ...cs]);

  const generate = async () => {
    setError('');
    setBusy('generate');
    try {
      const { text, truncated } = await askClaude({ ...settings, user: buildLogoPrompt(brand, { prompt, type, count }) });
      const found = extractProposals(text);
      if (!found.length) throw new Error('Claude no devolvió ningún SVG válido. Prueba otra vez o cambia la descripción.');
      addCandidates(found, prompt);
      if (truncated) toast('La respuesta se cortó: puede faltar alguna propuesta', 'error');
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(null);
    }
  };

  const refine = async (target, instruction) => {
    setBusy(target.id);
    setError('');
    try {
      const { text } = await askClaude({ ...settings, user: buildRefinePrompt(brand, target.svg, instruction) });
      const [first] = extractProposals(text);
      if (!first) throw new Error('La respuesta no contenía un SVG válido.');
      addCandidates([{ ...first, title: `${first.title} (refinado)` }], instruction);
      setRefining(null);
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(null);
    }
  };

  const copyManual = async (userPrompt) => {
    await copyText(manualPrompt(userPrompt));
    setPanel('manual');
    toast('Prompt copiado: pégalo en claude.ai');
  };

  const importText = (text) => {
    const found = extractProposals(text);
    if (!found.length) return toast('No encuentro ningún <svg> en lo que has pegado', 'error');
    addCandidates(found, prompt);
    setPasteText('');
    setPanel(null);
  };

  const onUpload = async (files) => {
    for (const file of Array.from(files || [])) {
      try {
        const name = file.name.replace(/\.[^.]+$/, '');
        if (file.type === 'image/svg+xml' || file.name.toLowerCase().endsWith('.svg')) addLogo({ name, svg: sanitizeSvg(await readFile(file)), source: 'upload' });
        else if (file.type.startsWith('image/')) addLogo({ name, dataUrl: await shrinkImage(await readFile(file, 'dataUrl')), source: 'upload' });
        else throw new Error('formato no admitido');
      } catch (e) {
        toast(`${file.name}: ${e.message}`, 'error');
      }
    }
  };

  const makeMono = (logo, light) => {
    addLogo({ name: `${logo.name} ${light ? 'claro' : 'oscuro'}`, svg: recolorSvg(logo.svg, light ? '#ffffff' : theme.colors.text), variant: light ? 'mono-light' : 'mono-dark', source: 'derived' });
    toast('Variante creada');
  };

  const downloadPng = async (logo) => {
    try {
      download(`${slugify(logo.name)}.png`, await rasterize(logoSrc(logo), 1024));
    } catch (e) {
      toast(e.message, 'error');
    }
  };

  return (
    <>
      <StepHeader step="Paso 5" title="Logo" subtitle="Descríbelo con tus palabras y Claude lo dibuja. O sube el tuyo." />

      <div className="prompt-box">
        <textarea rows={3} value={prompt} onChange={(e) => setPrompt(e.target.value)} placeholder="Un faro minimalista formado por la letra L, que transmita calma" />
        <div className="prompt-bar">
          <select value={type} onChange={(e) => setType(e.target.value)} aria-label="Tipo de logo">
            {LOGO_TYPES.map((t) => (
              <option key={t.id} value={t.id}>
                {t.label}
              </option>
            ))}
          </select>
          <select value={count} onChange={(e) => setCount(Number(e.target.value))} aria-label="Número de propuestas">
            {[1, 2, 3, 4, 6].map((n) => (
              <option key={n} value={n}>
                {n} {n === 1 ? 'propuesta' : 'propuestas'}
              </option>
            ))}
          </select>
          <span className="grow" />
          {apiReady ? (
            <button className="btn dark" disabled={busy === 'generate'} onClick={generate}>
              {busy === 'generate' ? 'Dibujando…' : 'Generar'}
            </button>
          ) : (
            <button className="btn dark" onClick={() => copyManual(buildLogoPrompt(brand, { prompt, type, count }))}>
              Copiar prompt
            </button>
          )}
        </div>
      </div>

      <p className="alt-actions">
        {apiReady ? (
          <>
            <button className="link" onClick={() => copyManual(buildLogoPrompt(brand, { prompt, type, count }))}>
              Usar claude.ai
            </button>
            {' · '}
          </>
        ) : (
          <>
            Funciona con{' '}
            <a href="https://claude.ai/new" target="_blank" rel="noreferrer">
              claude.ai
            </a>{' '}
            sin API key ·{' '}
            <button className="link" onClick={openSettings}>
              Conectar Claude
            </button>
            {' · '}
          </>
        )}
        <button className="link" onClick={() => fileRef.current?.click()}>
          Subir archivo
        </button>
        {' · '}
        <button className="link" onClick={() => setPanel(panel === 'paste' ? null : 'paste')}>
          Pegar SVG
        </button>
        <input ref={fileRef} type="file" hidden multiple accept=".svg,image/svg+xml,image/png,image/jpeg,image/webp" onChange={(e) => (onUpload(e.target.files), (e.target.value = ''))} />
      </p>

      {panel && (
        <div className="inline-panel">
          <textarea
            rows={5}
            value={pasteText}
            onChange={(e) => setPasteText(e.target.value)}
            placeholder={panel === 'manual' ? 'Pega aquí la respuesta completa de Claude' : '<svg xmlns="http://www.w3.org/2000/svg" …>…</svg>'}
          />
          <div className="row gap-xs">
            <button className="btn dark xs" disabled={!pasteText.trim()} onClick={() => importText(pasteText)}>
              {panel === 'manual' ? 'Importar propuestas' : 'Añadir'}
            </button>
            <button className="btn ghost xs" onClick={() => setPanel(null)}>
              Cerrar
            </button>
          </div>
        </div>
      )}

      {error && <div className="notice error">{error}</div>}

      {candidates.length > 0 && (
        <>
          <div className="subhead-row">
            <h3 className="subhead">Propuestas</h3>
            <button className="link" onClick={() => setCandidates([])}>
              Descartar todas
            </button>
          </div>
          <div className="logo-grid">
            {candidates.map((c) => (
              <div key={c.id} className="logo-card">
                <div className="logo-stage">
                  <img src={logoSrc(c)} alt={c.title} />
                </div>
                <span className="logo-name">{c.title.replace(/^Propuesta \d+:\s*/i, '')}</span>
                <div className="row gap-xs">
                  <button
                    className="btn dark xs"
                    onClick={() => {
                      addLogo({ name: c.title.replace(/^Propuesta \d+:\s*/i, ''), svg: c.svg, source: 'claude', prompt: c.prompt });
                      setCandidates((cs) => cs.filter((x) => x.id !== c.id));
                    }}
                  >
                    Me quedo este
                  </button>
                  <button className="btn xs" onClick={() => setRefining(refining === c.id ? null : c.id)}>
                    Refinar
                  </button>
                  <button className="btn ghost xs" onClick={() => setCandidates((cs) => cs.filter((x) => x.id !== c.id))} aria-label="Descartar">
                    ✕
                  </button>
                </div>
                {refining === c.id && (
                  <RefineBox apiReady={apiReady} busy={busy === c.id} onSubmit={(t) => refine(c, t)} onManual={(t) => copyManual(buildRefinePrompt(brand, c.svg, t))} onCancel={() => setRefining(null)} />
                )}
              </div>
            ))}
          </div>
        </>
      )}

      {brand.logos.length > 0 && (
        <>
          <h3 className="subhead">Tus logos</h3>
          <div className="logo-grid">
            {brand.logos.map((logo) => {
              const isPrimary = brand.primaryLogoId === logo.id;
              return (
                <div key={logo.id} className={`logo-card ${isPrimary ? 'primary' : ''}`}>
                  <div className={`logo-stage ${logo.variant === 'mono-light' ? 'dark' : ''}`}>
                    <img src={logoSrc(logo)} alt={logo.name} />
                    {isPrimary && <span className="logo-badge">Principal</span>}
                  </div>
                  <div className="row between gap-xs">
                    <input className="logo-name-input" value={logo.name} onChange={(e) => changeLogo(logo.id, { name: e.target.value })} aria-label="Nombre del logo" />
                    <Menu
                      align="right"
                      trigger={({ toggle }) => (
                        <button className="btn ghost icon" onClick={toggle} aria-label="Más acciones">
                          ⋯
                        </button>
                      )}
                    >
                      {!isPrimary && <MenuItem onClick={() => update((b) => ({ ...b, primaryLogoId: logo.id }))}>Usar como principal</MenuItem>}
                      {logo.svg && <MenuItem onClick={() => setRefining(logo.id)}>Refinar con Claude</MenuItem>}
                      {logo.svg && <MenuItem onClick={() => makeMono(logo, false)}>Crear versión oscura</MenuItem>}
                      {logo.svg && <MenuItem onClick={() => makeMono(logo, true)}>Crear versión clara</MenuItem>}
                      {logo.svg && <MenuItem onClick={() => download(`${slugify(logo.name)}.svg`, logo.svg, 'image/svg+xml')}>Descargar SVG</MenuItem>}
                      <MenuItem onClick={() => downloadPng(logo)}>Descargar PNG</MenuItem>
                      <MenuItem danger onClick={() => removeLogo(logo.id)}>
                        Eliminar
                      </MenuItem>
                    </Menu>
                  </div>
                  <select className="subtle-select" value={logo.variant} onChange={(e) => changeLogo(logo.id, { variant: e.target.value })} aria-label="Tipo">
                    {LOGO_VARIANTS.map((v) => (
                      <option key={v.id} value={v.id}>
                        {v.label}
                      </option>
                    ))}
                  </select>
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
            <p className="tiny muted mt">El texto dentro de un SVG se ve con una fuente genérica fuera de tu web. Para el archivo final, conviértelo a trazados en Figma o Inkscape.</p>
          )}
        </>
      )}
    </>
  );
}


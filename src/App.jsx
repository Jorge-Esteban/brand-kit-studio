import { useEffect, useRef, useState } from 'react';
import { useBrandStore, safeGet, safeSet } from './lib/store.js';
import { completion } from './lib/brand.js';
import { getSettings, saveSettings } from './lib/claude.js';
import { loadBrandFonts } from './lib/fontLoader.js';
import { readFile } from './lib/svg.js';
import { useToast, Modal } from './components/ui.jsx';
import IdentitySection from './components/IdentitySection.jsx';
import VoiceSection from './components/VoiceSection.jsx';
import ColorsSection from './components/ColorsSection.jsx';
import TypographySection from './components/TypographySection.jsx';
import StyleSection from './components/StyleSection.jsx';
import LogosSection from './components/LogosSection.jsx';
import ImagerySection from './components/ImagerySection.jsx';
import PreviewSection from './components/PreviewSection.jsx';
import ExportSection from './components/ExportSection.jsx';
import SettingsModal from './components/SettingsModal.jsx';

const SECTIONS = [
  { id: 'identity', label: 'Identidad', icon: '◎', C: IdentitySection },
  { id: 'voice', label: 'Voz y tono', icon: '❝', C: VoiceSection },
  { id: 'colors', label: 'Colores', icon: '◑', C: ColorsSection },
  { id: 'typography', label: 'Tipografía', icon: 'Aa', C: TypographySection },
  { id: 'style', label: 'Estilo', icon: '▣', C: StyleSection },
  { id: 'logos', label: 'Logos', icon: '✦', C: LogosSection },
  { id: 'imagery', label: 'Imagen e iconos', icon: '◫', C: ImagerySection },
  { id: 'preview', label: 'Vista previa', icon: '◉', C: PreviewSection },
  { id: 'export', label: 'Exportar', icon: '⇪', C: ExportSection },
];

export default function App() {
  const store = useBrandStore();
  const { brands, active: brand, setActiveId, update, patch, create, duplicate, remove, importBrand, saveError } = store;
  const toast = useToast();
  const [section, setSection] = useState(() => safeGet('bks:section') || 'identity');
  const [settings, setSettings] = useState(getSettings);
  const [showSettings, setShowSettings] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const importRef = useRef(null);
  const mainRef = useRef(null);

  useEffect(() => {
    safeSet('bks:section', section);
    mainRef.current?.scrollTo?.({ top: 0 });
  }, [section]);

  useEffect(() => {
    loadBrandFonts(brand.fonts);
  }, [brand.fonts]);

  useEffect(() => {
    document.title = `${brand.identity.name || 'Marca'} · Brand Kit Studio`;
  }, [brand.identity.name]);

  const done = completion(brand);
  const Current = (SECTIONS.find((s) => s.id === section) || SECTIONS[0]).C;

  const onImport = async (file) => {
    if (!file) return;
    try {
      const data = JSON.parse(await readFile(file));
      const b = importBrand(data);
      toast(`«${b.identity.name}» importada`);
    } catch {
      toast('El archivo no es un brand.json válido', 'error');
    }
  };

  return (
    <div className="app">
      <header className="topbar">
        <div className="app-logo">
          <span className="app-mark" aria-hidden="true" />
          <span>Brand Kit Studio</span>
        </div>
        <div className="brand-switch">
          <select value={brand.id} onChange={(e) => setActiveId(e.target.value)} aria-label="Marca activa">
            {brands.map((b) => (
              <option key={b.id} value={b.id}>
                {b.identity.name || 'Sin nombre'}
              </option>
            ))}
          </select>
          <button className="btn xs" onClick={() => create()} title="Nueva marca">
            + Nueva
          </button>
          <button className="btn xs" onClick={duplicate} title="Duplicar marca">
            Duplicar
          </button>
          <button className="btn xs" onClick={() => importRef.current?.click()} title="Importar brand.json">
            Importar
          </button>
          <button className="btn xs ghost danger" onClick={() => setConfirmDelete(true)} title="Eliminar marca">
            Eliminar
          </button>
          <input ref={importRef} type="file" accept=".json,application/json" hidden onChange={(e) => (onImport(e.target.files[0]), (e.target.value = ''))} />
        </div>
        <button className={`btn xs ${settings.apiKey ? '' : 'attention'}`} onClick={() => setShowSettings(true)}>
          ⚙ {settings.apiKey ? 'Claude conectado' : 'Conectar Claude'}
        </button>
      </header>

      <div className="layout">
        <nav className="sidenav" aria-label="Secciones">
          {SECTIONS.map((s) => (
            <button key={s.id} className={`nav-item ${section === s.id ? 'on' : ''}`} onClick={() => setSection(s.id)}>
              <span className="nav-icon">{s.icon}</span>
              <span className="nav-label">{s.label}</span>
              {done[s.id] !== undefined && <span className={`nav-dot ${done[s.id] ? 'done' : ''}`} aria-label={done[s.id] ? 'completado' : 'pendiente'} />}
            </button>
          ))}
          <div className="nav-palette" aria-hidden="true">
            {brand.colors.slice(0, 12).map((c) => (
              <span key={c.id} style={{ background: c.hex }} title={`${c.name} ${c.hex}`} />
            ))}
          </div>
        </nav>

        <main className="main" ref={mainRef}>
          {saveError && <div className="callout error">{saveError}</div>}
          <Current
            key={`${brand.id}-${section}`}
            brand={brand}
            update={update}
            patch={patch}
            settings={settings}
            openSettings={() => setShowSettings(true)}
          />
          <div className="section-nav">
            {SECTIONS.findIndex((s) => s.id === section) > 0 && (
              <button className="btn" onClick={() => setSection(SECTIONS[SECTIONS.findIndex((s) => s.id === section) - 1].id)}>
                ← Anterior
              </button>
            )}
            <span className="grow" />
            {SECTIONS.findIndex((s) => s.id === section) < SECTIONS.length - 1 && (
              <button className="btn primary" onClick={() => setSection(SECTIONS[SECTIONS.findIndex((s) => s.id === section) + 1].id)}>
                Siguiente: {SECTIONS[SECTIONS.findIndex((s) => s.id === section) + 1].label} →
              </button>
            )}
          </div>
        </main>
      </div>

      {showSettings && (
        <SettingsModal
          settings={settings}
          onClose={() => setShowSettings(false)}
          onSave={(s) => {
            saveSettings(s);
            setSettings(getSettings());
            setShowSettings(false);
            toast(s.apiKey ? 'Ajustes guardados' : 'API key eliminada');
          }}
        />
      )}

      {confirmDelete && (
        <Modal
          title="Eliminar marca"
          onClose={() => setConfirmDelete(false)}
          footer={
            <>
              <span className="grow" />
              <button className="btn" onClick={() => setConfirmDelete(false)}>
                Cancelar
              </button>
              <button
                className="btn danger-solid"
                onClick={() => {
                  remove();
                  setConfirmDelete(false);
                  toast('Marca eliminada');
                }}
              >
                Eliminar
              </button>
            </>
          }
        >
          <p>
            ¿Eliminar «{brand.identity.name || 'Sin nombre'}» de este navegador? No se puede deshacer. Si quieres conservarla, exporta antes su <code>brand.json</code>.
          </p>
        </Modal>
      )}
    </div>
  );
}

import { useEffect, useRef, useState } from 'react';
import { useBrandStore, safeGet, safeSet } from './lib/store.js';
import { getSettings, saveSettings } from './lib/claude.js';
import { loadBrandFonts } from './lib/fontLoader.js';
import { readFile } from './lib/svg.js';
import { useToast, Modal, Menu, MenuItem } from './components/ui.jsx';
import BrandSection from './components/BrandSection.jsx';
import ColorsSection from './components/ColorsSection.jsx';
import TypographySection from './components/TypographySection.jsx';
import StyleSection from './components/StyleSection.jsx';
import LogosSection from './components/LogosSection.jsx';
import ExportSection from './components/ExportSection.jsx';
import SettingsModal from './components/SettingsModal.jsx';
import BrandPreview from './components/BrandPreview.jsx';

const STEPS = [
  { id: 'brand', label: 'Marca', C: BrandSection },
  { id: 'colors', label: 'Colores', C: ColorsSection },
  { id: 'typography', label: 'Tipografía', C: TypographySection },
  { id: 'style', label: 'Estilo', C: StyleSection },
  { id: 'logos', label: 'Logo', C: LogosSection },
  { id: 'export', label: 'Exportar', C: ExportSection },
];

function PreviewToggle({ dark, setDark }) {
  return (
    <div className="seg small">
      <button className={!dark ? 'on' : ''} onClick={() => setDark(false)}>
        Claro
      </button>
      <button className={dark ? 'on' : ''} onClick={() => setDark(true)}>
        Oscuro
      </button>
    </div>
  );
}

export default function App() {
  const { brands, active: brand, setActiveId, update, patch, create, duplicate, remove, importBrand, saveError } = useBrandStore();
  const toast = useToast();
  const [step, setStep] = useState(() => {
    const saved = safeGet('bks:step');
    return STEPS.some((s) => s.id === saved) ? saved : 'brand';
  });
  const [settings, setSettings] = useState(getSettings);
  const [showSettings, setShowSettings] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [dark, setDark] = useState(false);
  const importRef = useRef(null);
  const editorRef = useRef(null);

  useEffect(() => {
    safeSet('bks:step', step);
    editorRef.current?.scrollTo?.({ top: 0 });
  }, [step]);

  useEffect(() => {
    loadBrandFonts(brand.fonts);
  }, [brand.fonts]);

  useEffect(() => {
    document.title = `${brand.identity.name || 'Marca'} · Brand Kit`;
  }, [brand.identity.name]);

  const index = STEPS.findIndex((s) => s.id === step);
  const Current = STEPS[index].C;
  const next = STEPS[index + 1];

  const onImport = async (file) => {
    if (!file) return;
    try {
      const b = importBrand(JSON.parse(await readFile(file)));
      toast(`«${b.identity.name}» importada`);
    } catch {
      toast('Ese archivo no es un brand.json válido', 'error');
    }
  };

  return (
    <div className="app">
      <header className="topbar">
        <div className="wordmark">
          Brand<em>Kit</em>
        </div>

        <Menu
          className="brand-menu"
          trigger={({ toggle, open }) => (
            <button className={`brand-trigger ${open ? 'open' : ''}`} onClick={toggle}>
              <span className="brand-dots">
                {brand.colors.slice(0, 3).map((c) => (
                  <span key={c.id} style={{ background: c.hex }} />
                ))}
              </span>
              <span className="ellipsis">{brand.identity.name || 'Sin nombre'}</span>
              <span className="chev">▾</span>
            </button>
          )}
        >
          <div className="menu-label">Tus marcas</div>
          {brands.map((b) => (
            <MenuItem key={b.id} active={b.id === brand.id} onClick={() => setActiveId(b.id)}>
              {b.identity.name || 'Sin nombre'}
            </MenuItem>
          ))}
          <div className="menu-sep" />
          <MenuItem onClick={() => (create(), setStep('brand'))}>Nueva marca</MenuItem>
          <MenuItem onClick={duplicate}>Duplicar</MenuItem>
          <MenuItem onClick={() => importRef.current?.click()}>Importar brand.json</MenuItem>
          <MenuItem danger onClick={() => setConfirmDelete(true)}>
            Eliminar
          </MenuItem>
        </Menu>
        <input ref={importRef} type="file" accept=".json,application/json" hidden onChange={(e) => (onImport(e.target.files[0]), (e.target.value = ''))} />

        <nav className="steps" aria-label="Pasos">
          {STEPS.map((s, i) => (
            <button key={s.id} className={`step ${step === s.id ? 'on' : ''}`} onClick={() => setStep(s.id)}>
              <span className="step-num">{i + 1}</span>
              <span className="step-label">{s.label}</span>
            </button>
          ))}
        </nav>

        <button className={`connect ${settings.apiKey ? 'on' : ''}`} onClick={() => setShowSettings(true)} title={settings.apiKey ? 'Claude conectado' : 'Conectar Claude'}>
          <span className="connect-dot" />
          {settings.apiKey ? 'Claude conectado' : 'Conectar Claude'}
        </button>
      </header>

      <div className="workspace">
        <main className="editor" ref={editorRef}>
          <div className="editor-inner">
            {saveError && <div className="notice error">{saveError}</div>}
            <Current key={`${brand.id}-${step}`} brand={brand} update={update} patch={patch} settings={settings} openSettings={() => setShowSettings(true)} />
            <div className="step-nav">
              {index > 0 && (
                <button className="btn ghost" onClick={() => setStep(STEPS[index - 1].id)}>
                  ← {STEPS[index - 1].label}
                </button>
              )}
              <span className="grow" />
              {next && (
                <button className="btn dark" onClick={() => setStep(next.id)}>
                  Siguiente: {next.label} →
                </button>
              )}
            </div>
          </div>
        </main>

        <aside className="preview-pane" aria-label="Vista previa">
          <div className="preview-head">
            <span className="eyebrow">Vista previa en vivo</span>
            <PreviewToggle dark={dark} setDark={setDark} />
          </div>
          <div className="preview-frame">
            <BrandPreview brand={brand} dark={dark} />
          </div>
        </aside>
      </div>

      <button className="preview-fab" onClick={() => setShowPreview(true)}>
        Ver vista previa
      </button>

      {showPreview && (
        <Modal title="Vista previa" wide onClose={() => setShowPreview(false)}>
          <PreviewToggle dark={dark} setDark={setDark} />
          <div className="preview-frame">
            <BrandPreview brand={brand} dark={dark} />
          </div>
        </Modal>
      )}

      {showSettings && (
        <SettingsModal
          settings={settings}
          onClose={() => setShowSettings(false)}
          onSave={(s) => {
            saveSettings(s);
            setSettings(getSettings());
            setShowSettings(false);
            toast(s.apiKey ? 'Claude conectado' : 'Claude desconectado');
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
                }}
              >
                Eliminar
              </button>
            </>
          }
        >
          <p>¿Eliminar «{brand.identity.name || 'Sin nombre'}» de este navegador? No se puede deshacer. Si quieres conservarla, descarga antes su JSON en Exportar.</p>
        </Modal>
      )}
    </div>
  );
}

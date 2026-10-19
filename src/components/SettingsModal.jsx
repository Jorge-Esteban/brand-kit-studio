import { useState } from 'react';
import { Modal, Select, Toggle } from './ui.jsx';
import { MODELS } from '../lib/claude.js';

export default function SettingsModal({ settings, onSave, onClose }) {
  const [apiKey, setApiKey] = useState(settings.apiKey);
  const [remember, setRemember] = useState(settings.remember);
  const [model, setModel] = useState(settings.model);
  const [show, setShow] = useState(false);
  return (
    <Modal
      title="Conectar Claude"
      onClose={onClose}
      footer={
        <>
          {settings.apiKey && (
            <button className="btn ghost danger" onClick={() => onSave({ apiKey: '', remember: false, model })}>
              Desconectar
            </button>
          )}
          <span className="grow" />
          <button className="btn" onClick={onClose}>
            Cancelar
          </button>
          <button className="btn dark" onClick={() => onSave({ apiKey: apiKey.trim(), remember, model })}>
            Guardar
          </button>
        </>
      }
    >
      <p className="muted">
        Con una API key de Anthropic, Claude dibuja los logos aquí mismo. Créala en{' '}
        <a href="https://console.anthropic.com/settings/keys" target="_blank" rel="noreferrer">
          console.anthropic.com
        </a>
        . Se cobra por uso en tu cuenta de la API.
      </p>
      <label className="field">
        <span className="field-label">API key</span>
        <div className="row gap-s">
          <input className="grow mono" type={show ? 'text' : 'password'} value={apiKey} onChange={(e) => setApiKey(e.target.value)} placeholder="sk-ant-…" autoComplete="off" spellCheck={false} />
          <button className="btn" type="button" onClick={() => setShow((s) => !s)}>
            {show ? 'Ocultar' : 'Ver'}
          </button>
        </div>
      </label>
      <Select label="Modelo" value={model} onChange={setModel} options={MODELS} />
      <Toggle label="Recordar en este navegador" checked={remember} onChange={setRemember} />
      <p className="tiny muted">
        La key solo se envía a api.anthropic.com. Si no marcas «Recordar», se borra al cerrar la pestaña. Si la recuerdas, queda en el almacenamiento de este dominio, que comparten
        todas tus páginas de GitHub Pages.
      </p>
    </Modal>
  );
}

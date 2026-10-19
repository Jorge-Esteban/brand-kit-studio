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
      title="Ajustes de Claude"
      onClose={onClose}
      footer={
        <>
          {settings.apiKey && (
            <button className="btn ghost danger" onClick={() => onSave({ apiKey: '', remember: false, model })}>
              Borrar key
            </button>
          )}
          <span className="grow" />
          <button className="btn" onClick={onClose}>
            Cancelar
          </button>
          <button className="btn primary" onClick={() => onSave({ apiKey: apiKey.trim(), remember, model })}>
            Guardar
          </button>
        </>
      }
    >
      <p className="small">
        Para generar logos directamente desde esta web necesitas una API key de Anthropic. Consíguela en{' '}
        <a href="https://console.anthropic.com/settings/keys" target="_blank" rel="noreferrer">
          console.anthropic.com
        </a>
        . El uso se factura en tu cuenta de la API (no forma parte de la suscripción de claude.ai).
      </p>
      <label className="field">
        <span className="field-label">API key</span>
        <div className="row gap-s">
          <input className="grow" type={show ? 'text' : 'password'} value={apiKey} onChange={(e) => setApiKey(e.target.value)} placeholder="sk-ant-…" autoComplete="off" spellCheck={false} />
          <button className="btn" type="button" onClick={() => setShow((s) => !s)}>
            {show ? 'Ocultar' : 'Ver'}
          </button>
        </div>
      </label>
      <Toggle label="Recordar en este navegador" checked={remember} onChange={setRemember} />
      <p className="small muted">
        La key se envía solo a <code>api.anthropic.com</code>. Sin «Recordar», se borra al cerrar la pestaña. Con «Recordar» se guarda en el almacenamiento local de este dominio,
        que comparten todas tus páginas de GitHub Pages: actívalo solo en un equipo de confianza.
      </p>
      <Select label="Modelo" value={model} onChange={setModel} options={MODELS} />
      <div className="callout">
        ¿Sin API key? No pasa nada: en la sección Logos puedes copiar el prompt, pegarlo en claude.ai y traer de vuelta los SVG.
      </div>
    </Modal>
  );
}

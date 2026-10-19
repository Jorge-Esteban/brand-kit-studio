import { createContext, useCallback, useContext, useState } from 'react';

export function SectionHeader({ title, subtitle, children }) {
  return (
    <header className="section-header">
      <div>
        <h1>{title}</h1>
        {subtitle && <p className="muted">{subtitle}</p>}
      </div>
      {children && <div className="section-actions">{children}</div>}
    </header>
  );
}

export function Card({ title, subtitle, children, className = '', actions }) {
  return (
    <section className={`card ${className}`}>
      {(title || actions) && (
        <div className="card-head">
          <div>
            {title && <h2>{title}</h2>}
            {subtitle && <p className="muted small">{subtitle}</p>}
          </div>
          {actions && <div className="row gap-s">{actions}</div>}
        </div>
      )}
      {children}
    </section>
  );
}

export function Field({ label, hint, children, className = '' }) {
  return (
    <label className={`field ${className}`}>
      <span className="field-label">{label}</span>
      {children}
      {hint && <span className="field-hint">{hint}</span>}
    </label>
  );
}

export function TextInput({ label, hint, value, onChange, placeholder, className, ...rest }) {
  return (
    <Field label={label} hint={hint} className={className}>
      <input type="text" value={value ?? ''} placeholder={placeholder} onChange={(e) => onChange(e.target.value)} {...rest} />
    </Field>
  );
}

export function TextArea({ label, hint, value, onChange, placeholder, rows = 3, className }) {
  return (
    <Field label={label} hint={hint} className={className}>
      <textarea rows={rows} value={value ?? ''} placeholder={placeholder} onChange={(e) => onChange(e.target.value)} />
    </Field>
  );
}

export function Select({ label, hint, value, onChange, options, className }) {
  return (
    <Field label={label} hint={hint} className={className}>
      <select value={value} onChange={(e) => onChange(e.target.value)}>
        {options.map((o) => (
          <option key={o.value ?? o.id} value={o.value ?? o.id}>
            {o.label}
          </option>
        ))}
      </select>
    </Field>
  );
}

export function Slider({ label, value, onChange, min = 0, max = 100, step = 1, left, right, format }) {
  return (
    <div className="field">
      <span className="field-label row between">
        <span>{label}</span>
        {format && <span className="muted small">{format(value)}</span>}
      </span>
      <input type="range" min={min} max={max} step={step} value={value} onChange={(e) => onChange(Number(e.target.value))} />
      {(left || right) && (
        <span className="row between small muted">
          <span>{left}</span>
          <span>{right}</span>
        </span>
      )}
    </div>
  );
}

export function Toggle({ label, checked, onChange }) {
  return (
    <label className="toggle">
      <input type="checkbox" checked={!!checked} onChange={(e) => onChange(e.target.checked)} />
      <span>{label}</span>
    </label>
  );
}

export function Chips({ options, selected, onToggle }) {
  return (
    <div className="chips">
      {options.map((o) => (
        <button type="button" key={o} className={`chip ${selected.includes(o) ? 'on' : ''}`} onClick={() => onToggle(o)}>
          {o}
        </button>
      ))}
    </div>
  );
}

const ToastCtx = createContext(() => {});
export const useToast = () => useContext(ToastCtx);

export function ToastProvider({ children }) {
  const [items, setItems] = useState([]);
  const show = useCallback((text, kind = 'ok') => {
    const id = Math.random();
    setItems((xs) => [...xs, { id, text, kind }]);
    setTimeout(() => setItems((xs) => xs.filter((x) => x.id !== id)), 3200);
  }, []);
  return (
    <ToastCtx.Provider value={show}>
      {children}
      <div className="toasts" role="status" aria-live="polite">
        {items.map((t) => (
          <div key={t.id} className={`toast ${t.kind}`}>
            {t.text}
          </div>
        ))}
      </div>
    </ToastCtx.Provider>
  );
}

export function Modal({ title, onClose, children, footer }) {
  return (
    <div className="modal-backdrop" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal" role="dialog" aria-modal="true" aria-label={title}>
        <div className="card-head">
          <h2>{title}</h2>
          <button className="btn ghost icon" onClick={onClose} aria-label="Cerrar">
            ✕
          </button>
        </div>
        <div className="modal-body">{children}</div>
        {footer && <div className="modal-footer">{footer}</div>}
      </div>
    </div>
  );
}

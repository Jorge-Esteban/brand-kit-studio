import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';

export function StepHeader({ step, title, subtitle, children }) {
  return (
    <header className="step-header">
      {step && <span className="eyebrow">{step}</span>}
      <h1>{title}</h1>
      {subtitle && <p className="lead">{subtitle}</p>}
      {children && <div className="step-header-actions">{children}</div>}
    </header>
  );
}

// group=true cuando contiene varios controles (un <label> activaría el primero al hacer clic).
export function Field({ label, hint, children, className = '', group = false }) {
  const Tag = group ? 'div' : 'label';
  return (
    <Tag className={`field ${className}`}>
      {label && <span className="field-label">{label}</span>}
      {children}
      {hint && <span className="field-hint">{hint}</span>}
    </Tag>
  );
}

export function TextInput({ label, hint, value, onChange, placeholder, className, big, ...rest }) {
  return (
    <Field label={label} hint={hint} className={className}>
      <input type="text" className={big ? 'input-big' : ''} value={value ?? ''} placeholder={placeholder} onChange={(e) => onChange(e.target.value)} {...rest} />
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
        {format && <span className="muted">{format(value)}</span>}
      </span>
      <input type="range" min={min} max={max} step={step} value={value} onChange={(e) => onChange(Number(e.target.value))} />
      {(left || right) && (
        <span className="row between tiny muted">
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
      <span className="toggle-track" aria-hidden="true" />
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

// Bloque plegable para todo lo opcional o avanzado.
export function Disclosure({ title, hint, children, defaultOpen = false }) {
  return (
    <details className="disclosure" open={defaultOpen}>
      <summary>
        <span>{title}</span>
        {hint && <span className="muted">{hint}</span>}
      </summary>
      <div className="disclosure-body">{children}</div>
    </details>
  );
}

// Menú desplegable sencillo (se cierra al hacer clic fuera).
export function Menu({ trigger, children, align = 'left', className = '' }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  useEffect(() => {
    if (!open) return;
    const close = (e) => !ref.current?.contains(e.target) && setOpen(false);
    const esc = (e) => e.key === 'Escape' && setOpen(false);
    document.addEventListener('mousedown', close);
    document.addEventListener('keydown', esc);
    return () => {
      document.removeEventListener('mousedown', close);
      document.removeEventListener('keydown', esc);
    };
  }, [open]);
  return (
    <div className={`menu ${className}`} ref={ref}>
      {trigger({ open, toggle: () => setOpen((o) => !o) })}
      {open && (
        <div className={`menu-pop ${align}`} role="menu" onClick={() => setOpen(false)}>
          {children}
        </div>
      )}
    </div>
  );
}

export function MenuItem({ children, onClick, danger, active }) {
  return (
    <button type="button" role="menuitem" className={`menu-item ${danger ? 'danger' : ''} ${active ? 'active' : ''}`} onClick={onClick}>
      {children}
    </button>
  );
}

const ToastCtx = createContext(() => {});
export const useToast = () => useContext(ToastCtx);

export function ToastProvider({ children }) {
  const [items, setItems] = useState([]);
  const show = useCallback((text, kind = 'ok') => {
    const id = Math.random();
    setItems((xs) => [...xs, { id, text, kind }]);
    setTimeout(() => setItems((xs) => xs.filter((x) => x.id !== id)), 3000);
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

export function Modal({ title, onClose, children, footer, wide }) {
  useEffect(() => {
    const esc = (e) => e.key === 'Escape' && onClose();
    document.addEventListener('keydown', esc);
    return () => document.removeEventListener('keydown', esc);
  }, [onClose]);
  return (
    <div className="modal-backdrop" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div className={`modal ${wide ? 'wide' : ''}`} role="dialog" aria-modal="true" aria-label={title}>
        <div className="modal-head">
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

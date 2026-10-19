import { resolveTheme } from '../lib/brand.js';
import { logoSrc } from '../lib/svg.js';
import { withAlpha, mix } from '../lib/color.js';

// Variables CSS que consumen las clases .bp-* (ver styles.css).
export function brandVars(brand, overrideTokens) {
  const t = resolveTheme(overrideTokens ? { ...brand, style: { ...brand.style, ...overrideTokens } } : brand);
  const c = t.colors;
  const glass = t.surfaceType === 'glass';
  return {
    '--bp-primary': c.primary,
    '--bp-secondary': c.secondary,
    '--bp-accent': c.accent,
    '--bp-bg': t.gradients ? `linear-gradient(135deg, ${mix(c.background, c.primary, 0.18)}, ${mix(c.background, c.accent, 0.22)})` : c.background,
    '--bp-bg-solid': c.background,
    '--bp-surface': glass ? withAlpha('#ffffff', 0.35) : c.surface,
    '--bp-blur': glass ? 'blur(14px)' : 'none',
    '--bp-text': c.text,
    '--bp-muted': c.muted,
    '--bp-border': t.shadowId === 'hard' || t.borderWidth >= 2 ? c.text : glass ? withAlpha('#ffffff', 0.6) : c.border,
    '--bp-btn-border': t.shadowId === 'hard' || t.borderWidth >= 2 ? c.text : c.primary,
    '--bp-on-primary': t.onPrimary,
    '--bp-on-accent': t.onAccent,
    '--bp-success': c.success,
    '--bp-warning': c.warning,
    '--bp-danger': c.danger,
    '--bp-radius': `${t.radius}px`,
    '--bp-radius-btn': t.pillButtons ? '999px' : `${t.radius}px`,
    '--bp-bw': `${t.borderWidth}px`,
    '--bp-shadow': t.shadow,
    '--bp-space': `${t.space}px`,
    '--bp-font-h': t.fonts.heading,
    '--bp-font-b': t.fonts.body,
    '--bp-font-m': t.fonts.mono,
    '--bp-w-h': t.fonts.headingWeight,
    '--bp-w-b': t.fonts.bodyWeight,
    '--bp-w-bold': t.fonts.bodyBold,
    '--bp-case': t.headingCase,
    '--bp-track': `${t.headingTracking}em`,
    '--bp-gradient': `linear-gradient(135deg, ${c.primary}, ${c.accent})`,
  };
}

function primaryLogo(brand) {
  return brand.logos.find((l) => l.id === brand.primaryLogoId) || brand.logos[0];
}

export function MiniPreview({ brand, tokens }) {
  return (
    <div className="bp bp-mini" style={brandVars(brand, tokens)}>
      <div className="bp-card">
        <div className="bp-h">Aa</div>
        <div className="bp-line" />
        <div className="bp-line short" />
        <span className="bp-btn">Botón</span>
      </div>
    </div>
  );
}

export default function BrandPreview({ brand, dark = false }) {
  const logo = primaryLogo(brand);
  const id = brand.identity;
  const name = id.name || 'Tu marca';
  const vars = brandVars(brand);
  if (dark) {
    const t = resolveTheme(brand);
    Object.assign(vars, {
      '--bp-bg': t.colors.text,
      '--bp-bg-solid': t.colors.text,
      '--bp-surface': mix(t.colors.text, t.colors.background, 0.08),
      '--bp-text': t.colors.background,
      '--bp-muted': mix(t.colors.background, t.colors.text, 0.35),
      '--bp-border': mix(t.colors.text, t.colors.background, 0.2),
    });
  }
  const darkLogo = dark ? brand.logos.find((l) => l.variant === 'mono-light') || logo : logo;
  return (
    <div className="bp bp-full" style={vars}>
      <nav className="bp-nav">
        <div className="bp-brand">
          {darkLogo ? <img src={logoSrc(darkLogo)} alt="" /> : <span className="bp-logo-fallback">{name.slice(0, 1)}</span>}
          <span>{name}</span>
        </div>
        <div className="bp-links">
          <span>Producto</span>
          <span>Precios</span>
          <span>Blog</span>
          <span className="bp-btn sm">Empezar</span>
        </div>
      </nav>
      <section className="bp-hero">
        <span className="bp-badge">Nuevo</span>
        <h1 className="bp-h">{id.tagline || 'Un titular que vende la idea'}</h1>
        <p className="bp-lead">{id.description || 'Una frase de apoyo que explica qué hace el producto y por qué importa a quien lo lee.'}</p>
        <div className="bp-row">
          <span className="bp-btn">Probar gratis</span>
          <span className="bp-btn outline">Ver demo</span>
        </div>
      </section>
      <section className="bp-cards">
        {[
          ['⚡', 'Rápido', 'Configura tu proyecto en minutos.'],
          ['🎯', 'Preciso', 'Cada detalle alineado con tu marca.'],
          ['🤝', 'Colaborativo', 'Comparte el kit con todo el equipo.'],
        ].map(([icon, title, text]) => (
          <div key={title} className="bp-card">
            <span className="bp-icon">{icon}</span>
            <h3 className="bp-h">{title}</h3>
            <p>{text}</p>
            <span className="bp-link">Saber más →</span>
          </div>
        ))}
      </section>
      <section className="bp-split">
        <div className="bp-card bp-form">
          <h3 className="bp-h">Únete a la lista</h3>
          <label>
            Correo electrónico
            <span className="bp-input">tu@correo.com</span>
          </label>
          <label className="bp-check">
            <span className="bp-checkbox" /> Acepto recibir novedades
          </label>
          <span className="bp-btn block">Suscribirme</span>
        </div>
        <div className="bp-card">
          <h3 className="bp-h">Estados</h3>
          <div className="bp-alert success">Guardado correctamente</div>
          <div className="bp-alert warning">Tu prueba termina en 3 días</div>
          <div className="bp-alert danger">No se pudo completar el pago</div>
          <code className="bp-code">npm install {name.toLowerCase().replace(/\s+/g, '-')}</code>
        </div>
      </section>
      <footer className="bp-footer">
        © {new Date().getFullYear()} {name}
        <span className="bp-swatches">
          {brand.colors.map((c) => (
            <span key={c.id} style={{ background: c.hex }} title={c.name} />
          ))}
        </span>
      </footer>
    </div>
  );
}

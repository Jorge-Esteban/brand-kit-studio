// Persistencia local de marcas (localStorage) y hook de estado.
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { newBrand, normalizeBrand, uid } from './brand.js';

const BRANDS_KEY = 'bks:brands:v1';
const ACTIVE_KEY = 'bks:active:v1';

export function safeGet(key, fallback = null, storage = 'local') {
  try {
    const s = storage === 'session' ? window.sessionStorage : window.localStorage;
    const v = s.getItem(key);
    return v === null ? fallback : v;
  } catch {
    return fallback;
  }
}

export function safeSet(key, value, storage = 'local') {
  try {
    const s = storage === 'session' ? window.sessionStorage : window.localStorage;
    if (value === null || value === undefined) s.removeItem(key);
    else s.setItem(key, value);
    return true;
  } catch {
    return false;
  }
}

function loadBrands() {
  try {
    const raw = JSON.parse(safeGet(BRANDS_KEY, '[]'));
    if (Array.isArray(raw) && raw.length) return raw.map(normalizeBrand);
  } catch {
    /* datos corruptos: empezamos de cero */
  }
  return [newBrand('Mi primera marca')];
}

export function useBrandStore() {
  const [brands, setBrands] = useState(loadBrands);
  const [activeId, setActiveId] = useState(() => safeGet(ACTIVE_KEY) || null);
  const [saveError, setSaveError] = useState(null);
  const timer = useRef(null);

  const active = useMemo(() => brands.find((b) => b.id === activeId) || brands[0], [brands, activeId]);

  // Guardado con pequeño retardo para no escribir en cada pulsación.
  useEffect(() => {
    clearTimeout(timer.current);
    timer.current = setTimeout(() => {
      const ok = safeSet(BRANDS_KEY, JSON.stringify(brands));
      setSaveError(
        ok
          ? null
          : 'No se ha podido guardar en el navegador (posiblemente por espacio: los logos PNG grandes ocupan mucho). Exporta el JSON para no perder cambios.',
      );
    }, 300);
    return () => clearTimeout(timer.current);
  }, [brands]);

  useEffect(() => {
    if (active) safeSet(ACTIVE_KEY, active.id);
  }, [active]);

  const update = useCallback(
    (fn) => {
      setBrands((list) =>
        list.map((b) => {
          if (b.id !== active.id) return b;
          const next = typeof fn === 'function' ? fn(b) : { ...b, ...fn };
          return { ...next, updatedAt: new Date().toISOString() };
        }),
      );
    },
    [active?.id],
  );

  // Atajo para actualizar una sub-sección: patch('identity', { name: 'X' })
  const patch = useCallback((section, values) => update((b) => ({ ...b, [section]: { ...b[section], ...values } })), [update]);

  const create = useCallback((name) => {
    const b = newBrand(name || 'Nueva marca');
    setBrands((list) => [...list, b]);
    setActiveId(b.id);
  }, []);

  const duplicate = useCallback(() => {
    const copy = normalizeBrand(JSON.parse(JSON.stringify(active)));
    copy.id = uid();
    copy.identity.name = `${active.identity.name} (copia)`;
    copy.createdAt = copy.updatedAt = new Date().toISOString();
    setBrands((list) => [...list, copy]);
    setActiveId(copy.id);
  }, [active]);

  const remove = useCallback(() => {
    setBrands((list) => {
      const rest = list.filter((b) => b.id !== active.id);
      const next = rest.length ? rest : [newBrand('Nueva marca')];
      setActiveId(next[0].id);
      return next;
    });
  }, [active?.id]);

  const importBrand = useCallback((data) => {
    const b = normalizeBrand(data.brand || data);
    if (brands.some((x) => x.id === b.id)) b.id = uid();
    setBrands((list) => [...list, b]);
    setActiveId(b.id);
    return b;
  }, [brands]);

  return { brands, active, setActiveId, update, patch, create, duplicate, remove, importBrand, saveError };
}

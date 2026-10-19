// Saneado, extracción, recoloreado y rasterizado de SVG.

const FORBIDDEN_TAGS = ['script', 'foreignObject', 'iframe', 'object', 'embed', 'audio', 'video', 'canvas'];

export function sanitizeSvg(input) {
  const doc = new DOMParser().parseFromString(String(input).trim(), 'image/svg+xml');
  const svg = doc.documentElement;
  if (!svg || svg.nodeName.toLowerCase() !== 'svg' || doc.getElementsByTagName('parsererror').length) {
    throw new Error('El código no es un SVG válido.');
  }
  FORBIDDEN_TAGS.forEach((t) => Array.from(svg.getElementsByTagName(t)).forEach((n) => n.remove()));
  const walk = (el) => {
    for (const attr of Array.from(el.attributes || [])) {
      const name = attr.name.toLowerCase();
      const val = attr.value.trim().toLowerCase();
      if (name.startsWith('on')) el.removeAttribute(attr.name);
      else if ((name === 'href' || name === 'xlink:href') && !(val.startsWith('#') || val.startsWith('data:image/'))) el.removeAttribute(attr.name);
      else if (val.includes('javascript:')) el.removeAttribute(attr.name);
    }
    Array.from(el.children || []).forEach(walk);
  };
  walk(svg);
  if (!svg.getAttribute('xmlns')) svg.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
  if (!svg.getAttribute('viewBox')) {
    const w = parseFloat(svg.getAttribute('width'));
    const h = parseFloat(svg.getAttribute('height'));
    if (w && h) svg.setAttribute('viewBox', `0 0 ${w} ${h}`);
  }
  return new XMLSerializer().serializeToString(svg);
}

// Extrae propuestas (título opcional + SVG) de una respuesta de texto de Claude.
export function extractProposals(text) {
  const out = [];
  const re = /<svg[\s\S]*?<\/svg>/gi;
  let m;
  let last = 0;
  while ((m = re.exec(text))) {
    const before = text.slice(last, m.index);
    const titleMatch = [...before.matchAll(/^#{1,4}\s*(.+)$/gm)].pop();
    const lines = before.split('\n').map((l) => l.trim()).filter((l) => l && !l.startsWith('```') && !l.startsWith('#'));
    try {
      out.push({
        title: titleMatch ? titleMatch[1].replace(/\*\*/g, '').trim() : `Propuesta ${out.length + 1}`,
        rationale: lines.slice(-2).join(' ').slice(0, 400),
        svg: sanitizeSvg(m[0]),
      });
    } catch {
      /* SVG roto: lo ignoramos */
    }
    last = m.index + m[0].length;
  }
  return out;
}

export function svgToDataUrl(svg) {
  return 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg);
}

export function logoSrc(logo) {
  return logo.svg ? svgToDataUrl(logo.svg) : logo.dataUrl;
}

// Convierte todos los rellenos y trazos a un único color (variantes monocromas).
export function recolorSvg(svg, color) {
  const doc = new DOMParser().parseFromString(svg, 'image/svg+xml');
  const root = doc.documentElement;
  const isPaint = (v) => v && v !== 'none' && !v.startsWith('url(') && v !== 'transparent';
  const all = [root, ...root.querySelectorAll('*')];
  for (const el of all) {
    for (const prop of ['fill', 'stroke', 'stop-color']) {
      const v = el.getAttribute(prop);
      if (isPaint(v)) el.setAttribute(prop, color);
    }
    const style = el.getAttribute('style');
    if (style) {
      el.setAttribute(
        'style',
        style.replace(/(fill|stroke|stop-color)\s*:\s*([^;]+)/gi, (all, p, v) => (isPaint(v.trim()) ? `${p}:${color}` : all)),
      );
    }
  }
  // Los elementos sin fill explícito heredan negro: forzamos el color en la raíz.
  if (!root.getAttribute('fill')) root.setAttribute('fill', color);
  doc.querySelectorAll('style').forEach((s) => {
    s.textContent = s.textContent.replace(/(fill|stroke|stop-color)\s*:\s*([^;}]+)/gi, (all, p, v) => (isPaint(v.trim()) ? `${p}:${color}` : all));
  });
  // Degradados: cada stop pasa a ser del mismo color.
  return new XMLSerializer().serializeToString(root);
}

// Rasteriza un logo (SVG o imagen) a PNG cuadrado o proporcional.
export function rasterize(src, size = 1024) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const ratio = (img.naturalWidth || size) / (img.naturalHeight || size);
      const w = ratio >= 1 ? size : Math.round(size * ratio);
      const h = ratio >= 1 ? Math.round(size / ratio) : size;
      const canvas = document.createElement('canvas');
      canvas.width = w;
      canvas.height = h;
      canvas.getContext('2d').drawImage(img, 0, 0, w, h);
      canvas.toBlob((blob) => (blob ? resolve(blob) : reject(new Error('No se pudo generar el PNG.'))), 'image/png');
    };
    img.onerror = () => reject(new Error('No se pudo cargar la imagen para convertirla a PNG.'));
    img.src = src;
  });
}

export function readFile(file, as = 'text') {
  return new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => resolve(r.result);
    r.onerror = () => reject(r.error);
    if (as === 'dataUrl') r.readAsDataURL(file);
    else r.readAsText(file);
  });
}

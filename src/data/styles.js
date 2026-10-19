// Presets de estilo de diseño. Los tokens son editables después de aplicar un preset.

export const SHADOWS = [
  { id: 'none', label: 'Sin sombra' },
  { id: 'soft', label: 'Suave' },
  { id: 'medium', label: 'Media' },
  { id: 'hard', label: 'Dura (desplazada)' },
  { id: 'glow', label: 'Resplandor' },
  { id: 'neu', label: 'Neumórfica' },
];

export const DENSITIES = [
  { id: 'compact', label: 'Compacta', factor: 0.75 },
  { id: 'normal', label: 'Normal', factor: 1 },
  { id: 'airy', label: 'Espaciosa', factor: 1.35 },
];

export const STYLE_PRESETS = [
  {
    id: 'minimal',
    name: 'Minimalista',
    description: 'Mucho espacio en blanco, jerarquía tipográfica clara y casi ningún ornamento.',
    tokens: { radius: 6, borderWidth: 1, shadow: 'none', density: 'airy', headingCase: 'none', headingTracking: -0.02, surface: 'solid', pillButtons: false, gradients: false },
    rules: ['Prioriza el espacio en blanco sobre los elementos decorativos.', 'Usa el color de acento con moderación: solo en llamadas a la acción.', 'Jerarquía mediante tamaño y peso tipográfico, no mediante cajas.', 'Bordes finos en lugar de sombras.'],
  },
  {
    id: 'corporate',
    name: 'Corporativo',
    description: 'Sobrio, fiable y ordenado. Retículas claras y componentes predecibles.',
    tokens: { radius: 4, borderWidth: 1, shadow: 'soft', density: 'normal', headingCase: 'none', headingTracking: -0.01, surface: 'solid', pillButtons: false, gradients: false },
    rules: ['Retícula de 12 columnas y alineaciones estrictas.', 'Sombras suaves para separar tarjetas del fondo.', 'Iconografía consistente y lineal.', 'Evita colores estridentes en grandes superficies.'],
  },
  {
    id: 'brutalist',
    name: 'Brutalista',
    description: 'Crudo y directo: bordes gruesos, sombras duras desplazadas y alto contraste.',
    tokens: { radius: 0, borderWidth: 3, shadow: 'hard', density: 'compact', headingCase: 'uppercase', headingTracking: 0, surface: 'solid', pillButtons: false, gradients: false },
    rules: ['Bordes negros gruesos en todos los componentes.', 'Sombras sólidas desplazadas, sin desenfoque.', 'Colores planos y saturados, sin degradados.', 'Tipografía grande y contundente; se permite romper la retícula.'],
  },
  {
    id: 'glass',
    name: 'Glassmorphism',
    description: 'Superficies translúcidas con desenfoque sobre fondos con degradado.',
    tokens: { radius: 18, borderWidth: 1, shadow: 'soft', density: 'normal', headingCase: 'none', headingTracking: -0.02, surface: 'glass', pillButtons: true, gradients: true },
    rules: ['Fondos con degradados de los colores de marca.', 'Tarjetas semitransparentes con backdrop-filter: blur().', 'Borde fino blanco semitransparente para definir las superficies.', 'Comprueba el contraste del texto sobre superficies translúcidas.'],
  },
  {
    id: 'neumorphism',
    name: 'Neumorfismo',
    description: 'Relieves suaves del mismo color que el fondo, como si estuvieran moldeados.',
    tokens: { radius: 16, borderWidth: 0, shadow: 'neu', density: 'airy', headingCase: 'none', headingTracking: -0.01, surface: 'solid', pillButtons: true, gradients: false },
    rules: ['Los componentes comparten color con el fondo y se distinguen por sombras dobles (clara y oscura).', 'Usa el color primario solo para estados activos.', 'Evita bordes; el relieve define la forma.', 'Refuerza la accesibilidad con iconos y texto, ya que el contraste es bajo.'],
  },
  {
    id: 'editorial',
    name: 'Editorial',
    description: 'Inspirado en revistas: tipografía serif protagonista, filetes y composiciones asimétricas.',
    tokens: { radius: 0, borderWidth: 1, shadow: 'none', density: 'airy', headingCase: 'none', headingTracking: -0.01, surface: 'solid', pillButtons: false, gradients: false },
    rules: ['Titulares grandes en serif con mucho contraste de tamaño.', 'Filetes (líneas finas) para separar secciones.', 'Columnas de texto de 60–75 caracteres.', 'Imágenes a sangre y composición asimétrica.'],
  },
  {
    id: 'retro',
    name: 'Retro / Vintage',
    description: 'Nostalgia de los 70–90: colores cálidos, bordes marcados y tipografías con carácter.',
    tokens: { radius: 10, borderWidth: 2, shadow: 'hard', density: 'normal', headingCase: 'uppercase', headingTracking: 0.02, surface: 'solid', pillButtons: false, gradients: false },
    rules: ['Paleta cálida y algo desaturada.', 'Texturas de papel o grano sutiles en fondos.', 'Tipografías display con personalidad para titulares.', 'Insignias, sellos y elementos de estilo badge.'],
  },
  {
    id: 'playful',
    name: 'Lúdico',
    description: 'Divertido y cercano: formas redondeadas, colores vivos y microanimaciones.',
    tokens: { radius: 24, borderWidth: 2, shadow: 'medium', density: 'normal', headingCase: 'none', headingTracking: -0.01, surface: 'solid', pillButtons: true, gradients: false },
    rules: ['Esquinas muy redondeadas y botones tipo píldora.', 'Combina varios colores de marca con confianza.', 'Ilustraciones y formas orgánicas como decoración.', 'Microinteracciones con rebote suave.'],
  },
  {
    id: 'tech',
    name: 'Tech / Futurista',
    description: 'Interfaces oscuras, acentos luminosos y detalles técnicos (monoespaciada, cuadrículas).',
    tokens: { radius: 8, borderWidth: 1, shadow: 'glow', density: 'compact', headingCase: 'none', headingTracking: -0.02, surface: 'solid', pillButtons: false, gradients: true },
    rules: ['Preferencia por fondos oscuros con acentos de neón del color primario.', 'Etiquetas y datos en tipografía monoespaciada.', 'Cuadrículas y líneas finas como decoración.', 'Resplandor sutil en elementos interactivos.'],
  },
  {
    id: 'organic',
    name: 'Orgánico / Natural',
    description: 'Cálido y suave: formas redondeadas, tonos tierra y mucho aire.',
    tokens: { radius: 28, borderWidth: 0, shadow: 'soft', density: 'airy', headingCase: 'none', headingTracking: -0.01, surface: 'solid', pillButtons: true, gradients: false },
    rules: ['Formas irregulares y blobs como fondos decorativos.', 'Tonos tierra, verdes y neutros cálidos.', 'Fotografía natural con luz suave.', 'Evita ángulos rectos y contrastes duros.'],
  },
  {
    id: 'luxury',
    name: 'Lujo / Elegante',
    description: 'Exclusivo y contenido: mucho espacio, mayúsculas espaciadas y paleta reducida.',
    tokens: { radius: 2, borderWidth: 1, shadow: 'none', density: 'airy', headingCase: 'uppercase', headingTracking: 0.12, surface: 'solid', pillButtons: false, gradients: false },
    rules: ['Paleta reducida: negro, blanco y un metálico o tono profundo.', 'Mayúsculas con espaciado amplio en titulares y etiquetas.', 'Mucho espacio negativo; menos es más.', 'Fotografía de producto cuidada y minimalista.'],
  },
];

export function findPreset(id) {
  return STYLE_PRESETS.find((p) => p.id === id);
}

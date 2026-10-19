# Brand Kit Studio

Crea la identidad de marca de tus proyectos y expórtala como contexto para Claude.

Seis pasos con vista previa en vivo:

1. **Marca**: nombre, eslogan, qué es y personalidad (tono de voz e imagen, opcionales).
2. **Colores**: paletas de inspiración con un clic o tus propios colores, sin límite.
3. **Tipografía**: parejas de fuentes listas para usar, o elige una a una entre 68 de Google Fonts.
4. **Estilo**: 11 estilos visuales (minimalista, brutalista, glassmorphism…) mostrados como miniaturas.
5. **Logo**: genera propuestas SVG con Claude (con tu API key, o copiando el prompt a claude.ai), súbelos o pega el código SVG. Variantes monocromas con un clic.
6. **Exportar**: `brand.md` listo para Claude, ZIP con logos SVG/PNG, `brand.json` reimportable, design tokens, CSS y Tailwind.

Todo se guarda en tu navegador (localStorage). La API key solo se envía a `api.anthropic.com`.

## Usar el kit con Claude

- **Proyecto de Claude**: sube `brand.md` al conocimiento del proyecto.
- **Chat**: pega el Markdown o adjunta el archivo.
- **Claude Code**: guarda `docs/brand.md` en el repositorio y añade `@docs/brand.md` a `CLAUDE.md`.

## Desarrollo

```bash
npm install
npm run dev
```

Cada push a `main` se publica automáticamente en GitHub Pages mediante `.github/workflows/deploy.yml`.

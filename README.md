# Brand Kit Studio

Crea la identidad de marca de tus proyectos y expórtala como contexto para Claude.

- **Identidad, y voz y tono**: nombre, eslogan, público y personalidad, y cómo habla la marca.
- **Colores**: tantos como quieras, con roles, escalas de tonos, armonías y comprobación de contraste WCAG.
- **Tipografía**: catálogo curado de Google Fonts, combinaciones sugeridas y escala tipográfica.
- **Estilo de diseño**: 11 estilos (minimalista, brutalista, glassmorphism…) con tokens editables y vista previa en vivo.
- **Logos**: genera propuestas SVG con Claude (con tu API key, o copiando el prompt a claude.ai), súbelos o pega el código SVG. Variantes monocromas con un clic.
- **Exportar**: `brand.md` listo para Claude, ZIP con logos SVG/PNG, `brand.json` reimportable, design tokens, CSS y Tailwind.

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

Para publicar los cambios en GitHub Pages:

```bash
npm run deploy
```

El script compila la app y sube `dist/` a la rama `gh-pages`.

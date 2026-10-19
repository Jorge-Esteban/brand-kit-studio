import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// base relativa: funciona en GitHub Pages sea cual sea el nombre del repo
export default defineConfig({
  plugins: [react()],
  base: './',
});

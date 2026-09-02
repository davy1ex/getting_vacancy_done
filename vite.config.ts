import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    cssCodeSplit: false,
    sourcemap: false,
    rollupOptions: {
      input: {
        content: 'src/content.tsx',
        background: 'src/background.ts',
      },
      output: {
        format: 'iife',
        entryFileNames: '[name].js',
      },
    },
  },
});

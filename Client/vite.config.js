import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    host: true,
    port: 5180, // dedicated port for this project, avoids clashing with anything else
    strictPort: true, // fail loudly instead of silently picking another port
  },
});
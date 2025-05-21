import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    host: true, // exposes it to your LAN (e.g. 192.168.x.x)
    port: 5173, // optional, just to be explicit
  },
});
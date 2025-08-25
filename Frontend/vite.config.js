import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(),tailwindcss()   
  ],
  server: {
    port: 5174,   // 👈 force port
    strictPort: true, // 👈 if 5174 is busy, it will fail instead of changing
    },
})

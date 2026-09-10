import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    // Editors replace files rather than writing in place, which macOS fs.watch
    // misses. Polling keeps CSS and TS edits reloading reliably.
    watch: { usePolling: true, interval: 300 },
  },
})

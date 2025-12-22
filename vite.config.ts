
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

/**
 * Fixed 'process.cwd()' error by removing unnecessary env loading logic.
 * This also ensures compliance with Gemini API guidelines: "Do not define process.env",
 * as the API_KEY is provided externally by the execution environment.
 */
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
  },
});

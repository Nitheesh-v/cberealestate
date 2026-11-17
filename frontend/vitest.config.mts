import { defineConfig } from 'vitest/config';
/** Isolates tests from real API services while retaining the production source aliases. */
export default defineConfig({
  resolve: { alias: { '@': new URL('./src', import.meta.url).pathname } },
  oxc: { jsx: { runtime: 'automatic' } },
  test: {
    env: {
      NEXT_PUBLIC_API_URL: 'https://api.example.test/api',
      NEXT_PUBLIC_APP_URL: 'https://web.example.test',
      NEXT_PUBLIC_APP_NAME: 'SBR Real Estate',
    },
  },
});

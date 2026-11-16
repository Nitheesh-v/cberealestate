import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import nextPlugin from '@next/eslint-plugin-next';
export default tseslint.config(
  { ignores: ['**/dist/**', '**/.next/**', '**/node_modules/**', '**/next-env.d.ts'] },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  { plugins: { '@next/next': nextPlugin } },
  {
    files: ['apps/frontend/**/*.{ts,tsx}'],
    settings: { next: { rootDir: new URL('./apps/frontend/', import.meta.url).pathname } },
    rules: {
      ...nextPlugin.configs.recommended.rules,
      ...nextPlugin.configs['core-web-vitals'].rules,
    },
  },
  { rules: { '@typescript-eslint/no-explicit-any': 'error' } },
);

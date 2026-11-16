import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import nextPlugin from '@next/eslint-plugin-next';
import type { Linter } from 'eslint';

/** Upstream rule typings widen valid severity literals to string. */
const nextRules = {
  ...nextPlugin.configs.recommended.rules,
  ...nextPlugin.configs['core-web-vitals'].rules,
} as Linter.RulesRecord;

export default tseslint.config(
  { ignores: ['**/dist/**', '**/.next/**', '**/node_modules/**', '**/next-env.d.ts'] },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  { plugins: { '@next/next': nextPlugin } },
  {
    files: ['**/*.{ts,tsx}'],
    settings: { next: { rootDir: new URL('./', import.meta.url).pathname } },
    rules: nextRules,
  },
  { rules: { '@typescript-eslint/no-explicit-any': 'error' } },
);

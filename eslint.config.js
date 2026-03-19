import tseslint from 'typescript-eslint';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import globals from 'globals';   // 👈 AGGIUNTO

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default [
  ...tseslint.configs.recommended,

  {
    ignores: [
      'index.ts',
      'eslint.config.js',
      'dist/**',
      'node_modules/**'
    ],

    languageOptions: {
      ecmaVersion: 2024,
      sourceType: 'module',

      parserOptions: {
        project: './tsconfig.json',
        tsconfigRootDir: __dirname
      },

      globals: {
        ...globals.node,
        console: 'readonly',
        process: 'readonly',
        Buffer: 'readonly'
      }
    },

    rules: {
      // Core rules
      'no-unused-vars': 'warn',
      'no-undef': 'off',
      'no-console': 'off',
      eqeqeq: 'error',
      curly: 'error',
      'no-shadow': 'warn',
      'no-constant-condition': 'warn',

      // TypeScript rules
      '@typescript-eslint/no-unused-vars': 'warn',
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/consistent-type-imports': 'error',
      '@typescript-eslint/no-misused-promises': 'error',
      '@typescript-eslint/no-floating-promises': 'error',
      '@typescript-eslint/ban-ts-comment': 'warn',
      '@typescript-eslint/no-non-null-assertion': 'off',

      // Style
      semi: ['error', 'always'],
      quotes: ['error', 'single'],
      indent: ['error', 2],
      'comma-dangle': ['error', 'never']
    }
  }
];
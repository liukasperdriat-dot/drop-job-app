import { defineConfig, globalIgnores } from 'eslint/config'
import nextVitals from 'eslint-config-next/core-web-vitals'
import nextTs from 'eslint-config-next/typescript'

export default defineConfig([
  ...nextVitals,
  ...nextTs,
  {
    rules: {
      // Les textes sont en français : les apostrophes s'affichent correctement,
      // les remplacer par &apos; n'apporterait rien.
      'react/no-unescaped-entities': 'off',
      // Données venant d'API externes non typées : signalé, sans bloquer.
      '@typescript-eslint/no-explicit-any': 'warn',
    },
  },
  globalIgnores(['.next/**', 'node_modules/**', 'next-env.d.ts', 'public/sw.js']),
])

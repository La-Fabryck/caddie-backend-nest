import { resolve } from 'node:path';
import swc from 'unplugin-swc';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  plugins: [
    swc.vite({
      // Nest docs: do not inherit .swcrc module settings (resolveFully is for nest build only)
      module: { type: 'es6' },
    }),
  ],
  resolve: {
    alias: {
      '@': resolve(import.meta.dirname, './src'),
      test: resolve(import.meta.dirname, './test'),
    },
  },
  test: {
    globals: true,
    root: './',
    setupFiles: ['./test/setup.ts'],
    include: ['**/*.e2e-spec.ts'],
  },
});

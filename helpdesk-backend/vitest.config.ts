import { defineConfig } from 'vitest/config';
import swc from 'unplugin-swc';

export default defineConfig({
  resolve: {
    tsconfigPaths: true,
  },
  test: {
    globals: true,
    root: './',
    environment: 'node',
    include: ['src/**/*.spec.ts'],
    exclude: ['**/*.e2e-spec.ts', 'node_modules'],
    pool: 'forks', // secure multithreading for docker container
  },
  plugins: [
    swc.vite({
      module: { type: 'es6' },
      jsc: {
        parser: {
          syntax: 'typescript',
          decorators: true,
        },
        transform: {
          legacyDecorator: true,
          decoratorMetadata: true,
        },
      },
    }),
  ],
});

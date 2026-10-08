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
    include: ['test/**/*.e2e-spec.ts', '**/*.e2e-spec.ts'],
    exclude: ['node_modules', 'dist'],
    pool: 'forks',
    fileParallelism: false,
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

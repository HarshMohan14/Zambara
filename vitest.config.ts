import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    css: false, // Disable CSS processing during tests
    exclude: ['**/node_modules/**', '**/dist/**', '**/.next/**', '**/.git/**']
  }
});

const { defineConfig } = require('vitest/config');
const react = require('@vitejs/plugin-react');

module.exports = defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: './src/__tests__/setupTests.js',
    include: ['src/__tests__/**/*.test.{js,jsx}'],
    exclude: ['node_modules'],
    testTimeout: 15000,
    hookTimeout: 15000,
    coverage: {
      provider: 'v8',
      reporter: ['text', 'text-summary', 'lcov'],
      exclude: [
        'src/__tests__/**',
        'src/index.js',
        'src/App.jsx',
        'src/assets/**',
        'src/data/**',
      ],
      thresholds: {
        lines: 50,
        functions: 45,
        branches: 40,
        statements: 50,
      },
    },
  },
  resolve: {
    alias: {
      '@': '/src',
    },
  },
});

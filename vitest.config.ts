import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    // Test environment
    environment: 'node',
    
    // Global setup
    globals: true,
    
    // Coverage configuration
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'dist/',
        '**/*.test.ts',
        '**/*.spec.ts',
        '**/types/**',
        '**/interfaces/**',
        'examples/**'
      ],
      thresholds: {
        lines: 80,
        functions: 80,
        branches: 75,
        statements: 80
      }
    },
    
    // Test file patterns
    include: ['tests/**/*.test.ts', 'tests/**/*.spec.ts'],
    
    // Timeout settings
    testTimeout: 10000,
    hookTimeout: 10000,
    
    // Reporters
    reporters: ['default', 'verbose']
  }
});

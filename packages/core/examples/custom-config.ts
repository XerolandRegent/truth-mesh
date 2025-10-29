/**
 * ==============================================================================
 * File Name: custom-config.ts
 * File Path: packages/core/examples/custom-config.ts
 * Description: Configuration examples for Truth Mesh
 * Date Created: 2025-10-29
 * Version: 1.0.0
 * ==============================================================================
 */

import { TruthMesh, MockIPFSStorage } from '../src';
import type { FactInput } from '../src';

/**
 * Configuration Examples
 * 
 * Demonstrates:
 * - Default configuration (in-memory)
 * - Mock storage with latency simulation
 * - Development mode configuration
 * - Production mode configuration
 * - Custom storage implementation
 */

/**
 * Example 1: Default Configuration (Quick Start)
 */
async function example1_Default() {
  console.log('=== Example 1: Default Configuration ===\n');

  // Simplest initialization - uses in-memory storage
  const mesh = new TruthMesh();
  await mesh.initialize();

  console.log('✓ Initialized with default config');
  console.log('  - Mode: development (in-memory)');
  console.log('  - Auto-pin: enabled');
  console.log('  - Timeout: 30 seconds\n');

  // Store a fact
  const keyPair = mesh.generateKeyPair();
  const fact: FactInput = {
    content: 'Default config example',
    source: 'Example'
  };

  const result = await mesh.storeFact(fact, keyPair.privateKey);
  console.log(`✓ Stored fact: ${result.cid.toString()}\n`);

  await mesh.shutdown();
}

/**
 * Example 2: Mock Storage with Latency Simulation
 */
async function example2_MockWithLatency() {
  console.log('=== Example 2: Mock Storage with Latency ===\n');

  // Create mock storage with 50ms latency
  const mockStorage = new MockIPFSStorage({ latency: 50 });

  const mesh = new TruthMesh({
    storage: mockStorage
  });

  await mesh.initialize();

  console.log('✓ Initialized with mock storage');
  console.log('  - Latency: 50ms per operation');
  console.log('  - Useful for testing network conditions\n');

  // Measure operation time
  const keyPair = mesh.generateKeyPair();
  const fact: FactInput = {
    content: 'Latency test fact',
    source: 'Example'
  };

  const start = Date.now();
  await mesh.storeFact(fact, keyPair.privateKey);
  const duration = Date.now() - start;

  console.log(`✓ Store operation took ${duration}ms`);
  console.log(`  Expected: >150ms (3 operations × 50ms)\n`);

  await mesh.shutdown();
}

/**
 * Example 3: Development Mode (Explicit)
 */
async function example3_Development() {
  console.log('=== Example 3: Development Mode ===\n');

  const mesh = new TruthMesh({
    ipfs: {
      mode: 'development'
    },
    autoPin: true,
    timeout: 30000
  });

  await mesh.initialize();

  console.log('✓ Initialized in development mode');
  console.log('  - Fast in-memory storage');
  console.log('  - No persistence');
  console.log('  - Perfect for testing\n');

  const keyPair = mesh.generateKeyPair();
  const fact: FactInput = {
    content: 'Development mode fact',
    source: 'Example'
  };

  const result = await mesh.storeFact(fact, keyPair.privateKey);
  console.log(`✓ Stored: ${result.cid.toString()}\n`);

  await mesh.shutdown();
}

/**
 * Example 4: Production Mode (File System Storage)
 */
async function example4_Production() {
  console.log('=== Example 4: Production Mode ===\n');

  // Note: This example shows the configuration
  // Actual file system storage requires blockstore-fs and datastore-fs packages
  console.log('Production configuration example:');
  console.log(`
  const mesh = new TruthMesh({
    ipfs: {
      mode: 'production',
      storage: '/var/lib/truth-mesh',
      bootstrap: [
        '/dns4/ipfs.infura.io/tcp/5001/https',
        '/dns4/node0.example.com/tcp/4001/p2p/QmYourNodeID'
      ]
    },
    autoPin: true,
    timeout: 60000
  });
  `);

  console.log('Features:');
  console.log('  - Persistent file system storage');
  console.log('  - Custom bootstrap nodes');
  console.log('  - Longer timeout for network operations');
  console.log('  - Suitable for production deployments\n');
}

/**
 * Example 5: Test Mode (No Auto-Pin)
 */
async function example5_TestMode() {
  console.log('=== Example 5: Test Mode (No Auto-Pin) ===\n');

  const mockStorage = new MockIPFSStorage();

  const mesh = new TruthMesh({
    storage: mockStorage,
    autoPin: false // Disable auto-pinning for tests
  });

  await mesh.initialize();

  console.log('✓ Initialized in test mode');
  console.log('  - Auto-pin disabled');
  console.log('  - Faster test execution\n');

  const keyPair = mesh.generateKeyPair();
  const fact: FactInput = {
    content: 'Test fact',
    source: 'Test'
  };

  const result = await mesh.storeFact(fact, keyPair.privateKey);
  
  console.log(`✓ Stored: ${result.cid.toString()}`);
  console.log(`  Pinned: ${mockStorage.isPinned(result.cid)}\n`);

  await mesh.shutdown();
}

/**
 * Example 6: Custom Timeout Configuration
 */
async function example6_CustomTimeout() {
  console.log('=== Example 6: Custom Timeout ===\n');

  const mesh = new TruthMesh({
    timeout: 5000 // 5 second timeout
  });

  await mesh.initialize();

  console.log('✓ Initialized with custom timeout');
  console.log('  - Timeout: 5 seconds');
  console.log('  - Useful for time-sensitive applications\n');

  await mesh.shutdown();
}

/**
 * Run all examples
 */
async function runAllExamples() {
  console.log('╔════════════════════════════════════════╗');
  console.log('║  Truth Mesh Configuration Examples    ║');
  console.log('╚════════════════════════════════════════╝\n');

  try {
    await example1_Default();
    console.log('─'.repeat(50) + '\n');

    await example2_MockWithLatency();
    console.log('─'.repeat(50) + '\n');

    await example3_Development();
    console.log('─'.repeat(50) + '\n');

    await example4_Production();
    console.log('─'.repeat(50) + '\n');

    await example5_TestMode();
    console.log('─'.repeat(50) + '\n');

    await example6_CustomTimeout();
    console.log('─'.repeat(50) + '\n');

    console.log('✓ All configuration examples completed successfully');

  } catch (error) {
    console.error('Error running examples:', error);
    throw error;
  }
}

// Run all examples
runAllExamples();
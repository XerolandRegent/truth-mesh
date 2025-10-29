/**
 * ==============================================================================
 * File Name: basic-usage.ts
 * File Path: packages/core/examples/basic-usage.ts
 * Description: Basic usage example for Truth Mesh
 * Date Created: 2025-10-29
 * Version: 1.0.0
 * ==============================================================================
 */

import { TruthMesh } from '../src';
import type { FactInput } from '../src';

/**
 * Basic Truth Mesh Usage Example
 * 
 * Demonstrates:
 * - Initialization
 * - Key generation
 * - Storing a fact
 * - Retrieving a fact
 * - Verifying a fact
 */
async function basicUsage() {
  console.log('=== Truth Mesh Basic Usage ===\n');

  // 1. Initialize Truth Mesh (uses in-memory storage by default)
  console.log('1. Initializing Truth Mesh...');
  const mesh = new TruthMesh();
  await mesh.initialize();
  console.log('✓ Initialized\n');

  // 2. Generate a key pair for signing
  console.log('2. Generating key pair...');
  const keyPair = mesh.generateKeyPair();
  console.log('✓ Key pair generated');
  console.log(`   Public key length: ${keyPair.publicKey.length} bytes`);
  console.log(`   Private key length: ${keyPair.privateKey.length} bytes\n`);

  // 3. Create and store a fact
  console.log('3. Storing a fact...');
  const factInput: FactInput = {
    content: 'The Earth orbits the Sun',
    source: 'Galileo Galilei',
    metadata: {
      category: 'astronomy',
      tags: ['solar system', 'planetary motion'],
      language: 'en'
    }
  };

  const stored = await mesh.storeFact(factInput, keyPair);
  console.log('✓ Fact stored successfully');
  console.log(`   CID: ${stored.cid.toString()}`);
  console.log(`   Signature: ${stored.signature.substring(0, 32)}...`);
  console.log(`   Root: ${stored.root.toString()}`);
  console.log(`   Proof length: ${stored.proof.length} CIDs\n`);

  // 4. Retrieve the stored fact
  console.log('4. Retrieving fact...');
  const retrieved = await mesh.retrieveFact(stored.cid);
  console.log('✓ Fact retrieved successfully');
  console.log(`   Content: "${retrieved.content}"`);
  console.log(`   Source: ${retrieved.source}`);
  console.log(`   Timestamp: ${new Date(retrieved.timestamp).toISOString()}`);
  console.log(`   Category: ${retrieved.metadata?.category}\n`);

  // 5. Verify the fact
  console.log('5. Verifying fact...');
  const verification = await mesh.verifyFact({
    cid: stored.cid,
    signature: stored.signature,
    proof: stored.proof,
    root: stored.root
  });

  console.log('✓ Verification complete');
  console.log(`   Valid: ${verification.valid}`);
  console.log('   Checks:');
  verification.checks.forEach(check => {
    console.log(`     - ${check.name}: ${check.passed ? '✓' : '✗'} ${check.message}`);
  });

  // 6. Cleanup
  console.log('\n6. Shutting down...');
  await mesh.shutdown();
  console.log('✓ Shutdown complete\n');

  console.log('=== Example Complete ===');
}

// Run the example
basicUsage().catch(error => {
  console.error('Error:', error);
  throw error;
});
/**
 * ==============================================================================
 * File Name: batch-operations.ts
 * File Path: packages/core/examples/batch-operations.ts
 * Description: Batch operations example for Truth Mesh
 * Date Created: 2025-10-29
 * Version: 1.0.0
 * ==============================================================================
 */

import { TruthMesh } from '../src';
import type { FactInput } from '../src';

/**
 * Batch Operations Example
 * 
 * Demonstrates:
 * - Storing multiple facts in a batch
 * - Single Merkle tree for all facts
 * - Batch verification
 * - Performance benefits of batching
 */
async function batchOperations() {
  console.log('=== Truth Mesh Batch Operations ===\n');

  // Initialize
  const mesh = new TruthMesh();
  await mesh.initialize();
  const keyPair = mesh.generateKeyPair();

  // Prepare multiple facts
  const facts: FactInput[] = [
    {
      content: 'Water boils at 100°C at sea level',
      source: 'Physics Textbook',
      metadata: { category: 'science', tags: ['physics', 'thermodynamics'] }
    },
    {
      content: 'The speed of light is approximately 299,792,458 m/s',
      source: 'Albert Einstein',
      metadata: { category: 'science', tags: ['physics', 'relativity'] }
    },
    {
      content: 'Mitochondria are the powerhouse of the cell',
      source: 'Biology Textbook',
      metadata: { category: 'science', tags: ['biology', 'cellular'] }
    },
    {
      content: 'The circumference of Earth is approximately 40,075 km',
      source: 'Geography Reference',
      metadata: { category: 'geography', tags: ['earth', 'measurements'] }
    },
    {
      content: 'DNA consists of four nucleotide bases: A, T, G, C',
      source: 'Molecular Biology',
      metadata: { category: 'science', tags: ['biology', 'genetics'] }
    }
  ];

  console.log(`Prepared ${facts.length} facts for batch storage\n`);

  // 1. Store facts individually (for comparison)
  console.log('1. Storing facts individually...');
  const startIndividual = Date.now();
  const individualResults = [];
  
  for (const fact of facts) {
    const result = await mesh.storeFact(fact, keyPair);
    individualResults.push(result);
  }
  
  const durationIndividual = Date.now() - startIndividual;
  console.log(`✓ Individual storage completed in ${durationIndividual}ms`);
  console.log(`   Average per fact: ${(durationIndividual / facts.length).toFixed(2)}ms\n`);

  // 2. Store facts in batch
  console.log('2. Storing facts in batch...');
  const startBatch = Date.now();
  const batchResults = await mesh.storeFactBatch(facts, keyPair);
  const durationBatch = Date.now() - startBatch;
  
  console.log(`✓ Batch storage completed in ${durationBatch}ms`);
  console.log(`   Average per fact: ${(durationBatch / facts.length).toFixed(2)}ms`);
  console.log(`   Performance improvement: ${((durationIndividual / durationBatch - 1) * 100).toFixed(1)}% faster\n`);

  // 3. Verify all facts share the same Merkle root
  console.log('3. Verifying shared Merkle root...');
  const rootCIDs = new Set(batchResults.map(r => r.root.toString()));
  console.log(`✓ All ${facts.length} facts share the same Merkle root`);
  console.log(`   Unique roots: ${rootCIDs.size} (should be 1)`);
  console.log(`   Root CID: ${batchResults[0]!.root.toString()}\n`);

  // 4. Verify all facts in batch
  console.log('4. Batch verification...');
  const startVerify = Date.now();
  const verificationResults = await mesh.verifyFactBatch(
    batchResults.map(r => ({
      cid: r.cid,
      signature: r.signature,
      proof: r.proof,
      root: r.root
    }))
  );
  const durationVerify = Date.now() - startVerify;

  const allValid = verificationResults.every(r => r.valid);
  console.log(`✓ Batch verification completed in ${durationVerify}ms`);
  console.log(`   All facts valid: ${allValid}`);
  console.log(`   Average per fact: ${(durationVerify / facts.length).toFixed(2)}ms\n`);

  // 5. Display verification details
  console.log('5. Verification details:');
  verificationResults.forEach((result, index) => {
    const fact = result.fact as { content: string };
    console.log(`\n   Fact ${index + 1}: "${fact.content.substring(0, 40)}..."`);
    console.log(`   Valid: ${result.valid}`);
    result.checks.forEach(check => {
      console.log(`     - ${check.name}: ${check.passed ? '✓' : '✗'}`);
    });
  });

  // 6. Retrieve and display sample facts
  console.log('\n6. Sample retrieval:');
  const sample = batchResults[2]!; // Retrieve third fact
  const retrieved = await mesh.retrieveFact(sample.cid);
  console.log(`   Content: "${retrieved.content}"`);
  console.log(`   Source: ${retrieved.source}`);
  console.log(`   Category: ${retrieved.metadata?.category}`);
  console.log(`   Tags: ${retrieved.metadata?.tags?.join(', ')}`);

  // Cleanup
  console.log('\n7. Cleanup...');
  await mesh.shutdown();
  console.log('✓ Complete\n');

  // Summary
  console.log('=== Performance Summary ===');
  console.log(`Individual storage: ${durationIndividual}ms`);
  console.log(`Batch storage: ${durationBatch}ms`);
  console.log(`Batch verification: ${durationVerify}ms`);
  console.log(`\nBatch storage is ${((durationIndividual / durationBatch - 1) * 100).toFixed(1)}% faster`);
  console.log('All facts share a single Merkle tree for efficient verification');
}

// Run the example
batchOperations().catch(error => {
  console.error('Error:', error);
  throw error;
});
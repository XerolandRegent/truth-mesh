/**
 * ==============================================================================
 * File Name: integration.test.ts
 * File Path: packages/core/tests/integration.test.ts
 * Description: Integration tests for complete Truth Mesh system
 * Date Created: 2025-10-29
 * Version: 1.0.0
 * ==============================================================================
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { TruthMesh } from '../src/truth-mesh';
import { MockIPFSStorage } from '../src/ipfs/mock-storage';
import type { FactInput, StorageResult } from '../src/types';

describe('TruthMesh Integration', () => {
  let mesh: TruthMesh;
  let mockStorage: MockIPFSStorage;
  let keyPair: { publicKey: Uint8Array; privateKey: Uint8Array };

  beforeEach(async () => {
    mockStorage = new MockIPFSStorage({ latency: 5 });
    
    mesh = new TruthMesh({
      storage: mockStorage
    });
    
    await mesh.initialize();
    
    // Generate key pair for testing
    keyPair = mesh.generateKeyPair();
  });

  afterEach(async () => {
    await mesh.shutdown();
  });

  describe('Lifecycle', () => {
    it('should initialize successfully', async () => {
      const newMesh = new TruthMesh({
        storage: new MockIPFSStorage()
      });
      
      await expect(newMesh.initialize()).resolves.not.toThrow();
      await newMesh.shutdown();
    });

    it('should handle multiple initialization calls', async () => {
      await mesh.initialize();
      await mesh.initialize(); // Should not throw
    });

    it('should shutdown gracefully', async () => {
      await mesh.shutdown();
      
      // Operations after shutdown should throw
      await expect(
        mesh.storeFact({ content: 'test', source: 'test' }, keyPair)
      ).rejects.toThrow();
    });
  });

  describe('Key Generation', () => {
    it('should generate valid key pairs', () => {
      const keyPair = mesh.generateKeyPair();

      expect(keyPair.publicKey).toBeInstanceOf(Uint8Array);
      expect(keyPair.privateKey).toBeInstanceOf(Uint8Array);
      expect(keyPair.publicKey.length).toBeGreaterThan(0);
      expect(keyPair.privateKey.length).toBeGreaterThan(0);
    });
  });

  describe('Fact Storage', () => {
    it('should store a simple fact', async () => {
      const factInput: FactInput = {
        content: 'The Earth orbits the Sun',
        source: 'Galileo Galilei'
      };
      
      const result = await mesh.storeFact(factInput, keyPair);

      expect(result.cid).toBeDefined();
      expect(result.signature).toBeTruthy();
      expect(result.proof).toBeDefined();
      expect(result.root).toBeDefined();
    });

    it('should store fact with metadata', async () => {
      const factInput: FactInput = {
        content: 'Water freezes at 0°C',
        source: 'Physics textbook',
        metadata: {
          category: 'science',
          tags: ['physics', 'temperature'],
          language: 'en'
        }
      };
      
      const result = await mesh.storeFact(factInput, keyPair);
      const retrieved = await mesh.retrieveFact(result.cid);

      expect(retrieved.metadata?.category).toBe('science');
      expect(retrieved.metadata?.tags).toContain('physics');
    });

    it('should store fact with custom timestamp', async () => {
      const customTimestamp = Date.now() - 86400000; // Yesterday
      const factInput: FactInput = {
        content: 'Historical fact',
        source: 'Archive',
        timestamp: customTimestamp
      };
      
      const result = await mesh.storeFact(factInput, keyPair);
      const retrieved = await mesh.retrieveFact(result.cid);

      expect(retrieved.timestamp).toBe(customTimestamp);
    });

    it('should auto-pin stored facts by default', async () => {
      const factInput: FactInput = {
        content: 'Test fact',
        source: 'Test'
      };
      
      const result = await mesh.storeFact(factInput, keyPair);

      expect(mockStorage.isPinned(result.cid)).toBe(true);
    });
  });

  describe('Batch Storage', () => {
    it('should store multiple facts in batch', async () => {
      const factInputs: FactInput[] = [
        { content: 'Fact 1', source: 'Source 1' },
        { content: 'Fact 2', source: 'Source 2' },
        { content: 'Fact 3', source: 'Source 3' }
      ];
      
      const results = await mesh.storeFactBatch(factInputs, keyPair);

      expect(results).toHaveLength(3);
      results.forEach(result => {
        expect(result.cid).toBeDefined();
        expect(result.signature).toBeTruthy();
        expect(result.proof).toBeDefined();
      });
    });

    it('should create single merkle tree for batch', async () => {
      const factInputs: FactInput[] = [
        { content: 'Fact 1', source: 'Source 1' },
        { content: 'Fact 2', source: 'Source 2' }
      ];
      
      const results = await mesh.storeFactBatch(factInputs, keyPair);

      // All facts should share same root
      expect(results[0]!.root.toString()).toBe(results[1]!.root.toString());
    });
  });

  describe('Fact Retrieval', () => {
    it('should retrieve stored fact', async () => {
      const factInput: FactInput = {
        content: 'Retrievable fact',
        source: 'Test source'
      };
      
      const result = await mesh.storeFact(factInput, keyPair);
      const retrieved = await mesh.retrieveFact(result.cid);

      expect(retrieved.content).toBe(factInput.content);
      expect(retrieved.source).toBe(factInput.source);
    });

    it('should throw error for non-existent fact', async () => {
      const fakeCID = await mockStorage.store('fake');
      mockStorage.clear();

      await expect(mesh.retrieveFact(fakeCID)).rejects.toThrow();
    });
  });

  describe('Fact Verification', () => {
    it('should verify valid fact', async () => {
      const factInput: FactInput = {
        content: 'Verifiable fact',
        source: 'Test'
      };
      
      const stored = await mesh.storeFact(factInput, keyPair);
      
      const verificationResult = await mesh.verifyFact({
        cid: stored.cid,
        signature: stored.signature,
        proof: stored.proof,
        root: stored.root
      });

      expect(verificationResult.valid).toBe(true);
      expect(verificationResult.checks).toHaveLength(3); // retrieval, signature, merkle
      expect(verificationResult.checks.every(c => c.passed)).toBe(true);
    });

    it('should reject fact with invalid signature', async () => {
      const factInput: FactInput = {
        content: 'Test fact',
        source: 'Test'
      };
      
      const stored = await mesh.storeFact(factInput, keyPair);
      
      // Tamper with signature
      const verificationResult = await mesh.verifyFact({
        cid: stored.cid,
        signature: 'invalid-signature',
        proof: stored.proof,
        root: stored.root
      });

      expect(verificationResult.valid).toBe(false);
    });

    it('should reject fact with invalid proof', async () => {
      // Create a batch with multiple facts so proofs are non-empty and different
      const factInputs: FactInput[] = [
        { content: 'Fact 1', source: 'Test' },
        { content: 'Fact 2', source: 'Test' },
        { content: 'Fact 3', source: 'Test' }
      ];
      
      const results = await mesh.storeFactBatch(factInputs, keyPair);
      
      // Use proof from fact 2 to verify fact 1 (wrong proof, same tree)
      const verificationResult = await mesh.verifyFact({
        cid: results[0]!.cid,
        signature: results[0]!.signature,
        proof: results[1]!.proof, // Wrong proof - belongs to different fact
        root: results[0]!.root
      });

      expect(verificationResult.valid).toBe(false);
    });
  });

  describe('Batch Verification', () => {
    it('should verify multiple facts in batch', async () => {
      const factInputs: FactInput[] = [
        { content: 'Fact 1', source: 'Source 1' },
        { content: 'Fact 2', source: 'Source 2' }
      ];
      
      const stored = await mesh.storeFactBatch(factInputs, keyPair);
      
      const verificationResults = await mesh.verifyFactBatch(
        stored.map(s => ({
          cid: s.cid,
          signature: s.signature,
          proof: s.proof,
          root: s.root
        }))
      );

      expect(verificationResults).toHaveLength(2);
      verificationResults.forEach(result => {
        expect(result.valid).toBe(true);
      });
    });
  });

  describe('Utility Operations', () => {
    it('should check if fact exists', async () => {
      const factInput: FactInput = {
        content: 'Existing fact',
        source: 'Test'
      };
      
      const stored = await mesh.storeFact(factInput, keyPair);
      
      const exists = await mesh.hasFact(stored.cid);

      expect(exists).toBe(true);
    });

    it('should pin and unpin facts', async () => {
      const factInput: FactInput = {
        content: 'Pinnable fact',
        source: 'Test'
      };
      
      const stored = await mesh.storeFact(factInput, keyPair);
      
      // Already pinned by default
      expect(mockStorage.isPinned(stored.cid)).toBe(true);
      
      await mesh.unpinFact(stored.cid);
      expect(mockStorage.isPinned(stored.cid)).toBe(false);
      
      await mesh.pinFact(stored.cid);
      expect(mockStorage.isPinned(stored.cid)).toBe(true);
    });
  });

  describe('End-to-End Flow', () => {
    it('should complete full storage and verification cycle', async () => {
      // 1. Generate key pair
      const keyPair = mesh.generateKeyPair();
      
      // 2. Create fact
      const factInput: FactInput = {
        content: 'Complete integration test',
        source: 'Test suite',
        metadata: {
          category: 'test',
          tags: ['integration', 'e2e']
        }
      };
      
      // 3. Store fact
      const stored = await mesh.storeFact(factInput, keyPair);
      
      // 4. Verify storage
      expect(await mesh.hasFact(stored.cid)).toBe(true);
      
      // 5. Retrieve fact
      const retrieved = await mesh.retrieveFact(stored.cid);
      expect(retrieved.content).toBe(factInput.content);
      
      // 6. Verify fact
      const verification = await mesh.verifyFact({
        cid: stored.cid,
        signature: stored.signature,
        proof: stored.proof,
        root: stored.root
      });
      
      expect(verification.valid).toBe(true);
      expect(verification.checks.every(c => c.passed)).toBe(true);
    });
  });

  describe('Configuration Options', () => {
    it('should respect autoPin=false setting', async () => {
      const noPinMesh = new TruthMesh({
        storage: mockStorage,
        autoPin: false
      });
      
      await noPinMesh.initialize();
      
      const keyPair = noPinMesh.generateKeyPair();
      const factInput: FactInput = {
        content: 'Unpinned fact',
        source: 'Test'
      };
      
      const stored = await noPinMesh.storeFact(factInput, keyPair);
      
      expect(mockStorage.isPinned(stored.cid)).toBe(false);
      
      await noPinMesh.shutdown();
    });
  });
});
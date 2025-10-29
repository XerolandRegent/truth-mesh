/**
 * ==============================================================================
 * File Name: merkle.test.ts
 * File Path: packages/core/tests/merkle.test.ts
 * Description: Unit tests for Merkle tree operations
 * Date Created: 2025-10-29
 * Version: 1.0.0
 * ==============================================================================
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { MerkleTree } from '../src/merkle/tree';
import { MockIPFSStorage } from '../src/ipfs/mock-storage';
import { SignatureService } from '../src/crypto/signatures';
import type { CID } from 'multiformats/cid';

describe('MerkleTree', () => {
  let storage: MockIPFSStorage;
  let crypto: SignatureService;
  let merkle: MerkleTree;

  beforeEach(async () => {
    storage = new MockIPFSStorage();
    await storage.initialize();
    
    crypto = new SignatureService();
    merkle = new MerkleTree(storage, crypto);
  });

  afterEach(async () => {
    await storage.shutdown();
  });

  describe('Tree Building', () => {
    it('should build tree from single fact', async () => {
      const factCID = await storage.store('Single fact');
      
      const rootCID = await merkle.buildFromFacts([factCID]);

      expect(rootCID).toBeDefined();
      expect(rootCID.toString()).toBeTruthy();
    });

    it('should build tree from multiple facts', async () => {
      const factCIDs: CID[] = [];
      for (let i = 0; i < 4; i++) {
        const cid = await storage.store(`Fact ${i}`);
        factCIDs.push(cid);
      }
      
      const rootCID = await merkle.buildFromFacts(factCIDs);

      expect(rootCID).toBeDefined();
    });

    it('should build tree from odd number of facts', async () => {
      const factCIDs: CID[] = [];
      for (let i = 0; i < 3; i++) {
        const cid = await storage.store(`Fact ${i}`);
        factCIDs.push(cid);
      }
      
      const rootCID = await merkle.buildFromFacts(factCIDs);

      expect(rootCID).toBeDefined();
    });

    it('should throw error for empty fact list', async () => {
      await expect(merkle.buildFromFacts([])).rejects.toThrow('empty fact list');
    });

    it('should produce deterministic roots for same facts', async () => {
      const factCIDs: CID[] = [];
      for (let i = 0; i < 4; i++) {
        const cid = await storage.store(`Fact ${i}`);
        factCIDs.push(cid);
      }
      
      const rootCID1 = await merkle.buildFromFacts(factCIDs);
      
      // Clear storage and rebuild
      storage.clear();
      await storage.initialize();
      const factCIDs2: CID[] = [];
      for (let i = 0; i < 4; i++) {
        const cid = await storage.store(`Fact ${i}`);
        factCIDs2.push(cid);
      }
      
      const rootCID2 = await merkle.buildFromFacts(factCIDs2);

      expect(rootCID1.toString()).toBe(rootCID2.toString());
    });
  });

  describe('Proof Generation', () => {
    it('should generate proof for single fact tree', async () => {
      const factCID = await storage.store('Single fact');
      const rootCID = await merkle.buildFromFacts([factCID]);
      
      const proof = await merkle.generateProof(rootCID, factCID);

      expect(proof).toBeDefined();
      expect(Array.isArray(proof)).toBe(true);
    });

    it('should generate proof for fact in multi-fact tree', async () => {
      const factCIDs: CID[] = [];
      for (let i = 0; i < 4; i++) {
        const cid = await storage.store(`Fact ${i}`);
        factCIDs.push(cid);
      }
      
      const rootCID = await merkle.buildFromFacts(factCIDs);
      const proof = await merkle.generateProof(rootCID, factCIDs[2]!);

      expect(proof).toBeDefined();
      expect(proof.length).toBeGreaterThan(0);
    });

    it('should generate proofs for all facts in tree', async () => {
      const factCIDs: CID[] = [];
      for (let i = 0; i < 4; i++) {
        const cid = await storage.store(`Fact ${i}`);
        factCIDs.push(cid);
      }
      
      const rootCID = await merkle.buildFromFacts(factCIDs);

      for (const factCID of factCIDs) {
        const proof = await merkle.generateProof(rootCID, factCID);
        expect(proof).toBeDefined();
      }
    });

    it('should throw error for non-existent fact', async () => {
      const factCIDs: CID[] = [];
      for (let i = 0; i < 4; i++) {
        const cid = await storage.store(`Fact ${i}`);
        factCIDs.push(cid);
      }
      
      const rootCID = await merkle.buildFromFacts(factCIDs);
      const nonExistentCID = await storage.store('Not in tree');

      await expect(
        merkle.generateProof(rootCID, nonExistentCID)
      ).rejects.toThrow('not found in tree');
    });
  });

  describe('Proof Verification', () => {
    it('should verify valid proof', async () => {
      const factCIDs: CID[] = [];
      for (let i = 0; i < 4; i++) {
        const cid = await storage.store(`Fact ${i}`);
        factCIDs.push(cid);
      }
      
      const rootCID = await merkle.buildFromFacts(factCIDs);
      const proof = await merkle.generateProof(rootCID, factCIDs[1]!);
      
      const isValid = await merkle.verifyProof(rootCID, factCIDs[1]!, proof);

      expect(isValid).toBe(true);
    });

    it('should verify proofs for all facts', async () => {
      const factCIDs: CID[] = [];
      for (let i = 0; i < 4; i++) {
        const cid = await storage.store(`Fact ${i}`);
        factCIDs.push(cid);
      }
      
      const rootCID = await merkle.buildFromFacts(factCIDs);

      for (const factCID of factCIDs) {
        const proof = await merkle.generateProof(rootCID, factCID);
        const isValid = await merkle.verifyProof(rootCID, factCID, proof);
        expect(isValid).toBe(true);
      }
    });

    it('should reject invalid proof', async () => {
      const factCIDs: CID[] = [];
      for (let i = 0; i < 4; i++) {
        const cid = await storage.store(`Fact ${i}`);
        factCIDs.push(cid);
      }
      
      const rootCID = await merkle.buildFromFacts(factCIDs);
      const wrongFactCID = await storage.store('Wrong fact');
      const proof = await merkle.generateProof(rootCID, factCIDs[0]!);
      
      const isValid = await merkle.verifyProof(rootCID, wrongFactCID, proof);

      expect(isValid).toBe(false);
    });

    it('should reject proof with wrong root', async () => {
      const factCIDs: CID[] = [];
      for (let i = 0; i < 4; i++) {
        const cid = await storage.store(`Fact ${i}`);
        factCIDs.push(cid);
      }
      
      const rootCID = await merkle.buildFromFacts(factCIDs);
      const proof = await merkle.generateProof(rootCID, factCIDs[0]!);
      
      // Create different tree for wrong root
      const wrongFactCIDs: CID[] = [];
      for (let i = 0; i < 4; i++) {
        const cid = await storage.store(`Different ${i}`);
        wrongFactCIDs.push(cid);
      }
      const wrongRootCID = await merkle.buildFromFacts(wrongFactCIDs);
      
      const isValid = await merkle.verifyProof(wrongRootCID, factCIDs[0]!, proof);

      expect(isValid).toBe(false);
    });
  });

  describe('Node Operations', () => {
    it('should store and load merkle nodes', async () => {
      const factCID = await storage.store('Test fact');
      
      const node = {
        hash: crypto.hashCID(factCID),
        data: factCID,
        isLeaf: true
      };
      
      const nodeCID = await merkle.storeNode(node);
      const loadedNode = await merkle.loadNode(nodeCID);

      expect(loadedNode.hash).toBe(node.hash);
      expect(loadedNode.isLeaf).toBe(true);
      expect(loadedNode.data?.toString()).toBe(factCID.toString());
    });

    it('should get node hash', async () => {
      const factCID = await storage.store('Test fact');
      
      const node = {
        hash: crypto.hashCID(factCID),
        data: factCID,
        isLeaf: true
      };
      
      const nodeCID = await merkle.storeNode(node);
      const hash = await merkle.getNodeHash(nodeCID);

      expect(hash).toBe(node.hash);
    });
  });

  describe('Large Trees', () => {
    it('should handle large tree with many facts', async () => {
      const factCIDs: CID[] = [];
      for (let i = 0; i < 100; i++) {
        const cid = await storage.store(`Fact ${i}`);
        factCIDs.push(cid);
      }
      
      const rootCID = await merkle.buildFromFacts(factCIDs);
      
      // Verify random samples
      const samplesToVerify = [0, 25, 50, 75, 99];
      for (const index of samplesToVerify) {
        const factCID = factCIDs[index]!;
        const proof = await merkle.generateProof(rootCID, factCID);
        const isValid = await merkle.verifyProof(rootCID, factCID, proof);
        expect(isValid).toBe(true);
      }
    }, 10000); // 10 second timeout for large tree test
  });
});

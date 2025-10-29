/**
 * ==============================================================================
 * File Name: storage.test.ts
 * File Path: packages/core/tests/storage.test.ts
 * Description: Unit tests for IPFS storage operations
 * Date Created: 2025-10-29
 * Version: 1.0.0
 * ==============================================================================
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { MockIPFSStorage } from '../src/ipfs/mock-storage';
import { CID } from 'multiformats/cid';

describe('MockIPFSStorage', () => {
  let storage: MockIPFSStorage;

  beforeEach(async () => {
    storage = new MockIPFSStorage();
    await storage.initialize();
  });

  afterEach(async () => {
    await storage.shutdown();
  });

  describe('Initialization', () => {
    it('should initialize successfully', async () => {
      const newStorage = new MockIPFSStorage();
      await expect(newStorage.initialize()).resolves.not.toThrow();
      await newStorage.shutdown();
    });

    it('should handle multiple initialization calls', async () => {
      await storage.initialize();
      await storage.initialize(); // Should not throw
      expect(storage.getStorageSize()).toBe(0);
    });
  });

  describe('Store Operations', () => {
    it('should store string data', async () => {
      const data = 'Hello, IPFS!';
      const cid = await storage.store(data);

      expect(cid).toBeInstanceOf(CID);
      expect(storage.getStorageSize()).toBe(1);
    });

    it('should store binary data', async () => {
      const data = new Uint8Array([1, 2, 3, 4, 5]);
      const cid = await storage.store(data);

      expect(cid).toBeInstanceOf(CID);
      expect(storage.getStorageSize()).toBe(1);
    });

    it('should generate deterministic CIDs for same data', async () => {
      const data = 'Deterministic data';
      
      const cid1 = await storage.store(data);
      const cid2 = await storage.store(data);

      expect(cid1.toString()).toBe(cid2.toString());
    });

    it('should generate different CIDs for different data', async () => {
      const cid1 = await storage.store('data1');
      const cid2 = await storage.store('data2');

      expect(cid1.toString()).not.toBe(cid2.toString());
    });
  });

  describe('Retrieve Operations', () => {
    it('should retrieve stored string data', async () => {
      const originalData = 'Test data';
      const cid = await storage.store(originalData);
      
      const retrievedData = await storage.retrieve(cid);

      expect(retrievedData).toBe(originalData);
    });

    it('should retrieve stored binary data', async () => {
      const originalData = new Uint8Array([1, 2, 3, 4, 5]);
      const cid = await storage.store(originalData);
      
      const retrievedData = await storage.retrieve(cid);
      const retrievedBytes = new TextEncoder().encode(retrievedData);

      expect(retrievedBytes).toEqual(originalData);
    });

    it('should throw error for non-existent CID', async () => {
      const fakeCID = await storage.store('temp');
      storage.clear();

      await expect(storage.retrieve(fakeCID)).rejects.toThrow('Content not found');
    });
  });

  describe('Pin Operations', () => {
    it('should pin content', async () => {
      const cid = await storage.store('Pinned data');
      
      await storage.pin(cid);

      expect(storage.isPinned(cid)).toBe(true);
    });

    it('should unpin content', async () => {
      const cid = await storage.store('Unpinned data');
      
      await storage.pin(cid);
      expect(storage.isPinned(cid)).toBe(true);
      
      await storage.unpin(cid);
      expect(storage.isPinned(cid)).toBe(false);
    });

    it('should track multiple pinned items', async () => {
      const cid1 = await storage.store('data1');
      const cid2 = await storage.store('data2');
      
      await storage.pin(cid1);
      await storage.pin(cid2);

      expect(storage.isPinned(cid1)).toBe(true);
      expect(storage.isPinned(cid2)).toBe(true);
      expect(storage.getAllPinnedCIDs()).toHaveLength(2);
    });
  });

  describe('Has Operations', () => {
    it('should return true for existing content', async () => {
      const cid = await storage.store('Existing data');
      
      const exists = await storage.has(cid);

      expect(exists).toBe(true);
    });

    it('should return false for non-existent content', async () => {
      const cid = await storage.store('temp');
      storage.clear();

      const exists = await storage.has(cid);

      expect(exists).toBe(false);
    });
  });

  describe('Test Helpers', () => {
    it('should clear all storage', async () => {
      await storage.store('data1');
      await storage.store('data2');
      expect(storage.getStorageSize()).toBe(2);
      
      storage.clear();

      expect(storage.getStorageSize()).toBe(0);
    });

    it('should report correct storage size', async () => {
      expect(storage.getStorageSize()).toBe(0);
      
      await storage.store('data1');
      expect(storage.getStorageSize()).toBe(1);
      
      await storage.store('data2');
      expect(storage.getStorageSize()).toBe(2);
    });

    it('should list all CIDs', async () => {
      const cid1 = await storage.store('data1');
      const cid2 = await storage.store('data2');
      
      const allCIDs = storage.getAllCIDs();

      expect(allCIDs).toHaveLength(2);
      expect(allCIDs).toContain(cid1.toString());
      expect(allCIDs).toContain(cid2.toString());
    });
  });

  describe('Latency Simulation', () => {
    it('should simulate network latency', async () => {
      const latencyStorage = new MockIPFSStorage({ latency: 50 });
      await latencyStorage.initialize();

      const start = Date.now();
      await latencyStorage.store('test data');
      const duration = Date.now() - start;

      expect(duration).toBeGreaterThanOrEqual(50);
      
      await latencyStorage.shutdown();
    });

    it('should work without latency by default', async () => {
      const start = Date.now();
      await storage.store('test data');
      const duration = Date.now() - start;

      expect(duration).toBeLessThan(50); // Should be very fast
    });
  });

  describe('Error Handling', () => {
    it('should throw if not initialized', async () => {
      const uninitStorage = new MockIPFSStorage();

      await expect(uninitStorage.store('data')).rejects.toThrow('not initialized');
    });

    it('should handle shutdown gracefully', async () => {
      await storage.store('data');
      
      await storage.shutdown();
      
      await expect(storage.store('more data')).rejects.toThrow('not initialized');
    });
  });
});

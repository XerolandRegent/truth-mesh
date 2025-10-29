/**
 * ==============================================================================
 * File Name: mock-storage.ts
 * File Path: packages/core/src/ipfs/mock-storage.ts
 * Description: Mock IPFS storage implementation for testing
 * Date Created: 2025-10-29
 * Version: 1.0.0
 * ==============================================================================
 */

import { CID } from 'multiformats/cid';
import { sha256 } from 'multiformats/hashes/sha2';
import * as raw from 'multiformats/codecs/raw';
import type { IIPFSStorage } from '../interfaces/index.js';

/**
 * Mock IPFS Storage Configuration
 */
export type MockStorageConfig = {
  latency?: number; // Simulate network latency in milliseconds
};

/**
 * Mock IPFS Storage Implementation
 * 
 * In-memory implementation for fast unit tests:
 * - No network operations
 * - Deterministic CID generation
 * - Configurable latency simulation
 * - Test helper methods for inspection
 */
export class MockIPFSStorage implements IIPFSStorage {
  private storage!: Map<string, string>;
  private pinned!: Set<string>;
  private readonly latency: number;
  private initialized: boolean;

  constructor(config: MockStorageConfig = {}) {
    this.latency = config.latency ?? 0;
    this.initialized = false;
  }

  /**
   * Initialize the mock storage
   */
  async initialize(): Promise<void> {
    await this.delay();
    this.storage = new Map<string, string>();
    this.pinned = new Set<string>();
    this.initialized = true;
  }

  /**
   * Store data and return its CID
   * @param data - String or binary data to store
   * @returns Content identifier (CID)
   */
  async store(data: string | Uint8Array): Promise<CID> {
    this.ensureInitialized();
    await this.delay();

    const bytes = typeof data === 'string'
      ? new TextEncoder().encode(data)
      : data;

    // Generate deterministic CID using SHA-256
    const hash = await sha256.digest(bytes);
    const cid = CID.create(1, raw.code, hash);

    // Store data
    this.storage.set(
      cid.toString(),
      typeof data === 'string' ? data : new TextDecoder().decode(data)
    );

    return cid;
  }

  /**
   * Retrieve data by CID
   * @param cid - Content identifier
   * @returns Stored data as string
   * @throws {Error} If content not found
   */
  async retrieve(cid: CID): Promise<string> {
    this.ensureInitialized();
    await this.delay();

    const data = this.storage.get(cid.toString());
    if (!data) {
      throw new Error(`Content not found: ${cid.toString()}`);
    }

    return data;
  }

  /**
   * Pin content to prevent garbage collection
   * @param cid - Content identifier to pin
   */
  async pin(cid: CID): Promise<void> {
    this.ensureInitialized();
    await this.delay();
    this.pinned.add(cid.toString());
  }

  /**
   * Unpin content to allow garbage collection
   * @param cid - Content identifier to unpin
   */
  async unpin(cid: CID): Promise<void> {
    this.ensureInitialized();
    await this.delay();
    this.pinned.delete(cid.toString());
  }

  /**
   * Check if content exists in storage
   * @param cid - Content identifier to check
   * @returns True if content exists
   */
  async has(cid: CID): Promise<boolean> {
    this.ensureInitialized();
    await this.delay();
    return this.storage.has(cid.toString());
  }

  /**
   * Shutdown the mock storage
   */
  async shutdown(): Promise<void> {
    await this.delay();
    this.initialized = false;
  }

  // ============================================================================
  // Test Helper Methods
  // ============================================================================

  /**
   * Clear all stored data (for test cleanup)
   */
  clear(): void {
    this.storage.clear();
    this.pinned.clear();
  }

  /**
   * Get number of items in storage
   * @returns Storage size
   */
  getStorageSize(): number {
    return this.storage.size;
  }

  /**
   * Check if content is pinned
   * @param cid - Content identifier to check
   * @returns True if pinned
   */
  isPinned(cid: CID): boolean {
    return this.pinned.has(cid.toString());
  }

  /**
   * Get all stored CIDs
   * @returns Array of CID strings
   */
  getAllCIDs(): string[] {
    return Array.from(this.storage.keys());
  }

  /**
   * Get all pinned CIDs
   * @returns Array of pinned CID strings
   */
  getAllPinnedCIDs(): string[] {
    return Array.from(this.pinned);
  }

  // ============================================================================
  // Private Methods
  // ============================================================================

  /**
   * Simulate network latency
   */
  private async delay(): Promise<void> {
    if (this.latency > 0) {
      await new Promise(resolve => setTimeout(resolve, this.latency));
    }
  }

  /**
   * Ensure storage is initialized
   * @throws {Error} If not initialized
   */
  private ensureInitialized(): void {
    if (!this.initialized) {
      throw new Error('Storage not initialized. Call initialize() first.');
    }
  }
}

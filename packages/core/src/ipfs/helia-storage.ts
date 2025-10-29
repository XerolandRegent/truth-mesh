/**
 * ==============================================================================
 * File Name: helia-storage.ts
 * File Path: packages/core/src/ipfs/helia-storage.ts
 * Description: Helia IPFS storage implementation for production
 * Date Created: 2025-10-29
 * Version: 1.0.0
 * ==============================================================================
 */

import { createHelia } from 'helia';
import { unixfs } from '@helia/unixfs';
import { MemoryBlockstore } from 'blockstore-core';
import { MemoryDatastore } from 'datastore-core';
import type { CID } from 'multiformats/cid';
import type { Helia } from 'helia';
import type { UnixFS } from '@helia/unixfs';
import type { IIPFSStorage } from '../interfaces/index.js';

/**
 * Helia Storage Configuration
 */
export type HeliaStorageConfig = {
  mode?: 'development' | 'production' | 'test';
  storage?: string; // Path for persistent storage (production only)
  bootstrap?: string[]; // Bootstrap node addresses
};

/**
 * Helia IPFS Storage Implementation
 * 
 * Production-ready IPFS storage using Helia:
 * - Development: In-memory storage (fast, no persistence)
 * - Production: File system storage (persistent)
 * - Full IPFS network integration
 * - Content addressing via CIDs
 */
export class HeliaStorage implements IIPFSStorage {
  private helia: Helia | null;
  private fs: UnixFS | null;
  private readonly config: HeliaStorageConfig;

  constructor(config: HeliaStorageConfig = {}) {
    this.helia = null;
    this.fs = null;
    this.config = {
      mode: config.mode ?? 'development',
      storage: config.storage,
      bootstrap: config.bootstrap
    };
  }

  /**
   * Initialize Helia IPFS node
   */
  async initialize(): Promise<void> {
    if (this.helia) {
      return; // Already initialized
    }

// Development/Test: In-memory storage with minimal libp2p
if (this.config.mode === 'development' || this.config.mode === 'test') {
  const { tcp } = await import('@libp2p/tcp');
  const { noise } = await import('@chainsafe/libp2p-noise');
  const { yamux } = await import('@chainsafe/libp2p-yamux');
  
  this.helia = await createHelia({
    blockstore: new MemoryBlockstore(),
    datastore: new MemoryDatastore(),
    libp2p: {
      addresses: {
        listen: ['/ip4/127.0.0.1/tcp/0'] // Localhost only
      },
      transports: [tcp()], // Only TCP, no WebRTC
      connectionEncrypters: [noise()],
      streamMuxers: [yamux()]
    }
  });
}

    // Production: Persistent file system storage
    if (this.config.mode === 'production') {
      if (!this.config.storage) {
        throw new Error('Storage path required for production mode');
      }

      // Dynamic import to avoid bundling in development
      const { FsBlockstore } = await import('blockstore-fs');
      const { FsDatastore } = await import('datastore-fs');

      this.helia = await createHelia({
        blockstore: new FsBlockstore(this.config.storage),
        datastore: new FsDatastore(this.config.storage)
      });
    }

    if (!this.helia) {
      throw new Error('Failed to initialize Helia');
    }

    // Initialize UnixFS layer
    this.fs = unixfs(this.helia);
  }

  /**
   * Store data in IPFS
   * @param data - String or binary data to store
   * @returns Content identifier (CID)
   */
  async store(data: string | Uint8Array): Promise<CID> {
    this.ensureInitialized();

    const bytes = typeof data === 'string'
      ? new TextEncoder().encode(data)
      : data;

    return await this.fs!.addBytes(bytes);
  }

  /**
   * Retrieve data from IPFS
   * @param cid - Content identifier
   * @returns Stored data as string
   */
  async retrieve(cid: CID): Promise<string> {
    this.ensureInitialized();

    const chunks: Uint8Array[] = [];
    
    for await (const chunk of this.fs!.cat(cid)) {
      chunks.push(chunk);
    }

    // Combine chunks
    const totalLength = chunks.reduce((acc, chunk) => acc + chunk.length, 0);
    const bytes = new Uint8Array(totalLength);
    
    let offset = 0;
    for (const chunk of chunks) {
      bytes.set(chunk, offset);
      offset += chunk.length;
    }

    return new TextDecoder().decode(bytes);
  }

  /**
   * Pin content in IPFS
   * @param cid - Content identifier to pin
   */
  async pin(cid: CID): Promise<void> {
    this.ensureInitialized();
    await this.helia!.pins.add(cid);
  }

  /**
   * Unpin content in IPFS
   * @param cid - Content identifier to unpin
   */
  async unpin(cid: CID): Promise<void> {
    this.ensureInitialized();
    await this.helia!.pins.rm(cid);
  }

  /**
   * Check if content exists in local blockstore
   * @param cid - Content identifier to check
   * @returns True if content exists
   */
  async has(cid: CID): Promise<boolean> {
    this.ensureInitialized();
    return await this.helia!.blockstore.has(cid);
  }

  /**
   * Shutdown Helia node
   */
  async shutdown(): Promise<void> {
    if (this.helia) {
      await this.helia.stop();
      this.helia = null;
      this.fs = null;
    }
  }

  // ============================================================================
  // Private Methods
  // ============================================================================

  /**
   * Ensure Helia is initialized
   * @throws {Error} If not initialized
   */
  private ensureInitialized(): void {
    if (!this.helia || !this.fs) {
      throw new Error('Helia not initialized. Call initialize() first.');
    }
  }
}

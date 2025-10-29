/**
 * ==============================================================================
 * File Name: storage.ts
 * File Path: packages/core/src/interfaces/storage.ts
 * Description: IPFS storage interface for implementation abstraction
 * Date Created: 2025-10-29
 * Version: 1.0.0
 * ==============================================================================
 */

import type { CID } from 'multiformats/cid';

/**
 * IPFS Storage Interface
 * 
 * Abstracts IPFS operations to enable:
 * - Real Helia implementation for production
 * - Mock implementation for fast unit tests
 * - Future alternative storage backends
 */
export interface IIPFSStorage {
  /**
   * Initialize the storage system
   * @throws {Error} If initialization fails
   */
  initialize(): Promise<void>;

  /**
   * Store data in IPFS and return its CID
   * @param data - String or binary data to store
   * @returns Content identifier (CID)
   */
  store(data: string | Uint8Array): Promise<CID>;

  /**
   * Retrieve data from IPFS by CID
   * @param cid - Content identifier
   * @returns Stored data as string
   * @throws {Error} If content not found
   */
  retrieve(cid: CID): Promise<string>;

  /**
   * Pin content to prevent garbage collection
   * @param cid - Content identifier to pin
   */
  pin(cid: CID): Promise<void>;

  /**
   * Unpin content to allow garbage collection
   * @param cid - Content identifier to unpin
   */
  unpin(cid: CID): Promise<void>;

  /**
   * Check if content exists in local blockstore
   * @param cid - Content identifier to check
   * @returns True if content exists locally
   */
  has(cid: CID): Promise<boolean>;

  /**
   * Shutdown the storage system and cleanup resources
   */
  shutdown(): Promise<void>;
}

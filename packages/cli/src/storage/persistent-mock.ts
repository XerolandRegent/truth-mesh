/**
 * ==============================================================================
 * File Name: persistent-mock.ts
 * File Path: packages/cli/src/storage/persistent-mock.ts
 * Description: Filesystem-backed mock storage for CLI persistence
 * Date Created: 2025-10-29
 * Version: 1.0.0
 * ==============================================================================
 */

import { MockIPFSStorage } from '@truth-mesh/core';
import type { CID } from 'multiformats/cid';
import * as fs from 'fs/promises';
import * as path from 'path';
import * as os from 'os';

/**
 * Persistent Mock Storage
 * 
 * Extends MockIPFSStorage with filesystem persistence for CLI.
 * Data survives between command invocations.
 */
export class PersistentMockStorage extends MockIPFSStorage {
  private dataDir: string;

  constructor(dataDir?: string) {
    super();
    this.dataDir = dataDir ?? path.join(os.homedir(), '.truth-mesh', 'data');
  }

  async initialize(): Promise<void> {
    await super.initialize();
    await fs.mkdir(this.dataDir, { recursive: true });
  }

  async store(data: string | Uint8Array): Promise<CID> {
    const cid = await super.store(data);
    
    // Persist to filesystem
    const filePath = path.join(this.dataDir, cid.toString());
    const content = typeof data === 'string' ? data : new TextDecoder().decode(data);
    await fs.writeFile(filePath, content, 'utf-8');
    
    return cid;
  }

  async retrieve(cid: CID): Promise<string> {
    const filePath = path.join(this.dataDir, cid.toString());
    
    try {
      return await fs.readFile(filePath, 'utf-8');
    } catch (error) {
      throw new Error(`Fact not found: ${cid.toString()}`);
    }
  }

  async has(cid: CID): Promise<boolean> {
    const filePath = path.join(this.dataDir, cid.toString());
    
    try {
      await fs.access(filePath);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Clear all stored data (for cleanup)
   */
  async clear(): Promise<void> {
    try {
      const files = await fs.readdir(this.dataDir);
      await Promise.all(
        files.map(file => fs.unlink(path.join(this.dataDir, file)))
      );
    } catch {
      // Directory doesn't exist or is empty
    }
  }
}
/**
 * ==============================================================================
 * File Name: keypair-manager.ts
 * File Path: packages/cli/src/utils/keypair-manager.ts
 * Description: Manage Ed25519 keypairs for the CLI
 * Date Created: 2025-10-29
 * Version: 0.1.0
 * ==============================================================================
 */

import fs from 'fs/promises';
import path from 'path';
import os from 'os';
import type { KeyPair } from '@truth-mesh/core';

/**
 * Stored keypair format
 */
interface StoredKeyPair {
  publicKey: string;
  privateKey: string;
  metadata: {
    created: string;
    algorithm: string;
  };
}

/**
 * KeyPair Manager
 * 
 * Handles loading, saving, and managing Ed25519 keypairs for the CLI.
 */
export class KeyPairManager {
  private readonly keyPairPath: string;

  constructor(configDir?: string) {
    const dir = configDir ?? path.join(os.homedir(), '.truth-mesh');
    this.keyPairPath = path.join(dir, 'keypair.json');
  }

  /**
   * Get the keypair file path
   */
  getKeyPairPath(): string {
    return this.keyPairPath;
  }

  /**
   * Check if keypair exists
   */
  async exists(): Promise<boolean> {
    try {
      await fs.access(this.keyPairPath);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Save a keypair to disk
   */
  async save(keyPair: KeyPair): Promise<void> {
    const dir = path.dirname(this.keyPairPath);
    await fs.mkdir(dir, { recursive: true });

    const stored: StoredKeyPair = {
      publicKey: this.publicKeyToHex(keyPair.publicKey),
      privateKey: this.privateKeyToHex(keyPair.privateKey),
      metadata: {
        created: new Date().toISOString(),
        algorithm: 'Ed25519'
      }
    };

    await fs.writeFile(
      this.keyPairPath,
      JSON.stringify(stored, null, 2),
      'utf-8'
    );
  }

  /**
   * Load keypair from disk
   */
  async load(): Promise<KeyPair | null> {
    try {
      const data = await fs.readFile(this.keyPairPath, 'utf-8');
      const stored: StoredKeyPair = JSON.parse(data);

      return {
        publicKey: this.hexToBytes(stored.publicKey),
        privateKey: this.hexToBytes(stored.privateKey)
      };
    } catch {
      return null;
    }
  }

  /**
   * Get keypair metadata
   */
  async getMetadata(): Promise<{ created: string; algorithm: string } | null> {
    try {
      const data = await fs.readFile(this.keyPairPath, 'utf-8');
      const stored: StoredKeyPair = JSON.parse(data);
      return stored.metadata;
    } catch {
      return null;
    }
  }

  /**
   * Delete keypair
   */
  async delete(): Promise<void> {
    try {
      await fs.unlink(this.keyPairPath);
    } catch {
      // File doesn't exist, nothing to delete
    }
  }

  /**
   * Convert public key to hex string
   */
  publicKeyToHex(publicKey: Uint8Array): string {
    return Array.from(publicKey)
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');
  }

  /**
   * Convert private key to hex string
   */
  privateKeyToHex(privateKey: Uint8Array): string {
    return Array.from(privateKey)
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');
  }

  /**
   * Convert hex string to bytes
   */
  private hexToBytes(hex: string): Uint8Array {
    const bytes = new Uint8Array(hex.length / 2);
    for (let i = 0; i < hex.length; i += 2) {
      bytes[i / 2] = parseInt(hex.slice(i, i + 2), 16);
    }
    return bytes;
  }
}
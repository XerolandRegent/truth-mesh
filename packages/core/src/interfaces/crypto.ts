/**
 * ==============================================================================
 * File Name: crypto.ts
 * File Path: packages/core/src/interfaces/crypto.ts
 * Description: Cryptographic operations interface for signing and verification
 * Date Created: 2025-10-29
 * Version: 1.0.0
 * ==============================================================================
 */

import type { CID } from 'multiformats/cid';

/**
 * Key pair for Ed25519 cryptography
 */
export type KeyPair = {
  publicKey: Uint8Array;
  privateKey: Uint8Array;
};

/**
 * Crypto Service Interface
 * 
 * Abstracts cryptographic operations:
 * - Ed25519 key generation
 * - Signing with private keys
 * - Signature verification with public keys
 * - Hashing for Merkle trees
 */
export interface ICryptoService {
  /**
   * Generate a new Ed25519 key pair
   * @returns Public and private key pair
   */
  generateKeyPair(): KeyPair;

  /**
   * Sign data with a private key
   * @param data - Data to sign (string or bytes)
   * @param privateKey - Ed25519 private key
   * @returns Hex-encoded signature
   */
  sign(data: string | Uint8Array, privateKey: Uint8Array): string;

  /**
   * Verify a signature
   * @param data - Original data that was signed
   * @param signature - Hex-encoded signature
   * @param publicKey - Ed25519 public key
   * @returns True if signature is valid
   */
  verify(data: string | Uint8Array, signature: string, publicKey: Uint8Array): boolean;

  /**
   * Hash data using SHA-256
   * @param data - Data to hash
   * @returns Hex-encoded hash
   */
  hash(data: string | Uint8Array): string;

  /**
   * Hash a CID for Merkle tree operations
   * @param cid - Content identifier
   * @returns Hex-encoded hash
   */
  hashCID(cid: CID): string;

  /**
   * Hash a pair of hashes (for Merkle tree parent nodes)
   * @param leftHash - Left child hash
   * @param rightHash - Right child hash
   * @returns Hex-encoded combined hash
   */
  hashPair(leftHash: string, rightHash: string): string;
}

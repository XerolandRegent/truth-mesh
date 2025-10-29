/**
 * ==============================================================================
 * File Name: signatures.ts
 * File Path: packages/core/src/crypto/signatures.ts
 * Description: Ed25519 cryptographic signature operations
 * Date Created: 2025-10-29
 * Version: 1.0.0
 * ==============================================================================
 */

import { createHash, generateKeyPairSync, sign, verify } from 'node:crypto';
import type { CID } from 'multiformats/cid';
import type { ICryptoService, KeyPair } from '../interfaces';

/**
 * Ed25519 Cryptographic Service
 * 
 * Provides cryptographic operations:
 * - Key pair generation (Ed25519)
 * - Digital signatures
 * - Signature verification
 * - SHA-256 hashing for Merkle trees
 */
export class SignatureService implements ICryptoService {
  /**
   * Generate a new Ed25519 key pair
   * @returns Public and private key pair as Uint8Arrays
   */
  generateKeyPair(): KeyPair {
    const { publicKey, privateKey } = generateKeyPairSync('ed25519', {
      publicKeyEncoding: {
        type: 'spki',
        format: 'der'
      },
      privateKeyEncoding: {
        type: 'pkcs8',
        format: 'der'
      }
    });

    return {
      publicKey: new Uint8Array(publicKey),
      privateKey: new Uint8Array(privateKey)
    };
  }

  /**
   * Sign data with a private key
   * @param data - Data to sign (string or bytes)
   * @param privateKey - Ed25519 private key
   * @returns Hex-encoded signature
   */
  sign(data: string | Uint8Array, privateKey: Uint8Array): string {
    const dataBuffer = typeof data === 'string'
      ? Buffer.from(data, 'utf-8')
      : Buffer.from(data);

    const signature = sign(null, dataBuffer, {
      key: Buffer.from(privateKey),
      format: 'der',
      type: 'pkcs8'
    });

    return signature.toString('hex');
  }

  /**
   * Verify a signature
   * @param data - Original data that was signed
   * @param signature - Hex-encoded signature
   * @param publicKey - Ed25519 public key
   * @returns True if signature is valid
   */
  verify(data: string | Uint8Array, signature: string, publicKey: Uint8Array): boolean {
    try {
      const dataBuffer = typeof data === 'string'
        ? Buffer.from(data, 'utf-8')
        : Buffer.from(data);

      const signatureBuffer = Buffer.from(signature, 'hex');

      return verify(null, dataBuffer, {
        key: Buffer.from(publicKey),
        format: 'der',
        type: 'spki'
      }, signatureBuffer);
    } catch (error) {
      // Invalid signature format or verification error
      return false;
    }
  }

  /**
   * Hash data using SHA-256
   * @param data - Data to hash
   * @returns Hex-encoded hash
   */
  hash(data: string | Uint8Array): string {
    const buffer = typeof data === 'string'
      ? Buffer.from(data, 'utf-8')
      : Buffer.from(data);

    return createHash('sha256').update(buffer).digest('hex');
  }

  /**
   * Hash a CID for Merkle tree operations
   * @param cid - Content identifier
   * @returns Hex-encoded hash
   */
  hashCID(cid: CID): string {
    return this.hash(cid.toString());
  }

  /**
   * Hash a pair of hashes (for Merkle tree parent nodes)
   * @param leftHash - Left child hash
   * @param rightHash - Right child hash
   * @returns Hex-encoded combined hash
   */
  hashPair(leftHash: string, rightHash: string): string {
    return this.hash(`${leftHash}${rightHash}`);
  }
}

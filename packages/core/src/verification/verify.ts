/**
 * ==============================================================================
 * File Name: verify.ts
 * File Path: packages/core/src/verification/verify.ts
 * Description: Verification pipeline for facts, signatures, and proofs
 * Date Created: 2025-10-29
 * Version: 1.0.0
 * ==============================================================================
 */

import type { CID } from 'multiformats/cid';
import type { IIPFSStorage } from '../interfaces/storage.js';
import type { ICryptoService } from '../interfaces/crypto.js';
import type { IMerkleTree } from '../interfaces/merkle.js';
import type {
  VerificationRequest,
  VerificationResult,
  VerificationCheck,
  VerificationOptions
} from '../types/index.js';

/**
 * Verification Service
 * 
 * Orchestrates the complete verification pipeline:
 * 1. Retrieve fact from IPFS
 * 2. Verify cryptographic signature
 * 3. Verify Merkle proof
 * 4. Return comprehensive result
 */
export class VerificationService {
  constructor(
    private readonly storage: IIPFSStorage,
    private readonly crypto: ICryptoService,
    private readonly merkle: IMerkleTree
  ) {}

  /**
   * Verify a fact with its proof
   * @param request - Verification request with CID, signature, proof, root
   * @param options - Verification options
   * @returns Comprehensive verification result
   */
  async verify(
    request: VerificationRequest,
    options: VerificationOptions = {}
  ): Promise<VerificationResult> {
    const checks: VerificationCheck[] = [];
    let fact: unknown;

    try {
      // Step 1: Retrieve fact from IPFS
      const retrievalCheck = await this.checkRetrieval(request.cid);
      checks.push(retrievalCheck);

      if (!retrievalCheck.passed) {
        return {
          valid: false,
          checks,
          error: 'Failed to retrieve fact from IPFS'
        };
      }

      // Parse the retrieved fact
      fact = JSON.parse(retrievalCheck.message);

      // Step 2: Verify signature (if not skipped)
      if (!options.skipSignature) {
        const signatureCheck = await this.checkSignature(
          request.signature,
          request.publicKey,
          fact
        );
        checks.push(signatureCheck);

        if (!signatureCheck.passed) {
          return {
            valid: false,
            checks,
            fact,
            error: 'Signature verification failed'
          };
        }
      }

      // Step 3: Verify Merkle proof (if not skipped)
      if (!options.skipMerkle) {
        const merkleCheck = await this.checkMerkleProof(
          request.root,
          request.cid,
          request.proof
        );
        checks.push(merkleCheck);

        if (!merkleCheck.passed) {
          return {
            valid: false,
            checks,
            fact,
            error: 'Merkle proof verification failed'
          };
        }
      }

      // All checks passed
      return {
        valid: true,
        checks,
        fact
      };

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      
      checks.push({
        name: 'exception',
        passed: false,
        message: 'Verification failed with exception',
        error: errorMessage
      });

      return {
        valid: false,
        checks,
        fact,
        error: errorMessage
      };
    }
  }

  /**
   * Verify multiple facts in batch
   * @param requests - Array of verification requests
   * @param options - Verification options
   * @returns Array of verification results
   */
  async verifyBatch(
    requests: VerificationRequest[],
    options: VerificationOptions = {}
  ): Promise<VerificationResult[]> {
    return await Promise.all(
      requests.map(request => this.verify(request, options))
    );
  }

  // ============================================================================
  // Private Verification Steps
  // ============================================================================

  /**
   * Check if fact can be retrieved from IPFS
   */
  private async checkRetrieval(cid: CID): Promise<VerificationCheck> {
    try {
      const data = await this.storage.retrieve(cid);
      
      return {
        name: 'retrieval',
        passed: true,
        message: data // Pass data for next steps
      };
    } catch (error) {
      return {
        name: 'retrieval',
        passed: false,
        message: 'Failed to retrieve fact from IPFS',
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Check cryptographic signature
   */
  private async checkSignature(
    signature: string,
    publicKey: string | undefined,
    fact: unknown
  ): Promise<VerificationCheck> {
    try {
      // Extract public key and data from fact
      const factObj = fact as { 
        publicKey?: string;
        content: string;
        source: string;
        timestamp: number;
      };
      
      const keyToUse = publicKey ?? factObj.publicKey;

      if (!keyToUse) {
        return {
          name: 'signature',
          passed: false,
          message: 'No public key provided for signature verification',
          error: 'Missing public key'
        };
      }

      // Verify signature
      const publicKeyBytes = this.hexToBytes(keyToUse);
      
      // Reconstruct the data that was signed (content, source, timestamp only)
      const dataToVerify = JSON.stringify({
        content: factObj.content,
        source: factObj.source,
        timestamp: factObj.timestamp
      });
      
      const isValid = this.crypto.verify(dataToVerify, signature, publicKeyBytes);

      if (isValid) {
        return {
          name: 'signature',
          passed: true,
          message: 'Signature verified successfully'
        };
      } else {
        return {
          name: 'signature',
          passed: false,
          message: 'Invalid signature',
          error: 'Signature does not match fact data'
        };
      }
    } catch (error) {
      return {
        name: 'signature',
        passed: false,
        message: 'Signature verification error',
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Check Merkle proof
   */
  private async checkMerkleProof(
    rootCID: CID,
    factCID: CID,
    proof: CID[]
  ): Promise<VerificationCheck> {
    try {
      const isValid = await this.merkle.verifyProof(rootCID, factCID, proof);

      if (isValid) {
        return {
          name: 'merkle',
          passed: true,
          message: 'Merkle proof verified successfully'
        };
      } else {
        return {
          name: 'merkle',
          passed: false,
          message: 'Invalid Merkle proof',
          error: 'Proof does not lead to the specified root'
        };
      }
    } catch (error) {
      return {
        name: 'merkle',
        passed: false,
        message: 'Merkle proof verification error',
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  // ============================================================================
  // Utility Methods
  // ============================================================================

  /**
   * Convert hex string to Uint8Array
   */
  private hexToBytes(hex: string): Uint8Array {
    const bytes = new Uint8Array(hex.length / 2);
    for (let i = 0; i < hex.length; i += 2) {
      bytes[i / 2] = parseInt(hex.slice(i, i + 2), 16);
    }
    return bytes;
  }
}
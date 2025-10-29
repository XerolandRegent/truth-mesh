/**
 * ==============================================================================
 * File Name: proof.ts
 * File Path: packages/core/src/types/proof.ts
 * Description: Merkle proof and verification types
 * Date Created: 2025-10-29
 * Version: 1.0.0
 * ==============================================================================
 */

import type { CID } from 'multiformats/cid';
import type { MerkleProof } from '../interfaces/merkle.js';

/**
 * Storage result after fact is successfully stored
 * 
 * Contains everything needed to verify the fact later:
 * - cid: Where to retrieve the fact from IPFS
 * - signature: Cryptographic proof of authorship
 * - proof: Merkle proof path (sibling CIDs)
 * - root: Merkle tree root CID
 */
export type StorageResult = {
  cid: CID;
  signature: string;
  proof: MerkleProof;
  root: CID;
};

/**
 * Verification request structure
 * 
 * Everything needed to verify a fact's authenticity:
 * - cid: Fact location in IPFS
 * - signature: Expected signature
 * - proof: Merkle proof path
 * - root: Expected Merkle root
 * - publicKey: For signature verification (optional if embedded in fact)
 */
export type VerificationRequest = {
  cid: CID;
  signature: string;
  proof: MerkleProof;
  root: CID;
  publicKey?: string;
};

/**
 * Individual verification check result
 * 
 * Tracks the outcome of each verification step:
 * - name: Which check was performed
 * - passed: Whether it succeeded
 * - message: Human-readable explanation
 * - error: Error details if check failed
 */
export type VerificationCheck = {
  name: string;
  passed: boolean;
  message: string;
  error?: string;
};

/**
 * Complete verification result
 * 
 * Aggregates all verification checks:
 * - valid: Overall result (all checks must pass)
 * - checks: Individual check results
 * - fact: Retrieved fact data (if retrieval succeeded)
 * - error: Overall error message if verification failed
 */
export type VerificationResult = {
  valid: boolean;
  checks: VerificationCheck[];
  fact?: unknown;
  error?: string;
};

/**
 * Proof verification options
 * 
 * Controls verification behavior:
 * - strict: Require all optional checks
 * - timeout: Maximum time for verification (ms)
 * - skipSignature: Skip signature verification (testing only)
 * - skipMerkle: Skip Merkle proof verification (testing only)
 */
export type VerificationOptions = {
  strict?: boolean;
  timeout?: number;
  skipSignature?: boolean;
  skipMerkle?: boolean;
};

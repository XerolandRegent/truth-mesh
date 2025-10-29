/**
 * ==============================================================================
 * File Name: errors.ts
 * File Path: packages/core/src/utils/errors.ts
 * Description: Structured error handling for Truth Mesh operations
 * Date Created: 2025-10-29
 * Version: 1.0.0
 * ==============================================================================
 */

import type { ErrorCode, ErrorInfo } from '../types';

/**
 * Base Truth Mesh Error
 */
export class TruthMeshError extends Error {
  public readonly code: ErrorCode;
  public readonly details?: Record<string, unknown>;
  public readonly timestamp: number;

  constructor(code: ErrorCode, message: string, details?: Record<string, unknown>) {
    super(message);
    this.name = 'TruthMeshError';
    this.code = code;
    this.details = details;
    this.timestamp = Date.now();

    // Maintains proper stack trace for where error was thrown
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, TruthMeshError);
    }
  }

  /**
   * Convert to ErrorInfo object
   */
  toErrorInfo(): ErrorInfo {
    return {
      code: this.code,
      message: this.message,
      details: this.details,
      timestamp: this.timestamp
    };
  }

  /**
   * Serialize to JSON
   */
  toJSON(): ErrorInfo {
    return this.toErrorInfo();
  }
}

/**
 * IPFS-related errors
 */
export class IPFSError extends TruthMeshError {
  constructor(code: ErrorCode, message: string, details?: Record<string, unknown>) {
    super(code, message, details);
    this.name = 'IPFSError';
  }
}

/**
 * Cryptographic errors
 */
export class CryptoError extends TruthMeshError {
  constructor(code: ErrorCode, message: string, details?: Record<string, unknown>) {
    super(code, message, details);
    this.name = 'CryptoError';
  }
}

/**
 * Merkle tree errors
 */
export class MerkleError extends TruthMeshError {
  constructor(code: ErrorCode, message: string, details?: Record<string, unknown>) {
    super(code, message, details);
    this.name = 'MerkleError';
  }
}

/**
 * Verification errors
 */
export class VerificationError extends TruthMeshError {
  constructor(code: ErrorCode, message: string, details?: Record<string, unknown>) {
    super(code, message, details);
    this.name = 'VerificationError';
  }
}

/**
 * Error factory functions
 */
export const Errors = {
  // IPFS errors
  ipfsInitFailed: (details?: Record<string, unknown>) =>
    new IPFSError('IPFS_INIT_FAILED', 'Failed to initialize IPFS', details),

  ipfsStoreFailed: (details?: Record<string, unknown>) =>
    new IPFSError('IPFS_STORE_FAILED', 'Failed to store data in IPFS', details),

  ipfsRetrieveFailed: (cid: string, details?: Record<string, unknown>) =>
    new IPFSError('IPFS_RETRIEVE_FAILED', `Failed to retrieve data from IPFS: ${cid}`, details),

  ipfsNotFound: (cid: string) =>
    new IPFSError('IPFS_NOT_FOUND', `Content not found in IPFS: ${cid}`),

  ipfsTimeout: (operation: string) =>
    new IPFSError('IPFS_TIMEOUT', `IPFS operation timed out: ${operation}`),

  // Crypto errors
  cryptoKeygenFailed: (details?: Record<string, unknown>) =>
    new CryptoError('CRYPTO_KEYGEN_FAILED', 'Failed to generate key pair', details),

  cryptoSignFailed: (details?: Record<string, unknown>) =>
    new CryptoError('CRYPTO_SIGN_FAILED', 'Failed to sign data', details),

  cryptoVerifyFailed: (details?: Record<string, unknown>) =>
    new CryptoError('CRYPTO_VERIFY_FAILED', 'Failed to verify signature', details),

  cryptoInvalidKey: (keyType: string) =>
    new CryptoError('CRYPTO_INVALID_KEY', `Invalid ${keyType} key format`),

  cryptoInvalidSignature: () =>
    new CryptoError('CRYPTO_INVALID_SIGNATURE', 'Invalid signature format or value'),

  // Merkle errors
  merkleBuildFailed: (details?: Record<string, unknown>) =>
    new MerkleError('MERKLE_BUILD_FAILED', 'Failed to build Merkle tree', details),

  merkleProofFailed: (details?: Record<string, unknown>) =>
    new MerkleError('MERKLE_PROOF_FAILED', 'Failed to generate Merkle proof', details),

  merkleVerifyFailed: (details?: Record<string, unknown>) =>
    new MerkleError('MERKLE_VERIFY_FAILED', 'Failed to verify Merkle proof', details),

  merkleNodeNotFound: (cid: string) =>
    new MerkleError('MERKLE_NODE_NOT_FOUND', `Merkle node not found: ${cid}`),

  merkleInvalidTree: (reason: string) =>
    new MerkleError('MERKLE_INVALID_TREE', `Invalid Merkle tree: ${reason}`),

  // Verification errors
  verificationFailed: (reason: string, details?: Record<string, unknown>) =>
    new VerificationError('VERIFICATION_FAILED', `Verification failed: ${reason}`, details),

  verificationTimeout: () =>
    new VerificationError('VERIFICATION_TIMEOUT', 'Verification operation timed out'),

  verificationIncomplete: (missingChecks: string[]) =>
    new VerificationError('VERIFICATION_INCOMPLETE', 'Verification incomplete', { missingChecks }),

  // Input validation errors
  invalidInput: (field: string, reason: string) =>
    new TruthMeshError('INVALID_INPUT', `Invalid input for ${field}: ${reason}`),

  invalidCID: (cid: string) =>
    new TruthMeshError('INVALID_CID', `Invalid CID format: ${cid}`),

  invalidProof: (reason: string) =>
    new TruthMeshError('INVALID_PROOF', `Invalid proof: ${reason}`),

  invalidFact: (reason: string) =>
    new TruthMeshError('INVALID_FACT', `Invalid fact: ${reason}`),

  // Generic errors
  notInitialized: (component: string) =>
    new TruthMeshError('NOT_INITIALIZED', `${component} not initialized. Call initialize() first.`),

  operationCancelled: (operation: string) =>
    new TruthMeshError('OPERATION_CANCELLED', `Operation cancelled: ${operation}`),

  unknownError: (message: string, details?: Record<string, unknown>) =>
    new TruthMeshError('UNKNOWN_ERROR', message, details)
};

/**
 * Wrap external errors with Truth Mesh error context
 */
export function wrapError(error: unknown, code: ErrorCode, context?: Record<string, unknown>): TruthMeshError {
  if (error instanceof TruthMeshError) {
    return error;
  }

  const message = error instanceof Error ? error.message : String(error);
  const stack = error instanceof Error ? error.stack : undefined;

  return new TruthMeshError(code, message, {
    ...context,
    originalError: error,
    stack
  });
}

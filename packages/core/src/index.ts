/**
 * ==============================================================================
 * File Name: index.ts
 * File Path: packages/core/src/index.ts
 * Description: Main entry point for @truth-mesh/core package
 * Date Created: 2025-10-29
 * Version: 1.0.0
 * ==============================================================================
 */

// Main class
export { TruthMesh } from './truth-mesh';

// Configuration
export type { TruthMeshConfig, IPFSConfig, CryptoConfig } from './config';
export { defaultConfig, mergeConfig } from './config';

// Interfaces (for custom implementations)
export type { IIPFSStorage } from './interfaces/storage';
export type { ICryptoService, KeyPair } from './interfaces/crypto';
export type { IMerkleTree, MerkleNode, MerkleProof } from './interfaces/merkle';

// Types
export type {
  Fact,
  FactMetadata,
  FactInput,
  StoredFact,
  StorageResult,
  VerificationRequest,
  VerificationCheck,
  VerificationResult,
  VerificationOptions,
  Result,
  ErrorInfo,
  ErrorCode,
  ConfigValidation,
  BatchResult,
  OperationStatus
} from './types';

// Error classes
export {
  TruthMeshError,
  IPFSError,
  CryptoError,
  MerkleError,
  VerificationError,
  Errors,
  wrapError
} from './utils/errors';

// IPFS implementations
export { MockIPFSStorage } from './ipfs/mock-storage';
export type { MockStorageConfig } from './ipfs/mock-storage';
export { HeliaStorage } from './ipfs/helia-storage';
export type { HeliaStorageConfig } from './ipfs/helia-storage';

// Crypto implementation
export { SignatureService } from './crypto/signatures';

// Merkle implementation
export { MerkleTree } from './merkle/tree';

// Verification implementation
export { VerificationService } from './verification/verify';

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
export { TruthMesh } from './truth-mesh.js';

// Configuration
export type { TruthMeshConfig, IPFSConfig, CryptoConfig } from './config.js';
export { defaultConfig, mergeConfig } from './config.js';

// Interfaces (for custom implementations)
export type { IIPFSStorage } from './interfaces/storage.js';
export type { ICryptoService, KeyPair } from './interfaces/crypto.js';
export type { IMerkleTree, MerkleNode, MerkleProof } from './interfaces/merkle.js';

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
} from './types/index.js';

// Error classes
export {
  TruthMeshError,
  IPFSError,
  CryptoError,
  MerkleError,
  VerificationError,
  Errors,
  wrapError
} from './utils/errors.js';

// IPFS implementations
export { MockIPFSStorage } from './ipfs/mock-storage.js';
export type { MockStorageConfig } from './ipfs/mock-storage.js';
export { HeliaStorage } from './ipfs/helia-storage.js';
export type { HeliaStorageConfig } from './ipfs/helia-storage.js';

// Crypto implementation
export { SignatureService } from './crypto/signatures.js';

// Merkle implementation
export { MerkleTree } from './merkle/tree.js';

// Verification implementation
export { VerificationService } from './verification/verify.js';
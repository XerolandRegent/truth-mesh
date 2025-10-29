/**
 * ==============================================================================
 * File Name: result.ts
 * File Path: packages/core/src/types/result.ts
 * Description: Result types and error handling structures
 * Date Created: 2025-10-29
 * Version: 1.0.0
 * ==============================================================================
 */

/**
 * Operation result with success/error pattern
 * 
 * Generic result type for operations that can fail:
 * - success: Whether operation succeeded
 * - data: Result data if successful
 * - error: Error information if failed
 */
export type Result<T> = 
  | { success: true; data: T; error?: never }
  | { success: false; data?: never; error: ErrorInfo };

/**
 * Structured error information
 * 
 * Provides detailed error context:
 * - code: Machine-readable error code
 * - message: Human-readable description
 * - details: Additional context
 * - timestamp: When error occurred
 */
export type ErrorInfo = {
  code: ErrorCode;
  message: string;
  details?: Record<string, unknown>;
  timestamp: number;
};

/**
 * Standard error codes
 * 
 * Categories:
 * - IPFS_*: Storage-related errors
 * - CRYPTO_*: Cryptographic operation errors
 * - MERKLE_*: Merkle tree operation errors
 * - VERIFICATION_*: Verification process errors
 * - NETWORK_*: Network and connectivity errors
 * - INVALID_*: Input validation errors
 */
export type ErrorCode =
  // IPFS errors
  | 'IPFS_INIT_FAILED'
  | 'IPFS_STORE_FAILED'
  | 'IPFS_RETRIEVE_FAILED'
  | 'IPFS_NOT_FOUND'
  | 'IPFS_TIMEOUT'
  
  // Crypto errors
  | 'CRYPTO_KEYGEN_FAILED'
  | 'CRYPTO_SIGN_FAILED'
  | 'CRYPTO_VERIFY_FAILED'
  | 'CRYPTO_INVALID_KEY'
  | 'CRYPTO_INVALID_SIGNATURE'
  
  // Merkle tree errors
  | 'MERKLE_BUILD_FAILED'
  | 'MERKLE_PROOF_FAILED'
  | 'MERKLE_VERIFY_FAILED'
  | 'MERKLE_NODE_NOT_FOUND'
  | 'MERKLE_INVALID_TREE'
  
  // Verification errors
  | 'VERIFICATION_FAILED'
  | 'VERIFICATION_TIMEOUT'
  | 'VERIFICATION_INCOMPLETE'
  
  // Network errors
  | 'NETWORK_ERROR'
  | 'NETWORK_TIMEOUT'
  | 'NETWORK_UNAVAILABLE'
  
  // Input validation errors
  | 'INVALID_INPUT'
  | 'INVALID_CID'
  | 'INVALID_PROOF'
  | 'INVALID_FACT'
  
  // Generic errors
  | 'UNKNOWN_ERROR'
  | 'OPERATION_CANCELLED'
  | 'NOT_INITIALIZED';

/**
 * Configuration result type
 * 
 * For operations that validate configuration:
 * - valid: Whether configuration is acceptable
 * - errors: Array of validation errors
 * - warnings: Non-critical issues
 */
export type ConfigValidation = {
  valid: boolean;
  errors: string[];
  warnings: string[];
};

/**
 * Batch operation result
 * 
 * For operations on multiple items:
 * - total: Number of items processed
 * - successful: Number of successes
 * - failed: Number of failures
 * - results: Individual results
 */
export type BatchResult<T> = {
  total: number;
  successful: number;
  failed: number;
  results: Array<Result<T>>;
};

/**
 * Operation status for long-running operations
 * 
 * Tracks progress of async operations:
 * - status: Current state
 * - progress: Percentage complete (0-100)
 * - message: Status description
 * - startTime: When operation started
 */
export type OperationStatus = {
  status: 'pending' | 'running' | 'completed' | 'failed' | 'cancelled';
  progress: number;
  message: string;
  startTime: number;
  endTime?: number;
};

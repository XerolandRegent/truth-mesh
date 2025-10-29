/**
 * ==============================================================================
 * File Name: index.ts
 * File Path: packages/core/src/types/index.ts
 * Description: Central export point for all type definitions
 * Date Created: 2025-10-29
 * Version: 1.0.0
 * ==============================================================================
 */

// Fact types
export type {
  Fact,
  FactMetadata,
  FactInput,
  StoredFact
} from './fact';

// Proof and verification types
export type {
  StorageResult,
  VerificationRequest,
  VerificationCheck,
  VerificationResult,
  VerificationOptions
} from './proof';

// Result and error types
export type {
  Result,
  ErrorInfo,
  ErrorCode,
  ConfigValidation,
  BatchResult,
  OperationStatus
} from './result';

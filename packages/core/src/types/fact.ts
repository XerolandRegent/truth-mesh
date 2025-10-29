/**
 * ==============================================================================
 * File Name: fact.ts
 * File Path: packages/core/src/types/fact.ts
 * Description: Core fact data structures and metadata types
 * Date Created: 2025-10-29
 * Version: 1.0.0
 * ==============================================================================
 */

import type { CID } from 'multiformats/cid';

/**
 * Core Fact structure
 * 
 * Represents a verifiable piece of information with:
 * - Content: The actual claim or statement
 * - Source: Attribution or origin
 * - Timestamp: When the fact was recorded
 * - Signature: Cryptographic proof of authorship
 * - Public key: For signature verification
 * - Metadata: Optional extensible data
 */
export type Fact = {
  content: string;
  source: string;
  timestamp: number;
  signature: string;
  publicKey: string;
  metadata?: FactMetadata;
};

/**
 * Extensible metadata for facts
 * 
 * Allows private platforms to extend without modifying public code.
 * The customData field is the extension point for features like:
 * - Liepedia-specific categorization
 * - Bias tracking
 * - Fork relationships
 * - Custom analytics
 */
export type FactMetadata = {
  category?: string;
  tags?: string[];
  references?: CID[];
  language?: string;
  customData?: Record<string, unknown>;
};

/**
 * Fact input for storage (before signing)
 * 
 * User provides minimal information; the system adds:
 * - Timestamp (if not provided)
 * - Signature (during storage)
 * - Public key (from key pair)
 */
export type FactInput = {
  content: string;
  source: string;
  timestamp?: number;
  metadata?: FactMetadata;
};

/**
 * Signed fact with IPFS CID
 * 
 * After storage, the fact is enriched with:
 * - CID: Content identifier in IPFS
 * - Verified: Whether signature has been checked
 */
export type StoredFact = Fact & {
  cid: CID;
  verified?: boolean;
};

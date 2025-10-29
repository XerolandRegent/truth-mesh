/**
 * ==============================================================================
 * File Name: truth-mesh.ts
 * File Path: packages/core/src/truth-mesh.ts
 * Description: Main TruthMesh orchestrator class
 * Date Created: 2025-10-29
 * Version: 1.0.0
 * ==============================================================================
 */

import type { CID } from 'multiformats/cid';
import { SignatureService } from './crypto/signatures.js';
import { MerkleTree } from './merkle/tree.js';
import { HeliaStorage } from './ipfs/helia-storage.js';
import { VerificationService } from './verification/verify.js';
import { mergeConfig, type TruthMeshConfig } from './config.js';
import { Errors } from './utils/errors.js';
import type { IIPFSStorage, ICryptoService, IMerkleTree, KeyPair } from './interfaces/index.js';
import type {
  Fact,
  FactInput,
  StorageResult,
  VerificationRequest,
  VerificationResult,
  VerificationOptions
} from './types/index.js';

/**
 * Truth Mesh Core
 * 
 * Main orchestrator for the Truth Mesh protocol:
 * - Fact storage with cryptographic signatures
 * - Merkle tree proof generation
 * - IPFS-based content addressing
 * - Comprehensive verification pipeline
 */
export class TruthMesh {
  private storage!: IIPFSStorage;
  private crypto!: ICryptoService;
  private merkle!: IMerkleTree;
  private verification!: VerificationService;
  private config!: TruthMeshConfig;
  private initialized: boolean;

  constructor(config?: TruthMeshConfig) {
    this.config = mergeConfig(config);
    this.initialized = false;
  }

  /**
   * Initialize Truth Mesh services
   */
  async initialize(): Promise<void> {
    if (this.initialized) {
      return; // Already initialized
    }

    try {
      // Initialize storage (custom or Helia)
      if (this.config.storage) {
        // Use provided storage implementation (e.g., MockIPFSStorage)
        this.storage = this.config.storage;
      } else {
        // Create Helia storage with IPFS config
        this.storage = new HeliaStorage({
          mode: this.config.ipfs?.mode,
          storage: this.config.ipfs?.storage,
          bootstrap: this.config.ipfs?.bootstrap
        });
      }

      await this.storage.initialize();

      // Initialize crypto service
      this.crypto = new SignatureService();

      // Initialize Merkle tree service
      this.merkle = new MerkleTree(this.storage, this.crypto);

      // Initialize verification service
      this.verification = new VerificationService(
        this.storage,
        this.crypto,
        this.merkle
      );

      this.initialized = true;
    } catch (error) {
      throw Errors.ipfsInitFailed({
        originalError: error,
        config: this.config
      });
    }
  }

  /**
   * Shutdown Truth Mesh and cleanup resources
   */
  async shutdown(): Promise<void> {
    if (this.storage) {
      await this.storage.shutdown();
    }
    this.initialized = false;
  }

  // ============================================================================
  // Crypto Operations
  // ============================================================================

  /**
   * Generate a new Ed25519 key pair
   * @returns Public and private key pair
   */
  generateKeyPair(): KeyPair {
    this.ensureInitialized();
    return this.crypto.generateKeyPair();
  }

  // ============================================================================
  // Fact Storage Operations
  // ============================================================================

  /**
   * Store a fact with cryptographic signature and Merkle proof
   * 
   * @param factInput - Fact data to store
   * @param keyPair - Key pair for signing (or just private key for backward compat)
   * @returns Storage result with CID, signature, proof, and root
   */
  async storeFact(
    factInput: FactInput,
    keyPair: Uint8Array | KeyPair
  ): Promise<StorageResult> {
    this.ensureInitialized();

    try {
      // Handle both KeyPair and Uint8Array (private key only) inputs
      let privateKey: Uint8Array;
      let publicKey: Uint8Array;
      
      if (keyPair instanceof Uint8Array) {
        // Legacy: just private key provided
        // We can't derive public from private in Ed25519, so this won't work
        // Generate a warning in production
        throw new Error('Must provide full KeyPair (not just private key). Use generateKeyPair() to create one.');
      } else {
        privateKey = keyPair.privateKey;
        publicKey = keyPair.publicKey;
      }
      
      // Create complete fact with signature
      const fact: Fact = {
        content: factInput.content,
        source: factInput.source,
        timestamp: factInput.timestamp ?? Date.now(),
        signature: '', // Will be set after signing
        publicKey: this.bytesToHex(publicKey),
        metadata: factInput.metadata
      };

      // Sign the fact
      const dataToSign = JSON.stringify({
        content: fact.content,
        source: fact.source,
        timestamp: fact.timestamp
      });
      
      fact.signature = this.crypto.sign(dataToSign, privateKey);

      // Store fact in IPFS
      const factData = JSON.stringify(fact);
      const cid = await this.storage.store(factData);

      // Auto-pin if enabled
      if (this.config.autoPin) {
        await this.storage.pin(cid);
      }

      // Build Merkle tree with this fact
      const rootCID = await this.merkle.buildFromFacts([cid]);

      // Generate proof for this fact
      const proof = await this.merkle.generateProof(rootCID, cid);

      return {
        cid,
        signature: fact.signature,
        proof,
        root: rootCID
      };

    } catch (error) {
      throw Errors.ipfsStoreFailed({
        originalError: error,
        fact: factInput
      });
    }
  }

  /**
   * Store multiple facts in batch
   * 
   * @param factInputs - Array of facts to store
   * @param keyPair - Key pair for signing
   * @returns Array of storage results
   */
  async storeFactBatch(
    factInputs: FactInput[],
    keyPair: Uint8Array | KeyPair
  ): Promise<StorageResult[]> {
    this.ensureInitialized();

    const results: StorageResult[] = [];
    const factCIDs: CID[] = [];

    try {
      // Handle both KeyPair and Uint8Array inputs
      let privateKey: Uint8Array;
      let publicKey: Uint8Array;
      
      if (keyPair instanceof Uint8Array) {
        throw new Error('Must provide full KeyPair (not just private key). Use generateKeyPair() to create one.');
      } else {
        privateKey = keyPair.privateKey;
        publicKey = keyPair.publicKey;
      }

      // Store all facts and collect CIDs
      for (const factInput of factInputs) {
        const fact: Fact = {
          content: factInput.content,
          source: factInput.source,
          timestamp: factInput.timestamp ?? Date.now(),
          signature: '',
          publicKey: this.bytesToHex(publicKey),
          metadata: factInput.metadata
        };

        const dataToSign = JSON.stringify({
          content: fact.content,
          source: fact.source,
          timestamp: fact.timestamp
        });
        
        fact.signature = this.crypto.sign(dataToSign, privateKey);

        const factData = JSON.stringify(fact);
        const cid = await this.storage.store(factData);
        factCIDs.push(cid);

        if (this.config.autoPin) {
          await this.storage.pin(cid);
        }
      }

      // Build single Merkle tree for all facts
      const rootCID = await this.merkle.buildFromFacts(factCIDs);

      // Generate proofs for each fact
      for (let i = 0; i < factCIDs.length; i++) {
        const cid = factCIDs[i]!;
        const proof = await this.merkle.generateProof(rootCID, cid);
        
        // Get the signature from the stored fact
        const factData = await this.storage.retrieve(cid);
        const fact = JSON.parse(factData) as Fact;

        results.push({
          cid,
          signature: fact.signature,
          proof,
          root: rootCID
        });
      }

      return results;

    } catch (error) {
      throw Errors.ipfsStoreFailed({
        originalError: error,
        batchSize: factInputs.length
      });
    }
  }

  // ============================================================================
  // Fact Retrieval Operations
  // ============================================================================

  /**
   * Retrieve a fact by its CID
   * 
   * @param cid - Content identifier
   * @returns Parsed fact object
   */
  async retrieveFact(cid: CID): Promise<Fact> {
    this.ensureInitialized();

    try {
      const factData = await this.storage.retrieve(cid);
      return JSON.parse(factData) as Fact;
    } catch (error) {
      throw Errors.ipfsRetrieveFailed(cid.toString(), {
        originalError: error
      });
    }
  }

  // ============================================================================
  // Verification Operations
  // ============================================================================

  /**
   * Verify a fact with its proof
   * 
   * @param request - Verification request
   * @param options - Verification options
   * @returns Verification result with detailed checks
   */
  async verifyFact(
    request: VerificationRequest,
    options?: VerificationOptions
  ): Promise<VerificationResult> {
    this.ensureInitialized();
    return await this.verification.verify(request, options);
  }

  /**
   * Verify multiple facts in batch
   * 
   * @param requests - Array of verification requests
   * @param options - Verification options
   * @returns Array of verification results
   */
  async verifyFactBatch(
    requests: VerificationRequest[],
    options?: VerificationOptions
  ): Promise<VerificationResult[]> {
    this.ensureInitialized();
    return await this.verification.verifyBatch(requests, options);
  }

  // ============================================================================
  // Utility Methods
  // ============================================================================

  /**
   * Check if a fact exists in storage
   * 
   * @param cid - Content identifier
   * @returns True if fact exists
   */
  async hasFact(cid: CID): Promise<boolean> {
    this.ensureInitialized();
    return await this.storage.has(cid);
  }

  /**
   * Pin a fact to prevent garbage collection
   * 
   * @param cid - Content identifier
   */
  async pinFact(cid: CID): Promise<void> {
    this.ensureInitialized();
    await this.storage.pin(cid);
  }

  /**
   * Unpin a fact to allow garbage collection
   * 
   * @param cid - Content identifier
   */
  async unpinFact(cid: CID): Promise<void> {
    this.ensureInitialized();
    await this.storage.unpin(cid);
  }

  // ============================================================================
  // Private Methods
  // ============================================================================

  /**
   * Ensure Truth Mesh is initialized
   */
  private ensureInitialized(): void {
    if (!this.initialized) {
      throw Errors.notInitialized('TruthMesh');
    }
  }

  /**
   * Convert bytes to hex string
   */
  private bytesToHex(bytes: Uint8Array): string {
    return Array.from(bytes)
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');
  }
}
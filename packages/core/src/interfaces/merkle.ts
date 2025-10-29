/**
 * ==============================================================================
 * File Name: merkle.ts
 * File Path: packages/core/src/interfaces/merkle.ts
 * Description: Merkle tree interface for proof generation and verification
 * Date Created: 2025-10-29
 * Version: 1.0.0
 * ==============================================================================
 */

import type { CID } from 'multiformats/cid';

/**
 * Merkle tree node stored in IPFS
 * 
 * Each node is stored as an IPFS object with its own CID.
 * The tree structure is maintained through CID pointers.
 */
export type MerkleNode = {
  hash: string;           // SHA-256 hash of node content
  left?: CID;            // Left child CID (in IPFS)
  right?: CID;           // Right child CID (in IPFS)
  data?: CID;            // Leaf node: points to fact CID
  isLeaf: boolean;       // True if this is a leaf node
};

/**
 * Merkle proof path from leaf to root
 * 
 * Array of sibling CIDs needed to reconstruct the path
 * from a specific fact to the root hash.
 */
export type MerkleProof = CID[];

/**
 * Merkle Tree Interface
 * 
 * IPFS-native Merkle tree implementation:
 * - Each node is stored in IPFS with its own CID
 * - Tree navigation via CID pointers (left/right)
 * - Root CID serves as the entire tree's address
 * - No separate persistence layer needed
 */
export interface IMerkleTree {
  /**
   * Build a Merkle tree from fact CIDs and store in IPFS
   * @param factCIDs - Array of fact content identifiers
   * @returns Root CID of the constructed tree
   */
  buildFromFacts(factCIDs: CID[]): Promise<CID>;

  /**
   * Generate a Merkle proof for a specific fact
   * @param rootCID - Root of the Merkle tree
   * @param factCID - Fact to generate proof for
   * @returns Array of sibling CIDs forming the proof path
   * @throws {Error} If fact not found in tree
   */
  generateProof(rootCID: CID, factCID: CID): Promise<MerkleProof>;

  /**
   * Verify a Merkle proof
   * @param rootCID - Expected root CID
   * @param factCID - Fact being verified
   * @param proof - Proof path (sibling CIDs)
   * @returns True if proof is valid
   */
  verifyProof(rootCID: CID, factCID: CID, proof: MerkleProof): Promise<boolean>;

  /**
   * Store a Merkle node in IPFS
   * @param node - Node to store
   * @returns CID of stored node
   */
  storeNode(node: MerkleNode): Promise<CID>;

  /**
   * Load a Merkle node from IPFS
   * @param nodeCID - CID of node to load
   * @returns Loaded node
   * @throws {Error} If node not found
   */
  loadNode(nodeCID: CID): Promise<MerkleNode>;

  /**
   * Get the hash of a node by its CID
   * @param nodeCID - CID of the node
   * @returns Node's hash value
   */
  getNodeHash(nodeCID: CID): Promise<string>;
}

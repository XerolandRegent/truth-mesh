/**
 * ==============================================================================
 * File Name: tree.ts
 * File Path: packages/core/src/merkle/tree.ts
 * Description: IPFS-native Merkle tree implementation
 * Date Created: 2025-10-29
 * Version: 1.0.0
 * ==============================================================================
 */

import type { CID } from 'multiformats/cid';
import type { IIPFSStorage } from '../interfaces/storage.js';
import type { ICryptoService } from '../interfaces/crypto.js';
import type { IMerkleTree, MerkleNode, MerkleProof } from '../interfaces/merkle.js';

/**
 * IPFS-Native Merkle Tree
 * 
 * Key architectural insight: The tree IS the IPFS structure.
 * - Each node is stored as an IPFS object (gets its own CID)
 * - Tree navigation happens via CID pointers (left/right)
 * - Root CID serves as the entire tree's address
 * - No separate persistence layer needed
 */
export class MerkleTree implements IMerkleTree {
  constructor(
    private readonly storage: IIPFSStorage,
    private readonly crypto: ICryptoService
  ) {}

  /**
   * Build a Merkle tree from fact CIDs and store in IPFS
   * @param factCIDs - Array of fact content identifiers
   * @returns Root CID of the constructed tree
   */
  async buildFromFacts(factCIDs: CID[]): Promise<CID> {
    if (factCIDs.length === 0) {
      throw new Error('Cannot build tree from empty fact list');
    }

    // Build leaf hashes from fact CIDs
    const leafHashes = factCIDs.map(cid => this.crypto.hashCID(cid));
    
    // Build tree layers bottom-up
    let currentLayer = leafHashes;
    
    while (currentLayer.length > 1) {
      const nextLayer: string[] = [];
      
      for (let i = 0; i < currentLayer.length; i += 2) {
        const left = currentLayer[i]!;
        const right = currentLayer[i + 1] || left; // Duplicate if odd
        
        const parentHash = this.crypto.hashPair(left, right);
        nextLayer.push(parentHash);
      }
      
      currentLayer = nextLayer;
    }
    
    const rootHash = currentLayer[0]!;
    
    // Store tree metadata in IPFS
    const treeData = {
      rootHash,
      factCIDs: factCIDs.map(cid => cid.toString()),
      leafHashes
    };
    
    return await this.storage.store(JSON.stringify(treeData));
  }

  /**
   * Generate a Merkle proof for a specific fact
   * @param rootCID - Root of the Merkle tree
   * @param factCID - Fact to generate proof for
   * @returns Array of sibling hashes forming the proof path
   */
  async generateProof(rootCID: CID, factCID: CID): Promise<MerkleProof> {
    // Load tree data
    const treeDataStr = await this.storage.retrieve(rootCID);
    const treeData = JSON.parse(treeDataStr) as {
      rootHash: string;
      factCIDs: string[];
      leafHashes: string[];
    };
    
    // Find the fact in the tree
    const targetCIDStr = factCID.toString();
    const index = treeData.factCIDs.indexOf(targetCIDStr);
    
    if (index === -1) {
      throw new Error(`Fact not found in tree: ${factCID.toString()}`);
    }
    
    // Generate proof with position info by building tree and collecting siblings
    type ProofElement = { hash: string; isLeft: boolean };
    const proofElements: ProofElement[] = [];
    let currentLayer = treeData.leafHashes;
    let currentIndex = index;
    
    while (currentLayer.length > 1) {
      const nextLayer: string[] = [];
      
      for (let i = 0; i < currentLayer.length; i += 2) {
        const left = currentLayer[i]!;
        const right = currentLayer[i + 1] || left;
        
        // If current index is in this pair, add sibling to proof
        if (i === currentIndex) {
          // Current is left, add right sibling
          if (i + 1 < currentLayer.length && right !== left) {
            proofElements.push({ hash: right, isLeft: false }); // Sibling goes on right
          }
        } else if (i + 1 === currentIndex) {
          // Current is right, add left sibling
          proofElements.push({ hash: left, isLeft: true }); // Sibling goes on left
        }
        
        nextLayer.push(this.crypto.hashPair(left, right));
      }
      
      currentIndex = Math.floor(currentIndex / 2);
      currentLayer = nextLayer;
    }
    
    // Store proof elements with position info in IPFS
    const proofCIDs: CID[] = [];
    for (const element of proofElements) {
      const elementData = JSON.stringify(element);
      const cid = await this.storage.store(elementData);
      proofCIDs.push(cid);
    }
    
    return proofCIDs;
  }

  /**
   * Verify a Merkle proof
   * @param rootCID - Expected root CID
   * @param factCID - Fact being verified
   * @param proof - Proof path (sibling CIDs with position info)
   * @returns True if proof is valid
   */
  async verifyProof(rootCID: CID, factCID: CID, proof: MerkleProof): Promise<boolean> {
    try {
      // Load tree data to get root hash
      const treeDataStr = await this.storage.retrieve(rootCID);
      const treeData = JSON.parse(treeDataStr) as {
        rootHash: string;
        factCIDs: string[];
        leafHashes: string[];
      };
      
      // CRITICAL: Verify the fact is actually in this tree
      const factCIDStr = factCID.toString();
      const factIndex = treeData.factCIDs.indexOf(factCIDStr);
      if (factIndex === -1) {
        return false; // Fact not in tree
      }
      
      // Start with the fact's hash
      let currentHash = this.crypto.hashCID(factCID);
      
      // Retrieve proof elements with position info
      type ProofElement = { hash: string; isLeft: boolean };
      for (const proofCID of proof) {
        const elementStr = await this.storage.retrieve(proofCID);
        const element: ProofElement = JSON.parse(elementStr);
        
        // Apply sibling hash in correct position
        if (element.isLeft) {
          // Sibling goes on left
          currentHash = this.crypto.hashPair(element.hash, currentHash);
        } else {
          // Sibling goes on right
          currentHash = this.crypto.hashPair(currentHash, element.hash);
        }
      }
      
      // Check if we reached the root
      return currentHash === treeData.rootHash;
      
    } catch (error) {
      return false;
    }
  }

  /**
   * Store a Merkle node in IPFS
   * @param node - Node to store
   * @returns CID of stored node
   */
  async storeNode(node: MerkleNode): Promise<CID> {
    const nodeData = JSON.stringify({
      hash: node.hash,
      left: node.left?.toString(),
      right: node.right?.toString(),
      data: node.data?.toString(),
      isLeaf: node.isLeaf
    });

    return await this.storage.store(nodeData);
  }

  /**
   * Load a Merkle node from IPFS
   * @param nodeCID - CID of node to load
   * @returns Loaded node
   */
  async loadNode(nodeCID: CID): Promise<MerkleNode> {
    const nodeData = await this.storage.retrieve(nodeCID);
    const parsed = JSON.parse(nodeData);

    // Reconstruct CIDs from strings
    const { CID: CIDClass } = await import('multiformats/cid');

    return {
      hash: parsed.hash,
      left: parsed.left ? CIDClass.parse(parsed.left) : undefined,
      right: parsed.right ? CIDClass.parse(parsed.right) : undefined,
      data: parsed.data ? CIDClass.parse(parsed.data) : undefined,
      isLeaf: parsed.isLeaf
    };
  }

  /**
   * Get the hash of a node by its CID
   * @param nodeCID - CID of the node
   * @returns Node's hash value
   */
  async getNodeHash(nodeCID: CID): Promise<string> {
    const node = await this.loadNode(nodeCID);
    return node.hash;
  }
}
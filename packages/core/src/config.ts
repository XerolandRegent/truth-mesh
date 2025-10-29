/**
 * ==============================================================================
 * File Name: config.ts
 * File Path: packages/core/src/config.ts
 * Description: Configuration types and default settings for Truth Mesh
 * Date Created: 2025-10-29
 * Version: 1.0.0
 * ==============================================================================
 */

import type { IIPFSStorage } from './interfaces';

/**
 * IPFS Configuration
 */
export type IPFSConfig = {
  mode?: 'development' | 'production' | 'test';
  storage?: string; // Path for persistent storage
  bootstrap?: string[]; // Bootstrap node addresses
};

/**
 * Crypto Configuration
 */
export type CryptoConfig = {
  algorithm?: 'Ed25519'; // Currently only Ed25519 supported
};

/**
 * Truth Mesh Configuration
 */
export type TruthMeshConfig = {
  /**
   * IPFS storage configuration
   * Can be either config object or custom storage implementation
   */
  ipfs?: IPFSConfig;
  
  /**
   * Custom storage implementation (overrides ipfs config)
   * Useful for testing with MockIPFSStorage
   */
  storage?: IIPFSStorage;
  
  /**
   * Cryptographic configuration
   */
  crypto?: CryptoConfig;
  
  /**
   * Enable automatic pinning of stored facts
   * @default true
   */
  autoPin?: boolean;
  
  /**
   * Timeout for operations in milliseconds
   * @default 30000 (30 seconds)
   */
  timeout?: number;
};

/**
 * Default configuration
 */
export const defaultConfig: Required<Omit<TruthMeshConfig, 'storage'>> & Pick<TruthMeshConfig, 'storage'> = {
  ipfs: {
    mode: 'development'
  },
  storage: undefined,
  crypto: {
    algorithm: 'Ed25519'
  },
  autoPin: true,
  timeout: 30000
};

/**
 * Merge user config with defaults
 */
export function mergeConfig(userConfig?: TruthMeshConfig): TruthMeshConfig {
  return {
    ...defaultConfig,
    ...userConfig,
    ipfs: {
      ...defaultConfig.ipfs,
      ...userConfig?.ipfs
    },
    crypto: {
      ...defaultConfig.crypto,
      ...userConfig?.crypto
    }
  };
}

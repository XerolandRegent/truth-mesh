/**
 * ==============================================================================
 * File Name: config-manager.ts
 * File Path: packages/cli/src/utils/config-manager.ts
 * Description: Manage CLI configuration for Truth Mesh
 * Date Created: 2025-10-29
 * Version: 0.1.0
 * ==============================================================================
 */

import fs from 'fs/promises';
import path from 'path';
import os from 'os';

/**
 * CLI Configuration structure
 */
export interface TruthMeshCLIConfig {
  version: string;
  ipfs: {
    mode: 'development' | 'production' | 'test';
    storage?: string;
    bootstrap?: string[];
  };
  cli: {
    outputFormat: 'pretty' | 'json';
    verbose: boolean;
  };
  advanced: {
    timeout: number;
    retries: number;
  };
}

/**
 * Configuration Manager
 * 
 * Handles loading, saving, and managing CLI configuration.
 */
export class ConfigManager {
  private readonly configPath: string;
  private readonly defaultConfig: TruthMeshCLIConfig;

  constructor(configDir?: string) {
    const dir = configDir ?? path.join(os.homedir(), '.truth-mesh');
    this.configPath = path.join(dir, 'config.json');

    this.defaultConfig = {
      version: '1.0.0',
      ipfs: {
        mode: 'development'
      },
      cli: {
        outputFormat: 'pretty',
        verbose: false
      },
      advanced: {
        timeout: 30000,
        retries: 3
      }
    };
  }

  /**
   * Get the config file path
   */
  getConfigPath(): string {
    return this.configPath;
  }

  /**
   * Check if config file exists
   */
  async exists(): Promise<boolean> {
    try {
      await fs.access(this.configPath);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Create new configuration
   */
  async create(config: Partial<TruthMeshCLIConfig>): Promise<void> {
    const fullConfig: TruthMeshCLIConfig = {
      ...this.defaultConfig,
      ...config,
      ipfs: {
        ...this.defaultConfig.ipfs,
        ...config.ipfs
      },
      cli: {
        ...this.defaultConfig.cli,
        ...config.cli
      },
      advanced: {
        ...this.defaultConfig.advanced,
        ...config.advanced
      }
    };

    await this.save(fullConfig);
  }

  /**
   * Load configuration from disk
   */
  async load(): Promise<TruthMeshCLIConfig> {
    try {
      const data = await fs.readFile(this.configPath, 'utf-8');
      const config = JSON.parse(data);

      // Merge with defaults for any missing fields
      return {
        ...this.defaultConfig,
        ...config,
        ipfs: {
          ...this.defaultConfig.ipfs,
          ...config.ipfs
        },
        cli: {
          ...this.defaultConfig.cli,
          ...config.cli
        },
        advanced: {
          ...this.defaultConfig.advanced,
          ...config.advanced
        }
      };
    } catch {
      // Config doesn't exist, return defaults
      return this.defaultConfig;
    }
  }

  /**
   * Save configuration to disk
   */
  async save(config: TruthMeshCLIConfig): Promise<void> {
    const dir = path.dirname(this.configPath);
    await fs.mkdir(dir, { recursive: true });

    await fs.writeFile(
      this.configPath,
      JSON.stringify(config, null, 2),
      'utf-8'
    );
  }

  /**
   * Get a specific config value by dot-notation path
   */
  async get(keyPath: string): Promise<unknown> {
    const config = await this.load();
    return this.getNestedValue(config as any, keyPath);
  }

  /**
   * Set a specific config value by dot-notation path
   */
  async set(keyPath: string, value: unknown): Promise<void> {
    const config = await this.load();
    this.setNestedValue(config as any, keyPath, value);
    await this.save(config);
  }

  /**
   * Reset configuration to defaults
   */
  async reset(): Promise<void> {
    await this.save(this.defaultConfig);
  }

  /**
   * Delete configuration file
   */
  async delete(): Promise<void> {
    try {
      await fs.unlink(this.configPath);
    } catch {
      // File doesn't exist, nothing to delete
    }
  }

  // ============================================================================
  // Private Helper Methods
  // ============================================================================

  /**
   * Get nested value from object using dot notation
   */
  private getNestedValue(obj: Record<string, unknown>, path: string): unknown {
    return path.split('.').reduce((current, key) => {
      return current?.[key] as Record<string, unknown>;
    }, obj as Record<string, unknown>);
  }

  /**
   * Set nested value in object using dot notation
   */
  private setNestedValue(
    obj: Record<string, unknown>,
    path: string,
    value: unknown
  ): void {
    const keys = path.split('.');
    const lastKey = keys.pop()!;

    const target = keys.reduce((current, key) => {
      if (!current[key] || typeof current[key] !== 'object') {
        current[key] = {};
      }
      return current[key] as Record<string, unknown>;
    }, obj);

    target[lastKey] = value;
  }
}
/**
 * ==============================================================================
 * File Name: utils.test.ts
 * File Path: packages/cli/tests/utils.test.ts
 * Description: CLI Integration Tests - Basic smoke tests for CLI commands
 * Date Created: 2025-10-29
 * Version: 0.1.0
 * ==============================================================================
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { KeyPairManager } from '../src/utils/keypair-manager';
import { ConfigManager } from '../src/utils/config-manager';
import { Formatter } from '../src/utils/formatter';
import fs from 'fs/promises';
import path from 'path';
import os from 'os';

describe('CLI Utilities', () => {
  const testDir = path.join(os.tmpdir(), `truth-mesh-test-${Date.now()}`);
  
  beforeEach(async () => {
    await fs.mkdir(testDir, { recursive: true });
  });

  afterEach(async () => {
    try {
      await fs.rm(testDir, { recursive: true, force: true });
    } catch {
      // Ignore cleanup errors
    }
  });

  describe('KeyPairManager', () => {
    it('should create and load keypair', async () => {
      const manager = new KeyPairManager(testDir);
      
      // Should not exist initially
      expect(await manager.exists()).toBe(false);

      // Create mock keypair
      const mockKeyPair = {
        publicKey: new Uint8Array(32).fill(1),
        privateKey: new Uint8Array(64).fill(2)
      };

      // Save
      await manager.save(mockKeyPair);
      expect(await manager.exists()).toBe(true);

      // Load
      const loaded = await manager.load();
      expect(loaded.publicKey).toEqual(mockKeyPair.publicKey);
      expect(loaded.privateKey).toEqual(mockKeyPair.privateKey);

      // Get info
      const info = await manager.getInfo();
      expect(info).toBeTruthy();
      expect(info?.publicKey).toBeTruthy();
    });

    it('should handle hex conversion correctly', async () => {
      const manager = new KeyPairManager(testDir);
      
      const keyPair = {
        publicKey: new Uint8Array([0x01, 0x23, 0x45, 0x67, 0x89, 0xab, 0xcd, 0xef]),
        privateKey: new Uint8Array([0xfe, 0xdc, 0xba, 0x98, 0x76, 0x54, 0x32, 0x10])
      };

      await manager.save(keyPair);
      const loaded = await manager.load();

      expect(loaded.publicKey).toEqual(keyPair.publicKey);
      expect(loaded.privateKey).toEqual(keyPair.privateKey);
    });
  });

  describe('ConfigManager', () => {
    it('should create and load config', async () => {
      const manager = new ConfigManager(testDir);
      
      expect(await manager.exists()).toBe(false);

      await manager.initialize();
      expect(await manager.exists()).toBe(true);

      const config = await manager.load();
      expect(config.ipfs.mode).toBe('development');
      expect(config.cli.outputFormat).toBe('pretty');
    });

    it('should get and set nested values', async () => {
      const manager = new ConfigManager(testDir);
      await manager.initialize();

      // Set value
      await manager.set('cli.verbose', true);
      
      // Get value
      const value = await manager.get('cli.verbose');
      expect(value).toBe(true);

      // Verify in full config
      const config = await manager.load();
      expect(config.cli.verbose).toBe(true);
    });

    it('should handle dot notation paths', async () => {
      const manager = new ConfigManager(testDir);
      await manager.initialize();

      await manager.set('ipfs.mode', 'production');
      expect(await manager.get('ipfs.mode')).toBe('production');

      await manager.set('advanced.timeout', 60000);
      expect(await manager.get('advanced.timeout')).toBe(60000);
    });
  });

  describe('Formatter', () => {
    it('should format success messages', () => {
      const formatter = new Formatter({ format: 'pretty' });
      
      // Should not throw
      expect(() => {
        formatter.success('Test message', { key: 'value' });
      }).not.toThrow();
    });

    it('should format JSON output', () => {
      const formatter = new Formatter({ format: 'json' });
      
      const originalLog = console.log;
      let output = '';
      console.log = (msg: string) => { output = msg; };

      formatter.success('Test', { key: 'value' });

      console.log = originalLog;

      const parsed = JSON.parse(output);
      expect(parsed.success).toBe(true);
      expect(parsed.key).toBe('value');
    });

    it('should format table data', () => {
      const formatter = new Formatter({ format: 'pretty' });
      
      expect(() => {
        formatter.table({
          'Key 1': 'Value 1',
          'Key 2': 'Value 2'
        });
      }).not.toThrow();
    });
  });
});

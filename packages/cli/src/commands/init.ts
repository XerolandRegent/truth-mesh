/**
 * ==============================================================================
 * File Name: init.ts
 * File Path: packages/cli/src/commands/init.ts
 * Description: Initialize Truth Mesh configuration and keypair
 * Date Created: 2025-10-29
 * Version: 0.1.0
 * ==============================================================================
 */

import { TruthMesh } from '@truth-mesh/core';
import { ConfigManager } from '../utils/config-manager.js';
import { KeyPairManager } from '../utils/keypair-manager.js';
import { Formatter } from '../utils/formatter.js';
import { PersistentMockStorage } from '../storage/persistent-mock.js';
import enquirer from 'enquirer';
import ora from 'ora';

export interface InitOptions {
  production?: boolean;
  force?: boolean;
  json?: boolean;
  verbose?: boolean;
}

export async function initCommand(options: InitOptions): Promise<void> {
  const formatter = new Formatter({
    format: options.json ? 'json' : 'pretty',
    verbose: options.verbose
  });

  const configManager = new ConfigManager();
  const keyPairManager = new KeyPairManager();

  try {
    // Check if already initialized
    const configExists = await configManager.exists();
    const keyPairExists = await keyPairManager.exists();

    if ((configExists || keyPairExists) && !options.force) {
      const { reinitialize } = await enquirer.prompt<{ reinitialize: boolean }>({
        type: 'confirm',
        name: 'reinitialize',
        message: 'Truth Mesh is already initialized. Reinitialize?',
        initial: false
      });

      if (!reinitialize) {
        formatter.info('⚠ Initialization cancelled. Existing configuration preserved.');
        return;
      }
    }

    // Create configuration
    const ipfsMode = options.production ? 'production' : 'development';
    await configManager.create({
      ipfs: {
        mode: ipfsMode
      }
    });
    formatter.success('✔ Configuration created');

    // Initialize Truth Mesh to test setup
    const spinner = options.json ? null : ora('Generating keypair...').start();
    
    let truthMesh: TruthMesh;
    if (ipfsMode === 'development') {
      // Use persistent mock storage for CLI
      const storage = new PersistentMockStorage();
      truthMesh = new TruthMesh({ storage });
    } else {
      // Use real Helia for production
      truthMesh = new TruthMesh({
        ipfs: {
          mode: ipfsMode,
          storage: await configManager.get('ipfs.storage') as string | undefined,
          bootstrap: await configManager.get('ipfs.bootstrap') as string[] | undefined
        }
      });
    }
    
    await truthMesh.initialize();

    // Generate keypair
    const keyPair = truthMesh.generateKeyPair();
    await keyPairManager.save(keyPair);
    
    await truthMesh.shutdown();
    spinner?.succeed('Keypair generated');

    // Display summary
    const config = await configManager.load();
    const publicKeyHex = keyPairManager.publicKeyToHex(keyPair.publicKey);

    formatter.success('✓ Truth Mesh initialized successfully!', {
      'Config path': configManager.getConfigPath(),
      'Keypair path': keyPairManager.getKeyPairPath(),
      'Public key': publicKeyHex.substring(0, 60) + '...',
      'IPFS mode': config.ipfs.mode,
      'Output format': config.cli.outputFormat
    });

    if (options.verbose) {
      console.log('\nℹ Next steps:');
      console.log('  1. Store a fact: truth-mesh store <file>');
      console.log('  2. View your keypair: truth-mesh keypair show');
      console.log('  3. Configure settings: truth-mesh config');
      
      console.log('\nℹ Data locations:');
      console.log(`  Config: ${configManager.getConfigPath()}`);
      console.log(`  Keypair: ${keyPairManager.getKeyPairPath()}`);
      if (ipfsMode === 'development') {
        const os = await import('os');
        const path = await import('path');
        console.log(`  Storage: ${path.default.join(os.default.homedir(), '.truth-mesh', 'data')}`);
      }
    }

  } catch (error) {
    formatter.error('Initialization failed', error as Error);
    process.exit(1);
  }
}
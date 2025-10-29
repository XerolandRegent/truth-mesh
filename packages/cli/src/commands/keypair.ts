/**
 * ==============================================================================
 * File Name: keypair.ts
 * File Path: packages/cli/src/commands/keypair.ts
 * Description: Manage Ed25519 keypairs for signing facts
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

export interface KeyPairOptions {
  force?: boolean;
  json?: boolean;
  verbose?: boolean;
}

export async function keypairShowCommand(options: KeyPairOptions): Promise<void> {
  const formatter = new Formatter({
    format: options.json ? 'json' : 'pretty',
    verbose: options.verbose
  });

  const keyPairManager = new KeyPairManager();

  try {
    const keyPair = await keyPairManager.load();
    
    if (!keyPair) {
      formatter.error('✗ No keypair found. Run "truth-mesh init" or "truth-mesh keypair generate" first.');
      process.exit(1);
    }

    const publicKeyHex = keyPairManager.publicKeyToHex(keyPair.publicKey);
    const metadata = await keyPairManager.getMetadata();

    if (options.json) {
      console.log(JSON.stringify({
        publicKey: publicKeyHex,
        created: metadata?.created,
        path: keyPairManager.getKeyPairPath()
      }, null, 2));
    } else {
      formatter.info('ℹ Current keypair', {
        'Public key': publicKeyHex.substring(0, 60) + '...',
        'Created': metadata?.created ? new Date(metadata.created).toISOString() : 'Unknown',
        'Path': keyPairManager.getKeyPairPath()
      });

      if (options.verbose) {
        console.log('\nℹ Full public key:');
        console.log(publicKeyHex);
      }
    }
  } catch (error) {
    formatter.error('Failed to show keypair', error as Error);
    process.exit(1);
  }
}

export async function keypairGenerateCommand(options: KeyPairOptions): Promise<void> {
  const formatter = new Formatter({
    format: options.json ? 'json' : 'pretty',
    verbose: options.verbose
  });

  const configManager = new ConfigManager();
  const keyPairManager = new KeyPairManager();

  try {
    // Check if keypair already exists
    const exists = await keyPairManager.exists();
    
    if (exists && !options.force) {
      const { overwrite } = await enquirer.prompt<{ overwrite: boolean }>({
        type: 'confirm',
        name: 'overwrite',
        message: 'Keypair already exists. Overwrite? (This cannot be undone)',
        initial: false
      });

      if (!overwrite) {
        formatter.info('⚠ Generation cancelled. Existing keypair preserved.');
        return;
      }
    }

    // Load config
    const config = await configManager.load();
    const ipfsMode = config.ipfs.mode;

    // Initialize Truth Mesh
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
          storage: config.ipfs.storage,
          bootstrap: config.ipfs.bootstrap
        }
      });
    }
    
    await truthMesh.initialize();

    // Generate new keypair
    const keyPair = truthMesh.generateKeyPair();
    await keyPairManager.save(keyPair);
    
    await truthMesh.shutdown();
    spinner?.succeed('Keypair generated');

    // Display result
    const publicKeyHex = keyPairManager.publicKeyToHex(keyPair.publicKey);

    if (options.json) {
      console.log(JSON.stringify({
        success: true,
        publicKey: publicKeyHex,
        path: keyPairManager.getKeyPairPath()
      }, null, 2));
    } else {
      formatter.success('✓ New keypair generated', {
        'Public key': publicKeyHex.substring(0, 60) + '...',
        'Path': keyPairManager.getKeyPairPath()
      });

      if (options.verbose) {
        console.log('\nℹ Full public key:');
        console.log(publicKeyHex);
      }
    }

  } catch (error) {
    formatter.error('Failed to generate keypair', error as Error);
    process.exit(1);
  }
}

export async function keypairExportCommand(options: KeyPairOptions): Promise<void> {
  const formatter = new Formatter({
    format: options.json ? 'json' : 'pretty',
    verbose: options.verbose
  });

  const keyPairManager = new KeyPairManager();

  try {
    const keyPair = await keyPairManager.load();
    
    if (!keyPair) {
      formatter.error('✗ No keypair found. Run "truth-mesh init" first.');
      process.exit(1);
    }

    const publicKeyHex = keyPairManager.publicKeyToHex(keyPair.publicKey);
    const privateKeyHex = keyPairManager.privateKeyToHex(keyPair.privateKey);

    console.log(JSON.stringify({
      publicKey: publicKeyHex,
      privateKey: privateKeyHex
    }, null, 2));

    if (!options.json) {
      console.error('\n⚠ WARNING: Keep your private key secure!');
      console.error('⚠ Anyone with your private key can sign facts as you.');
    }

  } catch (error) {
    formatter.error('Failed to export keypair', error as Error);
    process.exit(1);
  }
}
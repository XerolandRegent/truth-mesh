/**
 * ==============================================================================
 * File Name: store.ts
 * File Path: packages/cli/src/commands/store.ts
 * Description: Store facts with cryptographic signatures and Merkle proofs
 * Date Created: 2025-10-29
 * Version: 0.1.0
 * ==============================================================================
 */

import fs from 'fs/promises';
import path from 'path';
import { TruthMesh, type FactInput } from '@truth-mesh/core';
import { ConfigManager } from '../utils/config-manager.js';
import { KeyPairManager } from '../utils/keypair-manager.js';
import { Formatter } from '../utils/formatter.js';
import { PersistentMockStorage } from '../storage/persistent-mock.js';
import ora from 'ora';

export interface StoreOptions {
  content?: string;
  source?: string;
  batch?: string;
  production?: boolean;
  json?: boolean;
  verbose?: boolean;
}

export async function storeCommand(
  file: string | undefined,
  options: StoreOptions
): Promise<void> {
  const formatter = new Formatter({
    format: options.json ? 'json' : 'pretty',
    verbose: options.verbose
  });

  const configManager = new ConfigManager();
  const keyPairManager = new KeyPairManager();

  try {
    // Validate inputs
    if (!options.content && !file && !options.batch) {
      formatter.error('No input provided. Specify --content, a file, or --batch directory');
      process.exit(1);
    }

    // Load keypair
    const keyPair = await keyPairManager.load();
    if (!keyPair) {
      formatter.error('No keypair found. Run "truth-mesh init" first.');
      process.exit(1);
    }

    // Load config
    const config = await configManager.load();
    const ipfsMode = options.production ? 'production' : config.ipfs.mode;

    // Initialize Truth Mesh with appropriate storage
    const spinner = options.json ? null : ora('Initializing Truth Mesh...').start();
    
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
    spinner?.succeed('Truth Mesh initialized');

    // Handle batch storage
    if (options.batch) {
      await storeBatch(options.batch, truthMesh, keyPair, options, formatter);
      await truthMesh.shutdown();
      return;
    }

    // Prepare fact input
    let factInput: FactInput;

    if (options.content) {
      // Inline content
      factInput = {
        content: options.content,
        source: options.source ?? 'inline',
        timestamp: Date.now()
      };
    } else if (file) {
      // File content
      const fileContent = await fs.readFile(file, 'utf-8');
      factInput = {
        content: fileContent.trim(),
        source: options.source ?? file,
        timestamp: Date.now()
      };
    } else {
      throw new Error('No content to store');
    }

    // Store fact
    const storeSpinner = options.json ? null : ora('Storing fact...').start();
    const result = await truthMesh.storeFact(factInput, keyPair);
    storeSpinner?.succeed('Fact stored successfully');

    await truthMesh.shutdown();

    // Format output
    formatter.success('✓ Fact stored', {
      'CID': result.cid.toString(),
      'Root': result.root.toString(),
      'Signature': result.signature.substring(0, 40) + '...',
      'Proof length': result.proof.length,
      'Source': factInput.source,
      'Mode': ipfsMode
    });

    if (options.verbose) {
      console.log('\nℹ Save this information for verification:');
      console.log(`  CID: ${result.cid.toString()}`);
      console.log(`  Root: ${result.root.toString()}`);
      console.log(`  Proof: ${result.proof.map(p => p.toString()).join(',')}`);
    }

  } catch (error) {
    formatter.error('Failed to store fact', error as Error);
    process.exit(1);
  }
}

/**
 * Store multiple facts from a directory
 */
async function storeBatch(
  directory: string,
  truthMesh: TruthMesh,
  keyPair: any,
  options: StoreOptions,
  formatter: Formatter
): Promise<void> {
  const spinner = options.json ? null : ora('Scanning directory...').start();

  // Read all files from directory
  const files = await fs.readdir(directory);
  const txtFiles = files.filter(f => f.endsWith('.txt') || f.endsWith('.json'));

  if (txtFiles.length === 0) {
    spinner?.fail('No .txt or .json files found');
    process.exit(1);
  }

  spinner?.succeed(`Found ${txtFiles.length} files`);

  // Prepare all facts
  const facts: FactInput[] = [];
  for (const file of txtFiles) {
    const filePath = path.join(directory, file);
    const content = await fs.readFile(filePath, 'utf-8');
    facts.push({
      content: content.trim(),
      source: options.source ?? file,
      timestamp: Date.now()
    });
  }

  // Store batch
  const batchSpinner = options.json ? null : ora(`Storing ${facts.length} facts...`).start();
  
  if (batchSpinner) {
    batchSpinner.text = `Storing ${facts.length} facts...`;
  }
  
  const results = await truthMesh.storeFactBatch(facts, keyPair);
  batchSpinner?.succeed(`Stored ${results.length} facts`);

  // Output results
  if (options.json) {
    console.log(JSON.stringify({
      success: true,
      count: results.length,
      root: results[0]?.root.toString(),
      facts: results.map((result: any, index: number) => ({
        file: txtFiles[index],
        cid: result.cid.toString(),
        signature: result.signature,
        proof: result.proof.map((p: any) => p.toString())
      }))
    }, null, 2));
  } else {
    formatter.success(`✓ Batch stored: ${results.length} facts`, {
      'Root CID': results[0]?.root.toString() ?? 'N/A',
      'Mode': options.production ? 'production' : 'development'
    });

    console.log('\nℹ Individual facts:');
    results.forEach((result: any, index: number) => {
      console.log(`  ${txtFiles[index]}: ${result.cid.toString()}`);
    });

    if (options.verbose) {
      console.log('\nℹ Save results to file for verification:');
      console.log(`  truth-mesh store --batch ${directory} --json > batch-results.json`);
    }
  }
}
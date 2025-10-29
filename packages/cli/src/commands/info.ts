/**
 * ==============================================================================
 * File Name: info.ts
 * File Path: packages/cli/src/commands/info.ts
 * Description: Display detailed information about stored facts
 * Date Created: 2025-10-29
 * Version: 0.1.0
 * ==============================================================================
 */

import { TruthMesh } from '@truth-mesh/core';
import { CID } from 'multiformats/cid';
import { ConfigManager } from '../utils/config-manager.js';
import { Formatter } from '../utils/formatter.js';
import { PersistentMockStorage } from '../storage/persistent-mock.js';
import ora from 'ora';

export interface InfoOptions {
  production?: boolean;
  json?: boolean;
  verbose?: boolean;
}

export async function infoCommand(
  cidString: string,
  options: InfoOptions
): Promise<void> {
  const formatter = new Formatter({
    format: options.json ? 'json' : 'pretty',
    verbose: options.verbose
  });

  const configManager = new ConfigManager();

  try {
    // Parse CID
    let cid: CID;
    try {
      cid = CID.parse(cidString);
    } catch (error) {
      formatter.error('Invalid CID format', error as Error);
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

    // Check if fact exists
    const hasSpinner = options.json ? null : ora('Checking existence...').start();
    const exists = await truthMesh.hasFact(cid);
    
    if (!exists) {
      hasSpinner?.fail('Fact not found');
      formatter.error(`Fact not found: ${cidString}`);
      await truthMesh.shutdown();
      process.exit(1);
    }
    hasSpinner?.succeed('Fact found');

    // Retrieve fact
    const retrieveSpinner = options.json ? null : ora('Retrieving fact...').start();
    const fact = await truthMesh.retrieveFact(cid);
    retrieveSpinner?.succeed('Fact retrieved');

    await truthMesh.shutdown();

    // Format output
    if (options.json) {
      console.log(JSON.stringify({
        cid: cidString,
        fact,
        mode: ipfsMode
      }, null, 2));
    } else {
      formatter.success('✓ Fact information', {
        'CID': cidString,
        'Content': fact.content.length > 100 
          ? fact.content.substring(0, 100) + '...' 
          : fact.content,
        'Source': fact.source,
        'Timestamp': new Date(fact.timestamp).toISOString(),
        'Public Key': fact.publicKey.substring(0, 40) + '...',
        'Signature': fact.signature.substring(0, 40) + '...',
        'Mode': ipfsMode
      });

      if (options.verbose) {
        console.log('\nℹ Full content:');
        console.log(fact.content);
        console.log('\nℹ Complete public key:');
        console.log(fact.publicKey);
        console.log('\nℹ Complete signature:');
        console.log(fact.signature);
        
        if (fact.metadata) {
          console.log('\nℹ Metadata:');
          console.log(JSON.stringify(fact.metadata, null, 2));
        }
      }
    }

  } catch (error) {
    formatter.error('Failed to retrieve fact information', error as Error);
    process.exit(1);
  }
}
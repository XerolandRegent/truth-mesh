/**
 * ==============================================================================
 * File Name: verify.ts
 * File Path: packages/cli/src/commands/verify.ts
 * Description: Verify facts with Merkle proofs and signatures
 * Date Created: 2025-10-29
 * Version: 0.1.0
 * ==============================================================================
 */

import fs from 'fs/promises';
import { TruthMesh, type VerificationRequest } from '@truth-mesh/core';
import { CID } from 'multiformats/cid';
import { ConfigManager } from '../utils/config-manager.js';
import { Formatter } from '../utils/formatter.js';
import ora from 'ora';

export interface VerifyOptions {
  proofFile?: string;
  root?: string;
  proof?: string;
  production?: boolean;
  json?: boolean;
  verbose?: boolean;
}

export async function verifyCommand(
  cidString: string,
  options: VerifyOptions
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

    // Load verification request
    let request: VerificationRequest;

    if (options.proofFile) {
      // Load from JSON file
      request = await loadProofFile(options.proofFile, cid, formatter);
    } else if (options.root && options.proof) {
      // Manual arguments
      try {
        const rootCID = CID.parse(options.root);
        const proofCIDs = options.proof.split(',').map(p => CID.parse(p.trim()));

        request = {
          cid,
          root: rootCID,
          proof: proofCIDs,
          signature: '',
          publicKey: undefined
        };
      } catch (error) {
        formatter.error('Invalid proof format', error as Error);
        process.exit(1);
      }
    } else {
      formatter.error(
        'Missing proof data. Provide either --proof-file or both --root and --proof'
      );
      process.exit(1);
    }

    // Load config
    const config = await configManager.load();
    const ipfsMode = options.production ? 'production' : config.ipfs.mode;

    // Initialize Truth Mesh
    const spinner = options.json ? null : ora('Initializing Truth Mesh...').start();
    
    const truthMesh = new TruthMesh({
      ipfs: {
        mode: ipfsMode,
        storage: config.ipfs.storage,
        bootstrap: config.ipfs.bootstrap
      }
    });
    
    await truthMesh.initialize();
    spinner?.succeed('Truth Mesh initialized');

    // Verify fact
    const verifySpinner = options.json ? null : ora('Verifying fact...').start();
    
    const result = await truthMesh.verifyFact(request);
    
    if (result.valid) {
      verifySpinner?.succeed('Verification successful');
    } else {
      verifySpinner?.fail('Verification failed');
    }

    await truthMesh.shutdown();

    // Format output
    if (result.valid) {
      formatter.success('✓ Fact verified successfully', {
        'CID': cid.toString(),
        'Status': 'Valid'
      });

      if (options.verbose && result.checks && result.checks.length > 0) {
        console.log();
        formatter.info('Verification checks', {
          'Total checks': result.checks.length,
          'All passed': result.checks.every(c => c.passed)
        });
        
        // Show individual check details
        result.checks.forEach(check => {
          console.log(`  ${check.name}: ${check.passed ? '✓' : '✗'} ${check.message}`);
        });
      }
    } else {
      formatter.error('✗ Verification failed');
      
      if (result.checks && result.checks.length > 0) {
        console.log();
        const failedChecks = result.checks.filter(c => !c.passed);
        formatter.table({
          'Total checks': result.checks.length,
          'Failed checks': failedChecks.length,
          'Failed types': failedChecks.map(c => c.name).join(', ')
        });
        
        // Show details of failed checks
        if (options.verbose) {
          console.log();
          failedChecks.forEach(check => {
            console.log(`  ${check.name}: ${check.message}`);
            if (check.error) {
              console.log(`    Error: ${check.error}`);
            }
          });
        }
      }

      process.exit(1);
    }

  } catch (error) {
    formatter.error('Verification error', error as Error);
    process.exit(1);
  }
}

/**
 * Load proof from JSON file
 */
async function loadProofFile(
  filePath: string,
  cid: CID,
  formatter: Formatter
): Promise<VerificationRequest> {
  try {
    const fileContent = await fs.readFile(filePath, 'utf-8');
    const data = JSON.parse(fileContent);

    // Handle both single fact and batch results formats
    if (data.facts && Array.isArray(data.facts)) {
      // Batch results file - find matching CID
      const fact = data.facts.find((f: any) => f.cid === cid.toString());
      
      if (!fact) {
        throw new Error(`CID ${cid.toString()} not found in batch results`);
      }

      return {
        cid,
        root: CID.parse(data.root || fact.root),
        proof: fact.proof.map((p: string) => CID.parse(p)),
        signature: fact.signature || '',
        publicKey: fact.publicKey
      };
    } else {
      // Single fact format
      return {
        cid,
        root: CID.parse(data.root),
        proof: data.proof.map((p: string) => CID.parse(p)),
        signature: data.signature || '',
        publicKey: data.publicKey
      };
    }
  } catch (error) {
    formatter.error(`Failed to load proof file: ${filePath}`, error as Error);
    process.exit(1);
  }
}
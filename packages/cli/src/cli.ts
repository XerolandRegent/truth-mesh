#!/usr/bin/env node

/**
 * ==============================================================================
 * File Name: cli.ts
 * File Path: packages/cli/src/cli.ts
 * Description: Main CLI entry point with Commander.js integration
 * Date Created: 2025-10-29
 * Version: 0.1.0
 * ==============================================================================
 */

import { Command } from 'commander';
import chalk from 'chalk';
import { initCommand } from './commands/init.js';
import { keypairGenerateCommand, keypairShowCommand, keypairExportCommand } from './commands/keypair.js';
import { storeCommand } from './commands/store.js';
import { verifyCommand } from './commands/verify.js';
import { infoCommand } from './commands/info.js';
import { ConfigManager } from './utils/config-manager.js';

const program = new Command();

// CLI Metadata
program
  .name('truth-mesh')
  .description('Decentralized fact verification with cryptographic proofs')
  .version('0.1.0')
  .option('--verbose', 'Enable verbose output')
  .option('--json', 'Output in JSON format');

// Global error handler
process.on('uncaughtException', (error) => {
  console.error(chalk.red('Fatal error:'), error.message);
  if (process.argv.includes('--verbose')) {
    console.error(chalk.red('Stack trace:'), error.stack);
  }
  process.exit(1);
});

process.on('unhandledRejection', (reason) => {
  console.error(chalk.red('Unhandled promise rejection:'), reason);
  process.exit(1);
});

// ============================================================================
// Init Command
// ============================================================================

program
  .command('init')
  .description('Initialize Truth Mesh configuration and keypair')
  .option('-f, --force', 'Force reinitialization')
  .action(async (options) => {
    const globalOpts = program.opts();
    await initCommand({
      force: options.force,
      json: globalOpts.json,
      verbose: globalOpts.verbose
    });
  });

// ============================================================================
// Keypair Commands
// ============================================================================
const keypairCmd = program
  .command('keypair')
  .description('Manage Ed25519 keypairs');

keypairCmd
  .command('generate')
  .description('Generate a new keypair')
  .option('-f, --force', 'Overwrite existing keypair')
  .action(async (options) => {
    const globalOpts = program.opts();
    await keypairGenerateCommand({
      force: options.force,
      json: globalOpts.json,
      verbose: globalOpts.verbose
    });
  });

keypairCmd
  .command('show')
  .description('Show current keypair public key')
  .action(async () => {
    const globalOpts = program.opts();
    await keypairShowCommand({
      json: globalOpts.json,
      verbose: globalOpts.verbose
    });
  });

keypairCmd
  .command('export')
  .description('Export keypair (including private key)')
  .action(async () => {
    const globalOpts = program.opts();
    await keypairExportCommand({
      json: globalOpts.json,
      verbose: globalOpts.verbose
    });
  });

// ============================================================================
// Store Command
// ============================================================================

program
  .command('store [file]')
  .description('Store a fact with cryptographic signature')
  .option('-c, --content <text>', 'Inline content (instead of file)')
  .option('-s, --source <source>', 'Fact source/author')
  .option('-b, --batch <directory>', 'Store all files in directory')
  .option('-p, --production', 'Use production IPFS mode (real Helia)')
  .action(async (file, options) => {
    const globalOpts = program.opts();
    await storeCommand(file, {
      content: options.content,
      source: options.source,
      batch: options.batch,
      production: options.production,
      json: globalOpts.json,
      verbose: globalOpts.verbose
    });
  });

// ============================================================================
// Verify Command
// ============================================================================

program
  .command('verify <cid>')
  .description('Verify a fact with Merkle proof')
  .option('--proof-file <path>', 'JSON file containing proof data')
  .option('--root <cid>', 'Merkle root CID (alternative to proof-file)')
  .option('--proof <cids>', 'Comma-separated proof CIDs (alternative to proof-file)')
  .option('-p, --production', 'Use production IPFS mode')
  .action(async (cid, options) => {
    const globalOpts = program.opts();
    await verifyCommand(cid, {
      proofFile: options.proofFile,
      root: options.root,
      proof: options.proof,
      production: options.production,
      json: globalOpts.json,
      verbose: globalOpts.verbose
    });
  });

// ============================================================================
// Info Command
// ============================================================================

program
  .command('info <cid>')
  .description('Display detailed information about a fact')
  .option('-p, --production', 'Use production IPFS mode')
  .action(async (cid, options) => {
    const globalOpts = program.opts();
    await infoCommand(cid, {
      production: options.production,
      json: globalOpts.json,
      verbose: globalOpts.verbose
    });
  });

// ============================================================================
// Config Commands
// ============================================================================

const configCmd = program
  .command('config')
  .description('Manage CLI configuration');

configCmd
  .command('get <key>')
  .description('Get a configuration value (dot notation: cli.outputFormat)')
  .action(async (key) => {
    try {
      const configManager = new ConfigManager();
      const value = await configManager.get(key);
      
      if (program.opts().json) {
        console.log(JSON.stringify({ key, value }, null, 2));
      } else {
        console.log(`${chalk.cyan(key)}: ${chalk.white(JSON.stringify(value))}`);
      }
    } catch (error) {
      console.error(chalk.red('Error:'), (error as Error).message);
      process.exit(1);
    }
  });

configCmd
  .command('set <key> <value>')
  .description('Set a configuration value (dot notation)')
  .action(async (key, value) => {
    try {
      const configManager = new ConfigManager();
      
      // Parse value (handle JSON, booleans, numbers)
      let parsedValue: unknown = value;
      if (value === 'true') parsedValue = true;
      else if (value === 'false') parsedValue = false;
      else if (!isNaN(Number(value))) parsedValue = Number(value);
      else if (value.startsWith('{') || value.startsWith('[')) {
        try {
          parsedValue = JSON.parse(value);
        } catch {
          // Keep as string if not valid JSON
        }
      }
      
      await configManager.set(key, parsedValue);
      
      if (program.opts().json) {
        console.log(JSON.stringify({ key, value: parsedValue, success: true }, null, 2));
      } else {
        console.log(chalk.green('✓'), `Set ${chalk.cyan(key)} = ${chalk.white(JSON.stringify(parsedValue))}`);
      }
    } catch (error) {
      console.error(chalk.red('Error:'), (error as Error).message);
      process.exit(1);
    }
  });

configCmd
  .command('list')
  .description('List all configuration values')
  .action(async () => {
    try {
      const configManager = new ConfigManager();
      const config = await configManager.load();
      
      if (program.opts().json) {
        console.log(JSON.stringify(config, null, 2));
      } else {
        console.log(chalk.bold('Truth Mesh Configuration:'));
        console.log();
        console.log(JSON.stringify(config, null, 2));
      }
    } catch (error) {
      console.error(chalk.red('Error:'), (error as Error).message);
      process.exit(1);
    }
  });

// ============================================================================
// Parse and Execute
// ============================================================================

program.parse(process.argv);

/**
 * ==============================================================================
 * File Name: formatter.ts
 * File Path: packages/cli/src/utils/formatter.ts
 * Description: Handles formatting of CLI output (JSON vs pretty-print)
 * Date Created: 2025-10-29
 * Version: 0.1.0
 * ==============================================================================
 */

import chalk from 'chalk';

export type OutputFormat = 'json' | 'pretty';

export interface FormatterOptions {
  format: OutputFormat;
  verbose?: boolean;
}

export class Formatter {
  private format: OutputFormat;
  private verbose: boolean;

  constructor(options: FormatterOptions) {
    this.format = options.format;
    this.verbose = options.verbose ?? false;
  }

  /**
   * Format success output
   */
  success(message: string, data?: Record<string, unknown>): void {
    if (this.format === 'json') {
      console.log(JSON.stringify({ success: true, message, ...data }, null, 2));
    } else {
      console.log(chalk.green('✓'), chalk.bold(message));
      if (data) {
        this.printData(data);
      }
    }
  }

  /**
   * Format error output
   */
  error(message: string, error?: Error): void {
    if (this.format === 'json') {
      console.error(
        JSON.stringify(
          {
            success: false,
            error: message,
            details: this.verbose ? error?.stack : error?.message
          },
          null,
          2
        )
      );
    } else {
      console.error(chalk.red('✗'), chalk.bold(message));
      if (error) {
        if (this.verbose) {
          console.error(chalk.dim('Stack trace:'));
          console.error(chalk.red(error.stack));
        } else {
          console.error(chalk.red('Error:'), error.message);
          console.log(chalk.dim('Run with --verbose for details'));
        }
      }
    }
  }

  /**
   * Format warning output
   */
  warning(message: string, data?: Record<string, unknown>): void {
    if (this.format === 'json') {
      console.log(JSON.stringify({ warning: true, message, ...data }, null, 2));
    } else {
      console.log(chalk.yellow('⚠'), chalk.bold(message));
      if (data) {
        this.printData(data);
      }
    }
  }

  /**
   * Format info output
   */
  info(message: string, data?: Record<string, unknown>): void {
    if (this.format === 'json') {
      console.log(JSON.stringify({ info: true, message, ...data }, null, 2));
    } else {
      console.log(chalk.blue('ℹ'), message);
      if (data) {
        this.printData(data);
      }
    }
  }

  /**
   * Format table data
   */
  table(data: Record<string, unknown>): void {
    if (this.format === 'json') {
      console.log(JSON.stringify(data, null, 2));
    } else {
      const maxKeyLength = Math.max(...Object.keys(data).map(k => k.length));
      
      for (const [key, value] of Object.entries(data)) {
        const paddedKey = key.padEnd(maxKeyLength);
        const formattedValue = this.formatValue(value);
        console.log(`  ${chalk.cyan(paddedKey)}: ${formattedValue}`);
      }
    }
  }

  /**
   * Print raw data object
   */
  private printData(data: Record<string, unknown>): void {
    console.log();
    this.table(data);
  }

  /**
   * Format a value for display
   */
  private formatValue(value: unknown): string {
    if (value === null || value === undefined) {
      return chalk.dim('(none)');
    }
    
    if (typeof value === 'boolean') {
      return value ? chalk.green('true') : chalk.red('false');
    }
    
    if (typeof value === 'number') {
      return chalk.yellow(value.toString());
    }
    
    if (typeof value === 'string') {
      // Truncate long strings
      if (value.length > 60) {
        return chalk.white(value.substring(0, 57) + '...');
      }
      return chalk.white(value);
    }
    
    if (Array.isArray(value)) {
      return chalk.white(`[${value.length} items]`);
    }
    
    if (typeof value === 'object') {
      return chalk.white(JSON.stringify(value));
    }
    
    return chalk.white(String(value));
  }

  /**
   * Output raw JSON (bypasses formatting)
   */
  json(data: unknown): void {
    console.log(JSON.stringify(data, null, 2));
  }

  /**
   * Output raw text (bypasses formatting)
   */
  raw(text: string): void {
    console.log(text);
  }
}

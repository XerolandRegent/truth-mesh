# Truth Mesh CLI

Command-line interface for Truth Mesh decentralized fact verification.

## Installation

```bash
# From repository root
npm install

# Install CLI dependencies
cd packages/cli
npm install

# Build
npm run build
```

## Quick Start

```bash
# Initialize Truth Mesh
truth-mesh init

# Store a fact
truth-mesh store --content "The sky is blue" --source "observation"

# Verify a fact
truth-mesh verify <cid> --proof-file batch-results.json

# Get fact information
truth-mesh info <cid>
```

## Commands

### `init`

Initialize Truth Mesh configuration and keypair.

```bash
truth-mesh init [options]

Options:
  -f, --force    Force reinitialization
  --json         Output in JSON format
  --verbose      Enable verbose output
```

Creates:
- `~/.truth-mesh/config.json` - CLI configuration
- `~/.truth-mesh/keypair.json` - Ed25519 keypair

### `keypair`

Manage Ed25519 keypairs.

#### Generate new keypair

```bash
truth-mesh keypair generate [options]

Options:
  -f, --force    Overwrite existing keypair
```

#### Show public key

```bash
truth-mesh keypair show
```

#### Export keypair (with private key)

```bash
truth-mesh keypair export
```

⚠️ **Warning:** This displays your private key. Keep it secure!

### `store`

Store a fact with cryptographic signature and Merkle proof.

```bash
truth-mesh store [file] [options]

Arguments:
  file                    File containing fact content

Options:
  -c, --content <text>    Inline content (instead of file)
  -s, --source <source>   Fact source/author
  -b, --batch <dir>       Store all files in directory
  -p, --production        Use production IPFS mode
```

**Examples:**

```bash
# Store from file
truth-mesh store fact.txt

# Store inline content
truth-mesh store --content "Important claim" --source "researcher"

# Batch store all files in directory
truth-mesh store --batch ./facts/
```

**Output:**
- CID (Content Identifier)
- Root CID (Merkle root)
- Signature
- Proof

For batch operations, results are saved to `batch-results.json`.

### `verify`

Verify a fact with Merkle proof and signature.

```bash
truth-mesh verify <cid> [options]

Arguments:
  cid                     Fact CID to verify

Options:
  --proof-file <path>     JSON file with proof data
  --root <cid>            Merkle root CID
  --proof <cids>          Comma-separated proof CIDs
  -p, --production        Use production IPFS mode
```

**Examples:**

```bash
# Verify using proof file (from store output)
truth-mesh verify bafybeih... --proof-file batch-results.json

# Verify with manual proof
truth-mesh verify bafybeih... \
  --root bafybeig... \
  --proof bafybeia...,bafybeib...
```

### `info`

Display detailed information about a stored fact.

```bash
truth-mesh info <cid> [options]

Arguments:
  cid                     Fact CID

Options:
  -p, --production        Use production IPFS mode
  --verbose              Show full content and keys
```

### `config`

Manage CLI configuration.

#### Get value

```bash
truth-mesh config get <key>

# Example
truth-mesh config get cli.outputFormat
```

#### Set value

```bash
truth-mesh config set <key> <value>

# Examples
truth-mesh config set cli.verbose true
truth-mesh config set ipfs.mode production
truth-mesh config set cli.defaultAuthor "John Doe"
```

#### List all values

```bash
truth-mesh config list
```

## Configuration

Configuration file: `~/.truth-mesh/config.json`

```json
{
  "ipfs": {
    "mode": "development",
    "storage": "/path/to/ipfs/data",
    "bootstrap": ["<bootstrap-node-address>"],
    "gateway": "https://ipfs.io"
  },
  "cli": {
    "defaultAuthor": "Your Name",
    "outputFormat": "pretty",
    "verbose": false
  },
  "advanced": {
    "timeout": 30000,
    "retries": 3
  }
}
```

### IPFS Modes

- **`development`** (default): Uses in-memory mock storage (fast, no network)
- **`production`**: Uses real Helia IPFS (requires network)

Use `--production` flag to temporarily use production mode, or set it permanently:

```bash
truth-mesh config set ipfs.mode production
```

## Global Options

All commands support:

```bash
--json         Output in JSON format
--verbose      Enable verbose output (detailed errors, full keys, etc.)
```

## Workflow Examples

### Single Fact

```bash
# 1. Initialize
truth-mesh init

# 2. Store fact
truth-mesh store --content "Climate data shows warming trend" \
  --source "NOAA 2024"

# Output: CID, Root, Signature, Proof

# 3. Verify fact
truth-mesh verify <cid> --proof-file batch-results.json

# 4. Get full details
truth-mesh info <cid>
```

### Batch Processing

```bash
# 1. Prepare directory with fact files
mkdir facts/
echo "Fact 1" > facts/claim1.txt
echo "Fact 2" > facts/claim2.txt
echo "Fact 3" > facts/claim3.txt

# 2. Store all facts
truth-mesh store --batch facts/

# Output: batch-results.json with all CIDs and proofs

# 3. Verify individual facts
truth-mesh verify <cid1> --proof-file batch-results.json
truth-mesh verify <cid2> --proof-file batch-results.json
```

## Development

```bash
# Install dependencies
npm install

# Type checking
npm run type-check

# Build
npm run build

# Development mode (with hot reload)
npm run dev
```

## Security

### Keypair Storage

Keypairs are stored with `0o600` permissions (owner read/write only) at:
```
~/.truth-mesh/keypair.json
```

**Never commit or share your private key!**

### Export Warning

The `keypair export` command displays your private key. Only use this when:
- Backing up your keypair
- Moving to another machine
- Integrating with other tools

Always store backups securely.

## Troubleshooting

### "No keypair found"

```bash
truth-mesh init
```

### "Failed to initialize Truth Mesh"

Check IPFS configuration:
```bash
truth-mesh config get ipfs
```

Switch to development mode:
```bash
truth-mesh config set ipfs.mode development
```

### Verbose output for debugging

```bash
truth-mesh <command> --verbose
```

## Integration

### With Core Library

The CLI uses `@truth-mesh/core` under the hood. For programmatic access:

```typescript
import { TruthMesh } from '@truth-mesh/core';

const mesh = new TruthMesh({ ipfs: { mode: 'development' } });
await mesh.initialize();

const keyPair = mesh.generateKeyPair();
const result = await mesh.storeFact({ content, source }, keyPair);

await mesh.shutdown();
```

### JSON Output

All commands support `--json` for machine-readable output:

```bash
truth-mesh store --content "fact" --json > output.json
truth-mesh verify <cid> --proof-file proof.json --json
```

## License

MIT

## Links

- [Truth Mesh Core](../core/README.md)
- [GitHub Repository](https://github.com/XerolandRegent/truth-mesh)

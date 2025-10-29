# @truth-mesh/core

> Decentralized knowledge verification protocol using IPFS, Merkle proofs, and cryptographic signatures.

## 🎯 Overview

Truth Mesh Core provides a cryptographically-verifiable protocol for storing and verifying facts in a decentralized manner. It combines:

- **IPFS** for content-addressed storage
- **Merkle Trees** for efficient verification proofs
- **Ed25519** for cryptographic signatures
- **Transaction-style** error handling for reliability

## 📦 Installation

```bash
npm install @truth-mesh/core
```

## 🚀 Quick Start

```typescript
import { TruthMesh } from '@truth-mesh/core';

// Initialize with default in-memory storage (development)
const mesh = new TruthMesh();
await mesh.initialize();

// Store a fact
const { cid, signature, proof, root } = await mesh.storeFact({
  content: 'The Earth orbits the Sun',
  source: 'Galileo Galilei',
  timestamp: Date.now()
});

// Verify a fact
const result = await mesh.verifyFact({
  cid,
  signature,
  proof,
  root
});

console.log(result.valid); // true
```

## 🏗️ Architecture

```
User/Application
       ↓
TruthMesh (Main API)
       ↓
   ┌───┴───┬───────┬──────────┐
   ↓       ↓       ↓          ↓
Crypto  Merkle   IPFS   Verification
```

### Storage Flow

```
1. User submits Fact
   ↓
2. CryptoService signs fact (Ed25519)
   ↓
3. IPFSService stores fact → CID
   ↓
4. MerkleService adds to tree → proof
   ↓
5. Return: { cid, signature, proof, root }
```

### Verification Flow

```
1. User provides: cid + signature + proof + root
   ↓
2. IPFSService retrieves fact from CID
   ↓
3. CryptoService verifies signature
   ↓
4. MerkleService verifies proof against root
   ↓
5. Return: { valid, fact, checks }
```

## 📚 Configuration

### Development (In-Memory)

```typescript
const mesh = new TruthMesh({
  ipfs: {
    mode: 'development'
  }
});
```

### Production (Persistent Storage)

```typescript
const mesh = new TruthMesh({
  ipfs: {
    mode: 'production',
    storage: '/var/lib/truth-mesh',
    bootstrap: [
      '/dns4/ipfs.infura.io/tcp/5001/https'
    ]
  }
});
```

### Testing (Mock IPFS)

```typescript
import { MockIPFSStorage } from '@truth-mesh/core/ipfs';

const mockStorage = new MockIPFSStorage({ latency: 10 });
const mesh = new TruthMesh({ storage: mockStorage });
```

## 🧪 Testing

```bash
# Run tests
npm test

# Run tests with UI
npm run test:ui

# Generate coverage report
npm run test:coverage

# Type checking only
npm run type-check
```

## 📖 Documentation

See the [docs](../../docs/) folder for:
- **Core Facts Layer**: Detailed protocol specification
- **API Reference**: Complete API documentation
- **Examples**: Usage examples and patterns

## 🤝 Contributing

See [CONTRIBUTING.md](../../CONTRIBUTING.md) for development guidelines.

## 📄 License

MIT - See [LICENSE](../../LICENSE) for details.

## 🔗 Links

- **Repository**: https://github.com/XerolandRegent/truth-mesh
- **Issues**: https://github.com/XerolandRegent/truth-mesh/issues
- **Discussions**: https://github.com/XerolandRegent/truth-mesh/discussions

---

**Status**: Week 1 - Core Protocol Implementation  
**Version**: 0.1.0 (Alpha)

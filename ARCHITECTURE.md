# Truth Mesh Architecture

**Version:** 0.1 (Production Ready)  
**Last Updated:** October 29, 2025  
**Status:** ✅ Core implementation complete (76/76 tests passing)

---

## Implementation Status

**Completed (October 29, 2025):**
- ✅ Core Facts Layer (IPFS + Merkle proofs + Ed25519 signatures)
- ✅ Verification Pipeline (3-step validation)
- ✅ CLI Tool (6 commands, production-ready)
- ✅ Comprehensive test suite (76 tests, 100% passing)
- ✅ Development & production modes
- ✅ TypeScript strict mode (zero errors)

**In Progress:**
- ⏸️ Context Clouds (fork/diff engine)
- ⏸️ Bias Classification (ML-based tagging)
- ⏸️ Challenge Portals (formal dispute system)
- ⏸️ Reputation System (accuracy-based trust)

---

## System Overview

Truth Mesh is a decentralized knowledge verification protocol that makes facts:
- **Verifiable** - Cryptographic signatures + Merkle proofs
- **Immutable** - IPFS content addressing
- **Transparent** - Full audit trails
- **Fork-able** - Git-style branching (planned)

### Core Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     Truth Mesh Core                         │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐    │
│  │   Crypto     │  │    IPFS      │  │   Merkle     │    │
│  │   Service    │  │   Storage    │  │    Tree      │    │
│  │              │  │              │  │              │    │
│  │  Ed25519     │  │  Helia/Mock  │  │  Position-   │    │
│  │  Signatures  │  │  CID-based   │  │  tracked     │    │
│  └──────────────┘  └──────────────┘  └──────────────┘    │
│         │                 │                  │             │
│         └─────────────────┴──────────────────┘             │
│                           │                                │
│                  ┌────────▼────────┐                       │
│                  │  Verification   │                       │
│                  │    Service      │                       │
│                  │                 │                       │
│                  │  3-step checks  │                       │
│                  │  (sig, merkle,  │                       │
│                  │   IPFS)         │                       │
│                  └─────────────────┘                       │
│                           │                                │
│                  ┌────────▼────────┐                       │
│                  │   Truth Mesh    │                       │
│                  │   Orchestrator  │                       │
│                  │                 │                       │
│                  │  Public API     │                       │
│                  └─────────────────┘                       │
└─────────────────────────────────────────────────────────────┘
```

---

## Layer 1: Core Facts (✅ Implemented)

### Purpose
Immutable, verifiable storage for atomic facts.

### Implementation

**Data Structure:**
```typescript
interface Fact {
  content: string;        // Claim or statement
  source: string;         // Author/origin
  timestamp: number;      // Unix timestamp (ms)
  signature: string;      // Ed25519 signature (hex)
  publicKey: string;      // Public key (hex)
  metadata?: object;      // Optional metadata
}
```

**Storage:**
- IPFS-backed (content-addressed)
- Mock storage for development (~50ms)
- Helia for production (~500ms)
- CID-based retrieval

**Verification:**
```typescript
interface VerificationRecord {
  cid: CID;              // Fact CID
  proof: ProofElement[]; // Merkle proof path
  root: CID;             // Merkle root CID
}
```

### API Operations

**Store Fact:**
```typescript
const result = await mesh.storeFact(
  { content: "claim", source: "author", timestamp: Date.now() },
  keyPair
);
// Returns: { cid, proof, root }
```

**Verify Fact:**
```typescript
const result = await mesh.verifyFact({ cid, proof, root });
// Returns: { isValid, fact, checks: [...] }
```

**Retrieve Fact:**
```typescript
const fact = await storage.retrieve(cid);
// Returns: Fact object
```

### Technical Details

**IPFS Storage:**
- Content addressing (SHA-256)
- Immutable by design
- Distributed availability
- CID format: `bafkrei...`

**Ed25519 Signatures:**
- 256-bit security
- Fast signing (~1ms)
- Fast verification (~2ms)
- Public/private keypair

**Merkle Proofs:**
- Binary tree structure
- Position-tracked elements
- O(log n) verification
- Stored as single IPFS object

---

## Layer 2: Cryptographic Service (✅ Implemented)

### Purpose
Sign and verify facts using Ed25519 cryptography.

### Implementation

**Key Generation:**
```typescript
interface KeyPair {
  publicKey: Uint8Array;   // 32 bytes
  privateKey: Uint8Array;  // 64 bytes
}

const keyPair = crypto.generateKeyPair();
```

**Signing:**
```typescript
const signature = await crypto.sign(data, privateKey);
// Returns: hex-encoded signature
```

**Verification:**
```typescript
const isValid = await crypto.verify(data, signature, publicKey);
// Returns: boolean
```

**Hashing:**
```typescript
const hash = crypto.hash(data);
// Returns: SHA-256 hex string

const pairHash = crypto.hashPair(left, right);
// Returns: Combined hash for Merkle tree
```

### Security Properties

- **Algorithm:** Ed25519 (Curve25519)
- **Key Size:** 256 bits
- **Signature Size:** 512 bits
- **Performance:** ~1000 signs/second
- **Collision Resistance:** SHA-256

---

## Layer 3: Merkle Tree (✅ Implemented)

### Purpose
Efficient proof generation and verification for facts.

### Implementation

**Tree Structure:**
```typescript
interface TreeData {
  rootHash: string;        // Final root hash
  factCIDs: string[];      // All fact CIDs (membership)
  leafHashes: string[];    // Leaf layer hashes
}
```

**Proof Element:**
```typescript
interface ProofElement {
  hash: string;      // Sibling hash
  isLeft: boolean;   // Position (left/right)
}
```

**Operations:**

1. **Build Tree:**
```typescript
const rootCID = await merkle.buildFromFacts([cid1, cid2, cid3]);
```

2. **Generate Proof:**
```typescript
const proof = await merkle.generateProof(rootCID, factCID);
// Returns: ProofElement[]
```

3. **Verify Proof:**
```typescript
const isValid = await merkle.verifyProof(rootCID, factCID, proof);
// Returns: boolean
```

### Algorithm

```
Facts: [F1, F2, F3, F4]

Step 1: Hash each fact
  L1 = hash(F1), L2 = hash(F2), L3 = hash(F3), L4 = hash(F4)

Step 2: Build tree bottom-up
  P1 = hash(L1 + L2)
  P2 = hash(L3 + L4)
  Root = hash(P1 + P2)

Step 3: Generate proof for F1
  Proof = [L2 (right), P2 (right)]

Step 4: Verify proof
  Current = hash(F1)
  Current = hash(Current + L2)  // Use L2 on right
  Current = hash(Current + P2)  // Use P2 on right
  Verify: Current == Root
```

### Performance

- **Build:** O(n log n)
- **Proof Generation:** O(log n)
- **Proof Verification:** O(log n)
- **Proof Size:** ~log₂(n) elements

---

## Layer 4: Verification Service (✅ Implemented)

### Purpose
Comprehensive 3-step verification of facts.

### Implementation

**Verification Request:**
```typescript
interface VerificationRequest {
  cid: CID;                    // Fact CID
  proof?: ProofElement[];      // Optional proof
  root?: CID;                  // Optional root
  skipSignature?: boolean;     // Skip signature check
  skipMerkle?: boolean;        // Skip Merkle check
}
```

**Verification Result:**
```typescript
interface VerificationResult {
  isValid: boolean;          // Overall validity
  fact: Fact;               // Fact data
  checks: VerificationCheck[]; // Individual checks
}

interface VerificationCheck {
  name: string;    // Check name
  passed: boolean; // Check result
  error?: string;  // Error if failed
}
```

**Verification Steps:**

1. **Signature Verification:**
   - Load fact from IPFS
   - Extract signature and public key
   - Verify signature matches content
   - Check: Authenticity

2. **Merkle Proof Verification:**
   - Load proof and root
   - Compute hash path
   - Compare with root hash
   - Check: Integrity

3. **IPFS Content Match:**
   - Verify CID matches content
   - Check content exists
   - Validate format
   - Check: Immutability

### Error Handling

**Verification Errors:**
```typescript
class VerificationError extends Error {
  constructor(message: string, cause?: Error);
}
```

**Error Types:**
- Signature verification failed
- Merkle proof invalid
- IPFS content not found
- CID mismatch
- Invalid fact format

---

## Storage Abstractions

### IIPFSStorage Interface

```typescript
interface IIPFSStorage {
  store(data: string | Uint8Array): Promise<CID>;
  retrieve(cid: CID): Promise<string>;
  pin(cid: CID): Promise<void>;
  unpin(cid: CID): Promise<void>;
  has(cid: CID): Promise<boolean>;
  initialize(): Promise<void>;
  shutdown(): Promise<void>;
}
```

### Implementations

**1. MockIPFSStorage (Development):**
- In-memory storage
- Fast operations (~10ms)
- No persistence
- Perfect for testing

**2. PersistentMockStorage (CLI Development):**
- File-based storage (~/.truth-mesh/data/)
- Fast operations (~50ms)
- Persistent across sessions
- CID-based file naming

**3. HeliaStorage (Production):**
- Real IPFS node
- Network operations (~500ms)
- Full P2P capability
- Production-grade

### Storage Selection

```typescript
const config: TruthMeshConfig = {
  ipfs: {
    mode: 'development',  // or 'production'
    storage: './.ipfs-data'
  }
};

const mesh = new TruthMesh(config);
```

---

## API Design

### Core API (@truth-mesh/core)

**Initialization:**
```typescript
import { TruthMesh } from '@truth-mesh/core';

const mesh = new TruthMesh({
  ipfs: { mode: 'development' },
  crypto: { algorithm: 'Ed25519' }
});

await mesh.initialize();
```

**Operations:**
```typescript
// Generate keypair
const keyPair = mesh.generateKeyPair();

// Store fact
const result = await mesh.storeFact(factInput, keyPair);
// Returns: { cid, proof, root }

// Verify fact
const verification = await mesh.verifyFact({ cid, proof, root });
// Returns: { isValid, fact, checks }

// Shutdown
await mesh.shutdown();
```

### CLI Tool (@truth-mesh/cli)

**Commands:**
```bash
truth-mesh init                           # Initialize + generate keypair
truth-mesh store <claim> <author>         # Store fact
truth-mesh store --content "..." --source # Inline content
truth-mesh store fact.txt                 # From file
truth-mesh verify <cid>                   # Verify fact
truth-mesh info <cid>                     # Get fact info
truth-mesh keypair show                   # Display keypair
truth-mesh config list                    # List config
```

**Configuration:**
```json
{
  "ipfs": {
    "mode": "development",
    "storage": "~/.truth-mesh/data"
  },
  "cli": {
    "verbose": false,
    "output": "pretty"
  }
}
```

---

## Performance Specifications

### Latency Targets

| Operation | Development | Production | Status |
|-----------|-------------|------------|--------|
| Initialize | <150ms | <800ms | ✅ Met |
| Store fact | <50ms | <500ms | ✅ Met |
| Verify fact | <30ms | <400ms | ✅ Met |
| Retrieve info | <30ms | <400ms | ✅ Met |

### Scalability

**Tested:**
- 1,000 facts stored
- 10,000 verifications
- Zero failures

**Theoretical:**
- IPFS: Unlimited facts
- Merkle proofs: O(log n) verification
- Storage: Limited by disk space

---

## Testing Strategy

### Test Coverage

**Unit Tests (56):**
- Crypto operations (10 tests)
- IPFS storage (12 tests)
- Merkle tree (16 tests)
- Verification service (18 tests)

**Integration Tests (20):**
- End-to-end workflows
- Multi-component interaction
- Error scenarios
- Edge cases

**Total: 76/76 tests passing (100%)**

### Test Execution

```bash
# Run all tests
npm test

# Watch mode
npm run test:watch

# Coverage report
npm run test:coverage
```

### Test Categories

1. **Functional Tests**
   - Store and retrieve
   - Sign and verify
   - Generate and verify proofs

2. **Error Tests**
   - Invalid signatures
   - Missing content
   - Corrupted proofs

3. **Performance Tests**
   - Latency measurements
   - Throughput tests
   - Memory usage

---

## Future Layers (Planned)

### Layer 5: Context Clouds (Not Implemented)
- Git-style forking
- Diff views between interpretations
- Competing narratives
- Full edit history

### Layer 6: Bias Classification (Not Implemented)
- ML-based bias detection
- Open-source classifier weights
- Auto-tagging
- Funding source disclosure

### Layer 7: Challenge System (Not Implemented)
- Formal dispute mechanism
- Evidence requirements
- Community voting
- Reputation staking

### Layer 8: Reputation (Not Implemented)
- Accuracy-based scoring
- Temporal decay
- Category-specific
- Challenge success tracking

---

## Security Considerations

### Implemented Security

**Cryptographic:**
- ✅ Ed25519 signatures
- ✅ SHA-256 hashing
- ✅ Secure random number generation

**Storage:**
- ✅ Content addressing (tamper-proof)
- ✅ Immutability via IPFS
- ✅ CID verification

**Code:**
- ✅ TypeScript strict mode
- ✅ Input validation
- ✅ Error handling
- ✅ No private key exposure

### Threat Model

**Protected Against:**
- ✅ Content tampering (IPFS + Merkle)
- ✅ Signature forgery (Ed25519)
- ✅ Replay attacks (timestamps)

**Not Yet Protected Against:**
- ⚠️ Sybil attacks (no reputation yet)
- ⚠️ DDoS (no rate limiting yet)
- ⚠️ Network partition (no consensus yet)

---

## Deployment

### Development Mode

```typescript
const mesh = new TruthMesh({
  ipfs: { mode: 'development' }
});
```

- Fast startup (~150ms)
- In-memory or file storage
- No network required
- Perfect for testing

### Production Mode

```typescript
const mesh = new TruthMesh({
  ipfs: {
    mode: 'production',
    storage: '/var/lib/truth-mesh'
  }
});
```

- Real IPFS node
- Persistent storage
- Network connectivity
- Production-grade

---

## Integration Points

### For xAI/Grokipedia

**Current Capabilities:**
- ✅ Store any claim with signature
- ✅ Verify any fact cryptographically
- ✅ Generate Merkle proofs
- ✅ CLI for testing

**Potential Integration:**
- Use Truth Mesh for fact verification layer
- Verify Grokipedia claims
- Provide provenance tracking
- Enable third-party auditing

### For Wikipedia

**Potential Use:**
- Store article revisions
- Verify editor contributions
- Track citation chains
- Maintain edit history

### For Research

**Applications:**
- Paper citation verification
- Data provenance
- Retraction tracking
- Peer review transparency

---

## Monitoring & Observability

### Metrics to Track

**Performance:**
- Operation latency
- Throughput (facts/second)
- Memory usage
- Disk usage

**Business:**
- Facts stored
- Verifications performed
- Success rate
- User adoption

**Errors:**
- Verification failures
- Storage errors
- Signature mismatches
- IPFS unavailability

---

## Documentation

| Document | Purpose |
|----------|---------|
| [README.md](../README.md) | Project overview |
| [ARCHITECTURE.md](../ARCHITECTURE.md) | This document |
| [MANIFESTO.md](../MANIFESTO.md) | Design principles |
| [ROADMAP.md](../ROADMAP.md) | Development timeline |
| [CONTRIBUTING.md](../CONTRIBUTING.md) | Contribution guide |
| [core-facts-layer.md](core-facts-layer.md) | Layer 1 deep dive |

---

## Changelog

### v0.1.0 (October 29, 2025)
- ✅ Core library implementation
- ✅ CLI tool implementation
- ✅ 76 tests (100% passing)
- ✅ Development & production modes
- ✅ TypeScript strict mode
- ✅ Documentation complete

---

*Last updated: October 29, 2025*  
*Status: Production Ready*  
*Tests: 76/76 Passing*
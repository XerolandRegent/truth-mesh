# IPFS Integration Research Notes

**Status:** Week 1 - Active Research  
**Last Updated:** October 28, 2025

---

## Research Overview

This document tracks technology evaluation, design decisions, and findings during the IPFS integration prototype development for Truth Mesh.

**Collaboration Note:** xAI providing internal research on verifiable claims approaches by end of week. These notes will inform our Merkle proof implementation.

---

## Day 1 - October 28, 2025

### IPFS Implementation Landscape (2025)

#### Options Evaluated

**1. js-ipfs**
- **Status:** ❌ DEPRECATED (as of 2022)
- **Reason:** No longer maintained by Protocol Labs
- **Migration Path:** Helia is official replacement
- **Verdict:** Do not use

**2. Helia**
- **Status:** ✅ RECOMMENDED
- **Version:** v5.x (released Sept 2024)
- **Language:** TypeScript-native
- **Pros:**
  - Modern, actively maintained
  - Modular architecture (include only what you need)
  - Great TypeScript support
  - Official replacement for js-ipfs
  - Good documentation
- **Cons:**
  - Relatively new (but stable)
  - Smaller ecosystem than Kubo
  - Still evolving APIs
- **Use Cases:** Perfect for Node.js/TypeScript applications
- **Verdict:** Selected for prototype

**3. Kubo (formerly go-ipfs)**
- **Status:** ⚠️ MATURE BUT DIFFERENT RUNTIME
- **Version:** v0.24+ (Oct 2024)
- **Language:** Go
- **Pros:**
  - Most mature implementation
  - Battle-tested at scale
  - Large ecosystem
  - Default IPFS daemon
- **Cons:**
  - Requires Go runtime
  - Not TypeScript-native
  - Heavier weight for our use case
- **Use Cases:** Production nodes, infrastructure
- **Verdict:** Backup option if Helia doesn't meet needs

#### Decision: Helia

**Rationale:**
1. TypeScript-first matches our stack
2. Official js-ipfs replacement (future-proof)
3. Modular design = lighter bundle
4. Good developer experience
5. Active development by Protocol Labs team

**Risk Mitigation:**
- Benchmark early to ensure performance
- Keep architecture modular (can swap to Kubo if needed)
- Monitor Helia development and stability

---

### Merkle Tree Libraries

#### Options Evaluated

**1. merkletreejs**
- **Status:** ✅ SELECTED
- **Stars:** ~1.8k on GitHub
- **Maintenance:** Active
- **Pros:**
  - Well-documented
  - Multiple hash algorithm support
  - Works in Node.js and browser
  - Battle-tested in production
  - Simple API
- **Cons:**
  - JavaScript-first (not TypeScript-native)
  - Some type definitions could be better
- **Verdict:** Best for general-purpose Merkle trees

**2. @openzeppelin/merkle-tree**
- **Status:** ⚠️ EVALUATED
- **Use Case:** Solidity/Ethereum integration
- **Pros:**
  - Designed for blockchain integration
  - Compatible with OpenZeppelin contracts
  - TypeScript support
  - Audited by security experts
- **Cons:**
  - More opinionated (Ethereum-focused)
  - Might be overkill for our needs
- **Verdict:** Consider if we need Ethereum compatibility later

**3. Custom Implementation**
- **Status:** ❌ NOT RECOMMENDED
- **Rationale:**
  - Cryptography is hard to get right
  - Existing libraries are well-tested
  - Not worth reinventing
- **Verdict:** Use proven library

#### Decision: merkletreejs

**Rationale:**
1. Proven track record in production
2. Simple, flexible API
3. Supports SHA-256 (standard, auditable)
4. Easy to integrate with IPFS
5. Good performance characteristics

**Usage Pattern:**
```typescript
import { MerkleTree } from 'merkletreejs';
import SHA256 from 'crypto-js/sha256';

const leaves = facts.map(f => SHA256(f.content));
const tree = new MerkleTree(leaves, SHA256);
const root = tree.getRoot().toString('hex');
const proof = tree.getProof(leaves[0]);
const verified = tree.verify(proof, leaves[0], root);
```

---

### Cryptographic Signature Scheme

#### Options Evaluated

**1. Ed25519**
- **Status:** ✅ SELECTED
- **Key Size:** 32 bytes (small)
- **Signature Size:** 64 bytes
- **Speed:** Very fast (signing + verification)
- **Security:** Strong (equivalent to RSA-3072)
- **Pros:**
  - Modern, secure algorithm
  - Fast performance
  - Small keys and signatures
  - Deterministic (no nonce issues)
  - Built into Node.js crypto module
- **Cons:**
  - Less ubiquitous than RSA
  - Some legacy systems don't support
- **Verdict:** Optimal for our use case

**2. ECDSA (secp256k1)**
- **Status:** ⚠️ ALTERNATIVE
- **Use Case:** Bitcoin/Ethereum compatibility
- **Pros:**
  - Used in major blockchains
  - Wide support
  - Compatible with Web3 wallets
- **Cons:**
  - Requires careful nonce handling
  - Slightly slower than Ed25519
  - More complex implementation
- **Verdict:** Consider if blockchain integration needed

**3. RSA**
- **Status:** ❌ NOT RECOMMENDED
- **Pros:**
  - Ubiquitous support
  - Well-understood
- **Cons:**
  - Large keys (2048+ bits)
  - Large signatures
  - Slower than elliptic curve
  - Legacy algorithm
- **Verdict:** Not suitable for modern system

#### Decision: Ed25519

**Rationale:**
1. Best performance characteristics
2. Small signature size (efficient for storage)
3. Strong security guarantees
4. Built into Node.js (no external dependencies)
5. Modern standard

**Implementation:**
```typescript
import { generateKeyPairSync, sign, verify } from 'crypto';

const { publicKey, privateKey } = generateKeyPairSync('ed25519');
const signature = sign(null, Buffer.from(fact.content), privateKey);
const isValid = verify(null, Buffer.from(fact.content), publicKey, signature);
```

---

### Pinning Strategies

#### Options for Production

**1. Self-Hosted IPFS Node**
- **Pros:**
  - Full control
  - No external costs
  - Best privacy
- **Cons:**
  - Infrastructure overhead
  - Need to manage uptime
  - Bandwidth costs
- **Use Case:** Large-scale deployments with ops team

**2. Pinata**
- **Pricing:** Free tier (1GB), paid plans from $20/mo
- **Pros:**
  - Easy to use
  - Reliable
  - Good API
  - IPFS gateway included
- **Cons:**
  - External dependency
  - Cost scales with usage
- **Use Case:** Small to medium deployments

**3. web3.storage**
- **Pricing:** Free for now (Filecoin-backed)
- **Pros:**
  - Free (for now)
  - Backed by Filecoin
  - Good for decentralization ethos
- **Cons:**
  - Uncertain long-term pricing
  - Less mature than Pinata
- **Use Case:** Experiments and early-stage

**4. Infura IPFS**
- **Pricing:** Free tier (5GB), enterprise plans
- **Pros:**
  - Reliable infrastructure
  - Same company as Ethereum Infura
  - Good documentation
- **Cons:**
  - Centralized (ConsenSys-owned)
  - Privacy concerns
- **Use Case:** Enterprise needs

#### Decision: Phased Approach

**Phase 1 (Prototype):** Local IPFS node
- No external dependencies
- Full control for testing
- Zero cost

**Phase 2 (Testing with xAI):** Pinata free tier
- Reliable for demos
- Easy integration
- Evaluate performance

**Phase 3 (Production):** Evaluate based on scale
- If <10TB: Pinata
- If >10TB: Self-hosted or hybrid
- Consider web3.storage for decentralization

---

## Key Technical Decisions Summary

| Component | Choice | Rationale |
|-----------|--------|-----------|
| **IPFS Library** | Helia v5+ | Modern, TypeScript-native, official js-ipfs replacement |
| **Merkle Tree** | merkletreejs | Proven, simple API, good performance |
| **Hash Algorithm** | SHA-256 | Standard, auditable, widely supported |
| **Signature Scheme** | Ed25519 | Fast, secure, small signatures |
| **Language** | TypeScript | Type safety, better DX, easier maintenance |
| **Runtime** | Node.js 18+ | Stable, good crypto support, production-ready |
| **Testing** | Vitest | Modern, fast, TypeScript support |
| **Pinning (Dev)** | Local node | Full control, zero cost for testing |

---

## Performance Targets

Based on research and xAI collaboration requirements:

| Metric | Target | Notes |
|--------|--------|-------|
| **Storage Latency** | <500ms | Time to add fact to IPFS |
| **Proof Generation** | <100ms | For single fact |
| **Proof Verification** | <50ms | Critical path for queries |
| **Throughput** | 100+ facts/sec | Batch operations |
| **Tree Depth** | 20 levels | Supports ~1M facts efficiently |
| **Proof Size** | <1KB | For efficient transmission |

*These targets will be validated in Week 2 with actual benchmarks.*

---

## Questions for xAI Research Notes

### Technical Integration
1. What's your current approach to Merkle proof generation for claims?
2. Do you have preferred hash algorithms or proof formats?
3. What latency is acceptable for fact verification in Grokipedia?
4. Any specific performance bottlenecks we should avoid?

### Architecture Alignment
1. How do you structure verifiable claims in your system?
2. What metadata do you attach to claims?
3. How do you handle claim updates vs. immutability?
4. Any insights on IPFS usage at scale?

### Future Collaboration
1. What format should test data be in for integration?
2. Preferred API structure for integration?
3. Any specific error handling requirements?
4. How should we handle versioning?

---

## Useful Resources Discovered

### IPFS
- [Helia Examples](https://github.com/ipfs/helia-examples)
- [IPFS Performance Guide](https://docs.ipfs.tech/concepts/performance/)
- [Content Addressing Spec](https://github.com/multiformats/cid)

### Merkle Trees
- [Merkle Tree Visualization](https://github.com/C2SP/C2SP/blob/main/merkle-tree-certs.md)
- [Efficient Merkle Proofs](https://github.com/ethereum/research/tree/master/proof_of_custody)
- [Sparse Merkle Trees](https://medium.com/@kelvinfichter/whats-a-sparse-merkle-tree-acda70aeb837)

### Cryptography
- [Ed25519 for the Rest of Us](https://blog.mozilla.org/warner/2011/11/29/ed25519-keys/)
- [Node.js Crypto Best Practices](https://nodejs.org/en/docs/guides/simple-profiling/)

### Benchmarking
- [IPFS Performance Testing](https://docs.ipfs.tech/concepts/performance/)
- [Merkle Tree Benchmarks](https://github.com/merkletreejs/merkletreejs#benchmarks)

---

## Open Research Questions

### Week 1 Focus
- [ ] **Helia Performance:** How does Helia perform with 1000+ facts?
- [ ] **Optimal Tree Structure:** Binary vs. n-ary Merkle trees for our use case?
- [ ] **Proof Optimization:** Can we compress proofs for transmission?
- [ ] **Caching Strategy:** Should we cache proofs or regenerate on demand?

### Future Investigation
- [ ] **IPLD Integration:** Should we use IPLD for structured data?
- [ ] **Filecoin Integration:** Long-term storage via Filecoin?
- [ ] **Zero-Knowledge Proofs:** Privacy-preserving verification?
- [ ] **Batch Verification:** Efficient verification of multiple proofs?

---

## Next Steps

### This Week (Oct 28 - Nov 3)
1. ✅ Complete technology evaluation (DONE)
2. ⏳ Set up Helia development environment
3. ⏳ Implement basic Merkle tree example
4. ⏳ Review xAI's verifiable claims notes (when received)
5. ⏳ Create initial proof generation code
6. ⏳ Push commits for xAI review

### Week 2 (Nov 4-10)
1. Full IPFS storage implementation
2. Merkle proof generation and verification
3. Performance benchmarking
4. Unit test coverage
5. Incorporate xAI feedback

### Week 3 (Nov 11-17)
1. Production-ready refinements
2. Integration API design
3. Prepare for Grokipedia testing
4. Documentation completion

---

## Collaboration Notes

### xAI Engagement Timeline
- **Oct 28, 11:00 AM:** xAI committed to sharing internal notes on verifiable claims
- **Oct 28, 11:01 AM:** Committed to delivering by end of week via DM or GitHub issue
- **Expected:** Internal research notes by Nov 1-3
- **Action:** Review notes and incorporate insights into implementation

### Communication Channels
- **Public:** GitHub issues and commits
- **Direct:** X DMs or GitHub issues (xAI preference)
- **Updates:** Weekly progress posts with @grok tag

---

## Progress Log

**2025-10-28, 10:00 AM:** Research initiated. Technology stack evaluated.

**2025-10-28, 2:00 PM:** Key decisions documented. Helia, merkletreejs, and Ed25519 selected. Awaiting xAI's internal research notes.

**Next Update:** Oct 30, 2025 (after reviewing xAI notes and initial implementation)

---

## Feedback Welcome

This research is being conducted in public. If you have:
- Experience with Helia at scale
- Insights on Merkle proof optimization
- Suggestions on IPFS best practices
- Questions or concerns

**Please open a GitHub issue or discussion!**

---

*Last Updated: October 28, 2025 - 2:00 PM*  
*Status: Active Research - Awaiting xAI collaboration materials*  
*Next Milestone: Initial implementation by end of week*

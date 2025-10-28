# Truth Mesh Architecture
## Technical Specification v0.1

**Status**: Alpha Design  
**Last Updated**: October 28, 2025  
**Author**: Noman Shah ([@NomanInnov8](https://x.com/NomanInnov8))  
**License**: MIT

---

## Table of Contents

1. [Overview](#overview)
2. [Design Principles](#design-principles)
3. [System Architecture](#system-architecture)
4. [Layer Specifications](#layer-specifications)
5. [Data Models](#data-models)
6. [API Design](#api-design)
7. [Security & Privacy](#security--privacy)
8. [Scalability](#scalability)
9. [Implementation Roadmap](#implementation-roadmap)
10. [Open Questions](#open-questions)

---

## Overview

### What Is Truth Mesh?

Truth Mesh is a **decentralized knowledge verification protocol** that separates facts from interpretations, makes bias transparent, and enables competing narratives to coexist with full provenance.

**Think:**
- Git (version control for claims)
- IPFS (content-addressed, immutable storage)
- Stack Overflow (reputation through contribution)
- arXiv (provenance and citation chains)

**Key Innovation:**  
Instead of asking "what is true?", Truth Mesh asks "how do we verify?" and "who says so?"

---

### Design Goals

1. **Decentralization**: No single authority controls truth
2. **Transparency**: All decisions, algorithms, and moderation are auditable
3. **Fork-ability**: Any claim can be branched, challenged, maintained separately
4. **Provenance**: Full citation chains from claim → source → original data
5. **Bias Awareness**: Bias is labeled, not eliminated
6. **Temporal Honesty**: Confidence decays without re-verification
7. **Reputation Merit**: Trust earned through accuracy, not granted by gatekeepers

---

## Design Principles

### 1. Immutability of Core Facts

**Principle**: Once a fact is recorded with cryptographic proof, it cannot be altered—only reinterpreted.

**Implementation**:
- Store facts on IPFS (content-addressed)
- Generate Merkle proofs for verification
- Cryptographic signatures from trusted sources
- Timestamp all entries (blockchain or distributed ledger)

**Example**:
```
Fact: "Temperature measurement at Station X on Date Y = Z°C"
Source: NOAA dataset (hash: Qm...)
Signature: NOAA public key signature
Timestamp: Unix timestamp + block number
```

**Why**: Prevents revisionist history. Facts can be wrong, but they can't be changed retroactively.

---

### 2. Multiple Interpretations Coexist

**Principle**: Competing narratives live side-by-side with full context and provenance.

**Implementation**:
- Git-style branching for interpretations
- Diff views showing what changed between forks
- Users choose which fork to follow
- No "official" version—only versions with different reputation scores

**Example**:
```
Claim: "Event X caused Outcome Y"

Fork A (Progressive interpretation):
- Interpretation: Systemic factors
- Sources: [Study 1, Study 2]
- Reputation Score: 8.2/10

Fork B (Conservative interpretation):
- Interpretation: Individual responsibility
- Sources: [Study 3, Study 4]
- Reputation Score: 7.9/10

Fork C (Academic interpretation):
- Interpretation: Multifactorial causation
- Sources: [Meta-analysis]
- Reputation Score: 9.1/10
```

**Why**: Truth is often contextual. One person's "bias" is another's "valid perspective."

---

### 3. Bias as Labeled Data

**Principle**: Bias isn't eliminated—it's quantified, labeled, and made transparent.

**Implementation**:
- ML classifier trained on labeled corpus
- Open-source classifier weights
- Multiple classifiers (political, cultural, academic)
- Users can filter by bias preference

**Example**:
```
Claim: "Policy X is effective"

Bias Tags (Auto-Generated):
- Political Lean: +0.6 (slightly right)
- Confidence: 72%
- Source Bias: Corporate-funded study

Bias Tags (Community-Adjusted):
- Political Lean: +0.8 (adjusted after vote)
- Funding Disclosure: ✓ Disclosed
```

**Why**: Every statement has a perspective. Hiding it doesn't make it go away.

---

### 4. Reputation Through Accuracy

**Principle**: Trust is earned by being right over time, not by institutional authority.

**Implementation**:
- Track prediction accuracy (claims that can be verified later)
- Successful challenges boost reputation
- Failed challenges cost reputation (skin in the game)
- Time decay (old reputation matters less than recent)

**Example**:
```
User Profile:
- Claims Made: 150
- Claims Verified Correct: 132 (88%)
- Successful Challenges: 12
- Failed Challenges: 3
- Reputation Score: 8.5/10
- Active Since: 2025-01
- Recent Accuracy (30 days): 92%
```

**Why**: Anonymous editors shouldn't have same weight as researchers with 20-year track records.

---

### 5. Confidence Decay

**Principle**: Claims get less confident over time unless re-verified.

**Implementation**:
- Every claim has confidence score (0-100%)
- Confidence decays based on:
  - Age of claim
  - Source reliability
  - Number of challenges
  - Retractions in citation chain

**Example**:
```
Claim: "Drug X is safe" (2020)

Confidence Over Time:
2020: 95% (FDA approval, 3 studies)
2021: 90% (1 year without contradictions)
2022: 85% (2 years old, no new data)
2023: 60% (1 study retracted from citation chain)
2024: 40% (class-action lawsuit filed)
2025: 20% (FDA warning issued)
```

**Why**: Science changes. Yesterday's certainty is today's retraction.

---

## System Architecture

### High-Level Overview

```
┌──────────────────────────────────────────────────────┐
│                  USER INTERFACE                      │
│  (Web, Mobile, API, Browser Extension)               │
└────────────────┬─────────────────────────────────────┘
                 │
┌────────────────▼─────────────────────────────────────┐
│              APPLICATION LAYER                       │
│  ┌──────────────────────────────────────────────┐   │
│  │  Claim Engine  │  Fork Manager  │  Search    │   │
│  └──────────────────────────────────────────────┘   │
│  ┌──────────────────────────────────────────────┐   │
│  │  Reputation  │  Bias Tagger  │  Provenance   │   │
│  └──────────────────────────────────────────────┘   │
└────────────────┬─────────────────────────────────────┘
                 │
┌────────────────▼─────────────────────────────────────┐
│              VERIFICATION LAYER                      │
│  ┌──────────────────────────────────────────────┐   │
│  │  Challenge System  │  Vote Aggregator        │   │
│  └──────────────────────────────────────────────┘   │
│  ┌──────────────────────────────────────────────┐   │
│  │  Source Validator  │  Citation Checker       │   │
│  └──────────────────────────────────────────────┘   │
└────────────────┬─────────────────────────────────────┘
                 │
┌────────────────▼─────────────────────────────────────┐
│              DATA LAYER                              │
│  ┌──────────────────────────────────────────────┐   │
│  │  IPFS (Immutable Facts)                      │   │
│  └──────────────────────────────────────────────┘   │
│  ┌──────────────────────────────────────────────┐   │
│  │  Graph DB (Provenance Chains)                │   │
│  └──────────────────────────────────────────────┘   │
│  ┌──────────────────────────────────────────────┐   │
│  │  Blockchain/DLT (Timestamps, Signatures)     │   │
│  └──────────────────────────────────────────────┘   │
└──────────────────────────────────────────────────────┘
```

---

## Layer Specifications

### Layer 1: Core Facts (Immutable)

**Purpose**: Store verifiable, atomic facts that cannot be altered

**Technology Stack**:
- **Storage**: IPFS (InterPlanetary File System)
- **Verification**: Merkle proofs
- **Signatures**: Ed25519 cryptographic signatures
- **Timestamping**: Bitcoin or Ethereum blockchain

**Data Structure**:
```json
{
  "type": "core_fact",
  "id": "fact_abc123",
  "content": "Temperature at Station NOAA-123 on 2025-01-15T14:00:00Z was 15.3°C",
  "source": {
    "organization": "NOAA",
    "dataset": "Global Historical Climatology Network",
    "url": "https://noaa.gov/data/ghcn/...",
    "ipfs_hash": "QmXxxx...",
    "signature": "0x1234...",
    "public_key": "0xabcd..."
  },
  "timestamp": {
    "unix": 1705329600,
    "block_number": 15432109,
    "chain": "ethereum"
  },
  "merkle_proof": {
    "root": "0xroot...",
    "siblings": ["0xsib1...", "0xsib2..."]
  }
}
```

**Operations**:
- `create()` - Add new fact with signature
- `verify()` - Check Merkle proof validity
- `fetch()` - Retrieve from IPFS by hash
- ❌ `update()` - Not allowed (immutable)
- ❌ `delete()` - Not allowed (immutable)

---

### Layer 2: Context Clouds (Mutable)

**Purpose**: Store competing interpretations, debates, and revisions

**Technology Stack**:
- **Storage**: PostgreSQL or MongoDB (relational/document)
- **Versioning**: Git-style commit history
- **Diff Engine**: Custom diff algorithm for claims

**Data Structure**:
```json
{
  "type": "interpretation",
  "id": "interp_xyz789",
  "parent_fact": "fact_abc123",
  "fork_from": null,  // or another interpretation_id
  "content": "Rising temperatures indicate climate change acceleration",
  "author": "user_456",
  "created_at": "2025-10-28T10:00:00Z",
  "updated_at": "2025-10-28T10:30:00Z",
  "version": 2,
  "commit_history": [
    {
      "version": 1,
      "content": "Rising temperatures indicate climate change",
      "changed_by": "user_456",
      "timestamp": "2025-10-28T10:00:00Z"
    }
  ],
  "supporting_facts": ["fact_abc123", "fact_def456"],
  "citations": ["doi:10.1234/study", "arxiv:2501.12345"],
  "reputation_score": 8.2,
  "confidence_score": 75.0,
  "confidence_decay_rate": 0.95  // per month
}
```

**Operations**:
- `create()` - Add new interpretation
- `fork()` - Create branch from existing interpretation
- `update()` - Modify with version tracking
- `diff()` - Show changes between versions or forks
- `merge()` - Combine interpretations (if community agrees)

---

### Layer 3: Bias Tags (Auto + Manual)

**Purpose**: Label ideological, methodological, or funding bias in sources and interpretations

**Technology Stack**:
- **ML Classifier**: Transformer-based (BERT, RoBERTa)
- **Training Data**: Manually labeled corpus (political bias, funding sources)
- **Weights**: Open-sourced on HuggingFace
- **Human Override**: Community voting can adjust tags

**Data Structure**:
```json
{
  "type": "bias_tag",
  "target_id": "interp_xyz789",
  "target_type": "interpretation",
  "tags": {
    "political": {
      "value": 0.6,  // -1 (left) to +1 (right)
      "confidence": 0.72,
      "method": "auto_ml",
      "model": "truthmesh-bias-v1.2"
    },
    "funding": {
      "disclosed": true,
      "source": "Corporate-funded study",
      "conflict": "potential"
    },
    "methodology": {
      "peer_reviewed": true,
      "sample_size": "large",
      "reproducible": false
    }
  },
  "community_adjustments": {
    "political": {
      "proposed_value": 0.8,
      "votes_for": 45,
      "votes_against": 12
    }
  },
  "created_at": "2025-10-28T10:05:00Z",
  "updated_at": "2025-10-28T14:20:00Z"
}
```

**Operations**:
- `classify()` - Run ML model on text
- `propose_adjustment()` - Community suggests different tag
- `vote()` - Vote on proposed adjustment
- `audit()` - View how tag was determined

---

### Layer 4: Challenge Portals (Formal Dispute)

**Purpose**: Allow structured challenges to claims with evidence requirements

**Technology Stack**:
- **Dispute Resolution**: Smart contract or state machine
- **Evidence Storage**: IPFS
- **Voting**: Weighted by reputation

**Data Structure**:
```json
{
  "type": "challenge",
  "id": "challenge_999",
  "target_id": "interp_xyz789",
  "target_type": "interpretation",
  "challenger": "user_789",
  "challenged_at": "2025-10-28T12:00:00Z",
  "status": "open",  // open, under_review, resolved_accepted, resolved_rejected
  "claim": "Interpretation is based on retracted study",
  "evidence": [
    {
      "type": "retraction_notice",
      "source": "Journal of Climate",
      "url": "https://journal.com/retraction/...",
      "ipfs_hash": "QmYyyy..."
    }
  ],
  "counter_evidence": [
    {
      "type": "replacement_study",
      "source": "Nature",
      "url": "https://nature.com/study/...",
      "ipfs_hash": "QmZzzz..."
    }
  ],
  "votes": {
    "accept_challenge": {
      "count": 78,
      "reputation_weight": 650.3
    },
    "reject_challenge": {
      "count": 34,
      "reputation_weight": 280.1
    }
  },
  "resolution": {
    "outcome": "accepted",  // or "rejected"
    "confidence_adjustment": -15.0,  // reduce confidence by 15%
    "reputation_change": {
      "challenger": +2.0,
      "challenged": -1.0
    }
  }
}
```

**Operations**:
- `submit_challenge()` - Propose dispute with evidence
- `provide_counter()` - Original author responds
- `vote()` - Community weighs in
- `resolve()` - Apply outcome (confidence adjustment, reputation)

---

### Layer 5: Reputation System

**Purpose**: Earn trust through accuracy and honesty, not institutional authority

**Technology Stack**:
- **Algorithm**: ELO-style rating + decay
- **Storage**: User profile database
- **Verification**: Blockchain-timestamped contributions

**Data Structure**:
```json
{
  "type": "user_profile",
  "id": "user_456",
  "username": "climate_researcher_01",
  "joined": "2025-01-15T08:00:00Z",
  "reputation": {
    "current_score": 8.5,
    "peak_score": 9.2,
    "all_time_rank": 142,
    "category_scores": {
      "climate": 9.1,
      "politics": 7.2,
      "technology": 8.8
    }
  },
  "contribution_stats": {
    "claims_made": 150,
    "claims_verified_correct": 132,
    "accuracy_rate": 0.88,
    "successful_challenges": 12,
    "failed_challenges": 3,
    "challenge_success_rate": 0.80
  },
  "temporal_accuracy": {
    "last_30_days": 0.92,
    "last_90_days": 0.89,
    "all_time": 0.88
  },
  "badges": [
    "Consistent Contributor",
    "Successful Challenger",
    "Peer-Reviewed"
  ],
  "stakes": {
    "locked": 50.0,  // tokens locked for ongoing challenges
    "available": 200.0
  }
}
```

**Reputation Algorithm**:
```
New_Reputation = Current_Reputation + 
                 (ΔAccuracy × Weight) + 
                 (ΔChallenge × Weight) - 
                 (Time_Decay × Factor)

Where:
- ΔAccuracy = Change in prediction accuracy
- ΔChallenge = Success/failure in challenges
- Time_Decay = Reputation slowly decreases without activity
- Weights = Configurable based on community governance
```

---

## Data Models

### Entity Relationship Diagram

```
┌─────────────┐         ┌──────────────┐
│  Core Fact  │────────►│ Interpretation│
└─────────────┘         └──────────────┘
       │                       │
       │                       │
       ▼                       ▼
┌─────────────┐         ┌──────────────┐
│   Source    │         │  Bias Tag    │
└─────────────┘         └──────────────┘
       │                       │
       │                       │
       ▼                       ▼
┌─────────────┐         ┌──────────────┐
│  Signature  │         │  Challenge   │
└─────────────┘         └──────────────┘
       │                       │
       │                       │
       └───────┬───────────────┘
               │
               ▼
       ┌──────────────┐
       │   User       │
       └──────────────┘
```

---

## API Design

### RESTful Endpoints (v0.1)

**Facts**
```
GET    /api/v1/facts/:id           - Retrieve fact by ID
POST   /api/v1/facts                - Create new fact (requires signature)
GET    /api/v1/facts/:id/verify     - Verify Merkle proof
```

**Interpretations**
```
GET    /api/v1/interpretations/:id              - Retrieve interpretation
POST   /api/v1/interpretations                  - Create interpretation
POST   /api/v1/interpretations/:id/fork         - Fork interpretation
GET    /api/v1/interpretations/:id/diff/:other  - Diff two interpretations
```

**Challenges**
```
GET    /api/v1/challenges/:id                   - Retrieve challenge
POST   /api/v1/challenges                       - Submit challenge
POST   /api/v1/challenges/:id/vote              - Vote on challenge
POST   /api/v1/challenges/:id/counter           - Provide counter-evidence
```

**Reputation**
```
GET    /api/v1/users/:id/reputation             - Get user reputation
GET    /api/v1/users/:id/contributions          - Get contribution history
```

---

## Security & Privacy

### Threat Model

**Threats**:
1. **Sybil Attacks**: Fake accounts boost reputation
2. **Reputation Farming**: Gaming the system for high scores
3. **Coordinated Manipulation**: Groups vote together maliciously
4. **Data Tampering**: Attempts to alter immutable facts
5. **Privacy Leaks**: User identity exposed through contributions

**Mitigations**:
1. **Stake Requirements**: Must lock tokens to challenge (skin in the game)
2. **Reputation Decay**: Old reputation matters less
3. **Voting Weights**: Votes weighted by reputation + stake
4. **Immutability**: Facts stored on IPFS with cryptographic proofs
5. **Pseudonymity**: Users identified by public key, not real name

---

## Scalability

### Storage Estimates

**Assumptions**:
- 1 million facts per year
- 10 interpretations per fact
- 10% challenge rate

**Storage Requirements**:
- Core Facts (IPFS): ~100 GB/year (with signatures, proofs)
- Interpretations (DB): ~500 GB/year (with version history)
- Challenges (DB): ~50 GB/year

**Optimization**:
- Use IPFS for immutable data
- Archive old interpretations with low activity
- Prune spam/low-quality challenges

---

## Implementation Roadmap

See [ROADMAP.md](ROADMAP.md) for full details.

**Phase 1 (Weeks 1-4)**: Prototypes
- IPFS integration
- Bias classifier
- Fork engine

**Phase 2 (Weeks 5-8)**: Integration
- Connect layers
- API development
- Test with Grokipedia data

**Phase 3 (Months 3-6)**: Community
- Governance model
- Reputation system
- Public launch

---

## Open Questions

### Governance
- Who decides algorithm changes?
- How are disputes resolved at meta-level?
- What happens when community can't reach consensus?

### Economics
- Do we need a token for staking?
- How are contributors compensated?
- Can this be sustainable without ads?

### Technology
- Which blockchain for timestamps? (Bitcoin, Ethereum, Cosmos?)
- How to handle IPFS pinning costs?
- What if IPFS becomes unavailable?

### Social
- How to prevent echo chambers from forking forever?
- What's the UX for non-technical users?
- Can this scale to billions of claims?

---

## Contributing to Architecture

**Found a flaw?** Open an issue.  
**Have a better design?** Submit a PR.  
**Want to prototype?** See [CONTRIBUTING.md](CONTRIBUTING.md).

**This architecture is v0.1.**  
**It will evolve with community input.**

---

*Last updated: October 28, 2025*  
*Next review: After prototyping phase*

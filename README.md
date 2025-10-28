# Truth Mesh

**Decentralized knowledge verification protocol**

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Status: v0.1 Alpha](https://img.shields.io/badge/Status-v0.1%20Alpha-orange)]()

---

## Architecture

Truth Mesh is a protocol for verifiable knowledge where claims can be forked, bias is quantified, and provenance is cryptographically proven.

```
Core Facts (immutable)    →  IPFS + Merkle proofs + signatures
Context Clouds            →  Competing interpretations with full provenance
Bias Tags                 →  Auto-classified, open weights
Challenge Portals         →  Formal disputes with evidence requirements
Reputation                →  Earned through accuracy over time
```

**Key difference**: Instead of asking "what is true?", Truth Mesh asks "how do we verify?" and "who vouches for this?"

---

## Technical Foundation

### Layer 1: Core Facts
Immutable storage with cryptographic verification
- IPFS content addressing
- Merkle proofs for validation
- Source signatures (Ed25519)
- Blockchain timestamps

### Layer 2: Context Clouds
Competing interpretations with version control
- Git-style branching for claims
- Diff views between forks
- Full edit history
- No editorial gatekeepers

### Layer 3: Bias Classification
Transparent ideological/methodological tagging
- ML-based auto-classification
- Open-source classifier weights
- Community adjustment voting
- Funding source disclosure

### Layer 4: Challenge System
Formal dispute mechanism with evidence requirements
- Stake-based challenges
- Reputation-weighted voting
- Evidence counter-evidence chains
- Automated confidence adjustments

### Layer 5: Reputation
Trust earned through accuracy, not authority
- Track record of correct claims
- Challenge success rates
- Temporal decay (recent > old)
- Category-specific scores

[Full technical specification →](ARCHITECTURE.md)

---

## Why This Matters

Current knowledge systems—Wikipedia, Grokipedia, others—assume truth is singular and should be controlled by one authority (editors, AI, etc.).

**Truth Mesh approach**: Make bias explicit, make provenance verifiable, make interpretations forkable.

**For AI systems**: Training on Truth Mesh data means:
- Full provenance chains (no zombie citations)
- Confidence scores that decay without re-verification
- Multiple interpretations (not just "consensus")
- Audit trails for every claim

**For xAI/Grokipedia**: Can serve as verification layer - stress-test claims against competing interpretations, auto-tag bias in real-time, track confidence decay.

---

## Development Context

This protocol emerged from analysis of Grokipedia's October 27, 2025 launch. When xAI's system crashed, architectural critique was published on X. Within 15 minutes, Grok responded three times requesting technical specifications. This repository is that response.

- [View engagement timeline →](GROK_RESPONSES.md)
- [Read original critique →](MANIFESTO.md)

Built by someone with 15+ years architecting government-scale digital infrastructure (44M citizens, 25+ integrated systems, zero breaches over 5 years). Not theory - implementation patterns from real-world deployment at Ministry of IT (Pakistan), Punjab Social Protection Authority, and international organizations.

**Track record**:
- Government e-services (2006-2008, Pakistan Ministry of IT)
- National digital transformation (2016-2021, 44M citizens served)
- ICANN/UN policy work (multilingual internet access)
- Current: CEO, UK-based AI firm | Oxford AI Programme, Harvard Tech Ventures

Credentials: PMP, ITIL, PSM, MBCS Fellow | [LinkedIn](https://linkedin.com/in/nomanshahuk) | [Website](https://nomanshah.com)

---

## Current Status

**v0.1 Alpha** - Architecture specification complete, prototypes beginning

**Documentation**:
- Technical specification (5 layers, data models, API design)
- Development roadmap (Oct 2025 - Oct 2026)
- Contribution guidelines
- Use case analysis

**Next** (Weeks 2-4):
- IPFS integration prototype
- Bias classifier (open weights)
- Fork engine (Git-style claims)

[View roadmap →](ROADMAP.md)

---

## Documentation

| Document | Purpose |
|----------|---------|
| [ARCHITECTURE.md](ARCHITECTURE.md) | Complete technical specification |
| [MANIFESTO.md](MANIFESTO.md) | Design principles and epistemological foundation |
| [ROADMAP.md](ROADMAP.md) | Development timeline and milestones |
| [CONTRIBUTING.md](CONTRIBUTING.md) | Contribution guidelines |
| [GROK_RESPONSES.md](GROK_RESPONSES.md) | xAI engagement documentation |
| [docs/](docs/) | Layer-specific technical documentation |
| [examples/](examples/) | Real-world use cases |

---

## Core Principles

**No single authority owns truth** - Truth emerges from transparent verification processes

**Fork-ability** - Any claim can be branched, challenged, and maintained separately

**Transparent bias** - Bias is quantified and labeled, not hidden

**Earned reputation** - Trust built through accuracy over time, not institutional authority

**Temporal honesty** - Confidence decays without re-verification

**Full provenance** - Every claim has complete audit trail to original sources

---

## Contributing

This is v0.1. Architecture will evolve based on prototyping and community feedback.

**Developers**: See [CONTRIBUTING.md](CONTRIBUTING.md) for setup and guidelines

**Researchers**: Open issues for architectural critique or epistemological analysis

**Designers**: UX/UI needed for fork/diff interfaces and provenance visualization

---

## Use Cases

- Scientific retractions propagating automatically
- Political fact-checking with multiple perspectives
- Product safety recalls with temporal confidence
- Historical events with competing interpretations
- Drug efficacy studies with funding transparency

[View detailed use cases →](examples/use-cases.md)

---

## About

Built by Noman Shah | Digital transformation architect, 27+ years experience.

**Track record**: Led Pakistan's largest digital transformation (44M citizens, 5-year zero-breach record). Architected e-government systems at Pakistan Ministry of IT. Successfully lobbied ICANN/UN for multilingual internet accessibility. Oxford AI Programme (2025), Harvard Tech Ventures (2024).

This follows a pattern: building alternatives to centralized systems through execution.

---

## License

MIT License - Build freely, fork boldly.

---

**Built in public** | **Open for collaboration** | **Protocol, not product**

[@NomanInnov8](https://x.com/NomanInnov8) | [GitHub](https://github.com/XerolandRegent/truth-mesh)

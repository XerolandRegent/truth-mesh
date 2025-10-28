# Core Facts Layer

**Purpose**: Immutable, verifiable storage for atomic facts

**Last Updated**: October 28, 2025

---

## Overview

The Core Facts Layer is the foundation of Truth Mesh. It stores **verifiable, atomic facts** that cannot be altered or deleted—only reinterpreted.

**Key Properties**:
- ✅ Immutable (stored on IPFS)
- ✅ Verifiable (Merkle proofs + cryptographic signatures)
- ✅ Timestamped (blockchain or distributed ledger)
- ✅ Source-linked (provenance to original data)

---

## What Is a "Core Fact"?

**Definition**: A discrete, verifiable statement backed by authoritative source with cryptographic proof.

**Examples**:
- ✅ "Temperature at NOAA Station X on Date Y was Z°C"
- ✅ "Study DOI:10.1234/abc found correlation of 0.85"
- ✅ "GDP of Country A in Year B was $X trillion (World Bank)"
- ✅ "Bill passed Senate on Date with vote count Y-N"

**Non-Examples**:
- ❌ "Climate change is accelerating" (interpretation, not fact)
- ❌ "Policy X is effective" (subjective judgment)
- ❌ "Most experts agree..." (vague, not atomic)

---

## Data Structure

```json
{
  "type": "core_fact",
  "id": "fact_abc123",
  "version": "1.0",
  
  "content": {
    "statement": "Temperature at NOAA Station GHCN-123 on 2025-01-15T14:00:00Z was 15.3°C",
    "structured_data": {
      "station_id": "GHCN-123",
      "date": "2025-01-15T14:00:00Z",
      "measurement": 15.3,
      "unit": "celsius"
    }
  },
  
  "source": {
    "organization": "NOAA",
    "dataset": "Global Historical Climatology Network",
    "url": "https://noaa.gov/data/ghcn/...",
    "ipfs_hash": "QmXxxx...",
    "signature": "0x1234...",
    "public_key": "0xabcd...",
    "signature_algorithm": "Ed25519"
  },
  
  "verification": {
    "merkle_root": "0xroot...",
    "merkle_siblings": ["0xsib1...", "0xsib2..."],
    "merkle_path": [0, 1, 0]  // Path through tree
  },
  
  "timestamp": {
    "unix": 1705329600,
    "iso": "2025-01-15T14:00:00Z",
    "blockchain": {
      "chain": "ethereum",
      "block_number": 15432109,
      "transaction_hash": "0xtx..."
    }
  },
  
  "metadata": {
    "created_by": "user_456",
    "created_at": "2025-10-28T10:00:00Z",
    "category": "climate",
    "tags": ["temperature", "noaa", "raw-data"]
  }
}
```

---

## Storage on IPFS

### Why IPFS?

**Content-Addressed**: Hash of content is the address (tamper-proof)  
**Distributed**: No single point of failure  
**Immutable**: Once stored, content never changes  
**Retrievable**: Anyone can fetch by hash

### How It Works

1. **Create fact** with source signature
2. **Generate Merkle proof** showing fact is part of dataset
3. **Store on IPFS** → Get hash (e.g., `QmXxxx...`)
4. **Timestamp hash** on blockchain (Ethereum, Bitcoin)
5. **Fact now verifiable** by anyone with:
   - IPFS hash
   - Merkle proof
   - Source's public key

---

## Merkle Proofs

### What Are They?

Merkle proofs allow anyone to verify a fact is part of a larger dataset WITHOUT downloading the entire dataset.

### Example

```
Dataset: 1000 temperature measurements

Merkle Tree:
                    Root
                   /    \
              Node1      Node2
             /    \      /    \
          F1  F2  F3  F4  ...

To prove F1 is in the tree:
- Show F1
- Show sibling (F2)
- Show parent's sibling (Node2)
- Show root

Verifier can compute root and check against known root.
```

### Implementation

```python
def verify_merkle_proof(fact, siblings, path, root):
    """
    Verify that fact is part of Merkle tree with given root.
    
    Args:
        fact: The fact to verify
        siblings: Hashes of sibling nodes in tree
        path: Binary array (0=left, 1=right)
        root: Known Merkle root
    
    Returns:
        True if fact is in tree, False otherwise
    """
    current_hash = hash(fact)
    
    for sibling, direction in zip(siblings, path):
        if direction == 0:  # Current node is left child
            current_hash = hash(current_hash + sibling)
        else:  # Current node is right child
            current_hash = hash(sibling + current_hash)
    
    return current_hash == root
```

---

## Cryptographic Signatures

### Why Signatures?

To prove the fact came from the claimed source (e.g., NOAA, not a random person).

### How It Works

1. **Source generates key pair** (private + public)
2. **Source signs fact** with private key
3. **Signature stored** with fact
4. **Anyone can verify** using source's public key

### Implementation

```python
from cryptography.hazmat.primitives.asymmetric import ed25519

def sign_fact(fact_content, private_key):
    """Sign a fact with private key."""
    signature = private_key.sign(fact_content.encode())
    return signature.hex()

def verify_signature(fact_content, signature, public_key):
    """Verify fact signature."""
    try:
        public_key.verify(
            bytes.fromhex(signature),
            fact_content.encode()
        )
        return True
    except Exception:
        return False
```

---

## Timestamp on Blockchain

### Why Blockchain?

To prove the fact existed at a specific time (prevents backdating).

### How It Works

1. **Generate hash** of fact + signature
2. **Submit hash** to blockchain (Bitcoin, Ethereum)
3. **Get transaction ID** and block number
4. **Fact is now timestamped** (cannot claim it was created earlier)

### Cost Considerations

**Bitcoin**: Most secure, but expensive (~$5-50 per transaction)  
**Ethereum**: Flexible, but gas fees vary (~$1-20)  
**Layer 2 (Polygon, Arbitrum)**: Cheaper (~$0.01-0.10)  
**Batch Timestamps**: Group multiple facts → 1 transaction

---

## API Operations

### Create Fact

```http
POST /api/v1/facts

Request:
{
  "statement": "Temperature at Station X was Y°C",
  "source": {
    "organization": "NOAA",
    "url": "https://...",
    "signature": "0x..."
  }
}

Response:
{
  "id": "fact_abc123",
  "ipfs_hash": "QmXxxx...",
  "merkle_proof": {...},
  "timestamp": {...}
}
```

---

### Retrieve Fact

```http
GET /api/v1/facts/{id}

Response:
{
  "id": "fact_abc123",
  "content": {...},
  "source": {...},
  "verification": {...}
}
```

---

### Verify Fact

```http
GET /api/v1/facts/{id}/verify

Response:
{
  "ipfs_verified": true,
  "merkle_verified": true,
  "signature_verified": true,
  "timestamp_verified": true,
  "overall_status": "valid"
}
```

---

## Security Considerations

### Attack Vectors

1. **Fake Signatures**: Attacker claims fact from NOAA but signs with own key
   - **Mitigation**: Verify signature against known public keys

2. **Backdating**: Attacker claims fact existed years ago
   - **Mitigation**: Blockchain timestamp proves when fact was recorded

3. **IPFS Unavailability**: Fact hash exists but content not retrievable
   - **Mitigation**: Pin important facts, use multiple IPFS nodes

4. **Merkle Tree Forgery**: Fake proofs showing fact in tree
   - **Mitigation**: Require root to be timestamped on blockchain

---

## Best Practices

### For Fact Creators

✅ **Do**:
- Use authoritative sources only
- Provide direct links to original data
- Include structured data (not just text)
- Sign with organization's official key

❌ **Don't**:
- Mix facts with interpretations
- Use vague statements
- Omit source information
- Sign with personal key (use org key)

---

### For Verifiers

✅ **Do**:
- Check all three proofs (IPFS, Merkle, Signature)
- Verify blockchain timestamp
- Cross-reference with original source
- Report invalid facts

❌ **Don't**:
- Trust fact without verification
- Assume old facts are still valid
- Skip signature verification

---

## Future Improvements

### Planned Enhancements

1. **Batch Operations**: Submit multiple facts in one transaction
2. **Zero-Knowledge Proofs**: Prove fact validity without revealing content
3. **Cross-Chain Timestamps**: Use multiple blockchains for redundancy
4. **Automated Source Verification**: Check source authenticity automatically

---

## Contributing

**Want to improve this layer?**
- Propose better data structure
- Implement IPFS integration
- Build verification tools
- Write tests

**See**: [CONTRIBUTING.md](../CONTRIBUTING.md)

---

*Last updated: October 28, 2025*

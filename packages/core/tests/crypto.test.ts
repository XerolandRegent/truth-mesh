/**
 * ==============================================================================
 * File Name: crypto.test.ts
 * File Path: packages/core/tests/crypto.test.ts
 * Description: Unit tests for cryptographic operations
 * Date Created: 2025-10-29
 * Version: 1.0.0
 * ==============================================================================
 */

import { describe, it, expect } from 'vitest';
import { SignatureService } from '../src/crypto/signatures';
import { CID } from 'multiformats/cid';
import { sha256 } from 'multiformats/hashes/sha2';
import * as raw from 'multiformats/codecs/raw';

describe('SignatureService', () => {
  const crypto = new SignatureService();

  describe('Key Generation', () => {
    it('should generate a valid Ed25519 key pair', () => {
      const keyPair = crypto.generateKeyPair();

      expect(keyPair.publicKey).toBeInstanceOf(Uint8Array);
      expect(keyPair.privateKey).toBeInstanceOf(Uint8Array);
      expect(keyPair.publicKey.length).toBeGreaterThan(0);
      expect(keyPair.privateKey.length).toBeGreaterThan(0);
    });

    it('should generate unique key pairs', () => {
      const keyPair1 = crypto.generateKeyPair();
      const keyPair2 = crypto.generateKeyPair();

      expect(keyPair1.publicKey).not.toEqual(keyPair2.publicKey);
      expect(keyPair1.privateKey).not.toEqual(keyPair2.privateKey);
    });
  });

  describe('Signing', () => {
    it('should sign string data', () => {
      const keyPair = crypto.generateKeyPair();
      const data = 'Hello, World!';
      
      const signature = crypto.sign(data, keyPair.privateKey);

      expect(signature).toBeTruthy();
      expect(typeof signature).toBe('string');
      expect(signature.length).toBeGreaterThan(0);
    });

    it('should sign binary data', () => {
      const keyPair = crypto.generateKeyPair();
      const data = new Uint8Array([1, 2, 3, 4, 5]);
      
      const signature = crypto.sign(data, keyPair.privateKey);

      expect(signature).toBeTruthy();
      expect(typeof signature).toBe('string');
    });

    it('should produce different signatures for different data', () => {
      const keyPair = crypto.generateKeyPair();
      
      const signature1 = crypto.sign('data1', keyPair.privateKey);
      const signature2 = crypto.sign('data2', keyPair.privateKey);

      expect(signature1).not.toBe(signature2);
    });

    it('should produce consistent signatures for same data', () => {
      const keyPair = crypto.generateKeyPair();
      const data = 'consistent data';
      
      const signature1 = crypto.sign(data, keyPair.privateKey);
      const signature2 = crypto.sign(data, keyPair.privateKey);

      expect(signature1).toBe(signature2);
    });
  });

  describe('Verification', () => {
    it('should verify valid signatures', () => {
      const keyPair = crypto.generateKeyPair();
      const data = 'Test data';
      
      const signature = crypto.sign(data, keyPair.privateKey);
      const isValid = crypto.verify(data, signature, keyPair.publicKey);

      expect(isValid).toBe(true);
    });

    it('should reject invalid signatures', () => {
      const keyPair = crypto.generateKeyPair();
      const data = 'Test data';
      
      const signature = crypto.sign(data, keyPair.privateKey);
      const isValid = crypto.verify('Different data', signature, keyPair.publicKey);

      expect(isValid).toBe(false);
    });

    it('should reject signatures with wrong public key', () => {
      const keyPair1 = crypto.generateKeyPair();
      const keyPair2 = crypto.generateKeyPair();
      const data = 'Test data';
      
      const signature = crypto.sign(data, keyPair1.privateKey);
      const isValid = crypto.verify(data, signature, keyPair2.publicKey);

      expect(isValid).toBe(false);
    });

    it('should handle malformed signatures gracefully', () => {
      const keyPair = crypto.generateKeyPair();
      const data = 'Test data';
      
      const isValid = crypto.verify(data, 'invalid-signature', keyPair.publicKey);

      expect(isValid).toBe(false);
    });
  });

  describe('Hashing', () => {
    it('should hash string data', () => {
      const data = 'Test data';
      const hash = crypto.hash(data);

      expect(hash).toBeTruthy();
      expect(typeof hash).toBe('string');
      expect(hash.length).toBe(64); // SHA-256 produces 32 bytes = 64 hex chars
    });

    it('should hash binary data', () => {
      const data = new Uint8Array([1, 2, 3, 4, 5]);
      const hash = crypto.hash(data);

      expect(hash).toBeTruthy();
      expect(hash.length).toBe(64);
    });

    it('should produce consistent hashes', () => {
      const data = 'Consistent data';
      
      const hash1 = crypto.hash(data);
      const hash2 = crypto.hash(data);

      expect(hash1).toBe(hash2);
    });

    it('should produce different hashes for different data', () => {
      const hash1 = crypto.hash('data1');
      const hash2 = crypto.hash('data2');

      expect(hash1).not.toBe(hash2);
    });
  });

  describe('CID Hashing', () => {
    it('should hash a CID', async () => {
      const data = new Uint8Array([1, 2, 3]);
      const hash = await sha256.digest(data);
      const cid = CID.create(1, raw.code, hash);
      
      const cidHash = crypto.hashCID(cid);

      expect(cidHash).toBeTruthy();
      expect(typeof cidHash).toBe('string');
      expect(cidHash.length).toBe(64);
    });

    it('should produce consistent CID hashes', async () => {
      const data = new Uint8Array([1, 2, 3]);
      const hash = await sha256.digest(data);
      const cid = CID.create(1, raw.code, hash);
      
      const cidHash1 = crypto.hashCID(cid);
      const cidHash2 = crypto.hashCID(cid);

      expect(cidHash1).toBe(cidHash2);
    });
  });

  describe('Pair Hashing', () => {
    it('should hash a pair of hashes', () => {
      const hash1 = crypto.hash('data1');
      const hash2 = crypto.hash('data2');
      
      const pairHash = crypto.hashPair(hash1, hash2);

      expect(pairHash).toBeTruthy();
      expect(typeof pairHash).toBe('string');
      expect(pairHash.length).toBe(64);
    });

    it('should produce consistent pair hashes', () => {
      const hash1 = crypto.hash('data1');
      const hash2 = crypto.hash('data2');
      
      const pairHash1 = crypto.hashPair(hash1, hash2);
      const pairHash2 = crypto.hashPair(hash1, hash2);

      expect(pairHash1).toBe(pairHash2);
    });

    it('should produce different hashes for different order', () => {
      const hash1 = crypto.hash('data1');
      const hash2 = crypto.hash('data2');
      
      const pairHash1 = crypto.hashPair(hash1, hash2);
      const pairHash2 = crypto.hashPair(hash2, hash1);

      expect(pairHash1).not.toBe(pairHash2);
    });
  });
});

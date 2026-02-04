"""AES-256-GCM encryption for vault entries."""

import os
import base64
import json
from typing import Dict, Any, Optional
from cryptography.hazmat.primitives.ciphers.aead import AESGCM


class VaultCrypto:
    """Handles encryption and decryption of vault entries."""
    
    NONCE_SIZE = 12  # 96 bits for GCM
    
    def encrypt(self, plaintext: str, key: bytes) -> str:
        """
        Encrypt plaintext using AES-256-GCM.
        
        Returns base64-encoded string: nonce || ciphertext || tag
        """
        if not plaintext:
            raise ValueError("Plaintext cannot be empty")
        if len(key) != 32:
            raise ValueError("Key must be 256 bits (32 bytes)")
        
        nonce = os.urandom(self.NONCE_SIZE)
        aesgcm = AESGCM(key)
        
        ciphertext = aesgcm.encrypt(
            nonce,
            plaintext.encode('utf-8'),
            None  # No additional authenticated data
        )
        
        # Combine nonce + ciphertext (tag is appended by AESGCM)
        encrypted = nonce + ciphertext
        return base64.b64encode(encrypted).decode('utf-8')
    
    def decrypt(self, encrypted_b64: str, key: bytes) -> str:
        """
        Decrypt AES-256-GCM encrypted data.
        
        Expects base64-encoded string: nonce || ciphertext || tag
        """
        if not encrypted_b64:
            raise ValueError("Encrypted data cannot be empty")
        if len(key) != 32:
            raise ValueError("Key must be 256 bits (32 bytes)")
        
        encrypted = base64.b64decode(encrypted_b64.encode('utf-8'))
        
        if len(encrypted) < self.NONCE_SIZE + 16:  # nonce + min tag
            raise ValueError("Invalid encrypted data")
        
        nonce = encrypted[:self.NONCE_SIZE]
        ciphertext = encrypted[self.NONCE_SIZE:]
        
        aesgcm = AESGCM(key)
        plaintext = aesgcm.decrypt(nonce, ciphertext, None)
        
        return plaintext.decode('utf-8')
    
    def encrypt_entry(self, entry: Dict[str, Any], key: bytes) -> str:
        """Encrypt a vault entry dictionary."""
        json_str = json.dumps(entry, ensure_ascii=False)
        return self.encrypt(json_str, key)
    
    def decrypt_entry(self, encrypted_b64: str, key: bytes) -> Dict[str, Any]:
        """Decrypt a vault entry to dictionary."""
        json_str = self.decrypt(encrypted_b64, key)
        return json.loads(json_str)


# Global instance
vault_crypto = VaultCrypto()

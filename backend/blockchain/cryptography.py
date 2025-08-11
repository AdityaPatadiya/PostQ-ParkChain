from ecdsa import SigningKey, VerifyingKey, BadSignatureError, SECP256k1
import base58
import json
import sys
import os
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))
from backend.EchelonCrypt.Encryption.key_generation.key_file_generation import Key_Generation

class Cryptography():
    def __init__(self):
        self.generate_key = Key_Generation()
        self.private, self.public, self.address = self.generate_wallet()

    def generate_wallet(self):
        private_key = SigningKey.generate(curve=SECP256k1)
        public_key = private_key.get_verifying_key()
        print(type(public_key))

        if public_key is None:
            raise ValueError("Public key generation failed.")

        private_pem = private_key.to_pem().decode()
        public_pem = public_key.to_pem().decode()

        # keys = self.generate_key.generate_signature_keys("n")
        # if keys is None:
        #     raise ValueError("Key generation failed: generate_signature_keys returned None.")
        # public_key, private_key = keys

        # Encode public key for address
        print(public_key)
        public_key_bytes = public_key.to_string()
        print(public_key_bytes)
        address = base58.b58encode(public_key_bytes).decode()

        return private_key, public_key, address

    def sign_transaction(self, transaction):
        sk = SigningKey.from_pem(self.private)
        message = json.dumps(transaction, sort_keys=True).encode()
        signature = sk.sign(message)
        return signature.hex()

    def verify_transaction(self, transaction, signature_hex):
        vk = VerifyingKey.from_pem(self.public)
        message = json.dumps(transaction, sort_keys=True).encode()
        try:
            return vk.verify(bytes.fromhex(signature_hex), message)
        except BadSignatureError:
            return False

crypto = Cryptography()

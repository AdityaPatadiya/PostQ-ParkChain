from ecdsa import SigningKey, VerifyingKey, BadSignatureError, SECP256k1
import base58
import json
import sys
import os
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))
from EchelonCrypt.Encryption.key_generation.key_file_generation import Key_Generation

class Cryptography():
    def __init__(self):
        self.key_dir = os.path.join(os.path.dirname(__file__), "keys")
        os.makedirs(self.key_dir, exist_ok=True)

        private_path = os.path.join(self.key_dir, "private.pem")
        public_path = os.path.join(self.key_dir, "public.pem")

        if os.path.exists(private_path) and os.path.exists(public_path):
            with open(private_path, "r") as f:
                self.private = f.read()
            with open(public_path, "r") as f:
                self.public = f.read()
            self.address = self.generate_address_from_public(self.public)
        else:
            self.private, self.public, self.address = self.generate_wallet()
            with open(private_path, "w") as f:
                f.write(self.private)
            with open(public_path, "w") as f:
                f.write(self.public)

    def generate_address_from_public(self, public_pem):
        vk = VerifyingKey.from_pem(public_pem.encode())
        public_key_bytes = vk.to_string()
        return base58.b58encode(public_key_bytes).decode()

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

        return private_pem, public_pem, address

    def sign_transaction(self, transaction):
        sk = SigningKey.from_pem(self.private.encode())
        message = json.dumps(transaction, sort_keys=True).encode()
        signature = sk.sign(message)
        return signature.hex()

    def verify_transaction(self, transaction, signature_hex):
        vk = VerifyingKey.from_pem(self.public.encode())
        message = json.dumps(transaction, sort_keys=True).encode()
        try:
            return vk.verify(bytes.fromhex(signature_hex), message)
        except BadSignatureError:
            return False

crypto = Cryptography()

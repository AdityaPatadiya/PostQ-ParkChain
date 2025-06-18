from ecdsa import SigningKey, VerifyingKey, BadSignatureError, SECP256k1
import base58
import json


class Cryptography():
    def __init__(self):
        self.private, self.public, self.address = self.generate_wallet()
        # print("Private Key:\n", self.private)
        # print("Public Key:\n", self.public)
        # print("Wallet Address:", self.address)

    def generate_wallet(self):
        private_key = SigningKey.generate(curve=SECP256k1)
        public_key = private_key.get_verifying_key()

        private_pem_lines = private_key.to_pem().decode().strip().splitlines()
        public_pem_lines = public_key.to_pem().decode().strip().splitlines()

        raw_private_key = ''.join(private_pem_lines[1:-1])
        raw_public_key = ''.join(public_pem_lines[1:-1])
        # Encode in base58 for readability (like BTC addresses)
        public_key_bytes = public_key.to_string()
        address = base58.b58encode(public_key_bytes).decode()

        return raw_private_key, raw_public_key, address

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

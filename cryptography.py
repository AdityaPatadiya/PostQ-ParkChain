from ecdsa import SigningKey, VerifyingKey, BadSignatureError, SECP256k1
import base58
import json


class Cryptography():
    def __init__(self):
        self.private, self.public, self.address = self.generate_wallet()

    def generate_wallet(self):
        private_key = SigningKey.generate(curve=SECP256k1)
        public_key = private_key.get_verifying_key()

        if public_key is None:
            raise ValueError("Public key generation failed.")

        private_pem = private_key.to_pem().decode()
        public_pem = public_key.to_pem().decode()

        # Encode public key for address
        public_key_bytes = public_key.to_string()
        address = base58.b58encode(public_key_bytes).decode()

        return private_pem, public_pem, address

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

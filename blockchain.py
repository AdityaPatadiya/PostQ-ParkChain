import hashlib
import json
import requests

from time import time
from urllib.parse import urlparse
from cryptography import Cryptography


class Blockchain(object):
    def __init__(self):
        self.chain = []
        self.current_transaction = []
        self.nodes = set()
        self.cryptography = Cryptography()

        # Create the genesis block
        self.new_block(previous_hash='0000000000000000000000000000000000000000000000000000000000000000', proof=self.proof_of_work(0))

    def new_block(self, proof, previous_hash=None):
        """
        Create a new Block in the Blockchain
        :param proof: <int> The proof given by the proof of work algorithm
        :param previous_hash: (optional) <str> Hash of previous Block
        :return: <dict> New Block
        """
        block = {
            'index': len(self.chain) + 1,
            'timestamp': time(),
            'transactions': self.current_transaction,
            'proof': proof,
            'previous_hash': previous_hash or self.hash(self.chain[-1]),
            'validator': ""
        }

        # Reset the current list of transactions
        self.current_transaction = []
        self.chain.append(block)
        return block

    def new_transaction(self, sender, recipient, amount):
        """
        Creates a new transaction to go into the nexr mined Block
        :param sender: <str> Address of the Sender
        :param recipient: <str> Address of the Recipient
        :param amount: <int> Amount
        :return: <int> The index of the Block taht will hold this transaction
        """
        transaction = {
            'sender': sender,
            'recipient': recipient,
            'amount': amount,
            "vehical_id": "",
            "duration": "",
            "location": "",
            "timestamp": "",
            "signature": "",
            "public_key": "",
        }

        signature = self.cryptography.sign_transaction(transaction)
        public_key = self.cryptography.public
        raw_public_key = ''.join(public_key.splitlines()[1:-1])

        signed_transaction = {
            **transaction,
            "signature": signature,
            "public key": raw_public_key
        }

        if not self.cryptography.verify_transaction(transaction, signature):
            raise Exception("Invalid signature!")

        self.current_transaction.append(signed_transaction)

        return self.last_block['index'] + 1

    def register_node(self, address):
        """
        Add a new node to the list of nodes
        :param address: <str> Address of node. Eg. 'http://192.168.0.5:0000'
        :return: None
        """
        parsed_url = urlparse(address)
        self.nodes.add(parsed_url.netloc)

    def valid_chain(self, chain):
        """
        Determine if a given blockchain is calid
        :param chain: <list> A blockchain
        :return: <bool> Ture if valid, False if not
        """
        last_block = chain[0]
        current_index = 1

        while current_index < len(chain):
            block = chain[current_index]
            print(f"{last_block}")
            print(f"{block}")
            print("\n-----------------\n")
            # Check that the hash of the block is correct
            if block['previous_hash'] != self.hash(last_block):
                return False

            # Check that the proof of work is correct
            if not self.Valid_proof(last_block['proof'], block['proof']):
                return False

            last_block = block
            current_index += 1

        return True

    def resolve_conflicts(self):
        """
        This is our Consensus Algorithm, it resolves conflicts 
        by replacing our chain with the longest one in the network.
        :return: <bool> True if our chain was replaced, Flase if not
        """
        neighbours = self.nodes
        new_chain = None

        # We're only looking for chains longer than ours
        max_length = len(self.chain)

        # Grab and verify the chains from all the nodes in out network
        for node in neighbours:
            response = requests.get(f"http://{node}/chain")

            if response.status_code == 200:
                length = response.json()['length']
                chain = response.json()['chain']

                # Check if the length islonger and the chain is valid
                if length > max_length and self.valid_chain(chain):
                    max_length = length
                    new_chain = chain

        # Replace our chain if we deiscovered a new, valid chain longer than ours
        if new_chain:
            self.chain = new_chain
            return True

        return False

    @staticmethod
    def hash(block):
        """
        Creates a SHA-256 hash of a Block
        :param block: <dict> Block
        :return: <str>
        """

        block_string = json.dumps(block, sort_keys=True).encode()
        return hashlib.sha256(block_string).hexdigest()

    @property
    def last_block(self):
        return self.chain[-1]

    def proof_of_work(self, last_proof):
        """
        Simple Proof of Work Algorithm:
        - Find a number p' such that (pp') contains leading 4 zeroes, where p is the previous p'
        - p is the previous proof, and p' is the new proof
        :param last_proof: <int>
        :return: <int>
        """
        proof = 0
        while self.Valid_proof(last_proof, proof) is False:
            proof +=1

        return proof

    @staticmethod
    def Valid_proof(last_proof, proof):
        """
        Validated the Proof: Does hash(last_proof, proof) contains 4 leading zeroes?
        :param last_proof: <int> Previous Proof
        :param proof: <int> Current Proof
        :return: <bool> True if correct, False if not.
        """

        guess = f"{last_proof}{proof}".encode()
        guess_hash = hashlib.sha256(guess).hexdigest()
        return guess_hash[:4] == "0000"

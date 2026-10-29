"""
Blockchain integration service.

Environment: LOCAL_DEVELOPMENT (Hardhat) by default.
MST_TESTNET integration is prepared but requires verified RPC details.

IMPORTANT: This module never invents transaction receipts.
If the blockchain node is unavailable, it raises BlockchainUnavailableError.
The contract ABI must match the deployed contract exactly.
"""
from __future__ import annotations

import hashlib
import json
import logging
from pathlib import Path
from typing import Any, Dict, Optional

logger = logging.getLogger(__name__)

# Minimal ABI for FraudShieldRegistry contract
REGISTRY_ABI = [
    {
        "inputs": [
            {"internalType": "string", "name": "reportRef", "type": "string"},
            {"internalType": "bytes32", "name": "evidenceHash", "type": "bytes32"},
        ],
        "name": "registerReport",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function",
    },
    {
        "inputs": [{"internalType": "string", "name": "reportRef", "type": "string"}],
        "name": "getRecord",
        "outputs": [
            {"internalType": "bytes32", "name": "evidenceHash", "type": "bytes32"},
            {"internalType": "uint256", "name": "timestamp", "type": "uint256"},
            {"internalType": "address", "name": "registrar", "type": "address"},
        ],
        "stateMutability": "view",
        "type": "function",
    },
    {
        "anonymous": False,
        "inputs": [
            {"indexed": True, "internalType": "string", "name": "reportRef", "type": "string"},
            {"indexed": False, "internalType": "bytes32", "name": "evidenceHash", "type": "bytes32"},
            {"indexed": False, "internalType": "uint256", "name": "timestamp", "type": "uint256"},
        ],
        "name": "ReportRegistered",
        "type": "event",
    },
]


class BlockchainUnavailableError(Exception):
    pass


class BlockchainService:
    """
    Wraps Web3.py calls to the FraudShieldRegistry smart contract.
    
    Labels all operations with the active environment so the UI can
    distinguish LOCAL_DEVELOPMENT from a real network.
    """

    def __init__(self, settings):
        self.settings = settings
        self._w3 = None
        self._contract = None

    def _get_web3(self):
        """Lazy-initialize Web3 connection."""
        if self._w3 is not None:
            return self._w3
        try:
            from web3 import Web3
            rpc = self.settings.active_rpc_url
            w3 = Web3(Web3.HTTPProvider(rpc, request_kwargs={"timeout": 10}))
            if not w3.is_connected():
                raise BlockchainUnavailableError(
                    f"Cannot connect to blockchain node at {rpc}. "
                    f"Environment: {self.settings.BLOCKCHAIN_ENV}. "
                    f"Start a local Hardhat node with: npx hardhat node"
                )
            self._w3 = w3
            return w3
        except ImportError:
            raise BlockchainUnavailableError("web3 package not installed.")

    def _get_contract(self):
        if self._contract is not None:
            return self._contract
        w3 = self._get_web3()
        addr = self.settings.CONTRACT_ADDRESS
        if not addr:
            raise BlockchainUnavailableError(
                "CONTRACT_ADDRESS is not set. Deploy the smart contract first and set the address in .env."
            )
        from web3 import Web3
        self._contract = w3.eth.contract(
            address=Web3.to_checksum_address(addr),
            abi=REGISTRY_ABI,
        )
        return self._contract

    @property
    def environment_label(self) -> str:
        return self.settings.BLOCKCHAIN_ENV

    def is_available(self) -> bool:
        try:
            self._get_web3()
            return True
        except BlockchainUnavailableError:
            return False

    def hash_to_bytes32(self, hex_hash: str) -> bytes:
        """Convert a hex SHA-256 string to bytes32."""
        clean = hex_hash.removeprefix("0x")
        return bytes.fromhex(clean)

    def register_report(self, report_ref: str, evidence_hash_hex: str) -> Dict[str, Any]:
        """
        Register a report on-chain.
        Returns the transaction receipt details.
        Raises BlockchainUnavailableError if node is not reachable.
        """
        w3 = self._get_web3()
        contract = self._get_contract()

        private_key = self.settings.DEPLOYER_PRIVATE_KEY
        if not private_key:
            raise BlockchainUnavailableError(
                "DEPLOYER_PRIVATE_KEY is not configured. Set it in .env for backend signing."
            )

        account = w3.eth.account.from_key(private_key)
        ev_hash_bytes = self.hash_to_bytes32(evidence_hash_hex)

        tx = contract.functions.registerReport(report_ref, ev_hash_bytes).build_transaction({
            "from": account.address,
            "nonce": w3.eth.get_transaction_count(account.address),
            "gas": 200_000,
            "gasPrice": w3.eth.gas_price,
            "chainId": self.settings.active_chain_id,
        })

        signed = w3.eth.account.sign_transaction(tx, private_key=private_key)
        tx_hash = w3.eth.send_raw_transaction(signed.raw_transaction)
        receipt = w3.eth.wait_for_transaction_receipt(tx_hash, timeout=60)

        if receipt.status != 1:
            raise BlockchainUnavailableError(f"Transaction failed on-chain. Hash: {tx_hash.hex()}")

        return {
            "tx_hash": tx_hash.hex(),
            "block_number": receipt.blockNumber,
            "contract_address": self.settings.CONTRACT_ADDRESS,
            "environment": self.environment_label,
            "chain_id": self.settings.active_chain_id,
            "status": "confirmed",
        }

    def verify_report(self, report_ref: str, expected_hash_hex: str) -> Dict[str, Any]:
        """
        Read on-chain registered hash and compare with expected.
        Returns verification result with match status.
        """
        contract = self._get_contract()
        ev_hash_bytes, timestamp, registrar = contract.functions.getRecord(report_ref).call()

        registered_hex = ev_hash_bytes.hex()
        clean_expected = expected_hash_hex.removeprefix("0x").lower()
        match = registered_hex.lower() == clean_expected

        return {
            "report_ref": report_ref,
            "registered_hash": registered_hex,
            "expected_hash": clean_expected,
            "hash_match": match,
            "registered_at_unix": timestamp,
            "registrar_address": registrar,
            "environment": self.environment_label,
        }


_service: Optional[BlockchainService] = None


def get_blockchain_service() -> BlockchainService:
    global _service
    if _service is None:
        from app.core.config import get_settings
        _service = BlockchainService(get_settings())
    return _service

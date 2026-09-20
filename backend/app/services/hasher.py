"""
Cyber Flock Defense Hub - Cryptographic Canonical Hasher
Provides deterministic JSON serialization, SHA-256 cryptographic digest generation,
and tamper verification for enterprise audit proof and blockchain anchoring.
"""

import json
import hashlib
from typing import Dict, Any, Tuple

def canonical_json_dumps(data: Any) -> str:
    """
    Serializes data into a canonical, deterministic JSON string representation:
    - Keys sorted recursively
    - Floats rounded to 4 decimals to eliminate IEEE 754 platform variations
    - Compact delimiters (no spaces after separators)
    """
    def _normalize(obj):
        if isinstance(obj, dict):
            return {k: _normalize(v) for k, v in sorted(obj.items())}
        elif isinstance(obj, (list, tuple)):
            return [_normalize(item) for item in obj]
        elif isinstance(obj, float):
            return round(obj, 4)
        elif isinstance(obj, int):
            return obj
        elif isinstance(obj, bool):
            return obj
        elif obj is None:
            return None
        else:
            return str(obj).strip()

    normalized = _normalize(data)
    return json.dumps(normalized, sort_keys=True, separators=(",", ":"))

def generate_risk_result_hash(result_dict: Dict[str, Any]) -> Tuple[str, str]:
    """
    Computes deterministic SHA-256 hash for a RiskResult payload.
    Excludes ephemeral metadata (id, tx_hash, created_at, is_anchored).
    Returns (sha256_hex, canonical_json_string).
    """
    EXCLUDED_KEYS = {
        "id", "simulation_id", "organization_id", "blockchain_tx_hash",
        "is_anchored", "created_at", "updated_at", "sha256_hash"
    }
    
    payload = {k: v for k, v in result_dict.items() if k not in EXCLUDED_KEYS}
    canonical_str = canonical_json_dumps(payload)
    sha256_digest = hashlib.sha256(canonical_str.encode("utf-8")).hexdigest()
    return sha256_digest, canonical_str

def verify_risk_result_hash(result_dict: Dict[str, Any], expected_hash: str) -> bool:
    """Verifies that the risk result payload matches the expected cryptographic hash."""
    computed_hash, _ = generate_risk_result_hash(result_dict)
    clean_expected = expected_hash.lower().replace("0x", "")
    return computed_hash.lower() == clean_expected


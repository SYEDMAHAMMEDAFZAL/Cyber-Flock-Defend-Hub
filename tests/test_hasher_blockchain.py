import pytest
from app.services.hasher import canonical_json_dumps, generate_risk_result_hash, verify_risk_result_hash
from app.services.blockchain_service import blockchain_service

def test_canonical_json_determinism():
    dict_a = {"risk": 75.0, "ale": 15000000.0, "status": "COMPLETED"}
    dict_b = {"status": "COMPLETED", "risk": 75.0, "ale": 15000000.0}
    str_a = canonical_json_dumps(dict_a)
    str_b = canonical_json_dumps(dict_b)
    assert str_a == str_b

def test_risk_result_hash_and_verification():
    payload = {
        "id": "result-1",
        "risk_score": 72.5,
        "single_loss_expectancy": 15000000.0,
        "annualized_rate_of_occurrence": 0.8,
        "annualized_loss_expectancy": 12000000.0,
        "total_estimated_loss": 15000000.0,
        "created_at": "2026-09-17T00:00:00"
    }
    sha_hash, canonical_str = generate_risk_result_hash(payload)
    assert len(sha_hash) == 64

    assert verify_risk_result_hash(payload, sha_hash) is True
    assert verify_risk_result_hash(payload, f"0x{sha_hash}") is True

    # Tampering check
    tampered_payload = payload.copy()
    tampered_payload["annualized_loss_expectancy"] = 1000.0  # Fraudulent change
    assert verify_risk_result_hash(tampered_payload, sha_hash) is False

def test_blockchain_anchor_fallback():
    result_id = "test-result-xyz"
    dummy_hash = "a" * 64
    anchor = blockchain_service.anchor_hash(result_id, dummy_hash)

    assert "transaction_hash" in anchor
    assert anchor["transaction_hash"].startswith("0x")
    assert "status" in anchor
    assert anchor["status"] in ["ANCHORED_ON_CHAIN", "LOCAL_PROOF_ANCHORED"]


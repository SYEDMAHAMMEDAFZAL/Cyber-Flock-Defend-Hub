import pytest
from app.security.jwt import get_password_hash, verify_password, create_access_token, decode_token

def test_password_hashing():
    password = "SuperSecretPassword123!"
    hashed = get_password_hash(password)
    assert hashed != password
    assert verify_password(password, hashed) is True
    assert verify_password("WrongPassword!", hashed) is False

def test_jwt_token_generation_and_decoding():
    payload = {"sub": "user-123", "email": "ciso@cyberflock.defense", "role": "CISO"}
    token = create_access_token(payload)
    assert isinstance(token, str)
    assert len(token) > 20

    decoded = decode_token(token)
    assert decoded is not None
    assert decoded["sub"] == "user-123"
    assert decoded["email"] == "ciso@cyberflock.defense"
    assert decoded["role"] == "CISO"

def test_invalid_jwt_token():
    assert decode_token("invalid.token.payload") is None

def test_user_registration_with_lowercase_roles_and_aliases():
    from fastapi.testclient import TestClient
    from app.main import app
    import uuid

    client = TestClient(app)
    unique_suffix = str(uuid.uuid4())[:8]

    # Test registering an 'analyst' with 'full_name'
    analyst_payload = {
        "email": f"analyst_{unique_suffix}@defense-firm.com",
        "password": "SecurePassword123!",
        "full_name": "Jordan Hayes",
        "role": "analyst",
        "organization_name": f"Sentinel Corp {unique_suffix}"
    }
    res1 = client.post("/api/auth/register", json=analyst_payload)
    assert res1.status_code == 201, res1.text
    data1 = res1.json()
    assert "access_token" in data1
    assert data1["user"]["role"] == "SECURITY_ANALYST"
    assert data1["user"]["email"] == f"analyst_{unique_suffix}@defense-firm.com"

    # Test registering an 'executive' with 'name' alias instead of full_name
    exec_payload = {
        "email": f"exec_{unique_suffix}@defense-firm.com",
        "password": "SecurePassword123!",
        "name": "Sarah Connor",
        "role": "executive",
        "organization_name": f"Cyber Defense Ltd {unique_suffix}"
    }
    res2 = client.post("/api/auth/register", json=exec_payload)
    assert res2.status_code == 201, res2.text
    data2 = res2.json()
    assert "access_token" in data2
    assert data2["user"]["role"] == "CISO"
    assert data2["user"]["full_name"] == "Sarah Connor"



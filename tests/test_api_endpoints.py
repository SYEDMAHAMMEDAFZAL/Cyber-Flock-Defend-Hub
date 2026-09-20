import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_root_endpoint():
    response = client.get("/")
    assert response.status_code == 200
    data = response.json()
    assert data["platform"] == "CYBER FLOCK DEFENSE HUB"
    assert data["status"] == "OPERATIONAL"

def test_health_endpoint():
    response = client.get("/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "HEALTHY"
    assert "services" in data

def test_public_demo_request():
    payload = {
        "name": "Jane Doe",
        "official_email": "jane.doe@enterprise-cyber.com",
        "organization": "Global Enterprise Security Ltd",
        "job_role": "Chief Information Security Officer",
        "organization_size": "5000+",
        "industry": "BFSI",
        "number_of_endpoints": 3500,
        "requirements_message": "Interested in evaluating Monte Carlo cyber loss and blockchain anchoring."
    }
    response = client.post("/api/demo/request", json=payload)
    assert response.status_code == 201
    data = response.json()
    assert data["official_email"] == "jane.doe@enterprise-cyber.com"
    assert data["status"] == "PENDING"
    assert "id" in data

def test_admin_login():
    login_data = {
        "email": "admin@cyberflock.defense",
        "password": "AdminSecurePassword123!"
    }
    response = client.post("/api/auth/login", json=login_data)
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert data["token_type"] == "bearer"
    assert data["user"]["email"] == "admin@cyberflock.defense"

def test_authenticated_asset_and_risk_endpoints():
    # Login to acquire token
    login_res = client.post("/api/auth/login", json={
        "email": "admin@cyberflock.defense",
        "password": "AdminSecurePassword123!"
    })
    token = login_res.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    # Test /api/assets/metrics
    metrics_res = client.get("/api/assets/metrics", headers=headers)
    assert metrics_res.status_code == 200
    assert metrics_res.json()["total_assets"] > 0

    # Test /api/risk/overview
    risk_res = client.get("/api/risk/overview", headers=headers)
    assert risk_res.status_code == 200
    assert "risk_score" in risk_res.json()
    assert "annualized_loss_expectancy" in risk_res.json()

    # Test /api/market/benchmarks
    bench_res = client.get("/api/market/benchmarks")
    assert bench_res.status_code == 200
    assert len(bench_res.json()) >= 5

def test_simulation_incident_and_cross_tenant_flow():
    # Login as Super Admin
    login_res = client.post("/api/auth/login", json={
        "email": "admin@cyberflock.defense",
        "password": "AdminSecurePassword123!"
    })
    token = login_res.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    # Fetch organizations
    orgs_res = client.get("/api/organizations/", headers=headers)
    assert orgs_res.status_code == 200
    orgs = orgs_res.json()
    assert len(orgs) >= 2

    target_org = orgs[1]
    target_org_id = target_org["id"]

    # Execute simulation specifically targeting target_org_id
    sim_payload = {
        "organization_id": target_org_id,
        "name": f"Adversary Breach Vector on {target_org['name']}",
        "cve_id": "CVE-2024-3094",
        "threat_actor": "Ransomware Cartel (e.g. LockBit 3.0)",
        "active_controls": ["EDR", "MFA"],
        "iterations": 5000
    }
    exec_res = client.post("/api/simulations/execute", json=sim_payload, headers=headers)
    assert exec_res.status_code == 200
    sim_data = exec_res.json()
    assert sim_data["simulation"]["organization_id"] == target_org_id
    assert sim_data["simulation"]["threat_actor"] == "Ransomware Cartel (e.g. LockBit 3.0)"
    sim_id = sim_data["simulation"]["id"]

    # Now verify that when target_org accesses latest-incident, it receives this alert!
    tenant_headers = {
        "Authorization": f"Bearer {token}",
        "X-Organization-ID": target_org_id
    }
    incident_res = client.get("/api/simulations/latest-incident", headers=tenant_headers)
    assert incident_res.status_code == 200
    incident = incident_res.json()["incident"]
    assert incident is not None
    assert incident["id"] == sim_id
    assert incident["organization_id"] == target_org_id
    assert incident["is_acknowledged"] is False
    assert incident["threat_actor"] == "Ransomware Cartel (e.g. LockBit 3.0)"
    assert incident["cve_id"] == "CVE-2024-3094"

    # Acknowledge incident
    ack_res = client.post(f"/api/simulations/acknowledge-incident/{sim_id}", headers=tenant_headers)
    assert ack_res.status_code == 200
    assert ack_res.json()["status"] == "success"

    # Verify acknowledged status
    post_ack_res = client.get("/api/simulations/latest-incident", headers=tenant_headers)
    assert post_ack_res.json()["incident"]["is_acknowledged"] is True



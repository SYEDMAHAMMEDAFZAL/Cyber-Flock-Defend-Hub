import time
import uuid
import hashlib
from fastapi import APIRouter
from pydantic import BaseModel

router = APIRouter()

# In-memory store to simulate the Hyperledger Fabric World State for UI demo purposes
mock_fabric_state = {
    "blockHeight": 421890,
    "latestBlockHash": "6b25623fe222150a785caf8869005156f3c4575a8845a5f3a7523450147b54ef",
    "previousBlockHash": "f1883594cd2f33fcd98910ebef8b6a32332db8c0e6fc85ab607ef3a341b52a41",
    "transactions": [
        {
            "id": "RISK-001",
            "endpointId": "EP-SIM-492",
            "riskScore": 8.5,
            "expectedLoss": 450000,
            "ale": 1200000,
            "var": 950000,
            "sha256Hash": "a94a8fe5ccb19ba61c4c0873d391e987982fbbd3",
            "timestamp": (time.time() - 3600) * 1000,
            "verification": "Org1MSP & Org2MSP Endorsed"
        },
        {
            "id": "RISK-002",
            "endpointId": "EP-SIM-128",
            "riskScore": 6.2,
            "expectedLoss": 150000,
            "ale": 400000,
            "var": 250000,
            "sha256Hash": "b3f0c7f6bf7e68cf1889ab865778841a1a72d3bb",
            "timestamp": (time.time() - 7200) * 1000,
            "verification": "Org1MSP & Org2MSP Endorsed"
        }
    ]
}

class RiskInput(BaseModel):
    id: str
    endpointId: str
    riskScore: float
    expectedLoss: float
    ale: float
    var: float

@router.get("/status")
def get_blockchain_status():
    return {
        "success": True,
        "network": "Hyperledger Fabric 2.5",
        "channel": "mychannel",
        "chaincode": "cyberrisk",
        "blockHeight": mock_fabric_state["blockHeight"],
        "latestBlockHash": mock_fabric_state["latestBlockHash"],
        "previousBlockHash": mock_fabric_state["previousBlockHash"]
    }

@router.get("/risks")
def get_all_risks():
    return {
        "success": True,
        "data": mock_fabric_state["transactions"]
    }

@router.post("/risk")
def submit_risk(risk: RiskInput):
    # Simulate a new block being minted on Fabric
    mock_fabric_state["blockHeight"] += 1
    mock_fabric_state["previousBlockHash"] = mock_fabric_state["latestBlockHash"]
    
    # Generate a fake block hash
    new_hash = hashlib.sha256(str(time.time()).encode()).hexdigest()
    mock_fabric_state["latestBlockHash"] = new_hash
    
    new_tx = {
        "id": risk.id,
        "endpointId": risk.endpointId,
        "riskScore": risk.riskScore,
        "expectedLoss": risk.expectedLoss,
        "ale": risk.ale,
        "var": risk.var,
        "sha256Hash": hashlib.sha256(f"{risk.id}{risk.riskScore}".encode()).hexdigest(),
        "timestamp": time.time() * 1000,
        "verification": "Org1MSP & Org2MSP Endorsed"
    }
    mock_fabric_state["transactions"].insert(0, new_tx)
    
    return {
        "success": True, 
        "message": "Committed to Fabric",
        "sha256Hash": new_tx["sha256Hash"]
    }

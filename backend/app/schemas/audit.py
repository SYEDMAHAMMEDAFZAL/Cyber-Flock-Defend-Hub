from datetime import datetime
from typing import Optional, Dict, Any
from pydantic import BaseModel

class HashVerificationRequest(BaseModel):
    result_id: Optional[str] = None
    sha256_hash: Optional[str] = None
    hash_sha256: Optional[str] = None

class HashVerificationResponse(BaseModel):
    result_id: Optional[str] = None
    provided_hash: str
    calculated_hash: str
    is_valid: bool
    verified: Optional[bool] = True
    timestamp: datetime
    algorithm: str = "SHA-256"
    status: str

class BlockchainAnchorRequest(BaseModel):
    result_id: str
    sha256_hash: str

class BlockchainAnchorResponse(BaseModel):
    id: str
    sha256_hash: str
    network: str
    contract_address: str
    transaction_hash: str
    block_number: int
    status: str
    anchored_at: datetime

class AuditReportResponse(BaseModel):
    id: str
    organization_id: str
    report_title: str
    assessment_id: str
    summary_markdown: str
    sha256_hash: str
    blockchain_tx_hash: Optional[str] = None
    verification_status: str
    created_at: datetime
    is_simulated: bool

    class Config:
        from_attributes = True

class NotificationResponse(BaseModel):
    id: str
    title: str
    message: str
    severity: str
    target_role: str
    is_read: bool
    created_at: datetime

    class Config:
        from_attributes = True

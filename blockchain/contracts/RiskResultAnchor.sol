// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/**
 * @title RiskResultAnchor
 * @dev Anchors canonical SHA-256 cybersecurity risk and incident assessment hashes
 * onto EVM-compatible blockchains for tamper-evident auditability.
 * Part of CYBER FLOCK DEFENSE HUB.
 */
contract RiskResultAnchor {
    struct AnchorRecord {
        bytes32 hash;
        uint256 timestamp;
        address submitter;
        string resultId;
        string organizationId;
        string metadataUri;
    }

    // Mapping from hash to AnchorRecord
    mapping(bytes32 => AnchorRecord) private _records;
    
    // Mapping from resultId to hash
    mapping(string => bytes32) private _resultIdToHash;

    // Array of all anchored hashes
    bytes32[] private _allHashes;

    // Event emitted when a risk hash is anchored
    event RiskHashAnchored(
        bytes32 indexed hash,
        address indexed submitter,
        string indexed resultId,
        string organizationId,
        uint256 timestamp
    );

    /**
     * @notice Anchor a SHA-256 risk quantification or incident simulation hash.
     * @param hash The 32-byte SHA-256 hash of the canonical result JSON.
     * @param resultId Unique identifier of the risk assessment / simulation.
     * @param organizationId Unique identifier of the tenant organization.
     * @param metadataUri Optional URI or reference string for extended audit context.
     */
    function anchorHash(
        bytes32 hash,
        string calldata resultId,
        string calldata organizationId,
        string calldata metadataUri
    ) external returns (bool) {
        require(hash != bytes32(0), "Anchor: hash cannot be zero");
        require(bytes(resultId).length > 0, "Anchor: resultId required");
        require(_records[hash].timestamp == 0, "Anchor: hash already anchored");

        AnchorRecord memory record = AnchorRecord({
            hash: hash,
            timestamp: block.timestamp,
            submitter: msg.sender,
            resultId: resultId,
            organizationId: organizationId,
            metadataUri: metadataUri
        });

        _records[hash] = record;
        _resultIdToHash[resultId] = hash;
        _allHashes.push(hash);

        emit RiskHashAnchored(hash, msg.sender, resultId, organizationId, block.timestamp);
        return true;
    }

    /**
     * @notice Verify whether a hash exists and retrieve its anchoring record.
     * @param hash The 32-byte SHA-256 hash to verify.
     */
    function verifyHash(bytes32 hash)
        external
        view
        returns (
            bool isAnchored,
            uint256 timestamp,
            address submitter,
            string memory resultId,
            string memory organizationId,
            string memory metadataUri
        )
    {
        AnchorRecord memory rec = _records[hash];
        if (rec.timestamp == 0) {
            return (false, 0, address(0), "", "", "");
        }
        return (
            true,
            rec.timestamp,
            rec.submitter,
            rec.resultId,
            rec.organizationId,
            rec.metadataUri
        );
    }

    /**
     * @notice Retrieve the hash associated with a given result ID.
     */
    function getHashByResultId(string calldata resultId) external view returns (bytes32) {
        return _resultIdToHash[resultId];
    }

    /**
     * @notice Returns total number of anchored risk records.
     */
    function totalAnchoredRecords() external view returns (uint256) {
        return _allHashes.length;
    }

    /**
     * @notice Returns hash at specific index for enumeration.
     */
    function getHashAtIndex(uint256 index) external view returns (bytes32) {
        require(index < _allHashes.length, "Index out of bounds");
        return _allHashes[index];
    }
}

// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title MoSPICredentialRegistry
 * @notice Anchors SHA-256 hashes of MoSPI/NSSTA verifiable credentials onto Polygon Amoy.
 *         Only the contract owner (issuer backend wallet) can record credentials.
 *         Anyone can verify a credential hash on-chain.
 */
contract MoSPICredentialRegistry is Ownable {
    // credentialHash => block timestamp when it was anchored
    mapping(bytes32 => uint256) public credentialTimestamps;
    // credentialHash => issuer address at time of anchoring
    mapping(bytes32 => address) public credentialIssuers;

    event CredentialAnchored(
        bytes32 indexed credentialHash,
        address indexed issuer,
        uint256 timestamp
    );

    constructor() Ownable(msg.sender) {}

    /**
     * @notice Record a new credential hash on-chain.
     * @param credentialHash SHA-256 hash of the credential JSON payload (bytes32).
     */
    function recordCredential(bytes32 credentialHash) external onlyOwner {
        require(credentialTimestamps[credentialHash] == 0, "Credential already anchored");
        credentialTimestamps[credentialHash] = block.timestamp;
        credentialIssuers[credentialHash] = msg.sender;
        emit CredentialAnchored(credentialHash, msg.sender, block.timestamp);
    }

    /**
     * @notice Verify whether a credential hash is anchored on-chain.
     * @param credentialHash The bytes32 hash to verify.
     * @return isValid true if anchored, false otherwise.
     * @return anchoredAt UNIX timestamp when it was anchored (0 if not found).
     * @return issuer Address that issued the credential (zero address if not found).
     */
    function verifyCredential(bytes32 credentialHash)
        external
        view
        returns (bool isValid, uint256 anchoredAt, address issuer)
    {
        anchoredAt = credentialTimestamps[credentialHash];
        issuer = credentialIssuers[credentialHash];
        isValid = anchoredAt != 0;
    }
}

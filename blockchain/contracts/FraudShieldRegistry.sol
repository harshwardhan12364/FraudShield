// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/**
 * @title FraudShieldRegistry
 * @notice Immutable registry for fraud-report evidence hashes.
 *         Stores only: report reference (string), evidence hash (bytes32), and timestamp.
 *         NO personal data, names, UPI IDs, phone numbers, or financial details on-chain.
 *
 * @dev Roles:
 *   - DEFAULT_ADMIN_ROLE: can grant/revoke REGISTRAR_ROLE and REVIEWER_ROLE
 *   - REGISTRAR_ROLE: can register report hashes (backend signer)
 *   - REVIEWER_ROLE: can record status transition hashes (analyst/admin)
 *
 * Environment: LOCAL_DEVELOPMENT (Hardhat) unless explicitly redeployed to MST Testnet.
 */
contract FraudShieldRegistry is AccessControl, ReentrancyGuard {

    bytes32 public constant REGISTRAR_ROLE = keccak256("REGISTRAR_ROLE");
    bytes32 public constant REVIEWER_ROLE  = keccak256("REVIEWER_ROLE");

    struct ReportRecord {
        bytes32 evidenceHash;   // SHA-256 of evidence package, as bytes32
        uint256 timestamp;      // Unix timestamp of registration
        address registrar;      // Address that submitted the transaction
        bool    exists;
    }

    struct StatusTransition {
        bytes32 transitionHash; // Hash of (reportRef + newStatus + reviewerNote + timestamp)
        uint256 timestamp;
        address reviewer;
        string  statusLabel;    // e.g. "substantiated" — NOT a legal determination
    }

    // reportRef => ReportRecord
    mapping(string => ReportRecord) private _records;

    // reportRef => ordered list of status transitions
    mapping(string => StatusTransition[]) private _transitions;

    // ── Events ────────────────────────────────────────────────────────────

    event ReportRegistered(
        string  indexed reportRef,
        bytes32         evidenceHash,
        uint256         timestamp,
        address         registrar
    );

    event StatusTransitionRecorded(
        string  indexed reportRef,
        bytes32         transitionHash,
        string          statusLabel,
        uint256         timestamp,
        address         reviewer
    );

    // ── Errors ────────────────────────────────────────────────────────────

    error AlreadyRegistered(string reportRef);
    error NotRegistered(string reportRef);
    error EmptyReportRef();
    error ZeroHash();

    // ── Constructor ───────────────────────────────────────────────────────

    constructor(address admin) {
        _grantRole(DEFAULT_ADMIN_ROLE, admin);
        _grantRole(REGISTRAR_ROLE, admin);
        _grantRole(REVIEWER_ROLE, admin);
    }

    // ── External functions ────────────────────────────────────────────────

    /**
     * @notice Register a fraud report reference with its evidence hash.
     *         Can only be called by an address with REGISTRAR_ROLE.
     * @param reportRef  External report ID (e.g. "FS-A1B2C3D4"). NOT a person's identity.
     * @param evidenceHash  SHA-256 hash of the evidence package, encoded as bytes32.
     */
    function registerReport(
        string calldata reportRef,
        bytes32 evidenceHash
    ) external nonReentrant onlyRole(REGISTRAR_ROLE) {
        if (bytes(reportRef).length == 0) revert EmptyReportRef();
        if (evidenceHash == bytes32(0)) revert ZeroHash();
        if (_records[reportRef].exists) revert AlreadyRegistered(reportRef);

        _records[reportRef] = ReportRecord({
            evidenceHash: evidenceHash,
            timestamp:    block.timestamp,
            registrar:    msg.sender,
            exists:       true
        });

        emit ReportRegistered(reportRef, evidenceHash, block.timestamp, msg.sender);
    }

    /**
     * @notice Record an authorized status transition hash.
     *         The hash encodes the transition event; actual text is off-chain.
     * @param reportRef      Report reference that must already be registered.
     * @param transitionHash Hash of the transition event data.
     * @param statusLabel    Human-readable status label for event indexing.
     */
    function recordStatusTransition(
        string calldata reportRef,
        bytes32 transitionHash,
        string  calldata statusLabel
    ) external nonReentrant onlyRole(REVIEWER_ROLE) {
        if (!_records[reportRef].exists) revert NotRegistered(reportRef);
        if (transitionHash == bytes32(0)) revert ZeroHash();

        _transitions[reportRef].push(StatusTransition({
            transitionHash: transitionHash,
            timestamp:      block.timestamp,
            reviewer:       msg.sender,
            statusLabel:    statusLabel
        }));

        emit StatusTransitionRecorded(reportRef, transitionHash, statusLabel, block.timestamp, msg.sender);
    }

    /**
     * @notice Retrieve the registered evidence hash and metadata for a report.
     * @param reportRef  Report reference string.
     * @return evidenceHash, timestamp, registrar address.
     */
    function getRecord(string calldata reportRef)
        external
        view
        returns (bytes32 evidenceHash, uint256 timestamp, address registrar)
    {
        ReportRecord storage rec = _records[reportRef];
        if (!rec.exists) revert NotRegistered(reportRef);
        return (rec.evidenceHash, rec.timestamp, rec.registrar);
    }

    /**
     * @notice Verify whether a supplied hash matches the registered hash.
     * @param reportRef      Report reference.
     * @param candidateHash  Hash to compare against the stored value.
     * @return match  True if hashes match exactly.
     */
    function verifyHash(string calldata reportRef, bytes32 candidateHash)
        external
        view
        returns (bool match_)
    {
        ReportRecord storage rec = _records[reportRef];
        if (!rec.exists) return false;
        return rec.evidenceHash == candidateHash;
    }

    /**
     * @notice Return all status transitions for a report.
     */
    function getTransitions(string calldata reportRef)
        external
        view
        returns (StatusTransition[] memory)
    {
        return _transitions[reportRef];
    }

    /**
     * @notice Check whether a report reference is already registered.
     */
    function isRegistered(string calldata reportRef) external view returns (bool) {
        return _records[reportRef].exists;
    }
}

// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title AuditTrailContract
 * @dev Immutable audit logging for all platform activities
 * @notice Compliant with NIST SP 800-53 audit requirements
 */
contract AuditTrailContract {
    
    enum ActionType {
        INSTITUTION_REGISTERED,
        DATA_UPLOADED,
        ACCESS_GRANTED,
        ACCESS_REVOKED,
        VERIFICATION_REQUESTED,
        VERIFICATION_COMPLETED,
        DATA_ACCESSED,
        DATA_DOWNLOADED,
        PERMISSION_UPDATED,
        RECORD_DEACTIVATED,
        RECORD_REACTIVATED
    }
    
    struct AuditLog {
        uint256 logId;
        ActionType actionType;
        address actor; // Who performed the action
        address targetAddress; // Target of the action (if applicable)
        string recordId; // Related record ID (if applicable)
        string actionDetails; // JSON or description of action
        bytes32 dataHash; // Hash of related data (if applicable)
        bool success;
        uint256 timestamp;
        string ipAddress; // Off-chain IP (stored as string)
        string userAgent; // Off-chain user agent
    }
    
    // Array of all audit logs
    AuditLog[] public auditLogs;
    
    // Mapping: actor address => array of log IDs
    mapping(address => uint256[]) public actorLogs;
    
    // Mapping: recordId => array of log IDs
    mapping(string => uint256[]) public recordLogs;
    
    // Mapping: action type => array of log IDs
    mapping(ActionType => uint256[]) public actionTypeLogs;
    
    // Counter for log IDs
    uint256 public logCounter;
    
    // Events
    event AuditLogCreated(
        uint256 indexed logId,
        ActionType indexed actionType,
        address indexed actor,
        string recordId,
        bool success,
        uint256 timestamp
    );
    
    event InstitutionRegisteredLog(
        address indexed wallet,
        string name,
        uint256 timestamp
    );
    
    event DataUploadedLog(
        address indexed owner,
        bytes32 indexed hash,
        string recordId,
        uint256 timestamp
    );
    
    event AccessGrantedLog(
        address indexed owner,
        address indexed grantee,
        string recordId,
        uint256 timestamp
    );
    
    event AccessRevokedLog(
        address indexed owner,
        address indexed grantee,
        string recordId,
        uint256 timestamp
    );
    
    event VerificationRequestedLog(
        address indexed verifier,
        bytes32 indexed hash,
        string recordId,
        uint256 timestamp
    );
    
    event VerificationCompletedLog(
        address indexed verifier,
        bytes32 indexed hash,
        string recordId,
        bool success,
        uint256 timestamp
    );
    
    event DataAccessedLog(
        address indexed accessor,
        string recordId,
        uint256 timestamp
    );
    
    /**
     * @dev Create a general audit log entry
     * @param _actionType Type of action performed
     * @param _targetAddress Target address (if applicable)
     * @param _recordId Related record ID (if applicable)
     * @param _actionDetails Details of the action
     * @param _dataHash Related data hash (if applicable)
     * @param _success Whether the action was successful
     * @param _ipAddress IP address of the actor
     * @param _userAgent User agent string
     */
    function createLog(
        ActionType _actionType,
        address _targetAddress,
        string memory _recordId,
        string memory _actionDetails,
        bytes32 _dataHash,
        bool _success,
        string memory _ipAddress,
        string memory _userAgent
    ) public returns (uint256) {
        uint256 newLogId = logCounter++;
        
        AuditLog memory newLog = AuditLog({
            logId: newLogId,
            actionType: _actionType,
            actor: msg.sender,
            targetAddress: _targetAddress,
            recordId: _recordId,
            actionDetails: _actionDetails,
            dataHash: _dataHash,
            success: _success,
            timestamp: block.timestamp,
            ipAddress: _ipAddress,
            userAgent: _userAgent
        });
        
        auditLogs.push(newLog);
        actorLogs[msg.sender].push(newLogId);
        
        if (bytes(_recordId).length > 0) {
            recordLogs[_recordId].push(newLogId);
        }
        
        actionTypeLogs[_actionType].push(newLogId);
        
        emit AuditLogCreated(newLogId, _actionType, msg.sender, _recordId, _success, block.timestamp);
        
        return newLogId;
    }
    
    /**
     * @dev Log institution registration
     * @param _wallet Institution wallet address
     * @param _name Institution name
     */
    function logInstitutionRegistration(
        address _wallet,
        string memory _name
    ) external {
        createLog(
            ActionType.INSTITUTION_REGISTERED,
            _wallet,
            "",
            string(abi.encodePacked("Institution registered: ", _name)),
            bytes32(0),
            true,
            "",
            ""
        );
        
        emit InstitutionRegisteredLog(_wallet, _name, block.timestamp);
    }
    
    /**
     * @dev Log data upload
     * @param _owner Owner address
     * @param _recordId Record ID
     * @param _dataHash Data hash
     * @param _fileName File name
     */
    function logDataUpload(
        address _owner,
        string memory _recordId,
        bytes32 _dataHash,
        string memory _fileName
    ) external {
        createLog(
            ActionType.DATA_UPLOADED,
            address(0),
            _recordId,
            string(abi.encodePacked("Data uploaded: ", _fileName)),
            _dataHash,
            true,
            "",
            ""
        );
        
        emit DataUploadedLog(_owner, _dataHash, _recordId, block.timestamp);
    }
    
    /**
     * @dev Log access granted
     * @param _owner Data owner
     * @param _grantee Access grantee
     * @param _recordId Record ID
     */
    function logAccessGranted(
        address _owner,
        address _grantee,
        string memory _recordId
    ) external {
        createLog(
            ActionType.ACCESS_GRANTED,
            _grantee,
            _recordId,
            "Access granted",
            bytes32(0),
            true,
            "",
            ""
        );
        
        emit AccessGrantedLog(_owner, _grantee, _recordId, block.timestamp);
    }
    
    /**
     * @dev Log access revoked
     * @param _owner Data owner
     * @param _grantee Access grantee
     * @param _recordId Record ID
     */
    function logAccessRevoked(
        address _owner,
        address _grantee,
        string memory _recordId
    ) external {
        createLog(
            ActionType.ACCESS_REVOKED,
            _grantee,
            _recordId,
            "Access revoked",
            bytes32(0),
            true,
            "",
            ""
        );
        
        emit AccessRevokedLog(_owner, _grantee, _recordId, block.timestamp);
    }
    
    /**
     * @dev Log verification request
     * @param _verifier Verifier address
     * @param _recordId Record ID
     * @param _dataHash Data hash being verified
     */
    function logVerificationRequest(
        address _verifier,
        string memory _recordId,
        bytes32 _dataHash
    ) external {
        createLog(
            ActionType.VERIFICATION_REQUESTED,
            address(0),
            _recordId,
            "Verification requested",
            _dataHash,
            true,
            "",
            ""
        );
        
        emit VerificationRequestedLog(_verifier, _dataHash, _recordId, block.timestamp);
    }
    
    /**
     * @dev Log verification completion
     * @param _verifier Verifier address
     * @param _recordId Record ID
     * @param _dataHash Data hash verified
     * @param _success Verification result
     */
    function logVerificationCompletion(
        address _verifier,
        string memory _recordId,
        bytes32 _dataHash,
        bool _success
    ) external {
        createLog(
            ActionType.VERIFICATION_COMPLETED,
            address(0),
            _recordId,
            _success ? "Verification successful" : "Verification failed",
            _dataHash,
            _success,
            "",
            ""
        );
        
        emit VerificationCompletedLog(_verifier, _dataHash, _recordId, _success, block.timestamp);
    }
    
    /**
     * @dev Log data access
     * @param _accessor Accessor address
     * @param _recordId Record ID
     */
    function logDataAccess(
        address _accessor,
        string memory _recordId
    ) external {
        createLog(
            ActionType.DATA_ACCESSED,
            address(0),
            _recordId,
            "Data accessed",
            bytes32(0),
            true,
            "",
            ""
        );
        
        emit DataAccessedLog(_accessor, _recordId, block.timestamp);
    }
    
    /**
     * @dev Get audit log by ID
     * @param _logId Log ID
     */
    function getLog(uint256 _logId) external view returns (
        uint256 logId,
        ActionType actionType,
        address actor,
        address targetAddress,
        string memory recordId,
        string memory actionDetails,
        bytes32 dataHash,
        bool success,
        uint256 timestamp,
        string memory ipAddress,
        string memory userAgent
    ) {
        require(_logId < auditLogs.length, "Log does not exist");
        AuditLog memory log = auditLogs[_logId];
        return (
            log.logId,
            log.actionType,
            log.actor,
            log.targetAddress,
            log.recordId,
            log.actionDetails,
            log.dataHash,
            log.success,
            log.timestamp,
            log.ipAddress,
            log.userAgent
        );
    }
    
    /**
     * @dev Get all logs for an actor
     * @param _actor Actor address
     */
    function getLogsByActor(address _actor) external view returns (uint256[] memory) {
        return actorLogs[_actor];
    }
    
    /**
     * @dev Get all logs for a record
     * @param _recordId Record ID
     */
    function getLogsByRecord(string memory _recordId) external view returns (uint256[] memory) {
        return recordLogs[_recordId];
    }
    
    /**
     * @dev Get all logs by action type
     * @param _actionType Action type
     */
    function getLogsByActionType(ActionType _actionType) external view returns (uint256[] memory) {
        return actionTypeLogs[_actionType];
    }
    
    /**
     * @dev Get total number of logs
     */
    function getTotalLogs() external view returns (uint256) {
        return auditLogs.length;
    }
    
    /**
     * @dev Get recent logs (last N logs)
     * @param _count Number of recent logs to retrieve
     */
    function getRecentLogs(uint256 _count) external view returns (uint256[] memory) {
        uint256 totalLogs = auditLogs.length;
        uint256 actualCount = _count > totalLogs ? totalLogs : _count;
        
        uint256[] memory recentLogIds = new uint256[](actualCount);
        
        for (uint256 i = 0; i < actualCount; i++) {
            recentLogIds[i] = totalLogs - actualCount + i;
        }
        
        return recentLogIds;
    }
}


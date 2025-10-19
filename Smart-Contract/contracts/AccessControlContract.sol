// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title AccessControlContract
 * @dev Manages access permissions for data records
 * @notice Implements whitelist-based access control with time-bound permissions
 */
contract AccessControlContract {
    
    struct AccessPermission {
        string recordId;
        address owner;
        address grantee;
        uint256 grantedAt;
        uint256 expiresAt; // 0 means no expiration
        bool isActive;
        string permissionType; // e.g., "read", "verify", "full"
        string grantReason;
    }
    
    // Mapping: recordId => grantee => AccessPermission
    mapping(string => mapping(address => AccessPermission)) public permissions;
    
    // Mapping: recordId => array of addresses with access
    mapping(string => address[]) public recordGrantees;
    
    // Mapping: grantee => array of recordIds they have access to
    mapping(address => string[]) public granteeRecords;
    
    // Mapping to check if grantee has active access to recordId
    mapping(string => mapping(address => bool)) public hasAccess;
    
    // Reference to DataVaultContract
    address public dataVaultContract;
    
    // Reference to InstitutionRegistry
    address public institutionRegistry;
    
    // Events
    event AccessGranted(
        string indexed recordId,
        address indexed owner,
        address indexed grantee,
        string permissionType,
        uint256 expiresAt,
        uint256 timestamp
    );
    
    event AccessRevoked(
        string indexed recordId,
        address indexed owner,
        address indexed grantee,
        uint256 timestamp
    );
    
    event AccessExpired(
        string indexed recordId,
        address indexed grantee,
        uint256 timestamp
    );
    
    event PermissionUpdated(
        string indexed recordId,
        address indexed owner,
        address indexed grantee,
        uint256 timestamp
    );
    
    // Modifiers
    modifier onlyRegisteredInstitution() {
        (bool success, bytes memory data) = institutionRegistry.staticcall(
            abi.encodeWithSignature("verifyInstitution(address)", msg.sender)
        );
        require(success && abi.decode(data, (bool)), "Not a registered institution");
        _;
    }
    
    modifier onlyRecordOwner(string memory _recordId) {
        (bool success, bytes memory data) = dataVaultContract.staticcall(
            abi.encodeWithSignature("recordExists(string)", _recordId)
        );
        require(success && abi.decode(data, (bool)), "Record does not exist");
        
        // Get record owner
        (bool ownerSuccess, bytes memory ownerData) = dataVaultContract.staticcall(
            abi.encodeWithSignature("getDataRecord(string)", _recordId)
        );
        require(ownerSuccess, "Failed to get record");
        
        // Decode to get owner (3rd field in the tuple)
        (, , address owner, , , , , , , , , ) = abi.decode(
            ownerData,
            (string, bytes32, address, string, string, uint256, string, string, uint256, bool, string, string)
        );
        
        require(owner == msg.sender, "Not the record owner");
        _;
    }
    
    constructor(address _dataVaultContract, address _institutionRegistry) {
        require(_dataVaultContract != address(0), "Invalid vault address");
        require(_institutionRegistry != address(0), "Invalid registry address");
        dataVaultContract = _dataVaultContract;
        institutionRegistry = _institutionRegistry;
    }
    
    /**
     * @dev Grant access to a data record
     * @param _recordId Record to grant access to
     * @param _grantee Address to grant access
     * @param _expiresAt Expiration timestamp (0 for no expiration)
     * @param _permissionType Type of permission
     * @param _grantReason Reason for granting access
     */
    function grantAccess(
        string memory _recordId,
        address _grantee,
        uint256 _expiresAt,
        string memory _permissionType,
        string memory _grantReason
    ) external onlyRegisteredInstitution onlyRecordOwner(_recordId) {
        require(_grantee != address(0), "Invalid grantee address");
        require(_grantee != msg.sender, "Cannot grant access to self");
        require(_expiresAt == 0 || _expiresAt > block.timestamp, "Invalid expiration time");
        
        // Verify grantee is a registered institution
        (bool success, bytes memory data) = institutionRegistry.staticcall(
            abi.encodeWithSignature("verifyInstitution(address)", _grantee)
        );
        require(success && abi.decode(data, (bool)), "Grantee is not a registered institution");
        
        // If already has access, update instead
        if (hasAccess[_recordId][_grantee]) {
            _updatePermission(_recordId, _grantee, _expiresAt, _permissionType);
            return;
        }
        
        AccessPermission memory newPermission = AccessPermission({
            recordId: _recordId,
            owner: msg.sender,
            grantee: _grantee,
            grantedAt: block.timestamp,
            expiresAt: _expiresAt,
            isActive: true,
            permissionType: _permissionType,
            grantReason: _grantReason
        });
        
        permissions[_recordId][_grantee] = newPermission;
        hasAccess[_recordId][_grantee] = true;
        recordGrantees[_recordId].push(_grantee);
        granteeRecords[_grantee].push(_recordId);
        
        emit AccessGranted(_recordId, msg.sender, _grantee, _permissionType, _expiresAt, block.timestamp);
    }
    
    /**
     * @dev Revoke access to a data record
     * @param _recordId Record to revoke access from
     * @param _grantee Address to revoke access
     */
    function revokeAccess(
        string memory _recordId,
        address _grantee
    ) external onlyRecordOwner(_recordId) {
        require(hasAccess[_recordId][_grantee], "No active access found");
        
        permissions[_recordId][_grantee].isActive = false;
        hasAccess[_recordId][_grantee] = false;
        
        emit AccessRevoked(_recordId, msg.sender, _grantee, block.timestamp);
    }
    
    /**
     * @dev Update existing permission
     * @param _recordId Record ID
     * @param _grantee Grantee address
     * @param _expiresAt New expiration time
     * @param _permissionType New permission type
     */
    function _updatePermission(
        string memory _recordId,
        address _grantee,
        uint256 _expiresAt,
        string memory _permissionType
    ) internal {
        permissions[_recordId][_grantee].expiresAt = _expiresAt;
        permissions[_recordId][_grantee].permissionType = _permissionType;
        
        emit PermissionUpdated(_recordId, msg.sender, _grantee, block.timestamp);
    }
    
    /**
     * @dev Check if an address has valid access to a record
     * @param _recordId Record to check
     * @param _grantee Address to check
     */
    function checkAccess(
        string memory _recordId,
        address _grantee
    ) external view returns (bool) {
        if (!hasAccess[_recordId][_grantee]) {
            return false;
        }
        
        AccessPermission memory permission = permissions[_recordId][_grantee];
        
        if (!permission.isActive) {
            return false;
        }
        
        // Check expiration
        if (permission.expiresAt > 0 && block.timestamp > permission.expiresAt) {
            return false;
        }
        
        return true;
    }
    
    /**
     * @dev Get permission details
     * @param _recordId Record ID
     * @param _grantee Grantee address
     */
    function getPermission(
        string memory _recordId,
        address _grantee
    ) external view returns (
        string memory recordId,
        address owner,
        address grantee,
        uint256 grantedAt,
        uint256 expiresAt,
        bool isActive,
        string memory permissionType,
        string memory grantReason
    ) {
        AccessPermission memory permission = permissions[_recordId][_grantee];
        return (
            permission.recordId,
            permission.owner,
            permission.grantee,
            permission.grantedAt,
            permission.expiresAt,
            permission.isActive,
            permission.permissionType,
            permission.grantReason
        );
    }
    
    /**
     * @dev Get all addresses with access to a record
     * @param _recordId Record ID
     */
    function getRecordGrantees(string memory _recordId) external view returns (address[] memory) {
        return recordGrantees[_recordId];
    }
    
    /**
     * @dev Get all records accessible by an address
     * @param _grantee Grantee address
     */
    function getGranteeRecords(address _grantee) external view returns (string[] memory) {
        return granteeRecords[_grantee];
    }
    
    /**
     * @dev Check if access has expired and mark as inactive
     * @param _recordId Record ID
     * @param _grantee Grantee address
     */
    function expireAccess(
        string memory _recordId,
        address _grantee
    ) external {
        require(hasAccess[_recordId][_grantee], "No active access found");
        
        AccessPermission storage permission = permissions[_recordId][_grantee];
        require(permission.expiresAt > 0, "Permission has no expiration");
        require(block.timestamp > permission.expiresAt, "Permission not yet expired");
        
        permission.isActive = false;
        hasAccess[_recordId][_grantee] = false;
        
        emit AccessExpired(_recordId, _grantee, block.timestamp);
    }
}


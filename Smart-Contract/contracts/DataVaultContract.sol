// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title DataVaultContract
 * @dev Stores encrypted data hashes and metadata on-chain
 * @notice Implements SHA-256 hash verification and immutable record keeping
 */
contract DataVaultContract {
    
    struct DataRecord {
        string recordId; // Unique identifier
        bytes32 dataHash; // SHA-256 hash of the encrypted data
        address owner; // Institution that uploaded the data
        string fileName;
        string fileType;
        uint256 fileSize;
        string ipfsHash; // IPFS CID where encrypted file is stored
        string encryptionAlgorithm; // e.g., "AES-256-GCM"
        uint256 uploadedAt;
        bool isActive;
        string metadataURI; // Additional metadata
        string category; // e.g., "Medical", "Academic", "Financial"
    }
    
    // Mapping from recordId to DataRecord
    mapping(string => DataRecord) public dataRecords;
    
    // Mapping from owner address to their record IDs
    mapping(address => string[]) public ownerRecords;
    
    // Mapping to check if recordId exists
    mapping(string => bool) public recordExists;
    
    // Array of all record IDs
    string[] public allRecordIds;
    
    // Reference to InstitutionRegistry contract
    address public institutionRegistry;
    
    // Events
    event DataUploaded(
        string indexed recordId,
        address indexed owner,
        bytes32 dataHash,
        string ipfsHash,
        uint256 timestamp
    );
    
    event DataDeactivated(
        string indexed recordId,
        address indexed owner,
        uint256 timestamp
    );
    
    event DataReactivated(
        string indexed recordId,
        address indexed owner,
        uint256 timestamp
    );
    
    event DataMetadataUpdated(
        string indexed recordId,
        address indexed owner,
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
        require(recordExists[_recordId], "Record does not exist");
        require(dataRecords[_recordId].owner == msg.sender, "Not the record owner");
        _;
    }
    
    constructor(address _institutionRegistry) {
        require(_institutionRegistry != address(0), "Invalid registry address");
        institutionRegistry = _institutionRegistry;
    }
    
    /**
     * @dev Upload a new data record
     * @param _recordId Unique record identifier
     * @param _dataHash SHA-256 hash of encrypted data
     * @param _fileName Original file name
     * @param _fileType File MIME type
     * @param _fileSize File size in bytes
     * @param _ipfsHash IPFS CID
     * @param _encryptionAlgorithm Algorithm used
     * @param _category Data category
     * @param _metadataURI Additional metadata URI
     */
    function uploadData(
        string memory _recordId,
        bytes32 _dataHash,
        string memory _fileName,
        string memory _fileType,
        uint256 _fileSize,
        string memory _ipfsHash,
        string memory _encryptionAlgorithm,
        string memory _category,
        string memory _metadataURI
    ) external onlyRegisteredInstitution {
        require(!recordExists[_recordId], "Record ID already exists");
        require(_dataHash != bytes32(0), "Invalid data hash");
        require(bytes(_fileName).length > 0, "File name cannot be empty");
        require(bytes(_ipfsHash).length > 0, "IPFS hash cannot be empty");
        
        DataRecord memory newRecord = DataRecord({
            recordId: _recordId,
            dataHash: _dataHash,
            owner: msg.sender,
            fileName: _fileName,
            fileType: _fileType,
            fileSize: _fileSize,
            ipfsHash: _ipfsHash,
            encryptionAlgorithm: _encryptionAlgorithm,
            uploadedAt: block.timestamp,
            isActive: true,
            metadataURI: _metadataURI,
            category: _category
        });
        
        dataRecords[_recordId] = newRecord;
        recordExists[_recordId] = true;
        ownerRecords[msg.sender].push(_recordId);
        allRecordIds.push(_recordId);
        
        emit DataUploaded(_recordId, msg.sender, _dataHash, _ipfsHash, block.timestamp);
    }
    
    /**
     * @dev Verify data integrity by comparing hash
     * @param _recordId Record to verify
     * @param _providedHash Hash to compare against
     */
    function verifyData(
        string memory _recordId,
        bytes32 _providedHash
    ) external view returns (bool) {
        require(recordExists[_recordId], "Record does not exist");
        return dataRecords[_recordId].dataHash == _providedHash;
    }
    
    /**
     * @dev Deactivate a data record (soft delete)
     * @param _recordId Record to deactivate
     */
    function deactivateRecord(
        string memory _recordId
    ) external onlyRecordOwner(_recordId) {
        require(dataRecords[_recordId].isActive, "Record already deactivated");
        
        dataRecords[_recordId].isActive = false;
        
        emit DataDeactivated(_recordId, msg.sender, block.timestamp);
    }
    
    /**
     * @dev Reactivate a data record
     * @param _recordId Record to reactivate
     */
    function reactivateRecord(
        string memory _recordId
    ) external onlyRecordOwner(_recordId) {
        require(!dataRecords[_recordId].isActive, "Record already active");
        
        dataRecords[_recordId].isActive = true;
        
        emit DataReactivated(_recordId, msg.sender, block.timestamp);
    }
    
    /**
     * @dev Update record metadata
     * @param _recordId Record to update
     * @param _metadataURI New metadata URI
     */
    function updateMetadata(
        string memory _recordId,
        string memory _metadataURI
    ) external onlyRecordOwner(_recordId) {
        dataRecords[_recordId].metadataURI = _metadataURI;
        
        emit DataMetadataUpdated(_recordId, msg.sender, block.timestamp);
    }
    
    /**
     * @dev Get data record details
     * @param _recordId Record identifier
     */
    function getDataRecord(string memory _recordId) external view returns (
        string memory recordId,
        bytes32 dataHash,
        address owner,
        string memory fileName,
        string memory fileType,
        uint256 fileSize,
        string memory ipfsHash,
        string memory encryptionAlgorithm,
        uint256 uploadedAt,
        bool isActive,
        string memory metadataURI,
        string memory category
    ) {
        require(recordExists[_recordId], "Record does not exist");
        DataRecord memory record = dataRecords[_recordId];
        return (
            record.recordId,
            record.dataHash,
            record.owner,
            record.fileName,
            record.fileType,
            record.fileSize,
            record.ipfsHash,
            record.encryptionAlgorithm,
            record.uploadedAt,
            record.isActive,
            record.metadataURI,
            record.category
        );
    }
    
    /**
     * @dev Get all records owned by an address
     * @param _owner Owner address
     */
    function getRecordsByOwner(address _owner) external view returns (string[] memory) {
        return ownerRecords[_owner];
    }
    
    /**
     * @dev Get total number of records
     */
    function getTotalRecords() external view returns (uint256) {
        return allRecordIds.length;
    }
    
    /**
     * @dev Get record ID by index
     */
    function getRecordByIndex(uint256 _index) external view returns (string memory) {
        require(_index < allRecordIds.length, "Index out of bounds");
        return allRecordIds[_index];
    }
}


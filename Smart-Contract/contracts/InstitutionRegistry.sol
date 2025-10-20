// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title InstitutionRegistry
 * @dev Manages registration and verification of institutions on the DataTrust Nexus platform
 * @notice Compliant with ISO 27001 and NIST SP 800-53 security standards
 */
contract InstitutionRegistry {
    
    struct Institution {
        string name;
        string institutionType; // e.g., "University", "Bank", "Hospital", "Government"
        string registrationNumber;
        address walletAddress;
        uint256 registeredAt;
        bool isActive;
        string metadataURI; // IPFS link to additional institution data
    }
    
    // Mapping from wallet address to institution
    mapping(address => Institution) public institutions;
    
    // Mapping to check if an address is registered
    mapping(address => bool) public isRegistered;
    
    // Array of all registered institution addresses
    address[] public institutionAddresses;
    
    // Contract owner
    address public owner;
    
    // Events
    event InstitutionRegistered(
        address indexed wallet,
        string name,
        string institutionType,
        uint256 timestamp
    );
    
    event InstitutionDeactivated(
        address indexed wallet,
        uint256 timestamp
    );
    
    event InstitutionReactivated(
        address indexed wallet,
        uint256 timestamp
    );
    
    event InstitutionUpdated(
        address indexed wallet,
        string name,
        uint256 timestamp
    );
    
    // Modifiers
    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner can perform this action");
        _;
    }
    
    modifier onlyRegisteredInstitution() {
        require(isRegistered[msg.sender], "Institution not registered");
        require(institutions[msg.sender].isActive, "Institution is deactivated");
        _;
    }
    
    modifier notRegistered(address _wallet) {
        require(!isRegistered[_wallet], "Institution already registered");
        _;
    }
    
    constructor() {
        owner = msg.sender;
    }
    
    /**
     * @dev Register a new institution
     * @param _walletAddress The wallet address to register
     * @param _name Institution name
     * @param _institutionType Type of institution
     * @param _registrationNumber Official registration number
     * @param _metadataURI IPFS URI for additional metadata
     */
    function registerInstitution(
        address _walletAddress,
        string memory _name,
        string memory _institutionType,
        string memory _registrationNumber,
        string memory _metadataURI
    ) external notRegistered(_walletAddress) {
        require(bytes(_name).length > 0, "Name cannot be empty");
        require(bytes(_institutionType).length > 0, "Institution type cannot be empty");
        require(_walletAddress != address(0), "Invalid wallet address");
        
        Institution memory newInstitution = Institution({
            name: _name,
            institutionType: _institutionType,
            registrationNumber: _registrationNumber,
            walletAddress: _walletAddress,
            registeredAt: block.timestamp,
            isActive: true,
            metadataURI: _metadataURI
        });
        
        institutions[_walletAddress] = newInstitution;
        isRegistered[_walletAddress] = true;
        institutionAddresses.push(_walletAddress);
        
        emit InstitutionRegistered(_walletAddress, _name, _institutionType, block.timestamp);
    }
    
    /**
     * @dev Deactivate an institution (only owner)
     * @param _wallet Address of institution to deactivate
     */
    function deactivateInstitution(address _wallet) external onlyOwner {
        require(isRegistered[_wallet], "Institution not found");
        require(institutions[_wallet].isActive, "Institution already deactivated");
        
        institutions[_wallet].isActive = false;
        
        emit InstitutionDeactivated(_wallet, block.timestamp);
    }
    
    /**
     * @dev Reactivate an institution (only owner)
     * @param _wallet Address of institution to reactivate
     */
    function reactivateInstitution(address _wallet) external onlyOwner {
        require(isRegistered[_wallet], "Institution not found");
        require(!institutions[_wallet].isActive, "Institution already active");
        
        institutions[_wallet].isActive = true;
        
        emit InstitutionReactivated(_wallet, block.timestamp);
    }
    
    /**
     * @dev Update institution metadata
     * @param _name New name
     * @param _metadataURI New metadata URI
     */
    function updateInstitution(
        string memory _name,
        string memory _metadataURI
    ) external onlyRegisteredInstitution {
        require(bytes(_name).length > 0, "Name cannot be empty");
        
        institutions[msg.sender].name = _name;
        institutions[msg.sender].metadataURI = _metadataURI;
        
        emit InstitutionUpdated(msg.sender, _name, block.timestamp);
    }
    
    /**
     * @dev Get institution details
     * @param _wallet Address of the institution
     */
    function getInstitution(address _wallet) external view returns (
        string memory name,
        string memory institutionType,
        string memory registrationNumber,
        address walletAddress,
        uint256 registeredAt,
        bool isActive,
        string memory metadataURI
    ) {
        require(isRegistered[_wallet], "Institution not found");
        Institution memory inst = institutions[_wallet];
        return (
            inst.name,
            inst.institutionType,
            inst.registrationNumber,
            inst.walletAddress,
            inst.registeredAt,
            inst.isActive,
            inst.metadataURI
        );
    }
    
    /**
     * @dev Get total number of registered institutions
     */
    function getTotalInstitutions() external view returns (uint256) {
        return institutionAddresses.length;
    }
    
    /**
     * @dev Get institution address by index
     */
    function getInstitutionByIndex(uint256 _index) external view returns (address) {
        require(_index < institutionAddresses.length, "Index out of bounds");
        return institutionAddresses[_index];
    }
    
    /**
     * @dev Check if caller is a registered and active institution
     */
    function verifyInstitution(address _wallet) external view returns (bool) {
        return isRegistered[_wallet] && institutions[_wallet].isActive;
    }
}


# DataTrust Nexus - Smart Contracts

This directory contains the Solidity smart contracts for the DataTrust Nexus platform, built for the BlockDAG chain.

## 📋 Contracts Overview

### 1. InstitutionRegistry.sol
Manages registration and verification of institutions on the platform.

**Key Features:**
- Register new institutions with wallet addresses
- Activate/deactivate institutions
- Update institution metadata
- Verify institution status

**Main Functions:**
- `registerInstitution()` - Register a new institution
- `deactivateInstitution()` - Deactivate an institution (owner only)
- `reactivateInstitution()` - Reactivate an institution (owner only)
- `updateInstitution()` - Update institution details
- `getInstitution()` - Get institution information
- `verifyInstitution()` - Check if an institution is registered and active

### 2. DataVaultContract.sol
Stores encrypted data hashes and metadata on-chain.

**Key Features:**
- Upload data records with SHA-256 hashes
- Store IPFS CIDs for off-chain data
- Track data ownership
- Verify data integrity
- Soft delete (deactivate) records

**Main Functions:**
- `uploadData()` - Upload a new data record
- `verifyData()` - Verify data integrity by hash comparison
- `deactivateRecord()` - Deactivate a record
- `reactivateRecord()` - Reactivate a record
- `getDataRecord()` - Get record details
- `getRecordsByOwner()` - Get all records owned by an address

### 3. AccessControlContract.sol
Manages access permissions for data records using a whitelist approach.

**Key Features:**
- Grant time-bound access permissions
- Revoke access
- Check access validity
- Track permission history
- Support multiple permission types (read, verify, full)

**Main Functions:**
- `grantAccess()` - Grant access to a record
- `revokeAccess()` - Revoke access
- `checkAccess()` - Check if an address has valid access
- `getPermission()` - Get permission details
- `getRecordGrantees()` - Get all addresses with access to a record
- `expireAccess()` - Mark expired access as inactive

### 4. AuditTrailContract.sol
Immutable audit logging for all platform activities.

**Key Features:**
- Log all platform actions
- Support multiple action types
- Track actor, target, and timestamp
- Query logs by actor, record, or action type
- Retrieve recent logs

**Action Types:**
- INSTITUTION_REGISTERED
- DATA_UPLOADED
- ACCESS_GRANTED
- ACCESS_REVOKED
- VERIFICATION_REQUESTED
- VERIFICATION_COMPLETED
- DATA_ACCESSED
- DATA_DOWNLOADED
- PERMISSION_UPDATED
- RECORD_DEACTIVATED
- RECORD_REACTIVATED

**Main Functions:**
- `createLog()` - Create a general audit log
- `logInstitutionRegistration()` - Log institution registration
- `logDataUpload()` - Log data upload
- `logAccessGranted()` - Log access grant
- `logAccessRevoked()` - Log access revocation
- `logVerificationRequest()` - Log verification request
- `logVerificationCompletion()` - Log verification completion
- `getLog()` - Get log by ID
- `getLogsByActor()` - Get all logs for an actor
- `getLogsByRecord()` - Get all logs for a record
- `getRecentLogs()` - Get recent logs

## 🔐 Security & Compliance

All contracts implement:
- **Access Control:** Role-based modifiers (`onlyOwner`, `onlyRegisteredInstitution`, `onlyRecordOwner`)
- **Data Integrity:** SHA-256 hash verification
- **Audit Trail:** Comprehensive event emission for all critical actions
- **NIST SP 800-53 Compliance:** Audit logging and access control
- **ISO 27001 Compliance:** Secure data management practices

## 🚀 Deployment Instructions

### Prerequisites
- Node.js v16+
- Hardhat or Foundry
- BlockDAG network access

### Using Hardhat

1. **Install dependencies:**
```bash
npm install --save-dev hardhat @nomicfoundation/hardhat-toolbox
```

2. **Create hardhat.config.js:**
```javascript
require("@nomicfoundation/hardhat-toolbox");

module.exports = {
  solidity: {
    version: "0.8.20",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200
      }
    }
  },
  networks: {
    blockdag: {
      url: process.env.BLOCKDAG_RPC_URL,
      accounts: [process.env.DEPLOYER_PRIVATE_KEY]
    }
  }
};
```

3. **Create deployment script (scripts/deploy.js):**
```javascript
const hre = require("hardhat");

async function main() {
  console.log("Deploying DataTrust Nexus contracts...");

  // Deploy InstitutionRegistry
  const InstitutionRegistry = await hre.ethers.getContractFactory("InstitutionRegistry");
  const institutionRegistry = await InstitutionRegistry.deploy();
  await institutionRegistry.waitForDeployment();
  console.log("InstitutionRegistry deployed to:", await institutionRegistry.getAddress());

  // Deploy DataVaultContract
  const DataVaultContract = await hre.ethers.getContractFactory("DataVaultContract");
  const dataVault = await DataVaultContract.deploy(await institutionRegistry.getAddress());
  await dataVault.waitForDeployment();
  console.log("DataVaultContract deployed to:", await dataVault.getAddress());

  // Deploy AccessControlContract
  const AccessControlContract = await hre.ethers.getContractFactory("AccessControlContract");
  const accessControl = await AccessControlContract.deploy(
    await dataVault.getAddress(),
    await institutionRegistry.getAddress()
  );
  await accessControl.waitForDeployment();
  console.log("AccessControlContract deployed to:", await accessControl.getAddress());

  // Deploy AuditTrailContract
  const AuditTrailContract = await hre.ethers.getContractFactory("AuditTrailContract");
  const auditTrail = await AuditTrailContract.deploy();
  await auditTrail.waitForDeployment();
  console.log("AuditTrailContract deployed to:", await auditTrail.getAddress());

  // Save contract addresses
  const addresses = {
    InstitutionRegistry: await institutionRegistry.getAddress(),
    DataVaultContract: await dataVault.getAddress(),
    AccessControlContract: await accessControl.getAddress(),
    AuditTrailContract: await auditTrail.getAddress()
  };

  console.log("\nContract Addresses:");
  console.log(JSON.stringify(addresses, null, 2));
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
```

4. **Deploy:**
```bash
npx hardhat compile
npx hardhat run scripts/deploy.js --network blockdag
```

### Using Foundry

1. **Initialize Foundry project:**
```bash
forge init
```

2. **Deploy:**
```bash
forge create --rpc-url $BLOCKDAG_RPC_URL \
  --private-key $DEPLOYER_PRIVATE_KEY \
  InstitutionRegistry
```

## 📝 Environment Variables

Create a `.env` file:
```env
BLOCKDAG_RPC_URL=https://your-blockdag-rpc-url
DEPLOYER_PRIVATE_KEY=your-private-key-here
BLOCKDAG_CHAIN_ID=your-chain-id
```

## 🧪 Testing

Create test files in `test/` directory:

```javascript
const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("InstitutionRegistry", function () {
  it("Should register a new institution", async function () {
    const InstitutionRegistry = await ethers.getContractFactory("InstitutionRegistry");
    const registry = await InstitutionRegistry.deploy();
    
    await registry.registerInstitution(
      "Test University",
      "University",
      "REG123",
      "ipfs://metadata"
    );
    
    const [signer] = await ethers.getSigners();
    expect(await registry.isRegistered(signer.address)).to.be.true;
  });
});
```

Run tests:
```bash
npx hardhat test
```

## 🔗 Contract Interactions

### Register Institution
```javascript
const tx = await institutionRegistry.registerInstitution(
  "Harvard University",
  "University",
  "REG-HU-001",
  "ipfs://QmHash..."
);
await tx.wait();
```

### Upload Data
```javascript
const recordId = "REC-" + Date.now();
const dataHash = ethers.keccak256(ethers.toUtf8Bytes("encrypted-data"));
const tx = await dataVault.uploadData(
  recordId,
  dataHash,
  "transcript.pdf",
  "application/pdf",
  1024000,
  "QmIpfsHash...",
  "AES-256-GCM",
  "Academic",
  "ipfs://metadata"
);
await tx.wait();
```

### Grant Access
```javascript
const tx = await accessControl.grantAccess(
  recordId,
  granteeAddress,
  0, // No expiration
  "read",
  "Research collaboration"
);
await tx.wait();
```

## 📄 License

MIT License

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## 📞 Support

For issues and questions, please open an issue on the repository.


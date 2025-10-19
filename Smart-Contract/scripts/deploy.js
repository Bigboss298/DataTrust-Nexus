const hre = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  console.log("\n🚀 Starting deployment of DataTrust Nexus contracts...\n");
  
  // Get the network info
  const network = hre.network.name;
  console.log(`📡 Network: ${network}`);
  
  // Get the deployer account
  const [deployer] = await hre.ethers.getSigners();
  console.log(`👤 Deployer address: ${deployer.address}`);
  
  // Check balance
  const balance = await hre.ethers.provider.getBalance(deployer.address);
  console.log(`💰 Deployer balance: ${hre.ethers.formatEther(balance)} ETH\n`);
  
  if (balance === 0n) {
    console.error("❌ Error: Deployer account has no balance!");
    console.error(`Please get funds from: https://awakening.bdagscan.com/faucet`);
    process.exit(1);
  }
  
  const deployedContracts = {};
  
  // 1. Deploy InstitutionRegistry
  console.log("📝 Deploying InstitutionRegistry contract...");
  const InstitutionRegistry = await hre.ethers.getContractFactory("InstitutionRegistry");
  const institutionRegistry = await InstitutionRegistry.deploy();
  await institutionRegistry.waitForDeployment();
  const institutionRegistryAddress = await institutionRegistry.getAddress();
  deployedContracts.InstitutionRegistry = institutionRegistryAddress;
  console.log(`✅ InstitutionRegistry deployed: ${institutionRegistryAddress}`);
  console.log(`   TX: ${institutionRegistry.deploymentTransaction().hash}\n`);
  
  // Wait for confirmations
  await institutionRegistry.deploymentTransaction().wait(2);
  
  // 2. Deploy DataVaultContract
  console.log("📝 Deploying DataVaultContract...");
  const DataVaultContract = await hre.ethers.getContractFactory("DataVaultContract");
  const dataVault = await DataVaultContract.deploy(institutionRegistryAddress);
  await dataVault.waitForDeployment();
  const dataVaultAddress = await dataVault.getAddress();
  deployedContracts.DataVaultContract = dataVaultAddress;
  console.log(`✅ DataVaultContract deployed: ${dataVaultAddress}`);
  console.log(`   TX: ${dataVault.deploymentTransaction().hash}\n`);
  
  await dataVault.deploymentTransaction().wait(2);
  
  // 3. Deploy AccessControlContract
  console.log("📝 Deploying AccessControlContract...");
  const AccessControlContract = await hre.ethers.getContractFactory("AccessControlContract");
  const accessControl = await AccessControlContract.deploy(
    dataVaultAddress,
    institutionRegistryAddress
  );
  await accessControl.waitForDeployment();
  const accessControlAddress = await accessControl.getAddress();
  deployedContracts.AccessControlContract = accessControlAddress;
  console.log(`✅ AccessControlContract deployed: ${accessControlAddress}`);
  console.log(`   TX: ${accessControl.deploymentTransaction().hash}\n`);
  
  await accessControl.deploymentTransaction().wait(2);
  
  // 4. Deploy AuditTrailContract
  console.log("📝 Deploying AuditTrailContract...");
  const AuditTrailContract = await hre.ethers.getContractFactory("AuditTrailContract");
  const auditTrail = await AuditTrailContract.deploy();
  await auditTrail.waitForDeployment();
  const auditTrailAddress = await auditTrail.getAddress();
  deployedContracts.AuditTrailContract = auditTrailAddress;
  console.log(`✅ AuditTrailContract deployed: ${auditTrailAddress}`);
  console.log(`   TX: ${auditTrail.deploymentTransaction().hash}\n`);
  
  await auditTrail.deploymentTransaction().wait(2);
  
  // Save deployment info
  const deploymentInfo = {
    network: network,
    deployer: deployer.address,
    timestamp: new Date().toISOString(),
    contracts: {
      InstitutionRegistry: {
        address: institutionRegistryAddress,
        txHash: institutionRegistry.deploymentTransaction().hash
      },
      DataVaultContract: {
        address: dataVaultAddress,
        txHash: dataVault.deploymentTransaction().hash
      },
      AccessControlContract: {
        address: accessControlAddress,
        txHash: accessControl.deploymentTransaction().hash
      },
      AuditTrailContract: {
        address: auditTrailAddress,
        txHash: auditTrail.deploymentTransaction().hash
      }
    }
  };
  
  // Create deployments directory if it doesn't exist
  const deploymentsDir = path.join(__dirname, "..", "deployments");
  if (!fs.existsSync(deploymentsDir)) {
    fs.mkdirSync(deploymentsDir, { recursive: true });
  }
  
  // Save deployment info to file
  const deploymentFile = path.join(deploymentsDir, `${network}-deployment.json`);
  fs.writeFileSync(deploymentFile, JSON.stringify(deploymentInfo, null, 2));
  console.log(`💾 Deployment info saved to: ${deploymentFile}\n`);
  
  // Save contract addresses to .env format
  const envUpdate = `
# Deployed Contract Addresses (${network} - ${new Date().toISOString()})
INSTITUTION_REGISTRY_ADDRESS=${institutionRegistryAddress}
DATA_VAULT_ADDRESS=${dataVaultAddress}
ACCESS_CONTROL_ADDRESS=${accessControlAddress}
AUDIT_TRAIL_ADDRESS=${auditTrailAddress}
`;
  
  const envFile = path.join(__dirname, "..", "deployed-addresses.txt");
  fs.writeFileSync(envFile, envUpdate.trim());
  console.log(`📝 Contract addresses saved to: ${envFile}\n`);
  
  console.log("╔════════════════════════════════════════════════════════╗");
  console.log("║           ALL CONTRACTS DEPLOYED SUCCESSFULLY!         ║");
  console.log("╚════════════════════════════════════════════════════════╝\n");
  
  console.log("📍 Contract Addresses:");
  console.log(`   InstitutionRegistry:    ${institutionRegistryAddress}`);
  console.log(`   DataVaultContract:      ${dataVaultAddress}`);
  console.log(`   AccessControlContract:  ${accessControlAddress}`);
  console.log(`   AuditTrailContract:     ${auditTrailAddress}\n`);
  
  console.log("🔗 View on Block Explorer:");
  console.log(`   https://awakening.bdagscan.com/address/${institutionRegistryAddress}\n`);
  
  console.log("📝 Next steps:");
  console.log("1. Update Backend/appsettings.json with contract addresses");
  console.log("2. Update Smart-Contract/subgraph/subgraph.yaml with addresses");
  console.log("3. Update frontend/.env with addresses");
  console.log("4. Deploy The Graph subgraph");
  console.log("5. Test the contracts\n");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("\n❌ Deployment failed!");
    console.error(error);
    process.exit(1);
  });


#!/usr/bin/env node

/**
 * Generate a server wallet for DataTrust Nexus
 * 
 * This script generates a new Ethereum-compatible wallet that can be used
 * as the server wallet for signing blockchain transactions.
 * 
 * Usage:
 *   node generate-server-wallet.js
 */

const crypto = require('crypto');

console.log('\n🔐 DataTrust Nexus - Server Wallet Generator\n');
console.log('=' .repeat(60));

// Generate a random private key
const privateKey = crypto.randomBytes(32).toString('hex');

console.log('\n✅ Server Wallet Generated Successfully!\n');
console.log('📝 IMPORTANT: Save this information in a secure location!\n');

console.log('Private Key (without 0x):');
console.log('─'.repeat(60));
console.log(privateKey);
console.log('─'.repeat(60));

console.log('\n📋 Configuration Instructions:\n');

console.log('1. For Local Development:');
console.log('   Add to appsettings.Development.json:');
console.log('   ────────────────────────────────────────────');
console.log(`   "ServerPrivateKey": "${privateKey}"`);
console.log('   ────────────────────────────────────────────\n');

console.log('2. For Azure Deployment:');
console.log('   Add as Application Setting in Azure Portal:');
console.log('   ────────────────────────────────────────────');
console.log('   Name:  Blockchain__ServerPrivateKey');
console.log(`   Value: ${privateKey}`);
console.log('   ────────────────────────────────────────────\n');

console.log('⚠️  SECURITY WARNINGS:\n');
console.log('   • NEVER commit this private key to Git');
console.log('   • Store it securely (password manager, Azure Key Vault, etc.)');
console.log('   • Keep a secure backup');
console.log('   • Use different wallets for dev/staging/production\n');

console.log('💰 Next Steps:\n');
console.log('   1. Fund this wallet with BlockDAG tokens');
console.log('   2. Add the private key to your configuration');
console.log('   3. Restart your application');
console.log('   4. Test the registration flow\n');

console.log('📖 For more details, see: Backend/SERVER-WALLET-SETUP.md\n');
console.log('=' .repeat(60));
console.log('\n');


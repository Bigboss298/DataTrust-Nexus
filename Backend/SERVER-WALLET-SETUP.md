# Server Wallet Setup Guide

## Overview

The DataTrust Nexus backend uses a server-side wallet to sign blockchain transactions on behalf of users. This approach is more secure than requiring users to share their private keys.

## How It Works

1. **User Signs a Message**: When a user wants to register an institution, they sign a message with their wallet (MetaMask)
2. **Backend Verifies Signature**: The backend verifies that the signature is valid and matches the user's wallet address
3. **Backend Signs Transaction**: The backend uses its own wallet to submit the transaction to the blockchain

## Setup Instructions

### Step 1: Generate a Server Wallet

You can generate a new wallet using one of these methods:

#### Option A: Using MetaMask
1. Create a new account in MetaMask
2. Export the private key (Account Details → Export Private Key)
3. Copy the private key (without the `0x` prefix)

#### Option B: Using Node.js
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

#### Option C: Using Python
```bash
python -c "import secrets; print(secrets.token_hex(32))"
```

### Step 2: Fund the Server Wallet

The server wallet needs BlockDAG tokens to pay for gas fees. You can fund it by:

1. Getting BlockDAG testnet tokens from the faucet (if available)
2. Transferring tokens from another wallet
3. Mining tokens on the testnet

### Step 3: Configure the Private Key

#### For Local Development

Add the private key to `appsettings.Development.json`:

```json
{
  "Blockchain": {
    "ServerPrivateKey": "your_private_key_here_without_0x_prefix"
  }
}
```

#### For Azure Deployment

Add the private key as an Application Setting in Azure Portal:

1. Go to Azure Portal → Your App Service
2. Navigate to **Configuration** → **Application settings**
3. Add a new setting:
   - **Name**: `Blockchain__ServerPrivateKey`
   - **Value**: Your private key (without `0x` prefix)
4. Click **Save**

**Important**: Use double underscores (`__`) in Azure to represent nested configuration keys.

### Step 4: Verify Configuration

After setting up the private key, restart the application and check the logs. You should see the server wallet address in the logs when the application starts.

## Security Best Practices

### ⚠️ CRITICAL SECURITY NOTES

1. **NEVER commit private keys to Git**: The private key should NEVER be in version control
2. **Use Environment Variables**: Store the private key in environment variables or Azure Key Vault
3. **Rotate Keys Regularly**: Change the server wallet private key periodically
4. **Monitor Wallet Balance**: Ensure the server wallet always has enough tokens for gas
5. **Use Separate Wallets**: Use different wallets for different environments (dev, staging, production)
6. **Backup Securely**: Keep a secure backup of the private key in case of emergencies

### Azure Key Vault (Recommended for Production)

For production deployments, use Azure Key Vault instead of Application Settings:

1. Create an Azure Key Vault
2. Store the private key as a secret
3. Grant the App Service access to the Key Vault
4. Update the configuration to read from Key Vault

## Troubleshooting

### Error: "Server private key not configured"
- Make sure you've added the `ServerPrivateKey` to your configuration
- For Azure, ensure you're using double underscores (`__`) in the setting name
- Restart the application after adding the configuration

### Error: "Insufficient funds for gas"
- Check the server wallet balance on BlockDAG Explorer
- Fund the wallet with BlockDAG tokens
- Check the RPC URL is correct

### Error: "Invalid signature"
- Ensure the user signed the correct message format
- Verify the signature verification logic matches the frontend signing logic
- Check that the wallet address matches the signature

## Testing

To test the setup:

1. Start the backend application
2. Check the logs for the server wallet address
3. Try registering a new institution from the frontend
4. Verify the transaction appears on BlockDAG Explorer

## Support

If you encounter issues:

1. Check the application logs for detailed error messages
2. Verify all configuration values are correct
3. Ensure the server wallet has sufficient balance
4. Test the RPC connection to BlockDAG network


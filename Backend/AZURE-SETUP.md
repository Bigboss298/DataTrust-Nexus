# Azure App Service Setup Guide

## Configuration

This application requires the following configuration in Azure App Service:

### 1. Application Settings

Go to your Azure App Service → **Configuration** → **Application settings** and add:

#### Required Settings:

| Name | Value | Description |
|------|-------|-------------|
| `AzureStorage:ConnectionString` | Your full Azure Storage connection string | Get from Azure Portal → Storage Account → Access Keys |
| `AzureStorage:ContainerName` | `datatrust-nexus-files` | Container name for file storage |
| `Blockchain:RpcUrl` | `https://rpc.awakening.bdagscan.com` | BlockDAG RPC URL |
| `Blockchain:ChainId` | `1043` | BlockDAG Chain ID |

#### Optional Settings:

| Name | Value | Description |
|------|-------|-------------|
| `IPFS:ApiUrl` | `http://localhost:5001/api/v0` | IPFS API URL (if using local IPFS) |
| `IPFS:Gateway` | `http://localhost:8080/ipfs/` | IPFS Gateway URL |
| `Security:EnableEncryption` | `true` | Enable AES-256-GCM encryption |
| `Security:MaxFileSize` | `104857600` | Max file size in bytes (100MB) |

### 2. Connection Strings (Alternative)

You can also use the **Connection strings** section in Azure App Service:

```
Name: DefaultConnection
Value: Your Azure SQL connection string (if using SQL)
Type: SQLAzure
```

### 3. How to Get Azure Storage Connection String

1. Go to [Azure Portal](https://portal.azure.com)
2. Navigate to your Storage Account (e.g., `idealcbtfilestorage`)
3. Click on **Access keys** in the left menu
4. Click **Show keys**
5. Copy the **Connection string** from either key1 or key2
6. Paste it in the Application Settings as `AzureStorage:ConnectionString`

### 4. CORS Settings

Add your frontend URL to the **CORS** section:
- `https://your-frontend-domain.vercel.app`
- `http://localhost:3000` (for local development)

### 5. Deployment

The GitHub Actions workflow will automatically deploy when you push to the `main` branch.

### 6. Testing the Deployment

After deployment, test your API:
```bash
curl https://your-app-name.azurewebsites.net/api/health
```

## Local Development

For local development, create a `appsettings.Development.json` file:

```json
{
  "AzureStorage": {
    "ConnectionString": "YOUR_LOCAL_CONNECTION_STRING",
    "ContainerName": "datatrust-nexus-files"
  },
  "IPFS": {
    "ApiUrl": "http://localhost:5001/api/v0",
    "Gateway": "http://localhost:8080/ipfs/"
  }
}
```

This file is already in `.gitignore` and won't be committed.

## Security Notes

- ✅ Never commit secrets to Git
- ✅ Use Azure Application Settings for production
- ✅ Use User Secrets for local development
- ✅ Rotate keys regularly
- ✅ Enable HTTPS only in Azure App Service


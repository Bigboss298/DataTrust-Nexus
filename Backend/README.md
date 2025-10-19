# DataTrust Nexus - Backend API

ASP.NET Core 8 backend API for the DataTrust Nexus secure data exchange platform.

## 🏗️ Architecture

This backend follows a **4-layer N-Tier Architecture**:

1. **Models** - Entity models and DTOs
2. **Interfaces** - Service and repository contracts
3. **Implementations** - Business logic and data access
4. **Controllers** - API endpoints

## 🔐 Security & Compliance

- **ISO 27001** - Secure data management
- **NIST SP 800-53** - Encryption, access control, audit standards
- **GDPR/NDPR** - Data privacy compliance

### Encryption Standards

- **AES-256-GCM** - File encryption at rest
- **RSA-OAEP** - Key encryption and exchange
- **SHA-256** - Data hashing for integrity verification

## 📋 Prerequisites

- .NET 8 SDK
- PostgreSQL 14+
- (Optional) IPFS node
- (Optional) BlockDAG node access

## 🚀 Getting Started

### 1. Install Dependencies

```bash
cd Backend
dotnet restore
```

### 2. Configure Database

Update `appsettings.Development.json` with your PostgreSQL connection:

```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Host=localhost;Port=5432;Database=datatrust_nexus_dev;Username=postgres;Password=your_password"
  }
}
```

### 3. Create Database

```bash
# Install EF Core tools if not already installed
dotnet tool install --global dotnet-ef

# Create initial migration
dotnet ef migrations add InitialCreate

# Apply migrations
dotnet ef database update
```

### 4. Configure Blockchain & IPFS

Update `appsettings.Development.json`:

```json
{
  "Blockchain": {
    "RpcUrl": "http://localhost:8545",
    "ChainId": "1337",
    "Contracts": {
      "InstitutionRegistry": "0x...",
      "DataVaultContract": "0x...",
      "AccessControlContract": "0x...",
      "AuditTrailContract": "0x..."
    }
  },
  "IPFS": {
    "ApiUrl": "http://localhost:5001/api/v0",
    "Gateway": "http://localhost:8080/ipfs/"
  }
}
```

### 5. Run the Application

```bash
dotnet run
```

The API will be available at:
- HTTP: `http://localhost:5000`
- HTTPS: `https://localhost:5001`
- Swagger UI: `http://localhost:5000` or `https://localhost:5001`

## 📚 API Documentation

Once running, access the Swagger UI at the root URL for complete API documentation.

### Key Endpoints

#### Institutions
- `POST /api/institution/register` - Register a new institution
- `GET /api/institution/wallet/{walletAddress}` - Get institution by wallet
- `GET /api/institution/verify/{walletAddress}` - Verify institution status

#### Data Management
- `POST /api/data/upload` - Upload encrypted data
- `POST /api/data/verify` - Verify data integrity
- `GET /api/data/{recordId}` - Get data record details
- `GET /api/data/institution/{walletAddress}` - Get all records for an institution

#### Access Control
- `POST /api/access/grant` - Grant access to data
- `POST /api/access/revoke` - Revoke access
- `GET /api/access/check` - Check access permissions
- `GET /api/access/granted/{walletAddress}` - Get granted permissions
- `GET /api/access/received/{walletAddress}` - Get received permissions

#### Audit Logs
- `GET /api/audit/recent` - Get recent audit logs
- `GET /api/audit/actor/{walletAddress}` - Get logs by actor
- `GET /api/audit/record/{recordId}` - Get logs for a record
- `GET /api/audit/statistics` - Get audit statistics
- `POST /api/audit/query` - Query logs with filters

## 🔧 Configuration

### Database Configuration

```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Host=localhost;Port=5432;Database=datatrust_nexus;Username=postgres;Password=your_password"
  },
  "Database": {
    "AutoMigrate": false
  }
}
```

### CORS Configuration

By default, the API allows requests from:
- `http://localhost:3001`
- `http://localhost:3000`

Update `AllowedOrigins` in `appsettings.json` for production.

### Security Settings

```json
{
  "Security": {
    "EnableEncryption": true,
    "KeyRotationDays": 90,
    "MaxFileSize": 104857600
  }
}
```

## 🧪 Testing

### Using Swagger UI

1. Navigate to the Swagger UI
2. Click "Try it out" on any endpoint
3. Fill in the required parameters
4. Add `X-Wallet-Address` header for authenticated endpoints

### Using cURL

```bash
# Register an institution
curl -X POST "https://localhost:5001/api/institution/register" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Harvard University",
    "institutionType": "University",
    "registrationNumber": "REG-HU-001",
    "walletAddress": "0x1234567890123456789012345678901234567890",
    "contactEmail": "admin@harvard.edu"
  }'

# Upload data
curl -X POST "https://localhost:5001/api/data/upload" \
  -H "Content-Type: application/json" \
  -H "X-Wallet-Address: 0x1234567890123456789012345678901234567890" \
  -d '{
    "recordId": "REC-001",
    "dataHash": "abc123...",
    "fileName": "transcript.pdf",
    "fileType": "application/pdf",
    "fileSize": 1024000,
    "ipfsHash": "QmHash...",
    "category": "Academic"
  }'
```

## 📁 Project Structure

```
Backend/
├── Models/
│   ├── Institution.cs
│   ├── DataRecord.cs
│   ├── AccessRequest.cs
│   ├── AuditLog.cs
│   ├── DataTrustDbContext.cs
│   └── DTOs/
│       ├── InstitutionDto.cs
│       ├── UploadDataDto.cs
│       ├── VerifyDataDto.cs
│       ├── AccessControlDto.cs
│       └── AuditLogDto.cs
├── Interfaces/
│   ├── IRepository.cs
│   ├── IInstitutionService.cs
│   ├── IDataService.cs
│   ├── IAccessControlService.cs
│   ├── IAuditService.cs
│   ├── IEncryptionService.cs
│   ├── IBlockchainService.cs
│   └── IIpfsService.cs
├── Implementations/
│   ├── Repository/
│   │   └── GenericRepository.cs
│   └── Services/
│       ├── InstitutionService.cs
│       ├── DataService.cs
│       ├── AccessControlService.cs
│       ├── AuditService.cs
│       ├── EncryptionService.cs
│       ├── BlockchainService.cs
│       └── IpfsService.cs
├── Controllers/
│   ├── InstitutionController.cs
│   ├── DataController.cs
│   ├── AccessController.cs
│   └── AuditController.cs
├── Program.cs
├── appsettings.json
└── Backend.csproj
```

## 🔐 Authentication

The API uses wallet-based authentication via the `X-Wallet-Address` header. The wallet address is used to:
- Identify the institution
- Verify ownership of data
- Control access permissions
- Audit all actions

## 🛡️ Error Handling

All endpoints return standard HTTP status codes:

- `200 OK` - Success
- `400 Bad Request` - Invalid input
- `404 Not Found` - Resource not found
- `500 Internal Server Error` - Server error

Error responses include a message:
```json
{
  "message": "Error description"
}
```

## 📊 Database Schema

### Institutions
- Id (string, PK)
- Name (string)
- InstitutionType (string)
- WalletAddress (string, unique)
- RegisteredAt (datetime)
- IsActive (bool)

### DataRecords
- Id (string, PK)
- RecordId (string, unique)
- DataHash (string)
- OwnerId (string, FK)
- FileName (string)
- IpfsHash (string)
- UploadedAt (datetime)

### AccessRequests
- Id (string, PK)
- RecordId (string, FK)
- GranterId (string, FK)
- GranteeWalletAddress (string)
- GrantedAt (datetime)
- ExpiresAt (datetime, nullable)
- IsActive (bool)

### AuditLogs
- Id (string, PK)
- ActionType (string)
- ActorId (string, FK)
- RecordId (string, nullable)
- Timestamp (datetime)
- Success (bool)

## 🚀 Deployment

### Production Checklist

1. Update `appsettings.json` with production values
2. Set `Database:AutoMigrate` to `false`
3. Configure production CORS origins
4. Set up proper blockchain node access
5. Configure IPFS (local node or Pinata/Infura)
6. Enable HTTPS
7. Set up monitoring and logging
8. Configure backup strategy

### Docker Deployment

```dockerfile
FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS base
WORKDIR /app
EXPOSE 80
EXPOSE 443

FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src
COPY ["Backend.csproj", "./"]
RUN dotnet restore "Backend.csproj"
COPY . .
RUN dotnet build "Backend.csproj" -c Release -o /app/build

FROM build AS publish
RUN dotnet publish "Backend.csproj" -c Release -o /app/publish

FROM base AS final
WORKDIR /app
COPY --from=publish /app/publish .
ENTRYPOINT ["dotnet", "Backend.dll"]
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## 📄 License

MIT License

## 📞 Support

For issues and questions, please open an issue on the repository.


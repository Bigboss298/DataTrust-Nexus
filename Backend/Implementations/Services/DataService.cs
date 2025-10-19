using DataTrustNexus.Api.Interfaces;
using DataTrustNexus.Api.Services;
using Nethereum.Web3;
using Nethereum.Web3.Accounts;
using System.Numerics;
using Nethereum.RPC.Eth.DTOs;

namespace DataTrustNexus.Api.Implementations.Services;

/// <summary>
/// Data service with REAL BlockDAG integration
/// </summary>
public class DataService : IDataService
{
    private readonly IConfiguration _configuration;
    private readonly ILogger<DataService> _logger;
    private readonly string _rpcUrl;
    private readonly string _contractAddress;

    public DataService(IConfiguration configuration, ILogger<DataService> logger)
    {
        _configuration = configuration;
        _logger = logger;
        _rpcUrl = configuration["Blockchain:RpcUrl"] ?? throw new Exception("RPC URL not configured");
        _contractAddress = configuration["Blockchain:Contracts:DataVaultContract"] 
            ?? throw new Exception("DataVaultContract address not configured");
    }

    public async Task<string> UploadDataAsync(string recordId, string dataHash, string fileName, string fileType, long fileSize, string ipfsHash, string encryptionAlgorithm, string category, string metadataUri, string privateKey)
    {
        try
        {
            _logger.LogInformation("🚀 Uploading data: {RecordId}", recordId);
            
            var account = new Account(privateKey);
            var web3 = new Web3(account, _rpcUrl);
            var abi = ContractAbiLoader.LoadAbi("DataVaultContract");
            var contract = web3.Eth.GetContract(abi, _contractAddress);
            var function = contract.GetFunction("uploadData");

            var dataHashBytes = System.Text.Encoding.UTF8.GetBytes(dataHash);
            if (dataHashBytes.Length < 32) Array.Resize(ref dataHashBytes, 32);

            var gas = await function.EstimateGasAsync(account.Address, null, null, recordId, dataHashBytes, fileName, fileType, new BigInteger(fileSize), ipfsHash, encryptionAlgorithm, category, metadataUri);
            var txHash = await function.SendTransactionAsync(account.Address, gas, null, recordId, dataHashBytes, fileName, fileType, new BigInteger(fileSize), ipfsHash, encryptionAlgorithm, category, metadataUri);

            _logger.LogInformation("✅ Data uploaded! TxHash: {TxHash}", txHash);
            return txHash;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "❌ Failed to upload data");
            throw new Exception($"BlockDAG error: {ex.Message}", ex);
        }
    }

    public async Task<string> UpdateDataMetadataAsync(string recordId, string metadataUri, string privateKey)
    {
        try
        {
            _logger.LogInformation("🚀 Updating data metadata: {RecordId}", recordId);
            
            var account = new Account(privateKey);
            var web3 = new Web3(account, _rpcUrl);
            var abi = ContractAbiLoader.LoadAbi("DataVaultContract");
            var contract = web3.Eth.GetContract(abi, _contractAddress);
            var function = contract.GetFunction("updateDataMetadata");

            var gas = await function.EstimateGasAsync(account.Address, null, null, recordId, metadataUri);
            var txHash = await function.SendTransactionAsync(account.Address, gas, null, recordId, metadataUri);

            _logger.LogInformation("✅ Data metadata updated! TxHash: {TxHash}", txHash);
            return txHash;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "❌ Failed to update data metadata");
            throw new Exception($"BlockDAG error: {ex.Message}", ex);
        }
    }

    public async Task<string> DeactivateDataAsync(string recordId, string privateKey)
    {
        try
        {
            _logger.LogInformation("🚀 Deactivating data: {RecordId}", recordId);
            
            var account = new Account(privateKey);
            var web3 = new Web3(account, _rpcUrl);
            var abi = ContractAbiLoader.LoadAbi("DataVaultContract");
            var contract = web3.Eth.GetContract(abi, _contractAddress);
            var function = contract.GetFunction("deactivateData");

            var gas = await function.EstimateGasAsync(account.Address, null, null, recordId);
            var txHash = await function.SendTransactionAsync(account.Address, gas, null, recordId);

            _logger.LogInformation("✅ Data deactivated! TxHash: {TxHash}", txHash);
            return txHash;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "❌ Failed to deactivate data");
            throw new Exception($"BlockDAG error: {ex.Message}", ex);
        }
    }

    public async Task<DataRecordInfo?> GetDataRecordAsync(string recordId)
    {
        try
        {
            _logger.LogInformation("📖 Reading data record from BlockDAG: {RecordId}", recordId);
            
            var web3 = new Web3(_rpcUrl);
            var abi = ContractAbiLoader.LoadAbi("DataVaultContract");
            var contract = web3.Eth.GetContract(abi, _contractAddress);
            var function = contract.GetFunction("getDataRecord");

            var result = await function.CallDeserializingToObjectAsync<DataRecordContractData>(recordId);

            return new DataRecordInfo
            {
                RecordId = recordId,
                DataHash = System.Text.Encoding.UTF8.GetString(result.DataHash).TrimEnd('\0'),
                Owner = result.Owner,
                FileName = result.FileName,
                FileType = result.FileType,
                FileSize = (long)result.FileSize,
                IpfsHash = result.IpfsHash,
                EncryptionAlgorithm = result.EncryptionAlgorithm,
                Category = result.Category,
                MetadataUri = result.MetadataUri,
                UploadedAt = (long)result.UploadedAt,
                UploadedAtFormatted = DateTimeOffset.FromUnixTimeSeconds((long)result.UploadedAt).ToString("yyyy-MM-dd HH:mm:ss UTC"),
                IsActive = result.IsActive
            };
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "❌ Failed to get data record");
            return null;
        }
    }

    public async Task<List<DataRecordInfo>> GetAllDataRecordsAsync()
    {
        try
        {
            _logger.LogInformation("📖 Querying all data records from BlockDAG events...");
            
            var web3 = new Web3(_rpcUrl);
            var abi = ContractAbiLoader.LoadAbi("DataVaultContract");
            var contract = web3.Eth.GetContract(abi, _contractAddress);
            var dataUploadedEvent = contract.GetEvent("DataUploaded");

            var filterAll = dataUploadedEvent.CreateFilterInput(
                fromBlock: BlockParameter.CreateEarliest(), 
                toBlock: BlockParameter.CreateLatest());
            
            var allEvents = await dataUploadedEvent.GetAllChangesAsync<DataUploadedEvent>(filterAll);

            var records = new List<DataRecordInfo>();
            foreach (var evt in allEvents)
            {
                // Get full details from contract
                var record = await GetDataRecordAsync(evt.Event.RecordId);
                if (record != null)
                {
                    records.Add(record);
                }
            }

            _logger.LogInformation("✅ Found {Count} data records", records.Count);
            return records;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "❌ Failed to query data records");
            return new List<DataRecordInfo>();
        }
    }

    public async Task<string[]> GetRecordIdsByOwnerAsync(string ownerAddress)
    {
        try
        {
            _logger.LogInformation("📖 Getting record IDs for owner {Owner} from BlockDAG...", ownerAddress);
            
            var web3 = new Web3(_rpcUrl);
            var abi = ContractAbiLoader.LoadAbi("DataVaultContract");
            var contract = web3.Eth.GetContract(abi, _contractAddress);
            var function = contract.GetFunction("getRecordsByOwner");

            // Use CallDeserializingToObjectAsync for dynamic arrays
            var result = await function.CallDeserializingToObjectAsync<GetRecordsByOwnerResult>(ownerAddress);
            
            _logger.LogInformation("✅ Found {Count} record IDs for owner", result.RecordIds?.Length ?? 0);
            return result.RecordIds ?? Array.Empty<string>();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "❌ Failed to get record IDs by owner");
            return Array.Empty<string>();
        }
    }

    public async Task<List<DataRecordInfo>> GetDataRecordsByOwnerAsync(string ownerAddress)
    {
        try
        {
            _logger.LogInformation("📖 Querying data records for owner {Owner} from BlockDAG...", ownerAddress);
            
            // Get record IDs using the contract's getRecordsByOwner function
            var recordIds = await GetRecordIdsByOwnerAsync(ownerAddress);

            var records = new List<DataRecordInfo>();
            foreach (var recordId in recordIds)
            {
                var record = await GetDataRecordAsync(recordId);
                if (record != null)
                {
                    records.Add(record);
                }
            }

            _logger.LogInformation("✅ Found {Count} data records for owner", records.Count);
            return records;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "❌ Failed to query data records by owner");
            return new List<DataRecordInfo>();
        }
    }

    public async Task<bool> VerifyDataIntegrityAsync(string recordId, string dataHash)
    {
        try
        {
            var web3 = new Web3(_rpcUrl);
            var abi = ContractAbiLoader.LoadAbi("DataVaultContract");
            var contract = web3.Eth.GetContract(abi, _contractAddress);
            var function = contract.GetFunction("verifyData");

            var dataHashBytes = System.Text.Encoding.UTF8.GetBytes(dataHash);
            if (dataHashBytes.Length < 32) Array.Resize(ref dataHashBytes, 32);

            var result = await function.CallAsync<bool>(recordId, dataHashBytes);
            return result;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "❌ Failed to verify data");
            return false;
        }
    }
}

[Nethereum.ABI.FunctionEncoding.Attributes.FunctionOutput]
public class DataRecordContractData
{
    [Nethereum.ABI.FunctionEncoding.Attributes.Parameter("bytes32", "dataHash", 1, false)]
    public byte[] DataHash { get; set; } = Array.Empty<byte>();
    
    [Nethereum.ABI.FunctionEncoding.Attributes.Parameter("address", "owner", 2, false)]
    public string Owner { get; set; } = string.Empty;
    
    [Nethereum.ABI.FunctionEncoding.Attributes.Parameter("string", "fileName", 3, false)]
    public string FileName { get; set; } = string.Empty;
    
    [Nethereum.ABI.FunctionEncoding.Attributes.Parameter("string", "fileType", 4, false)]
    public string FileType { get; set; } = string.Empty;
    
    [Nethereum.ABI.FunctionEncoding.Attributes.Parameter("uint256", "fileSize", 5, false)]
    public BigInteger FileSize { get; set; }
    
    [Nethereum.ABI.FunctionEncoding.Attributes.Parameter("string", "ipfsHash", 6, false)]
    public string IpfsHash { get; set; } = string.Empty;
    
    [Nethereum.ABI.FunctionEncoding.Attributes.Parameter("string", "encryptionAlgorithm", 7, false)]
    public string EncryptionAlgorithm { get; set; } = string.Empty;
    
    [Nethereum.ABI.FunctionEncoding.Attributes.Parameter("string", "category", 8, false)]
    public string Category { get; set; } = string.Empty;
    
    [Nethereum.ABI.FunctionEncoding.Attributes.Parameter("string", "metadataURI", 9, false)]
    public string MetadataUri { get; set; } = string.Empty;
    
    [Nethereum.ABI.FunctionEncoding.Attributes.Parameter("uint256", "uploadedAt", 10, false)]
    public BigInteger UploadedAt { get; set; }
    
    [Nethereum.ABI.FunctionEncoding.Attributes.Parameter("bool", "isActive", 11, false)]
    public bool IsActive { get; set; }
}

// Event DTO for DataUploaded
[Nethereum.ABI.FunctionEncoding.Attributes.Event("DataUploaded")]
public class DataUploadedEvent
{
    [Nethereum.ABI.FunctionEncoding.Attributes.Parameter("string", "recordId", 1, true)]
    public string RecordId { get; set; } = string.Empty;
    
    [Nethereum.ABI.FunctionEncoding.Attributes.Parameter("address", "owner", 2, true)]
    public string Owner { get; set; } = string.Empty;
    
    [Nethereum.ABI.FunctionEncoding.Attributes.Parameter("string", "fileName", 3, false)]
    public string FileName { get; set; } = string.Empty;
    
    [Nethereum.ABI.FunctionEncoding.Attributes.Parameter("uint256", "timestamp", 4, false)]
    public ulong Timestamp { get; set; }
}

// Function output for getRecordsByOwner
[Nethereum.ABI.FunctionEncoding.Attributes.FunctionOutput]
public class GetRecordsByOwnerResult
{
    [Nethereum.ABI.FunctionEncoding.Attributes.Parameter("string[]", "recordIds", 1, false)]
    public string[] RecordIds { get; set; } = Array.Empty<string>();
}


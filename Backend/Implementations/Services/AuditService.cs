using DataTrustNexus.Api.Interfaces;
using DataTrustNexus.Api.Services;
using Nethereum.Web3;
using Nethereum.Web3.Accounts;
using System.Numerics;
using Nethereum.RPC.Eth.DTOs;

namespace DataTrustNexus.Api.Implementations.Services;

/// <summary>
/// Audit service with REAL BlockDAG integration
/// </summary>
public class AuditService : IAuditService
{
    private readonly IConfiguration _configuration;
    private readonly ILogger<AuditService> _logger;
    private readonly string _rpcUrl;
    private readonly string _contractAddress;

    public AuditService(IConfiguration configuration, ILogger<AuditService> logger)
    {
        _configuration = configuration;
        _logger = logger;
        _rpcUrl = configuration["Blockchain:RpcUrl"] ?? throw new Exception("RPC URL not configured");
        _contractAddress = configuration["Blockchain:Contracts:AuditTrailContract"] 
            ?? throw new Exception("AuditTrailContract address not configured");
    }

    public async Task<string> LogActionAsync(int actionType, string targetAddress, string recordId, string actionDetails, string dataHash, bool success, string ipAddress, string userAgent, string privateKey)
    {
        try
        {
            _logger.LogInformation("🚀 Logging audit action: Type {ActionType}", actionType);
            
            var account = new Account(privateKey);
            var web3 = new Web3(account, _rpcUrl);
            var abi = ContractAbiLoader.LoadAbi("AuditTrailContract");
            var contract = web3.Eth.GetContract(abi, _contractAddress);
            var function = contract.GetFunction("createLog");

            var dataHashBytes = System.Text.Encoding.UTF8.GetBytes(dataHash);
            if (dataHashBytes.Length < 32) Array.Resize(ref dataHashBytes, 32);

            var gas = await function.EstimateGasAsync(account.Address, null, null, actionType, targetAddress, recordId, actionDetails, dataHashBytes, success, ipAddress, userAgent);
            var txHash = await function.SendTransactionAsync(account.Address, gas, null, actionType, targetAddress, recordId, actionDetails, dataHashBytes, success, ipAddress, userAgent);

            _logger.LogInformation("✅ Audit log created! TxHash: {TxHash}", txHash);
            return txHash;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "❌ Failed to log action");
            throw new Exception($"BlockDAG error: {ex.Message}", ex);
        }
    }

    public async Task<List<AuditLogEntry>> GetAllAuditLogsAsync(int skip = 0, int take = 50)
    {
        try
        {
            _logger.LogInformation("📖 Querying all audit logs from BlockDAG events...");
            
            var web3 = new Web3(_rpcUrl);
            var abi = ContractAbiLoader.LoadAbi("AuditTrailContract");
            var contract = web3.Eth.GetContract(abi, _contractAddress);
            var auditLogCreatedEvent = contract.GetEvent("AuditLogCreated");

            var filterAll = auditLogCreatedEvent.CreateFilterInput(
                fromBlock: BlockParameter.CreateEarliest(), 
                toBlock: BlockParameter.CreateLatest());

            var allEvents = await auditLogCreatedEvent.GetAllChangesAsync<AuditLogCreatedEvent>(filterAll);

            var logs = new List<AuditLogEntry>();
            foreach (var evt in allEvents)
            {
                var log = await GetAuditLogByIdAsync(evt.Event.LogId);
                if (log != null)
                {
                    logs.Add(log);
                }
            }

            _logger.LogInformation("✅ Found {Count} audit logs", logs.Count);
            return logs.Skip(skip).Take(take).ToList();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "❌ Failed to query audit logs");
            return new List<AuditLogEntry>();
        }
    }

    public async Task<List<AuditLogEntry>> GetAuditLogsByActorAsync(string actorAddress, int skip = 0, int take = 50)
    {
        try
        {
            _logger.LogInformation("📖 Querying audit logs for actor {Actor} from BlockDAG...", actorAddress);
            
            var web3 = new Web3(_rpcUrl);
            var abi = ContractAbiLoader.LoadAbi("AuditTrailContract");
            var contract = web3.Eth.GetContract(abi, _contractAddress);
            var auditLogCreatedEvent = contract.GetEvent("AuditLogCreated");

            var filterAll = auditLogCreatedEvent.CreateFilterInput(
                fromBlock: BlockParameter.CreateEarliest(), 
                toBlock: BlockParameter.CreateLatest());

            var allEvents = await auditLogCreatedEvent.GetAllChangesAsync<AuditLogCreatedEvent>(filterAll);

            var logs = new List<AuditLogEntry>();
            foreach (var evt in allEvents)
            {
                if (evt.Event.Actor.Equals(actorAddress, StringComparison.OrdinalIgnoreCase))
                {
                    var log = await GetAuditLogByIdAsync(evt.Event.LogId);
                    if (log != null)
                    {
                        logs.Add(log);
                    }
                }
            }

            _logger.LogInformation("✅ Found {Count} audit logs for actor", logs.Count);
            return logs.Skip(skip).Take(take).ToList();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "❌ Failed to query audit logs by actor");
            return new List<AuditLogEntry>();
        }
    }

    public async Task<List<AuditLogEntry>> GetAuditLogsByRecordAsync(string recordId, int skip = 0, int take = 50)
    {
        try
        {
            _logger.LogInformation("📖 Querying audit logs for record {RecordId} from BlockDAG...", recordId);
            
            var web3 = new Web3(_rpcUrl);
            var abi = ContractAbiLoader.LoadAbi("AuditTrailContract");
            var contract = web3.Eth.GetContract(abi, _contractAddress);
            var auditLogCreatedEvent = contract.GetEvent("AuditLogCreated");

            var filterAll = auditLogCreatedEvent.CreateFilterInput(
                fromBlock: BlockParameter.CreateEarliest(), 
                toBlock: BlockParameter.CreateLatest());

            var allEvents = await auditLogCreatedEvent.GetAllChangesAsync<AuditLogCreatedEvent>(filterAll);

            var logs = new List<AuditLogEntry>();
            foreach (var evt in allEvents)
            {
                var log = await GetAuditLogByIdAsync(evt.Event.LogId);
                if (log != null && log.RecordId.Equals(recordId, StringComparison.OrdinalIgnoreCase))
                {
                    logs.Add(log);
                }
            }

            _logger.LogInformation("✅ Found {Count} audit logs for record", logs.Count);
            return logs.Skip(skip).Take(take).ToList();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "❌ Failed to query audit logs by record");
            return new List<AuditLogEntry>();
        }
    }

    public async Task<List<AuditLogEntry>> GetAuditLogsByActionTypeAsync(int actionType, int skip = 0, int take = 50)
    {
        try
        {
            _logger.LogInformation("📖 Querying audit logs for action type {ActionType} from BlockDAG...", actionType);
            
            var web3 = new Web3(_rpcUrl);
            var abi = ContractAbiLoader.LoadAbi("AuditTrailContract");
            var contract = web3.Eth.GetContract(abi, _contractAddress);
            var auditLogCreatedEvent = contract.GetEvent("AuditLogCreated");

            var filterAll = auditLogCreatedEvent.CreateFilterInput(
                fromBlock: BlockParameter.CreateEarliest(), 
                toBlock: BlockParameter.CreateLatest());

            var allEvents = await auditLogCreatedEvent.GetAllChangesAsync<AuditLogCreatedEvent>(filterAll);

            var logs = new List<AuditLogEntry>();
            foreach (var evt in allEvents)
            {
                if (evt.Event.ActionType == actionType)
                {
                    var log = await GetAuditLogByIdAsync(evt.Event.LogId);
                    if (log != null)
                    {
                        logs.Add(log);
                    }
                }
            }

            _logger.LogInformation("✅ Found {Count} audit logs for action type", logs.Count);
            return logs.Skip(skip).Take(take).ToList();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "❌ Failed to query audit logs by action type");
            return new List<AuditLogEntry>();
        }
    }

    public async Task<AuditLogEntry?> GetAuditLogByIdAsync(ulong logId)
    {
        try
        {
            var web3 = new Web3(_rpcUrl);
            var abi = ContractAbiLoader.LoadAbi("AuditTrailContract");
            var contract = web3.Eth.GetContract(abi, _contractAddress);
            var function = contract.GetFunction("getAuditLog");

            var result = await function.CallDeserializingToObjectAsync<AuditLogContractData>(new BigInteger(logId));

            return new AuditLogEntry
            {
                LogId = logId,
                ActionType = result.ActionType,
                Actor = result.Actor,
                TargetAddress = result.TargetAddress,
                RecordId = result.RecordId,
                ActionDetails = result.ActionDetails,
                DataHash = System.Text.Encoding.UTF8.GetString(result.DataHash).TrimEnd('\0'),
                Success = result.Success,
                Timestamp = (long)result.Timestamp,
                TimestampFormatted = DateTimeOffset.FromUnixTimeSeconds((long)result.Timestamp).ToString("yyyy-MM-dd HH:mm:ss UTC"),
                IpAddress = result.IpAddress,
                UserAgent = result.UserAgent
            };
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "❌ Failed to get audit log");
            return null;
        }
    }

    public async Task<List<AuditLogEntry>> GetRecentAuditLogsAsync(int count = 50)
    {
        try
        {
            _logger.LogInformation("📖 Fetching recent {Count} audit logs from BlockDAG", count);
            
            var web3 = new Web3(_rpcUrl);
            var abi = ContractAbiLoader.LoadAbi("AuditTrailContract");
            var contract = web3.Eth.GetContract(abi, _contractAddress);
            
            // Get total logs
            var getTotalFunction = contract.GetFunction("getTotalLogs");
            var totalLogs = await getTotalFunction.CallAsync<BigInteger>();
            
            var logs = new List<AuditLogEntry>();
            var startIndex = Math.Max(0, (int)totalLogs - count);
            
            // Get recent logs
            var getLogFunction = contract.GetFunction("getLog");
            for (ulong i = (ulong)startIndex; i < totalLogs; i++)
            {
                try
                {
                    var logData = await getLogFunction.CallDeserializingToObjectAsync<AuditLogContractData>(i);
                    
                    logs.Add(new AuditLogEntry
                    {
                        LogId = i,
                        ActionType = logData.ActionType,
                        Actor = logData.Actor,
                        TargetAddress = logData.TargetAddress,
                        RecordId = logData.RecordId,
                        ActionDetails = logData.ActionDetails,
                        DataHash = logData.DataHash.Length > 0 ? Convert.ToHexString(logData.DataHash) : "",
                        Success = logData.Success,
                        Timestamp = (long)logData.Timestamp,
                        TimestampFormatted = DateTimeOffset.FromUnixTimeSeconds((long)logData.Timestamp).ToString("yyyy-MM-dd HH:mm:ss UTC"),
                        IpAddress = logData.IpAddress,
                        UserAgent = logData.UserAgent
                    });
                }
                catch (Exception ex)
                {
                    _logger.LogWarning(ex, "Failed to get log {LogId}", i);
                }
            }
            
            // Reverse to show most recent first
            logs.Reverse();
            
            _logger.LogInformation("✅ Retrieved {Count} recent audit logs", logs.Count);
            return logs;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "❌ Failed to get recent audit logs");
            return new List<AuditLogEntry>();
        }
    }

    public async Task<AuditStatistics> GetAuditStatisticsAsync(string? startDate = null, string? endDate = null)
    {
        try
        {
            _logger.LogInformation("📊 Fetching audit statistics from BlockDAG");
            
            var web3 = new Web3(_rpcUrl);
            var statistics = new AuditStatistics
            {
                TotalUploads = 0,
                TotalVerifications = 0,
                SuccessfulVerifications = 0,
                FailedVerifications = 0,
                TotalAccessGrants = 0,
                TotalAccessRevocations = 0,
                TotalInstitutions = 0,
                ActionTypeCounts = new Dictionary<string, int>()
            };
            
            // Get total uploads from DataVaultContract (source of truth)
            try
            {
                var dataVaultAddress = _configuration["Blockchain:Contracts:DataVaultContract"];
                _logger.LogInformation("📊 DataVault Contract Address: {Address}", dataVaultAddress);
                
                if (!string.IsNullOrEmpty(dataVaultAddress))
                {
                    var dataVaultAbi = ContractAbiLoader.LoadAbi("DataVaultContract");
                    _logger.LogInformation("📊 DataVault ABI loaded successfully");
                    
                    var dataVaultContract = web3.Eth.GetContract(dataVaultAbi, dataVaultAddress);
                    var getTotalRecordsFunction = dataVaultContract.GetFunction("getTotalRecords");
                    
                    _logger.LogInformation("📊 Calling getTotalRecords() on DataVaultContract...");
                    var totalRecords = await getTotalRecordsFunction.CallAsync<BigInteger>();
                    
                    statistics.TotalUploads = (int)totalRecords;
                    _logger.LogInformation("✅ Total uploads from DataVault: {Count}", totalRecords);
                }
                else
                {
                    _logger.LogWarning("⚠️ DataVaultContract address not found in configuration");
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "❌ Failed to get upload count from DataVault");
            }
            
            // Get actual institution count from InstitutionRegistry contract
            try
            {
                var institutionRegistryAddress = _configuration["Blockchain:Contracts:InstitutionRegistry"];
                if (!string.IsNullOrEmpty(institutionRegistryAddress))
                {
                    var institutionAbi = ContractAbiLoader.LoadAbi("InstitutionRegistry");
                    var institutionContract = web3.Eth.GetContract(institutionAbi, institutionRegistryAddress);
                    var getTotalInstitutionsFunction = institutionContract.GetFunction("getTotalInstitutions");
                    var institutionCount = await getTotalInstitutionsFunction.CallAsync<BigInteger>();
                    statistics.TotalInstitutions = (int)institutionCount;
                    _logger.LogInformation("📊 Total institutions from registry: {Count}", institutionCount);
                }
            }
            catch (Exception ex)
            {
                _logger.LogWarning(ex, "Failed to get institution count from registry");
            }
            
            // Get other audit statistics from AuditTrailContract
            var abi = ContractAbiLoader.LoadAbi("AuditTrailContract");
            var contract = web3.Eth.GetContract(abi, _contractAddress);
            
            // Get logs by action type for verifications and access control
            var actionTypes = new[] { 0, 1, 2, 3, 4, 5 };
            foreach (var actionType in actionTypes)
            {
                try
                {
                    var getLogsFunction = contract.GetFunction("getLogsByActionType");
                    var logIds = await getLogsFunction.CallAsync<List<BigInteger>>(actionType);
                    
                    var actionName = GetActionTypeName(actionType);
                    statistics.ActionTypeCounts[actionName] = logIds.Count;
                    
                    // Count specific actions (excluding DATA_UPLOADED since we get it from DataVault)
                    switch (actionType)
                    {
                        case 4: // VERIFICATION_REQUESTED
                        case 5: // VERIFICATION_COMPLETED
                            statistics.TotalVerifications += logIds.Count;
                            break;
                        case 2: // ACCESS_GRANTED
                            statistics.TotalAccessGrants = logIds.Count;
                            break;
                        case 3: // ACCESS_REVOKED
                            statistics.TotalAccessRevocations = logIds.Count;
                            break;
                    }
                }
                catch (Exception ex)
                {
                    _logger.LogWarning(ex, "Failed to get logs for action type {ActionType}", actionType);
                }
            }
            
            _logger.LogInformation("✅ Retrieved audit statistics");
            return statistics;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "❌ Failed to get audit statistics");
            return new AuditStatistics();
        }
    }

    private string GetActionTypeName(int actionType)
    {
        return actionType switch
        {
            0 => "INSTITUTION_REGISTERED",
            1 => "DATA_UPLOADED",
            2 => "ACCESS_GRANTED",
            3 => "ACCESS_REVOKED",
            4 => "VERIFICATION_REQUESTED",
            5 => "VERIFICATION_COMPLETED",
            6 => "DATA_ACCESSED",
            7 => "DATA_DOWNLOADED",
            8 => "PERMISSION_UPDATED",
            9 => "RECORD_DEACTIVATED",
            10 => "RECORD_REACTIVATED",
            _ => "UNKNOWN"
        };
    }
}

[Nethereum.ABI.FunctionEncoding.Attributes.FunctionOutput]
public class AuditLogContractData
{
    [Nethereum.ABI.FunctionEncoding.Attributes.Parameter("uint8", "actionType", 1, false)]
    public int ActionType { get; set; }
    
    [Nethereum.ABI.FunctionEncoding.Attributes.Parameter("address", "actor", 2, false)]
    public string Actor { get; set; } = string.Empty;
    
    [Nethereum.ABI.FunctionEncoding.Attributes.Parameter("address", "targetAddress", 3, false)]
    public string TargetAddress { get; set; } = string.Empty;
    
    [Nethereum.ABI.FunctionEncoding.Attributes.Parameter("string", "recordId", 4, false)]
    public string RecordId { get; set; } = string.Empty;
    
    [Nethereum.ABI.FunctionEncoding.Attributes.Parameter("string", "actionDetails", 5, false)]
    public string ActionDetails { get; set; } = string.Empty;
    
    [Nethereum.ABI.FunctionEncoding.Attributes.Parameter("bytes32", "dataHash", 6, false)]
    public byte[] DataHash { get; set; } = Array.Empty<byte>();
    
    [Nethereum.ABI.FunctionEncoding.Attributes.Parameter("bool", "success", 7, false)]
    public bool Success { get; set; }
    
    [Nethereum.ABI.FunctionEncoding.Attributes.Parameter("uint256", "timestamp", 8, false)]
    public BigInteger Timestamp { get; set; }
    
    [Nethereum.ABI.FunctionEncoding.Attributes.Parameter("string", "ipAddress", 9, false)]
    public string IpAddress { get; set; } = string.Empty;
    
    [Nethereum.ABI.FunctionEncoding.Attributes.Parameter("string", "userAgent", 10, false)]
    public string UserAgent { get; set; } = string.Empty;
}

// Event DTO for AuditLogCreated
[Nethereum.ABI.FunctionEncoding.Attributes.Event("AuditLogCreated")]
public class AuditLogCreatedEvent
{
    [Nethereum.ABI.FunctionEncoding.Attributes.Parameter("uint256", "logId", 1, true)]
    public ulong LogId { get; set; }
    
    [Nethereum.ABI.FunctionEncoding.Attributes.Parameter("address", "actor", 2, true)]
    public string Actor { get; set; } = string.Empty;
    
    [Nethereum.ABI.FunctionEncoding.Attributes.Parameter("uint8", "actionType", 3, false)]
    public int ActionType { get; set; }
    
    [Nethereum.ABI.FunctionEncoding.Attributes.Parameter("uint256", "timestamp", 4, false)]
    public BigInteger Timestamp { get; set; }
}


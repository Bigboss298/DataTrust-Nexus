using DataTrustNexus.Api.Interfaces;
using DataTrustNexus.Api.Services;
using Nethereum.Web3;
using Nethereum.Web3.Accounts;
using System.Numerics;
using Nethereum.RPC.Eth.DTOs;

namespace DataTrustNexus.Api.Implementations.Services;

/// <summary>
/// Access service with REAL BlockDAG integration
/// </summary>
public class AccessService : IAccessService
{
    private readonly IConfiguration _configuration;
    private readonly ILogger<AccessService> _logger;
    private readonly string _rpcUrl;
    private readonly string _contractAddress;

    public AccessService(IConfiguration configuration, ILogger<AccessService> logger)
    {
        _configuration = configuration;
        _logger = logger;
        _rpcUrl = configuration["Blockchain:RpcUrl"] ?? throw new Exception("RPC URL not configured");
        _contractAddress = configuration["Blockchain:Contracts:AccessControlContract"] 
            ?? throw new Exception("AccessControlContract address not configured");
    }

    public async Task<string> GrantAccessAsync(string recordId, string granteeAddress, long expiresAt, string permissionType, string grantReason, string privateKey)
    {
        try
        {
            _logger.LogInformation("🚀 Granting access to: {Grantee}", granteeAddress);
            
            var account = new Account(privateKey);
            var web3 = new Web3(account, _rpcUrl);
            var abi = ContractAbiLoader.LoadAbi("AccessControlContract");
            var contract = web3.Eth.GetContract(abi, _contractAddress);
            var function = contract.GetFunction("grantAccess");

            var gas = await function.EstimateGasAsync(account.Address, null, null, recordId, granteeAddress, new BigInteger(expiresAt), permissionType, grantReason);
            var txHash = await function.SendTransactionAsync(account.Address, gas, null, recordId, granteeAddress, new BigInteger(expiresAt), permissionType, grantReason);

            _logger.LogInformation("✅ Access granted! TxHash: {TxHash}", txHash);
            return txHash;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "❌ Failed to grant access");
            throw new Exception($"BlockDAG error: {ex.Message}", ex);
        }
    }

    public async Task<string> RevokeAccessAsync(string recordId, string granteeAddress, string privateKey)
    {
        try
        {
            _logger.LogInformation("🚀 Revoking access from: {Grantee}", granteeAddress);
            
            var account = new Account(privateKey);
            var web3 = new Web3(account, _rpcUrl);
            var abi = ContractAbiLoader.LoadAbi("AccessControlContract");
            var contract = web3.Eth.GetContract(abi, _contractAddress);
            var function = contract.GetFunction("revokeAccess");

            var gas = await function.EstimateGasAsync(account.Address, null, null, recordId, granteeAddress);
            var txHash = await function.SendTransactionAsync(account.Address, gas, null, recordId, granteeAddress);

            _logger.LogInformation("✅ Access revoked! TxHash: {TxHash}", txHash);
            return txHash;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "❌ Failed to revoke access");
            throw new Exception($"BlockDAG error: {ex.Message}", ex);
        }
    }

    public async Task<string> UpdatePermissionAsync(string recordId, string granteeAddress, long newExpiresAt, string privateKey)
    {
        try
        {
            _logger.LogInformation("🚀 Updating permission for: {Grantee}", granteeAddress);
            
            var account = new Account(privateKey);
            var web3 = new Web3(account, _rpcUrl);
            var abi = ContractAbiLoader.LoadAbi("AccessControlContract");
            var contract = web3.Eth.GetContract(abi, _contractAddress);
            var function = contract.GetFunction("updatePermission");

            var gas = await function.EstimateGasAsync(account.Address, null, null, recordId, granteeAddress, new BigInteger(newExpiresAt));
            var txHash = await function.SendTransactionAsync(account.Address, gas, null, recordId, granteeAddress, new BigInteger(newExpiresAt));

            _logger.LogInformation("✅ Permission updated! TxHash: {TxHash}", txHash);
            return txHash;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "❌ Failed to update permission");
            throw new Exception($"BlockDAG error: {ex.Message}", ex);
        }
    }

    public async Task<List<AccessPermission>> GetAccessPermissionsForRecordAsync(string recordId)
    {
        try
        {
            _logger.LogInformation("📖 Querying access permissions for record {RecordId} from BlockDAG...", recordId);
            
            var web3 = new Web3(_rpcUrl);
            var abi = ContractAbiLoader.LoadAbi("AccessControlContract");
            var contract = web3.Eth.GetContract(abi, _contractAddress);
            var accessGrantedEvent = contract.GetEvent("AccessGranted");

            var filterAll = accessGrantedEvent.CreateFilterInput(
                fromBlock: BlockParameter.CreateEarliest(), 
                toBlock: BlockParameter.CreateLatest());

            var allEvents = await accessGrantedEvent.GetAllChangesAsync<AccessGrantedEvent>(filterAll);

            var permissions = new List<AccessPermission>();
            foreach (var evt in allEvents)
            {
                if (evt.Event.RecordId.Equals(recordId, StringComparison.OrdinalIgnoreCase))
                {
                    var permission = await GetSpecificPermissionAsync(recordId, evt.Event.Grantee);
                    if (permission != null && permission.IsActive)
                    {
                        permissions.Add(permission);
                    }
                }
            }

            _logger.LogInformation("✅ Found {Count} active permissions for record", permissions.Count);
            return permissions;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "❌ Failed to query permissions for record");
            return new List<AccessPermission>();
        }
    }

    public async Task<List<AccessPermission>> GetAccessPermissionsForUserAsync(string userAddress)
    {
        try
        {
            _logger.LogInformation("📖 Querying access permissions for user {User} from BlockDAG...", userAddress);
            
            var web3 = new Web3(_rpcUrl);
            var abi = ContractAbiLoader.LoadAbi("AccessControlContract");
            var contract = web3.Eth.GetContract(abi, _contractAddress);
            var accessGrantedEvent = contract.GetEvent("AccessGranted");

            var filterAll = accessGrantedEvent.CreateFilterInput(
                fromBlock: BlockParameter.CreateEarliest(), 
                toBlock: BlockParameter.CreateLatest());

            var allEvents = await accessGrantedEvent.GetAllChangesAsync<AccessGrantedEvent>(filterAll);

            var permissions = new List<AccessPermission>();
            foreach (var evt in allEvents)
            {
                if (evt.Event.Grantee.Equals(userAddress, StringComparison.OrdinalIgnoreCase))
                {
                    var permission = await GetSpecificPermissionAsync(evt.Event.RecordId, evt.Event.Grantee);
                    if (permission != null && permission.IsActive)
                    {
                        permissions.Add(permission);
                    }
                }
            }

            _logger.LogInformation("✅ Found {Count} active permissions for user", permissions.Count);
            return permissions;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "❌ Failed to query permissions for user");
            return new List<AccessPermission>();
        }
    }

    public async Task<List<AccessPermission>> GetGrantedPermissionsAsync(string ownerAddress)
    {
        try
        {
            _logger.LogInformation("📖 Querying granted permissions for owner {Owner} from BlockDAG...", ownerAddress);
            
            var web3 = new Web3(_rpcUrl);
            var abi = ContractAbiLoader.LoadAbi("AccessControlContract");
            var contract = web3.Eth.GetContract(abi, _contractAddress);
            var accessGrantedEvent = contract.GetEvent("AccessGranted");

            var filterAll = accessGrantedEvent.CreateFilterInput(
                fromBlock: BlockParameter.CreateEarliest(), 
                toBlock: BlockParameter.CreateLatest());

            var allEvents = await accessGrantedEvent.GetAllChangesAsync<AccessGrantedEvent>(filterAll);

            var permissions = new List<AccessPermission>();
            foreach (var evt in allEvents)
            {
                if (evt.Event.Owner.Equals(ownerAddress, StringComparison.OrdinalIgnoreCase))
                {
                    var permission = await GetSpecificPermissionAsync(evt.Event.RecordId, evt.Event.Grantee);
                    if (permission != null && permission.IsActive)
                    {
                        permissions.Add(permission);
                    }
                }
            }

            _logger.LogInformation("✅ Found {Count} active granted permissions for owner", permissions.Count);
            return permissions;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "❌ Failed to query granted permissions");
            return new List<AccessPermission>();
        }
    }

    public async Task<List<AccessPermission>> GetReceivedPermissionsAsync(string granteeAddress)
    {
        try
        {
            _logger.LogInformation("📖 Querying received permissions for grantee {Grantee} from BlockDAG...", granteeAddress);
            
            var web3 = new Web3(_rpcUrl);
            var abi = ContractAbiLoader.LoadAbi("AccessControlContract");
            var contract = web3.Eth.GetContract(abi, _contractAddress);
            var accessGrantedEvent = contract.GetEvent("AccessGranted");

            var filterAll = accessGrantedEvent.CreateFilterInput(
                fromBlock: BlockParameter.CreateEarliest(), 
                toBlock: BlockParameter.CreateLatest());

            var allEvents = await accessGrantedEvent.GetAllChangesAsync<AccessGrantedEvent>(filterAll);

            var permissions = new List<AccessPermission>();
            foreach (var evt in allEvents)
            {
                if (evt.Event.Grantee.Equals(granteeAddress, StringComparison.OrdinalIgnoreCase))
                {
                    var permission = await GetSpecificPermissionAsync(evt.Event.RecordId, evt.Event.Grantee);
                    if (permission != null && permission.IsActive)
                    {
                        permissions.Add(permission);
                    }
                }
            }

            _logger.LogInformation("✅ Found {Count} active received permissions for grantee", permissions.Count);
            return permissions;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "❌ Failed to query received permissions");
            return new List<AccessPermission>();
        }
    }

    public async Task<bool> CheckAccessAsync(string recordId, string userAddress)
    {
        try
        {
            var web3 = new Web3(_rpcUrl);
            var abi = ContractAbiLoader.LoadAbi("AccessControlContract");
            var contract = web3.Eth.GetContract(abi, _contractAddress);
            var function = contract.GetFunction("hasAccess");

            var result = await function.CallAsync<bool>(recordId, userAddress);
            return result;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "❌ Failed to check access");
            return false;
        }
    }

    public async Task<AccessPermission?> GetSpecificPermissionAsync(string recordId, string granteeAddress)
    {
        try
        {
            var web3 = new Web3(_rpcUrl);
            var abi = ContractAbiLoader.LoadAbi("AccessControlContract");
            var contract = web3.Eth.GetContract(abi, _contractAddress);
            var function = contract.GetFunction("getPermission");

            var result = await function.CallDeserializingToObjectAsync<AccessPermissionContractData>(recordId, granteeAddress);

            return new AccessPermission
            {
                RecordId = recordId,
                Owner = result.Owner,
                Grantee = granteeAddress,
                PermissionType = result.PermissionType,
                GrantReason = result.GrantReason,
                GrantedAt = (long)result.GrantedAt,
                GrantedAtFormatted = DateTimeOffset.FromUnixTimeSeconds((long)result.GrantedAt).ToString("yyyy-MM-dd HH:mm:ss UTC"),
                ExpiresAt = (long)result.ExpiresAt,
                ExpiresAtFormatted = DateTimeOffset.FromUnixTimeSeconds((long)result.ExpiresAt).ToString("yyyy-MM-dd HH:mm:ss UTC"),
                IsActive = result.IsActive
            };
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "❌ Failed to get permission");
            return null;
        }
    }
}

[Nethereum.ABI.FunctionEncoding.Attributes.FunctionOutput]
public class AccessPermissionContractData
{
    [Nethereum.ABI.FunctionEncoding.Attributes.Parameter("address", "owner", 1, false)]
    public string Owner { get; set; } = string.Empty;
    
    [Nethereum.ABI.FunctionEncoding.Attributes.Parameter("string", "permissionType", 2, false)]
    public string PermissionType { get; set; } = string.Empty;
    
    [Nethereum.ABI.FunctionEncoding.Attributes.Parameter("string", "grantReason", 3, false)]
    public string GrantReason { get; set; } = string.Empty;
    
    [Nethereum.ABI.FunctionEncoding.Attributes.Parameter("uint256", "grantedAt", 4, false)]
    public BigInteger GrantedAt { get; set; }
    
    [Nethereum.ABI.FunctionEncoding.Attributes.Parameter("uint256", "expiresAt", 5, false)]
    public BigInteger ExpiresAt { get; set; }
    
    [Nethereum.ABI.FunctionEncoding.Attributes.Parameter("bool", "isActive", 6, false)]
    public bool IsActive { get; set; }
}

// Event DTO for AccessGranted
[Nethereum.ABI.FunctionEncoding.Attributes.Event("AccessGranted")]
public class AccessGrantedEvent
{
    [Nethereum.ABI.FunctionEncoding.Attributes.Parameter("string", "recordId", 1, true)]
    public string RecordId { get; set; } = string.Empty;
    
    [Nethereum.ABI.FunctionEncoding.Attributes.Parameter("address", "owner", 2, true)]
    public string Owner { get; set; } = string.Empty;
    
    [Nethereum.ABI.FunctionEncoding.Attributes.Parameter("address", "grantee", 3, true)]
    public string Grantee { get; set; } = string.Empty;
    
    [Nethereum.ABI.FunctionEncoding.Attributes.Parameter("string", "permissionType", 4, false)]
    public string PermissionType { get; set; } = string.Empty;
    
    [Nethereum.ABI.FunctionEncoding.Attributes.Parameter("uint256", "expiresAt", 5, false)]
    public BigInteger ExpiresAt { get; set; }
}


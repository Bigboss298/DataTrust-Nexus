using DataTrustNexus.Api.Interfaces;
using DataTrustNexus.Api.Services;
using Nethereum.Web3;
using Nethereum.Web3.Accounts;
using Nethereum.Contracts;
using Nethereum.RPC.Eth.DTOs;
using System.Numerics;

namespace DataTrustNexus.Api.Implementations.Services;

/// <summary>
/// Institution service with REAL BlockDAG integration
/// </summary>
public class InstitutionService : IInstitutionService
{
    private readonly IConfiguration _configuration;
    private readonly ILogger<InstitutionService> _logger;
    private readonly string _rpcUrl;
    private readonly string _contractAddress;

    public InstitutionService(IConfiguration configuration, ILogger<InstitutionService> logger)
    {
        _configuration = configuration;
        _logger = logger;
        _rpcUrl = configuration["Blockchain:RpcUrl"] ?? throw new Exception("RPC URL not configured");
        _contractAddress = configuration["Blockchain:Contracts:InstitutionRegistry"] 
            ?? throw new Exception("InstitutionRegistry address not configured");
    }

    public async Task<string> RegisterInstitutionAsync(string name, string institutionType, string registrationNumber, string metadataUri, string walletAddress)
    {
        try
        {
            _logger.LogInformation("🚀 Registering institution: {Name} for wallet {Wallet}", name, walletAddress);
            
            // Use server-side wallet for blockchain transactions
            var serverPrivateKey = _configuration["Blockchain:ServerPrivateKey"] 
                ?? throw new Exception("Server private key not configured");
            
            var account = new Account(serverPrivateKey);
            var web3 = new Web3(account, _rpcUrl);
            var abi = ContractAbiLoader.LoadAbi("InstitutionRegistry");
            var contract = web3.Eth.GetContract(abi, _contractAddress);
            var function = contract.GetFunction("registerInstitution");

            var gas = await function.EstimateGasAsync(account.Address, null, null, name, institutionType, registrationNumber, metadataUri);
            var txHash = await function.SendTransactionAsync(account.Address, gas, null, name, institutionType, registrationNumber, metadataUri);

            _logger.LogInformation("✅ Institution registered! TxHash: {TxHash}", txHash);
            return txHash;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "❌ Failed to register institution");
            throw new Exception($"BlockDAG error: {ex.Message}", ex);
        }
    }

    public async Task<bool> VerifySignatureAsync(string walletAddress, string signature, string name, string institutionType, string registrationNumber)
    {
        try
        {
            _logger.LogInformation("🔐 Verifying signature for wallet {Wallet}", walletAddress);
            
            // Create the message that should have been signed
            var message = $"Register Institution: {name}|{institutionType}|{registrationNumber}|{walletAddress}";
            
            // Verify the signature using Nethereum EthereumMessageSigner
            // HashMessageUTF8 adds the Ethereum message prefix automatically for personal_sign
            var signer = new Nethereum.Signer.EthereumMessageSigner();
            var recoveredAddress = signer.EncodeUTF8AndEcRecover(message, signature);
            
            var isValid = recoveredAddress.ToLower() == walletAddress.ToLower();
            
            _logger.LogInformation("🔐 Signature verification result: {IsValid} (Expected: {Expected}, Recovered: {Recovered})", 
                isValid, walletAddress.ToLower(), recoveredAddress.ToLower());
            
            if (!isValid)
            {
                _logger.LogWarning("🔐 Signature mismatch - Message: {Message}", message);
            }
            
            return isValid;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "❌ Failed to verify signature");
            return false;
        }
    }

    public async Task<string> UpdateInstitutionAsync(string walletAddress, string name, string metadataUri, string privateKey)
    {
        try
        {
            _logger.LogInformation("🚀 Updating institution: {Wallet}", walletAddress);
            
            var account = new Account(privateKey);
            var web3 = new Web3(account, _rpcUrl);
            var abi = ContractAbiLoader.LoadAbi("InstitutionRegistry");
            var contract = web3.Eth.GetContract(abi, _contractAddress);
            var function = contract.GetFunction("updateInstitution");

            var gas = await function.EstimateGasAsync(account.Address, null, null, name, metadataUri);
            var txHash = await function.SendTransactionAsync(account.Address, gas, null, name, metadataUri);

            _logger.LogInformation("✅ Institution updated! TxHash: {TxHash}", txHash);
            return txHash;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "❌ Failed to update institution");
            throw new Exception($"BlockDAG error: {ex.Message}", ex);
        }
    }

    public async Task<string> DeactivateInstitutionAsync(string walletAddress, string privateKey)
    {
        try
        {
            _logger.LogInformation("🚀 Deactivating institution: {Wallet}", walletAddress);
            
            var account = new Account(privateKey);
            var web3 = new Web3(account, _rpcUrl);
            var abi = ContractAbiLoader.LoadAbi("InstitutionRegistry");
            var contract = web3.Eth.GetContract(abi, _contractAddress);
            var function = contract.GetFunction("deactivateInstitution");

            var gas = await function.EstimateGasAsync(account.Address, null, null, walletAddress);
            var txHash = await function.SendTransactionAsync(account.Address, gas, null, walletAddress);

            _logger.LogInformation("✅ Institution deactivated! TxHash: {TxHash}", txHash);
            return txHash;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "❌ Failed to deactivate institution");
            throw new Exception($"BlockDAG error: {ex.Message}", ex);
        }
    }

    public async Task<InstitutionData?> GetInstitutionAsync(string walletAddress)
    {
        try
        {
            _logger.LogInformation("📖 Reading institution from BlockDAG: {Wallet}", walletAddress);
            
            var web3 = new Web3(_rpcUrl);
            var abi = ContractAbiLoader.LoadAbi("InstitutionRegistry");
            var contract = web3.Eth.GetContract(abi, _contractAddress);
            var function = contract.GetFunction("getInstitution");

            var result = await function.CallDeserializingToObjectAsync<InstitutionContractData>(walletAddress);

            return new InstitutionData
            {
                Name = result.Name,
                InstitutionType = result.InstitutionType,
                RegistrationNumber = result.RegistrationNumber,
                WalletAddress = result.WalletAddress,
                MetadataUri = result.MetadataUri,
                RegisteredAt = (long)result.RegisteredAt,
                RegisteredAtFormatted = DateTimeOffset.FromUnixTimeSeconds((long)result.RegisteredAt).ToString("yyyy-MM-dd HH:mm:ss UTC"),
                IsActive = result.IsActive,
                IsVerified = result.IsActive // Verified = Active
            };
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "❌ Failed to get institution");
            return null;
        }
    }

    public async Task<List<InstitutionData>> GetAllInstitutionsAsync()
    {
        try
        {
            _logger.LogInformation("📖 Querying all institutions from BlockDAG...");
            
            var web3 = new Web3(_rpcUrl);
            var abi = ContractAbiLoader.LoadAbi("InstitutionRegistry");
            var contract = web3.Eth.GetContract(abi, _contractAddress);
            
            // Get total count
            var getTotalFunction = contract.GetFunction("getTotalInstitutions");
            var totalCount = await getTotalFunction.CallAsync<BigInteger>();
            
            _logger.LogInformation("Found {Count} total institutions", totalCount);
            
            var institutions = new List<InstitutionData>();
            
            // Get each institution by index
            var getByIndexFunction = contract.GetFunction("getInstitutionByIndex");
            for (int i = 0; i < (int)totalCount; i++)
            {
                try
                {
                    var walletAddress = await getByIndexFunction.CallAsync<string>(i);
                    var institution = await GetInstitutionAsync(walletAddress);
                    if (institution != null)
                    {
                        institutions.Add(institution);
                    }
                }
                catch (Exception ex)
                {
                    _logger.LogWarning(ex, "Failed to get institution at index {Index}", i);
                }
            }

            _logger.LogInformation("✅ Retrieved {Count} institutions", institutions.Count);
            return institutions;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "❌ Failed to query institutions");
            return new List<InstitutionData>();
        }
    }

    public async Task<bool> IsInstitutionVerifiedAsync(string walletAddress)
    {
        try
        {
            var web3 = new Web3(_rpcUrl);
            var abi = ContractAbiLoader.LoadAbi("InstitutionRegistry");
            var contract = web3.Eth.GetContract(abi, _contractAddress);
            var function = contract.GetFunction("verifyInstitution");

            var result = await function.CallAsync<bool>(walletAddress);
            return result;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "❌ Failed to verify institution");
            return false;
        }
    }
}

[Nethereum.ABI.FunctionEncoding.Attributes.FunctionOutput]
public class InstitutionContractData
{
    [Nethereum.ABI.FunctionEncoding.Attributes.Parameter("string", "name", 1, false)]
    public string Name { get; set; } = string.Empty;
    
    [Nethereum.ABI.FunctionEncoding.Attributes.Parameter("string", "institutionType", 2, false)]
    public string InstitutionType { get; set; } = string.Empty;
    
    [Nethereum.ABI.FunctionEncoding.Attributes.Parameter("string", "registrationNumber", 3, false)]
    public string RegistrationNumber { get; set; } = string.Empty;
    
    [Nethereum.ABI.FunctionEncoding.Attributes.Parameter("address", "walletAddress", 4, false)]
    public string WalletAddress { get; set; } = string.Empty;
    
    [Nethereum.ABI.FunctionEncoding.Attributes.Parameter("uint256", "registeredAt", 5, false)]
    public ulong RegisteredAt { get; set; }
    
    [Nethereum.ABI.FunctionEncoding.Attributes.Parameter("bool", "isActive", 6, false)]
    public bool IsActive { get; set; }
    
    [Nethereum.ABI.FunctionEncoding.Attributes.Parameter("string", "metadataURI", 7, false)]
    public string MetadataUri { get; set; } = string.Empty;
}



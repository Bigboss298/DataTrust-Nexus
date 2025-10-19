namespace DataTrustNexus.Api.Interfaces;

/// <summary>
/// Service for institution management on BlockDAG
/// </summary>
public interface IInstitutionService
{
    // WRITE OPERATIONS
    Task<string> RegisterInstitutionAsync(string name, string institutionType, string registrationNumber, string metadataUri, string privateKey);
    Task<string> UpdateInstitutionAsync(string walletAddress, string name, string metadataUri, string privateKey);
    Task<string> DeactivateInstitutionAsync(string walletAddress, string privateKey);
    
    // READ OPERATIONS
    Task<InstitutionData?> GetInstitutionAsync(string walletAddress);
    Task<List<InstitutionData>> GetAllInstitutionsAsync();
    Task<bool> IsInstitutionVerifiedAsync(string walletAddress);
}

public class InstitutionData
{
    public string Name { get; set; } = string.Empty;
    public string InstitutionType { get; set; } = string.Empty;
    public string RegistrationNumber { get; set; } = string.Empty;
    public string WalletAddress { get; set; } = string.Empty;
    public string MetadataUri { get; set; } = string.Empty;
    public long RegisteredAt { get; set; }
    public string RegisteredAtFormatted { get; set; } = string.Empty;
    public bool IsActive { get; set; }
    public bool IsVerified { get; set; }
}


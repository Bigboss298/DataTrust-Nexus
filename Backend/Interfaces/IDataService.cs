namespace DataTrustNexus.Api.Interfaces;

/// <summary>
/// Service for data vault operations on BlockDAG
/// </summary>
public interface IDataService
{
    // WRITE OPERATIONS
    Task<string> UploadDataAsync(string recordId, string dataHash, string fileName, string fileType, long fileSize, string ipfsHash, string encryptionAlgorithm, string category, string metadataUri, string privateKey);
    Task<string> UpdateDataMetadataAsync(string recordId, string metadataUri, string privateKey);
    Task<string> DeactivateDataAsync(string recordId, string privateKey);
    
    // READ OPERATIONS
    Task<DataRecordInfo?> GetDataRecordAsync(string recordId);
    Task<List<DataRecordInfo>> GetAllDataRecordsAsync();
    Task<List<DataRecordInfo>> GetDataRecordsByOwnerAsync(string ownerAddress);
    Task<string[]> GetRecordIdsByOwnerAsync(string ownerAddress);
    Task<bool> VerifyDataIntegrityAsync(string recordId, string dataHash);
}

public class DataRecordInfo
{
    public string RecordId { get; set; } = string.Empty;
    public string DataHash { get; set; } = string.Empty;
    public string Owner { get; set; } = string.Empty;
    public string FileName { get; set; } = string.Empty;
    public string FileType { get; set; } = string.Empty;
    public long FileSize { get; set; }
    public string IpfsHash { get; set; } = string.Empty;
    public string EncryptionAlgorithm { get; set; } = string.Empty;
    public string Category { get; set; } = string.Empty;
    public string MetadataUri { get; set; } = string.Empty;
    public long UploadedAt { get; set; }
    public string UploadedAtFormatted { get; set; } = string.Empty;
    public bool IsActive { get; set; }
}


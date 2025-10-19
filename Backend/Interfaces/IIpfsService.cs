namespace DataTrustNexus.Api.Interfaces;

/// <summary>
/// Service interface for IPFS operations
/// </summary>
public interface IIpfsService
{
    /// <summary>
    /// Upload file to IPFS
    /// </summary>
    Task<string> UploadFileAsync(byte[] fileData, string fileName);
    
    /// <summary>
    /// Upload file to IPFS from stream
    /// </summary>
    Task<string> UploadFileAsync(Stream fileStream, string fileName);
    
    /// <summary>
    /// Download file from IPFS
    /// </summary>
    Task<byte[]> DownloadFileAsync(string ipfsHash);
    
    /// <summary>
    /// Download file from IPFS as stream
    /// </summary>
    Task<Stream> DownloadFileStreamAsync(string ipfsHash);
    
    /// <summary>
    /// Check if file exists in IPFS
    /// </summary>
    Task<bool> FileExistsAsync(string ipfsHash);
    
    /// <summary>
    /// Upload JSON metadata to IPFS
    /// </summary>
    Task<string> UploadMetadataAsync(object metadata);
    
    /// <summary>
    /// Get file info from IPFS
    /// </summary>
    Task<IpfsFileInfo?> GetFileInfoAsync(string ipfsHash);
}

/// <summary>
/// IPFS file information
/// </summary>
public class IpfsFileInfo
{
    public string Hash { get; set; } = string.Empty;
    public long Size { get; set; }
    public string Type { get; set; } = string.Empty;
}


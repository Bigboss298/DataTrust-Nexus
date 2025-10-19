namespace DataTrustNexus.Api.Interfaces;

/// <summary>
/// Service for Azure Blob Storage operations
/// </summary>
public interface IBlobStorageService
{
    Task<string> UploadAsync(byte[] encryptedFile, string fileName);
    Task<byte[]> DownloadAsync(string fileUrl);
    Task<bool> DeleteAsync(string fileName);
    Task<bool> FileExistsAsync(string fileName);
}


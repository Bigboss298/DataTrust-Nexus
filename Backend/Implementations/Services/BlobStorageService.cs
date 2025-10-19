using Azure.Storage.Blobs;
using Azure.Storage.Blobs.Models;
using DataTrustNexus.Api.Interfaces;

namespace DataTrustNexus.Api.Implementations.Services;

/// <summary>
/// Azure Blob Storage service for encrypted file storage
/// </summary>
public class BlobStorageService : IBlobStorageService
{
    private readonly BlobServiceClient _blobServiceClient;
    private readonly string _containerName;
    private readonly ILogger<BlobStorageService> _logger;
    
    public BlobStorageService(IConfiguration configuration, ILogger<BlobStorageService> logger)
    {
        _logger = logger;
        
        var connectionString = configuration["AzureStorage:ConnectionString"] 
            ?? throw new InvalidOperationException("Azure Storage connection string not configured");
        
        _containerName = configuration["AzureStorage:ContainerName"] ?? "datatrust-nexus-files";
        
        _blobServiceClient = new BlobServiceClient(connectionString);
        
        _ = EnsureContainerExistsAsync();
    }
    
    private async Task EnsureContainerExistsAsync()
    {
        try
        {
            var containerClient = _blobServiceClient.GetBlobContainerClient(_containerName);
            await containerClient.CreateIfNotExistsAsync();
            _logger.LogInformation("✅ Azure Blob container '{ContainerName}' ready", _containerName);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "❌ Failed to create blob container");
        }
    }
    
    public async Task<string> UploadAsync(byte[] encryptedFile, string fileName)
    {
        try
        {
            _logger.LogInformation("📤 Uploading file to Azure Blob: {FileName}", fileName);
            
            var containerClient = _blobServiceClient.GetBlobContainerClient(_containerName);
            var blobClient = containerClient.GetBlobClient(fileName);
            
            using var stream = new MemoryStream(encryptedFile);
            await blobClient.UploadAsync(stream, overwrite: true);
            
            var url = blobClient.Uri.ToString();
            _logger.LogInformation("✅ File uploaded successfully: {Url}", url);
            
            return url;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "❌ Failed to upload file to Azure Blob");
            throw new Exception($"Azure Blob upload failed: {ex.Message}", ex);
        }
    }
    
    public async Task<byte[]> DownloadAsync(string fileUrl)
    {
        try
        {
            _logger.LogInformation("📥 Downloading file from Azure Blob: {Url}", fileUrl);
            
            // Extract blob name from URL
            var uri = new Uri(fileUrl);
            var blobName = uri.Segments[^1]; // Get last segment (filename)
            
            var containerClient = _blobServiceClient.GetBlobContainerClient(_containerName);
            var blobClient = containerClient.GetBlobClient(blobName);
            
            using var memoryStream = new MemoryStream();
            await blobClient.DownloadToAsync(memoryStream);
            memoryStream.Position = 0; // Reset position for reading
            
            _logger.LogInformation("✅ File downloaded successfully");
            
            return memoryStream.ToArray();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "❌ Failed to download file from Azure Blob");
            throw new Exception($"Azure Blob download failed: {ex.Message}", ex);
        }
    }
    
    public async Task<bool> DeleteAsync(string fileName)
    {
        try
        {
            _logger.LogInformation("🗑️ Deleting file from Azure Blob: {FileName}", fileName);
            
            var containerClient = _blobServiceClient.GetBlobContainerClient(_containerName);
            var blobClient = containerClient.GetBlobClient(fileName);
            
            var result = await blobClient.DeleteIfExistsAsync();
            
            
            return result;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "❌ Failed to delete file from Azure Blob");
            throw new Exception($"Azure Blob delete failed: {ex.Message}", ex);
        }
    }
    
    public async Task<bool> FileExistsAsync(string fileName)
    {
        try
        {
            var containerClient = _blobServiceClient.GetBlobContainerClient(_containerName);
            var blobClient = containerClient.GetBlobClient(fileName);
            
            return await blobClient.ExistsAsync();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "❌ Failed to check file existence in Azure Blob");
            return false;
        }
    }
}


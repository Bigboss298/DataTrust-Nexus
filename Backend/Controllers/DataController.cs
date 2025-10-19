using DataTrustNexus.Api.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace DataTrustNexus.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class DataController : ControllerBase
{
    private readonly IDataService _dataService;
    private readonly ILogger<DataController> _logger;

    public DataController(
        IDataService dataService,
        ILogger<DataController> logger)
    {
        _dataService = dataService;
        _logger = logger;
    }

    /// <summary>
    /// Get all data records from blockchain
    /// </summary>
    [HttpGet]
    public async Task<IActionResult> GetAllDataRecords()
    {
        try
        {
            _logger.LogInformation("Fetching all data records from blockchain");
            var records = await _dataService.GetAllDataRecordsAsync();
            return Ok(records);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving data records from blockchain");
            return StatusCode(500, new { message = "Failed to retrieve data records", error = ex.Message });
        }
    }

    /// <summary>
    /// Get data records by owner address
    /// </summary>
    [HttpGet("owner/{ownerAddress}")]
    public async Task<IActionResult> GetDataRecordsByOwner(string ownerAddress)
    {
        try
        {
            _logger.LogInformation("Fetching data records for owner {OwnerAddress} from blockchain", ownerAddress);
            var records = await _dataService.GetDataRecordsByOwnerAsync(ownerAddress);
            return Ok(records);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving data records by owner from blockchain");
            return StatusCode(500, new { message = "Failed to retrieve data records", error = ex.Message });
        }
    }

    /// <summary>
    /// Get specific data record from blockchain
    /// </summary>
    [HttpGet("{recordId}")]
    public async Task<IActionResult> GetDataRecord(string recordId)
    {
        try
        {
            _logger.LogInformation("Fetching data record {RecordId} from blockchain", recordId);
            var record = await _dataService.GetDataRecordAsync(recordId);
            
            if (record == null)
            {
                return NotFound(new { message = "Data record not found on blockchain" });
            }

            return Ok(record);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving data record from blockchain");
            return StatusCode(500, new { message = "Failed to retrieve data record", error = ex.Message });
        }
    }

    /// <summary>
    /// Verify data integrity on blockchain
    /// </summary>
    [HttpPost("verify")]
    public async Task<IActionResult> VerifyData([FromBody] VerifyDataRequest request)
    {
        try
        {
            _logger.LogInformation("Verifying data {RecordId} on blockchain", request.RecordId);
            var isValid = await _dataService.VerifyDataIntegrityAsync(request.RecordId, request.DataHash);
            return Ok(new { recordId = request.RecordId, isValid });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error verifying data on blockchain");
            return StatusCode(500, new { message = "Failed to verify data", error = ex.Message });
        }
    }

    /// <summary>
    /// Upload file - accepts file, category, and description
    /// Returns encrypted data and hash for frontend to sign and upload to blockchain
    /// </summary>
    [HttpPost("upload-file")]
    public async Task<IActionResult> UploadFile([FromForm] UploadFileRequest request)
    {
        try
        {
            if (request.File == null || request.File.Length == 0)
            {
                return BadRequest(new { success = false, message = "No file uploaded" });
            }

            _logger.LogInformation("Processing file: {FileName}, Category: {Category}", request.File.FileName, request.Category);
            
            // Generate unique record ID
            var recordId = $"REC-{DateTimeOffset.UtcNow.ToUnixTimeSeconds()}-{Guid.NewGuid().ToString("N")[..8]}";
            
            // Read file content
            using var memoryStream = new MemoryStream();
            await request.File.CopyToAsync(memoryStream);
            var fileBytes = memoryStream.ToArray();
            
            // Encrypt the file
            var encryptionService = HttpContext.RequestServices.GetRequiredService<IEncryptionService>();
            var key = encryptionService.GenerateAesKey();
            var (encryptedData, iv, tag) = await encryptionService.EncryptAesAsync(fileBytes, key);
            
            // Calculate hash of encrypted data
            var dataHash = encryptionService.ComputeSha256Hash(encryptedData);
            
            // Upload to Azure Blob Storage
            var blobStorageService = HttpContext.RequestServices.GetRequiredService<IBlobStorageService>();
            var blobUrl = await blobStorageService.UploadAsync(encryptedData, $"{recordId}_{request.File.FileName}");
            
            // Return data for frontend to sign and upload to blockchain
            return Ok(new
            {
                success = true,
                message = "File processed and uploaded to Azure Blob Storage",
                recordId = recordId,
                dataHash = dataHash,
                fileName = request.File.FileName,
                fileType = request.File.ContentType,
                fileSize = request.File.Length,
                blobUrl = blobUrl,
                category = request.Category,
                description = request.Description
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error processing file");
            return StatusCode(500, new { success = false, message = "Failed to process file", error = ex.Message });
        }
    }

    /// <summary>
    /// Upload data to blockchain (legacy endpoint)
    /// </summary>
    [HttpPost("upload")]
    public async Task<IActionResult> UploadData([FromBody] UploadDataRequest request)
    {
        try
        {
            _logger.LogInformation("Uploading data {RecordId} to blockchain", request.RecordId);
            
            var txHash = await _dataService.UploadDataAsync(
                request.RecordId,
                request.DataHash,
                request.FileName,
                request.FileType,
                request.FileSize,
                request.IpfsHash,
                request.EncryptionAlgorithm,
                request.Category,
                request.MetadataUri,
                request.PrivateKey
            );

            return Ok(new
            {
                success = true,
                message = "Data uploaded to blockchain",
                recordId = request.RecordId,
                transactionHash = txHash,
                explorerUrl = $"https://awakening.bdagscan.com/tx/{txHash}"
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error uploading data to blockchain");
            return StatusCode(500, new { success = false, message = "Failed to upload data", error = ex.Message });
        }
    }

    /// <summary>
    /// Update data metadata on blockchain
    /// </summary>
    [HttpPut("{recordId}")]
    public async Task<IActionResult> UpdateDataMetadata(string recordId, [FromBody] UpdateDataRequest request)
    {
        try
        {
            _logger.LogInformation("Updating data metadata {RecordId} on blockchain", recordId);
            var txHash = await _dataService.UpdateDataMetadataAsync(recordId, request.MetadataUri, request.PrivateKey);

            return Ok(new
            {
                success = true,
                message = "Data metadata updated on blockchain",
                recordId,
                transactionHash = txHash,
                explorerUrl = $"https://awakening.bdagscan.com/tx/{txHash}"
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error updating data metadata");
            return StatusCode(500, new { success = false, message = "Failed to update data metadata", error = ex.Message });
        }
    }

    /// <summary>
    /// Deactivate data on blockchain
    /// </summary>
    [HttpPost("{recordId}/deactivate")]
    public async Task<IActionResult> DeactivateData(string recordId, [FromBody] DeactivateDataRequest request)
    {
        try
        {
            _logger.LogInformation("Deactivating data {RecordId} on blockchain", recordId);
            var txHash = await _dataService.DeactivateDataAsync(recordId, request.PrivateKey);

            return Ok(new
            {
                success = true,
                message = "Data deactivated on blockchain",
                recordId,
                transactionHash = txHash,
                explorerUrl = $"https://awakening.bdagscan.com/tx/{txHash}"
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error deactivating data");
            return StatusCode(500, new { success = false, message = "Failed to deactivate data", error = ex.Message });
        }
    }

}

public class VerifyDataRequest
{
    public string RecordId { get; set; } = string.Empty;
    public string DataHash { get; set; } = string.Empty;
}

public class UploadDataRequest
{
    public string RecordId { get; set; } = string.Empty;
    public string DataHash { get; set; } = string.Empty;
    public string FileName { get; set; } = string.Empty;
    public string FileType { get; set; } = string.Empty;
    public long FileSize { get; set; }
    public string IpfsHash { get; set; } = string.Empty;
    public string EncryptionAlgorithm { get; set; } = "AES-256-GCM";
    public string Category { get; set; } = string.Empty;
    public string MetadataUri { get; set; } = string.Empty;
    public string PrivateKey { get; set; } = string.Empty;
}

public class UpdateDataRequest
{
    public string MetadataUri { get; set; } = string.Empty;
    public string PrivateKey { get; set; } = string.Empty;
}

public class DeactivateDataRequest
{
    public string PrivateKey { get; set; } = string.Empty;
}

public class UploadFileRequest
{
    public IFormFile File { get; set; } = null!;
    public string Category { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
}

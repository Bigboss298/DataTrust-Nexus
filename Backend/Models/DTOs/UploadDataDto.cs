using System.ComponentModel.DataAnnotations;

namespace DataTrustNexus.Api.Models.DTOs;

/// <summary>
/// DTO for uploading data
/// </summary>
public class UploadDataDto
{
    [Required]
    [StringLength(100)]
    public string RecordId { get; set; } = string.Empty;
    
    [Required]
    [StringLength(64)]
    public string DataHash { get; set; } = string.Empty;
    
    [Required]
    [StringLength(255)]
    public string FileName { get; set; } = string.Empty;
    
    [StringLength(100)]
    public string FileType { get; set; } = string.Empty;
    
    [Required]
    public long FileSize { get; set; }
    
    [Required]
    [StringLength(100)]
    public string IpfsHash { get; set; } = string.Empty;
    
    [StringLength(50)]
    public string EncryptionAlgorithm { get; set; } = "AES-256-GCM";
    
    [Required]
    [StringLength(100)]
    public string Category { get; set; } = string.Empty;
    
    [StringLength(500)]
    public string? Description { get; set; }
    
    public string? MetadataUri { get; set; }
    
    public string? EncryptedSymmetricKey { get; set; }
}

/// <summary>
/// Response DTO for upload
/// </summary>
public class UploadDataResponseDto
{
    public string RecordId { get; set; } = string.Empty;
    public string DataHash { get; set; } = string.Empty;
    public string IpfsHash { get; set; } = string.Empty;
    public DateTime UploadedAt { get; set; }
    public string TransactionHash { get; set; } = string.Empty;
    public bool Success { get; set; }
    public string Message { get; set; } = string.Empty;
}


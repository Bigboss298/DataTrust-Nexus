using System.ComponentModel.DataAnnotations;

namespace DataTrustNexus.Api.Models.DTOs;

/// <summary>
/// DTO for data verification request
/// </summary>
public class VerifyDataDto
{
    [Required]
    [StringLength(100)]
    public string RecordId { get; set; } = string.Empty;
    
    [Required]
    [StringLength(64)]
    public string ProvidedHash { get; set; } = string.Empty;
}

/// <summary>
/// Response DTO for verification
/// </summary>
public class VerifyDataResponseDto
{
    public string RecordId { get; set; } = string.Empty;
    public bool IsValid { get; set; }
    public string OnChainHash { get; set; } = string.Empty;
    public string ProvidedHash { get; set; } = string.Empty;
    public DateTime VerifiedAt { get; set; }
    public string Message { get; set; } = string.Empty;
    public DataRecordDetailsDto? RecordDetails { get; set; }
}

/// <summary>
/// Data record details DTO
/// </summary>
public class DataRecordDetailsDto
{
    public string RecordId { get; set; } = string.Empty;
    public string DataHash { get; set; } = string.Empty;
    public string OwnerWalletAddress { get; set; } = string.Empty;
    public string OwnerName { get; set; } = string.Empty;
    public string FileName { get; set; } = string.Empty;
    public string FileType { get; set; } = string.Empty;
    public long FileSize { get; set; }
    public string IpfsHash { get; set; } = string.Empty;
    public string EncryptionAlgorithm { get; set; } = string.Empty;
    public DateTime UploadedAt { get; set; }
    public bool IsActive { get; set; }
    public string Category { get; set; } = string.Empty;
    public string? Description { get; set; }
}


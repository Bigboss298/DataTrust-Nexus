using System.ComponentModel.DataAnnotations;

namespace DataTrustNexus.Api.Models.DTOs;

/// <summary>
/// DTO for granting access
/// </summary>
public class GrantAccessDto
{
    [Required]
    [StringLength(100)]
    public string RecordId { get; set; } = string.Empty;
    
    [Required]
    [StringLength(42)]
    public string GranteeWalletAddress { get; set; } = string.Empty;
    
    public DateTime? ExpiresAt { get; set; }
    
    [Required]
    [StringLength(50)]
    public string PermissionType { get; set; } = "read";
    
    [StringLength(500)]
    public string? GrantReason { get; set; }
}

/// <summary>
/// DTO for revoking access
/// </summary>
public class RevokeAccessDto
{
    [Required]
    [StringLength(100)]
    public string RecordId { get; set; } = string.Empty;
    
    [Required]
    [StringLength(42)]
    public string GranteeWalletAddress { get; set; } = string.Empty;
    
    [StringLength(500)]
    public string? RevokeReason { get; set; }
}

/// <summary>
/// Response DTO for access control operations
/// </summary>
public class AccessControlResponseDto
{
    public string RecordId { get; set; } = string.Empty;
    public string GranteeWalletAddress { get; set; } = string.Empty;
    public bool Success { get; set; }
    public string Message { get; set; } = string.Empty;
    public string TransactionHash { get; set; } = string.Empty;
    public DateTime Timestamp { get; set; }
}

/// <summary>
/// DTO for checking access
/// </summary>
public class CheckAccessDto
{
    [Required]
    [StringLength(100)]
    public string RecordId { get; set; } = string.Empty;
    
    [Required]
    [StringLength(42)]
    public string WalletAddress { get; set; } = string.Empty;
}

/// <summary>
/// Response DTO for access check
/// </summary>
public class CheckAccessResponseDto
{
    public string RecordId { get; set; } = string.Empty;
    public string WalletAddress { get; set; } = string.Empty;
    public bool HasAccess { get; set; }
    public string PermissionType { get; set; } = string.Empty;
    public DateTime? GrantedAt { get; set; }
    public DateTime? ExpiresAt { get; set; }
    public bool IsExpired { get; set; }
}

/// <summary>
/// Access permission details DTO
/// </summary>
public class AccessPermissionDto
{
    public string Id { get; set; } = string.Empty;
    public string RecordId { get; set; } = string.Empty;
    public string RecordFileName { get; set; } = string.Empty;
    public string GranteeWalletAddress { get; set; } = string.Empty;
    public DateTime GrantedAt { get; set; }
    public DateTime? ExpiresAt { get; set; }
    public bool IsActive { get; set; }
    public string PermissionType { get; set; } = string.Empty;
    public string? GrantReason { get; set; }
    public bool IsExpired { get; set; }
    public bool HasValidAccess { get; set; }
}


using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace DataTrustNexus.Api.Models;

/// <summary>
/// Represents an audit log entry for compliance and tracking
/// </summary>
public class AuditLog
{
    [Key]
    public string Id { get; set; } = Guid.NewGuid().ToString();
    
    [Required]
    [StringLength(100)]
    public string ActionType { get; set; } = string.Empty;
    
    [Required]
    public string ActorId { get; set; } = string.Empty;
    
    [ForeignKey(nameof(ActorId))]
    public virtual Institution? Actor { get; set; }
    
    [StringLength(42)]
    public string? TargetWalletAddress { get; set; }
    
    public string? RecordId { get; set; }
    
    [StringLength(64)]
    public string? DataHash { get; set; }
    
    [Required]
    public string ActionDetails { get; set; } = string.Empty;
    
    public bool Success { get; set; } = true;
    
    public DateTime Timestamp { get; set; } = DateTime.UtcNow;
    
    [StringLength(45)]
    public string? IpAddress { get; set; }
    
    [StringLength(500)]
    public string? UserAgent { get; set; }
    
    public string? ErrorMessage { get; set; }
    
    [StringLength(64)]
    public string? BlockchainTransactionHash { get; set; }
    
    [StringLength(100)]
    public string? BlockchainEventId { get; set; }
}

/// <summary>
/// Audit action types
/// </summary>
public static class AuditActionTypes
{
    public const string InstitutionRegistered = "INSTITUTION_REGISTERED";
    public const string DataUploaded = "DATA_UPLOADED";
    public const string AccessGranted = "ACCESS_GRANTED";
    public const string AccessRevoked = "ACCESS_REVOKED";
    public const string VerificationRequested = "VERIFICATION_REQUESTED";
    public const string VerificationCompleted = "VERIFICATION_COMPLETED";
    public const string DataAccessed = "DATA_ACCESSED";
    public const string DataDownloaded = "DATA_DOWNLOADED";
    public const string PermissionUpdated = "PERMISSION_UPDATED";
    public const string RecordDeactivated = "RECORD_DEACTIVATED";
    public const string RecordReactivated = "RECORD_REACTIVATED";
    public const string Login = "LOGIN";
    public const string Logout = "LOGOUT";
}


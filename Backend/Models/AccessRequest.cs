using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace DataTrustNexus.Api.Models;

/// <summary>
/// Represents an access permission or request for a data record
/// </summary>
public class AccessRequest
{
    [Key]
    public string Id { get; set; } = Guid.NewGuid().ToString();
    
    [Required]
    public string RecordId { get; set; } = string.Empty;
    
    [ForeignKey(nameof(RecordId))]
    public virtual DataRecord? DataRecord { get; set; }
    
    [Required]
    public string GranterId { get; set; } = string.Empty; // Institution that granted access
    
    [ForeignKey(nameof(GranterId))]
    public virtual Institution? Granter { get; set; }
    
    [Required]
    [StringLength(42)]
    public string GranteeWalletAddress { get; set; } = string.Empty;
    
    public DateTime GrantedAt { get; set; } = DateTime.UtcNow;
    
    public DateTime? ExpiresAt { get; set; }
    
    public bool IsActive { get; set; } = true;
    
    [StringLength(50)]
    public string PermissionType { get; set; } = "read"; // read, verify, full
    
    [StringLength(500)]
    public string? GrantReason { get; set; }
    
    public DateTime? RevokedAt { get; set; }
    
    [StringLength(500)]
    public string? RevokeReason { get; set; }
    
    public bool IsExpired => ExpiresAt.HasValue && DateTime.UtcNow > ExpiresAt.Value;
    
    public bool HasValidAccess => IsActive && !IsExpired;
}


using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace DataTrustNexus.Api.Models;

/// <summary>
/// Represents a pending access request for a data record
/// </summary>
public class AccessRequestModel
{
    [Key]
    public string Id { get; set; } = Guid.NewGuid().ToString();
    
    [Required]
    public string RecordId { get; set; } = string.Empty;
    
    [Required]
    [StringLength(42)]
    public string RequesterWalletAddress { get; set; } = string.Empty;
    
    [Required]
    [StringLength(42)]
    public string OwnerWalletAddress { get; set; } = string.Empty;
    
    [StringLength(50)]
    public string PermissionType { get; set; } = "read"; // read, verify, full
    
    [StringLength(1000)]
    public string? RequestReason { get; set; }
    
    public DateTime RequestedAt { get; set; } = DateTime.UtcNow;
    
    [StringLength(20)]
    public string Status { get; set; } = "pending"; // pending, approved, denied
    
    public DateTime? RespondedAt { get; set; }
    
    [StringLength(500)]
    public string? ResponseNote { get; set; }
}


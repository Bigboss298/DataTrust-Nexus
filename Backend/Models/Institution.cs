using System.ComponentModel.DataAnnotations;

namespace DataTrustNexus.Api.Models;

/// <summary>
/// Represents an institution in the DataTrust Nexus platform
/// </summary>
public class Institution
{
    [Key]
    public string Id { get; set; } = Guid.NewGuid().ToString();
    
    [Required]
    [StringLength(200)]
    public string Name { get; set; } = string.Empty;
    
    [Required]
    [StringLength(100)]
    public string InstitutionType { get; set; } = string.Empty; // University, Bank, Hospital, Government
    
    [StringLength(100)]
    public string RegistrationNumber { get; set; } = string.Empty;
    
    [Required]
    [StringLength(42)]
    public string WalletAddress { get; set; } = string.Empty;
    
    public DateTime RegisteredAt { get; set; } = DateTime.UtcNow;
    
    public bool IsActive { get; set; } = true;
    
    public string? MetadataUri { get; set; }
    
    public string? ContactEmail { get; set; }
    
    public string? ContactPhone { get; set; }
    
    public string? Country { get; set; }
    
    // Navigation properties
    public virtual ICollection<DataRecord> DataRecords { get; set; } = new List<DataRecord>();
    
    public virtual ICollection<AccessRequest> GrantedAccess { get; set; } = new List<AccessRequest>();
    
    public virtual ICollection<AuditLog> AuditLogs { get; set; } = new List<AuditLog>();
}


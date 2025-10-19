using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace DataTrustNexus.Api.Models;

/// <summary>
/// Represents a data record in the system
/// </summary>
public class DataRecord
{
    [Key]
    public string Id { get; set; } = Guid.NewGuid().ToString();
    
    [Required]
    [StringLength(100)]
    public string RecordId { get; set; } = string.Empty; // Unique record identifier
    
    [Required]
    [StringLength(64)]
    public string DataHash { get; set; } = string.Empty; // SHA-256 hash (hex string)
    
    [Required]
    public string OwnerId { get; set; } = string.Empty;
    
    [ForeignKey(nameof(OwnerId))]
    public virtual Institution? Owner { get; set; }
    
    [Required]
    [StringLength(255)]
    public string FileName { get; set; } = string.Empty;
    
    [StringLength(100)]
    public string FileType { get; set; } = string.Empty;
    
    public long FileSize { get; set; }
    
    [Required]
    [StringLength(100)]
    public string IpfsHash { get; set; } = string.Empty;
    
    [StringLength(50)]
    public string EncryptionAlgorithm { get; set; } = "AES-256-GCM";
    
    public DateTime UploadedAt { get; set; } = DateTime.UtcNow;
    
    public bool IsActive { get; set; } = true;
    
    public string? MetadataUri { get; set; }
    
    [StringLength(100)]
    public string Category { get; set; } = string.Empty; // Medical, Academic, Financial, etc.
    
    [StringLength(500)]
    public string? Description { get; set; }
    
    public string? EncryptedSymmetricKey { get; set; } // RSA-encrypted AES key
    
    // Navigation properties
    public virtual ICollection<AccessRequest> AccessRequests { get; set; } = new List<AccessRequest>();
}


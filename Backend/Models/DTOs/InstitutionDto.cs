using System.ComponentModel.DataAnnotations;

namespace DataTrustNexus.Api.Models.DTOs;

/// <summary>
/// DTO for registering an institution
/// </summary>
public class RegisterInstitutionDto
{
    [Required]
    [StringLength(200)]
    public string Name { get; set; } = string.Empty;
    
    [Required]
    [StringLength(100)]
    public string InstitutionType { get; set; } = string.Empty;
    
    [StringLength(100)]
    public string RegistrationNumber { get; set; } = string.Empty;
    
    [Required]
    [StringLength(42)]
    public string WalletAddress { get; set; } = string.Empty;
    
    public string? MetadataUri { get; set; }
    
    [EmailAddress]
    public string? ContactEmail { get; set; }
    
    [Phone]
    public string? ContactPhone { get; set; }
    
    [StringLength(100)]
    public string? Country { get; set; }
}

/// <summary>
/// DTO for updating institution details
/// </summary>
public class UpdateInstitutionDto
{
    [Required]
    [StringLength(200)]
    public string Name { get; set; } = string.Empty;
    
    public string? MetadataUri { get; set; }
    
    [EmailAddress]
    public string? ContactEmail { get; set; }
    
    [Phone]
    public string? ContactPhone { get; set; }
}

/// <summary>
/// Institution details DTO
/// </summary>
public class InstitutionDto
{
    public string Id { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public string InstitutionType { get; set; } = string.Empty;
    public string RegistrationNumber { get; set; } = string.Empty;
    public string WalletAddress { get; set; } = string.Empty;
    public DateTime RegisteredAt { get; set; }
    public bool IsActive { get; set; }
    public string? MetadataUri { get; set; }
    public string? ContactEmail { get; set; }
    public string? ContactPhone { get; set; }
    public string? Country { get; set; }
    public int TotalDataRecords { get; set; }
    public int TotalAccessGrants { get; set; }
}

/// <summary>
/// Response DTO for institution operations
/// </summary>
public class InstitutionResponseDto
{
    public bool Success { get; set; }
    public string Message { get; set; } = string.Empty;
    public InstitutionDto? Institution { get; set; }
    public string? TransactionHash { get; set; }
}


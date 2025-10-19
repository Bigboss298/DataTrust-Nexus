namespace DataTrustNexus.Api.Models.DTOs;

public class SubmitAccessRequestDto
{
    public string RecordId { get; set; } = string.Empty;
    public string PermissionType { get; set; } = "read";
    public string? RequestReason { get; set; }
}

public class AccessRequestResponseDto
{
    public string Id { get; set; } = string.Empty;
    public string RecordId { get; set; } = string.Empty;
    public string RecordFileName { get; set; } = string.Empty;
    public string RequesterWalletAddress { get; set; } = string.Empty;
    public string RequesterInstitutionName { get; set; } = string.Empty;
    public string OwnerWalletAddress { get; set; } = string.Empty;
    public string OwnerInstitutionName { get; set; } = string.Empty;
    public string PermissionType { get; set; } = string.Empty;
    public string? RequestReason { get; set; }
    public DateTime RequestedAt { get; set; }
    public string Status { get; set; } = string.Empty;
    public DateTime? RespondedAt { get; set; }
    public string? ResponseNote { get; set; }
}

public class RespondToRequestDto
{
    public string RequestId { get; set; } = string.Empty;
    public string Action { get; set; } = string.Empty; // approve or deny
    public string? ResponseNote { get; set; }
}


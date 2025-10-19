namespace DataTrustNexus.Api.Interfaces;

/// <summary>
/// Service for access control operations on BlockDAG
/// </summary>
public interface IAccessService
{
    // WRITE OPERATIONS
    Task<string> GrantAccessAsync(string recordId, string granteeAddress, long expiresAt, string permissionType, string grantReason, string privateKey);
    Task<string> RevokeAccessAsync(string recordId, string granteeAddress, string privateKey);
    Task<string> UpdatePermissionAsync(string recordId, string granteeAddress, long newExpiresAt, string privateKey);
    
    // READ OPERATIONS
    Task<List<AccessPermission>> GetAccessPermissionsForRecordAsync(string recordId);
    Task<List<AccessPermission>> GetAccessPermissionsForUserAsync(string userAddress);
    Task<List<AccessPermission>> GetGrantedPermissionsAsync(string ownerAddress);
    Task<List<AccessPermission>> GetReceivedPermissionsAsync(string granteeAddress);
    Task<bool> CheckAccessAsync(string recordId, string userAddress);
    Task<AccessPermission?> GetSpecificPermissionAsync(string recordId, string granteeAddress);
}

public class AccessPermission
{
    public string RecordId { get; set; } = string.Empty;
    public string Owner { get; set; } = string.Empty;
    public string Grantee { get; set; } = string.Empty;
    public string PermissionType { get; set; } = string.Empty;
    public string GrantReason { get; set; } = string.Empty;
    public long GrantedAt { get; set; }
    public string GrantedAtFormatted { get; set; } = string.Empty;
    public long ExpiresAt { get; set; }
    public string ExpiresAtFormatted { get; set; } = string.Empty;
    public bool IsActive { get; set; }
}


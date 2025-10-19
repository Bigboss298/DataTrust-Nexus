using DataTrustNexus.Api.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace DataTrustNexus.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AccessController : ControllerBase
{
    private readonly IAccessService _accessService;
    private readonly ILogger<AccessController> _logger;

    public AccessController(
        IAccessService accessService,
        ILogger<AccessController> logger)
    {
        _accessService = accessService;
        _logger = logger;
    }

    /// <summary>
    /// Get access permissions for a data record from blockchain
    /// </summary>
    [HttpGet("record/{recordId}")]
    public async Task<IActionResult> GetAccessPermissions(string recordId)
    {
        try
        {
            _logger.LogInformation("Fetching access permissions for record {RecordId} from blockchain", recordId);
            var permissions = await _accessService.GetAccessPermissionsForRecordAsync(recordId);
            return Ok(permissions);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving access permissions from blockchain");
            return StatusCode(500, new { message = "Failed to retrieve access permissions", error = ex.Message });
        }
    }

    /// <summary>
    /// Get access permissions for a user from blockchain
    /// </summary>
    [HttpGet("user/{userAddress}")]
    public async Task<IActionResult> GetUserPermissions(string userAddress)
    {
        try
        {
            _logger.LogInformation("Fetching access permissions for user {UserAddress} from blockchain", userAddress);
            var permissions = await _accessService.GetAccessPermissionsForUserAsync(userAddress);
            return Ok(permissions);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving user permissions from blockchain");
            return StatusCode(500, new { message = "Failed to retrieve user permissions", error = ex.Message });
        }
    }

    /// <summary>
    /// Get permissions granted by an owner (permissions they gave to others)
    /// </summary>
    [HttpGet("granted/{ownerAddress}")]
    public async Task<IActionResult> GetGrantedPermissions(string ownerAddress)
    {
        try
        {
            _logger.LogInformation("Fetching granted permissions for owner {OwnerAddress} from blockchain", ownerAddress);
            var permissions = await _accessService.GetGrantedPermissionsAsync(ownerAddress);
            return Ok(permissions);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving granted permissions from blockchain");
            return StatusCode(500, new { message = "Failed to retrieve granted permissions", error = ex.Message });
        }
    }

    /// <summary>
    /// Get permissions received by a grantee (permissions they received from others)
    /// </summary>
    [HttpGet("received/{granteeAddress}")]
    public async Task<IActionResult> GetReceivedPermissions(string granteeAddress)
    {
        try
        {
            _logger.LogInformation("Fetching received permissions for grantee {GranteeAddress} from blockchain", granteeAddress);
            var permissions = await _accessService.GetReceivedPermissionsAsync(granteeAddress);
            return Ok(permissions);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving received permissions from blockchain");
            return StatusCode(500, new { message = "Failed to retrieve received permissions", error = ex.Message });
        }
    }

    /// <summary>
    /// Check if an address has access to a record
    /// </summary>
    [HttpGet("check")]
    public async Task<IActionResult> CheckAccess([FromQuery] string recordId, [FromQuery] string walletAddress)
    {
        try
        {
            _logger.LogInformation("Checking access for {WalletAddress} to record {RecordId}", walletAddress, recordId);
            var hasAccess = await _accessService.CheckAccessAsync(recordId, walletAddress);
            return Ok(new { recordId, walletAddress, hasAccess });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error checking access on blockchain");
            return StatusCode(500, new { message = "Failed to check access", error = ex.Message });
        }
    }

    /// <summary>
    /// Get specific permission details
    /// </summary>
    [HttpGet("{recordId}/{granteeAddress}")]
    public async Task<IActionResult> GetSpecificPermission(string recordId, string granteeAddress)
    {
        try
        {
            _logger.LogInformation("Fetching permission for {Grantee} on record {RecordId}", granteeAddress, recordId);
            var permission = await _accessService.GetSpecificPermissionAsync(recordId, granteeAddress);
            
            if (permission == null)
            {
                return NotFound(new { message = "Permission not found" });
            }

            return Ok(permission);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving permission");
            return StatusCode(500, new { message = "Failed to retrieve permission", error = ex.Message });
        }
    }

    /// <summary>
    /// Grant access to a data record on blockchain
    /// </summary>
    [HttpPost("grant")]
    public async Task<IActionResult> GrantAccess([FromBody] GrantAccessRequest request)
    {
        try
        {
            _logger.LogInformation("Granting access for {Grantee} to record {RecordId}", request.GranteeAddress, request.RecordId);
            
            var txHash = await _accessService.GrantAccessAsync(
                request.RecordId,
                request.GranteeAddress,
                request.ExpiresAt,
                request.PermissionType,
                request.GrantReason,
                request.PrivateKey
            );

            return Ok(new
            {
                success = true,
                message = "Access granted on blockchain",
                recordId = request.RecordId,
                grantee = request.GranteeAddress,
                transactionHash = txHash,
                explorerUrl = $"https://awakening.bdagscan.com/tx/{txHash}"
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error granting access on blockchain");
            return StatusCode(500, new { success = false, message = "Failed to grant access", error = ex.Message });
        }
    }

    /// <summary>
    /// Revoke access to a data record on blockchain
    /// </summary>
    [HttpPost("revoke")]
    public async Task<IActionResult> RevokeAccess([FromBody] RevokeAccessRequest request)
    {
        try
        {
            _logger.LogInformation("Revoking access for {Grantee} to record {RecordId}", request.GranteeAddress, request.RecordId);
            
            var txHash = await _accessService.RevokeAccessAsync(
                request.RecordId,
                request.GranteeAddress,
                request.PrivateKey
            );

            return Ok(new
            {
                success = true,
                message = "Access revoked on blockchain",
                recordId = request.RecordId,
                grantee = request.GranteeAddress,
                transactionHash = txHash,
                explorerUrl = $"https://awakening.bdagscan.com/tx/{txHash}"
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error revoking access on blockchain");
            return StatusCode(500, new { success = false, message = "Failed to revoke access", error = ex.Message });
        }
    }

    /// <summary>
    /// Update permission expiry time
    /// </summary>
    [HttpPut("update")]
    public async Task<IActionResult> UpdatePermission([FromBody] UpdatePermissionRequest request)
    {
        try
        {
            _logger.LogInformation("Updating permission for {Grantee} on record {RecordId}", request.GranteeAddress, request.RecordId);
            
            var txHash = await _accessService.UpdatePermissionAsync(
                request.RecordId,
                request.GranteeAddress,
                request.NewExpiresAt,
                request.PrivateKey
            );

            return Ok(new
            {
                success = true,
                message = "Permission updated on blockchain",
                recordId = request.RecordId,
                grantee = request.GranteeAddress,
                transactionHash = txHash,
                explorerUrl = $"https://awakening.bdagscan.com/tx/{txHash}"
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error updating permission");
            return StatusCode(500, new { success = false, message = "Failed to update permission", error = ex.Message });
        }
    }
}

public class GrantAccessRequest
{
    public string RecordId { get; set; } = string.Empty;
    public string GranteeAddress { get; set; } = string.Empty;
    public long ExpiresAt { get; set; }
    public string PermissionType { get; set; } = string.Empty;
    public string GrantReason { get; set; } = string.Empty;
    public string PrivateKey { get; set; } = string.Empty;
}

public class RevokeAccessRequest
{
    public string RecordId { get; set; } = string.Empty;
    public string GranteeAddress { get; set; } = string.Empty;
    public string PrivateKey { get; set; } = string.Empty;
}

public class UpdatePermissionRequest
{
    public string RecordId { get; set; } = string.Empty;
    public string GranteeAddress { get; set; } = string.Empty;
    public long NewExpiresAt { get; set; }
    public string PrivateKey { get; set; } = string.Empty;
}

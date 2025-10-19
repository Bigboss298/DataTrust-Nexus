using DataTrustNexus.Api.Interfaces;
using DataTrustNexus.Api.Models.DTOs;
using Microsoft.AspNetCore.Mvc;

namespace DataTrustNexus.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AccessController : ControllerBase
{
    private readonly IAccessService _accessService;
    private readonly IAccessRequestService _accessRequestService;
    private readonly ILogger<AccessController> _logger;

    public AccessController(
        IAccessService accessService,
        IAccessRequestService accessRequestService,
        ILogger<AccessController> logger)
    {
        _accessService = accessService;
        _accessRequestService = accessRequestService;
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

    // ========== ACCESS REQUEST ENDPOINTS ==========

    /// <summary>
    /// Submit a request for access to a data record
    /// </summary>
    [HttpPost("request")]
    public async Task<IActionResult> SubmitAccessRequest([FromBody] SubmitAccessRequestDto request)
    {
        try
        {
            var walletAddress = Request.Headers["X-Wallet-Address"].ToString();
            if (string.IsNullOrEmpty(walletAddress))
            {
                return BadRequest(new { success = false, message = "Wallet address is required" });
            }

            _logger.LogInformation("Submitting access request for record {RecordId} by {Requester}", 
                request.RecordId, walletAddress);

            var result = await _accessRequestService.SubmitAccessRequestAsync(request, walletAddress);

            return Ok(new
            {
                success = true,
                message = "Access request submitted successfully",
                requestId = result.Id,
                recordId = result.RecordId,
                status = result.Status
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error submitting access request");
            return StatusCode(500, new { success = false, message = "Failed to submit access request", error = ex.Message });
        }
    }

    /// <summary>
    /// Get pending access requests for an owner
    /// </summary>
    [HttpGet("requests/pending/{ownerAddress}")]
    public async Task<IActionResult> GetPendingRequests(string ownerAddress)
    {
        try
        {
            _logger.LogInformation("Fetching pending requests for owner {Owner}", ownerAddress);
            var requests = await _accessRequestService.GetPendingRequestsAsync(ownerAddress);
            return Ok(requests);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error fetching pending requests");
            return StatusCode(500, new { message = "Failed to fetch pending requests", error = ex.Message });
        }
    }

    /// <summary>
    /// Get access requests submitted by a user
    /// </summary>
    [HttpGet("requests/my/{requesterAddress}")]
    public async Task<IActionResult> GetMyRequests(string requesterAddress)
    {
        try
        {
            _logger.LogInformation("Fetching requests for {Requester}", requesterAddress);
            var requests = await _accessRequestService.GetMyRequestsAsync(requesterAddress);
            return Ok(requests);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error fetching my requests");
            return StatusCode(500, new { message = "Failed to fetch requests", error = ex.Message });
        }
    }

    /// <summary>
    /// Respond to an access request (approve or deny)
    /// </summary>
    [HttpPost("requests/respond")]
    public async Task<IActionResult> RespondToRequest([FromBody] RespondToRequestDto request)
    {
        try
        {
            var walletAddress = Request.Headers["X-Wallet-Address"].ToString();
            if (string.IsNullOrEmpty(walletAddress))
            {
                return BadRequest(new { success = false, message = "Wallet address is required" });
            }

            _logger.LogInformation("Responding to request {RequestId} with action {Action}", 
                request.RequestId, request.Action);

            var result = await _accessRequestService.RespondToRequestAsync(request, walletAddress);

            if (result == null)
            {
                return NotFound(new { success = false, message = "Request not found or unauthorized" });
            }

            return Ok(new
            {
                success = true,
                message = $"Access request {request.Action}",
                requestId = result.Id,
                status = result.Status
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error responding to request");
            return StatusCode(500, new { success = false, message = "Failed to respond to request", error = ex.Message });
        }
    }

    /// <summary>
    /// Check if user has a pending request for a record
    /// </summary>
    [HttpGet("requests/check")]
    public async Task<IActionResult> CheckPendingRequest([FromQuery] string recordId, [FromQuery] string requesterAddress)
    {
        try
        {
            var hasPending = await _accessRequestService.HasPendingRequestAsync(recordId, requesterAddress);
            return Ok(new { recordId, requesterAddress, hasPending });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error checking pending request");
            return StatusCode(500, new { message = "Failed to check request", error = ex.Message });
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

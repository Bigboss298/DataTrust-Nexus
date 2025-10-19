using DataTrustNexus.Api.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace DataTrustNexus.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class InstitutionController : ControllerBase
{
    private readonly IInstitutionService _institutionService;
    private readonly ILogger<InstitutionController> _logger;

    public InstitutionController(
        IInstitutionService institutionService,
        ILogger<InstitutionController> logger)
    {
        _institutionService = institutionService;
        _logger = logger;
    }

    /// <summary>
    /// Get all institutions from blockchain
    /// </summary>
    [HttpGet]
    public async Task<IActionResult> GetAllInstitutions()
    {
        try
        {
            _logger.LogInformation("Fetching all institutions from blockchain");
            var institutions = await _institutionService.GetAllInstitutionsAsync();
            return Ok(institutions);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving institutions from blockchain");
            return StatusCode(500, new { message = "Failed to retrieve institutions", error = ex.Message });
        }
    }

    /// <summary>
    /// Get institution by wallet address from blockchain
    /// </summary>
    [HttpGet("{walletAddress}")]
    public async Task<IActionResult> GetInstitution(string walletAddress)
    {
        try
        {
            _logger.LogInformation("Fetching institution {WalletAddress} from blockchain", walletAddress);
            var institution = await _institutionService.GetInstitutionAsync(walletAddress);
            
            if (institution == null)
            {
                return NotFound(new { message = "Institution not found on blockchain" });
            }

            return Ok(institution);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving institution from blockchain");
            return StatusCode(500, new { message = "Failed to retrieve institution", error = ex.Message });
        }
    }

    /// <summary>
    /// Verify institution on blockchain
    /// </summary>
    [HttpGet("{walletAddress}/verify")]
    public async Task<IActionResult> VerifyInstitution(string walletAddress)
    {
        try
        {
            _logger.LogInformation("Verifying institution {WalletAddress} on blockchain", walletAddress);
            var isValid = await _institutionService.IsInstitutionVerifiedAsync(walletAddress);
            return Ok(new { walletAddress, isVerified = isValid });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error verifying institution on blockchain");
            return StatusCode(500, new { message = "Failed to verify institution", error = ex.Message });
        }
    }

    /// <summary>
    /// Register a new institution on blockchain
    /// </summary>
    [HttpPost("register")]
    public async Task<IActionResult> RegisterInstitution([FromBody] RegisterInstitutionRequest request)
    {
        try
        {
            _logger.LogInformation("Registering institution {Name} on blockchain", request.Name);
            
            var txHash = await _institutionService.RegisterInstitutionAsync(
                request.Name,
                request.InstitutionType,
                request.RegistrationNumber,
                request.MetadataUri,
                request.PrivateKey
            );

            return Ok(new
            {
                success = true,
                message = "Institution registered on blockchain",
                transactionHash = txHash,
                explorerUrl = $"https://awakening.bdagscan.com/tx/{txHash}"
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error registering institution on blockchain");
            return StatusCode(500, new { success = false, message = "Failed to register institution", error = ex.Message });
        }
    }

    /// <summary>
    /// Update institution metadata on blockchain
    /// </summary>
    [HttpPut("{walletAddress}")]
    public async Task<IActionResult> UpdateInstitution(string walletAddress, [FromBody] UpdateInstitutionRequest request)
    {
        try
        {
            _logger.LogInformation("Updating institution {WalletAddress} on blockchain", walletAddress);
            var txHash = await _institutionService.UpdateInstitutionAsync(walletAddress, request.Name, request.MetadataUri, request.PrivateKey);

            return Ok(new
            {
                success = true,
                message = "Institution updated on blockchain",
                transactionHash = txHash,
                explorerUrl = $"https://awakening.bdagscan.com/tx/{txHash}"
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error updating institution");
            return StatusCode(500, new { success = false, message = "Failed to update institution", error = ex.Message });
        }
    }

    /// <summary>
    /// Deactivate institution on blockchain
    /// </summary>
    [HttpPost("{walletAddress}/deactivate")]
    public async Task<IActionResult> DeactivateInstitution(string walletAddress, [FromBody] DeactivateRequest request)
    {
        try
        {
            _logger.LogInformation("Deactivating institution {WalletAddress} on blockchain", walletAddress);
            var txHash = await _institutionService.DeactivateInstitutionAsync(walletAddress, request.PrivateKey);

            return Ok(new
            {
                success = true,
                message = "Institution deactivated on blockchain",
                transactionHash = txHash,
                explorerUrl = $"https://awakening.bdagscan.com/tx/{txHash}"
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error deactivating institution");
            return StatusCode(500, new { success = false, message = "Failed to deactivate institution", error = ex.Message });
        }
    }
}

public class RegisterInstitutionRequest
{
    public string Name { get; set; } = string.Empty;
    public string InstitutionType { get; set; } = string.Empty;
    public string RegistrationNumber { get; set; } = string.Empty;
    public string MetadataUri { get; set; } = string.Empty;
    public string PrivateKey { get; set; } = string.Empty;
}

public class UpdateInstitutionRequest
{
    public string Name { get; set; } = string.Empty;
    public string MetadataUri { get; set; } = string.Empty;
    public string PrivateKey { get; set; } = string.Empty;
}

public class DeactivateRequest
{
    public string PrivateKey { get; set; } = string.Empty;
}

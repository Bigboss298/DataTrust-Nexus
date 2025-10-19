using DataTrustNexus.Api.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace DataTrustNexus.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuditController : ControllerBase
{
    private readonly IAuditService _auditService;
    private readonly ILogger<AuditController> _logger;

    public AuditController(
        IAuditService auditService,
        ILogger<AuditController> logger)
    {
        _auditService = auditService;
        _logger = logger;
    }

    /// <summary>
    /// Get all audit logs from blockchain
    /// </summary>
    [HttpGet]
    public async Task<IActionResult> GetAuditLogs([FromQuery] int skip = 0, [FromQuery] int take = 50)
    {
        try
        {
            _logger.LogInformation("Fetching audit logs from blockchain");
            var logs = await _auditService.GetAllAuditLogsAsync(skip, take);
            return Ok(logs);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving audit logs from blockchain");
            return StatusCode(500, new { message = "Failed to retrieve audit logs", error = ex.Message });
        }
    }

    /// <summary>
    /// Get audit log by ID
    /// </summary>
    [HttpGet("{logId}")]
    public async Task<IActionResult> GetAuditLogById(ulong logId)
    {
        try
        {
            _logger.LogInformation("Fetching audit log {LogId} from blockchain", logId);
            var log = await _auditService.GetAuditLogByIdAsync(logId);
            
            if (log == null)
            {
                return NotFound(new { message = "Audit log not found" });
            }

            return Ok(log);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving audit log");
            return StatusCode(500, new { message = "Failed to retrieve audit log", error = ex.Message });
        }
    }

    /// <summary>
    /// Get audit logs by action type
    /// </summary>
    [HttpGet("action/{actionType}")]
    public async Task<IActionResult> GetAuditLogsByAction(int actionType, [FromQuery] int skip = 0, [FromQuery] int take = 50)
    {
        try
        {
            _logger.LogInformation("Fetching audit logs for action type {ActionType} from blockchain", actionType);
            var logs = await _auditService.GetAuditLogsByActionTypeAsync(actionType, skip, take);
            return Ok(logs);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving audit logs by action from blockchain");
            return StatusCode(500, new { message = "Failed to retrieve audit logs", error = ex.Message });
        }
    }

    /// <summary>
    /// Get audit logs by actor address
    /// </summary>
    [HttpGet("actor/{actorAddress}")]
    public async Task<IActionResult> GetAuditLogsByActor(string actorAddress, [FromQuery] int skip = 0, [FromQuery] int take = 50)
    {
        try
        {
            _logger.LogInformation("Fetching audit logs for actor {ActorAddress} from blockchain", actorAddress);
            var logs = await _auditService.GetAuditLogsByActorAsync(actorAddress, skip, take);
            return Ok(logs);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving audit logs by actor from blockchain");
            return StatusCode(500, new { message = "Failed to retrieve audit logs", error = ex.Message });
        }
    }

    /// <summary>
    /// Get audit logs by record ID
    /// </summary>
    [HttpGet("record/{recordId}")]
    public async Task<IActionResult> GetAuditLogsByRecord(string recordId, [FromQuery] int skip = 0, [FromQuery] int take = 50)
    {
        try
        {
            _logger.LogInformation("Fetching audit logs for record {RecordId} from blockchain", recordId);
            var logs = await _auditService.GetAuditLogsByRecordAsync(recordId, skip, take);
            return Ok(logs);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving audit logs by record from blockchain");
            return StatusCode(500, new { message = "Failed to retrieve audit logs", error = ex.Message });
        }
    }

    /// <summary>
    /// Get recent audit logs
    /// </summary>
    [HttpGet("recent")]
    public async Task<IActionResult> GetRecentAuditLogs([FromQuery] int count = 50)
    {
        try
        {
            _logger.LogInformation("Fetching recent {Count} audit logs from blockchain", count);
            var logs = await _auditService.GetRecentAuditLogsAsync(count);
            return Ok(logs);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving recent audit logs from blockchain");
            return StatusCode(500, new { message = "Failed to retrieve recent audit logs", error = ex.Message });
        }
    }

    /// <summary>
    /// Get audit statistics
    /// </summary>
    [HttpGet("statistics")]
    public async Task<IActionResult> GetAuditStatistics([FromQuery] string? startDate = null, [FromQuery] string? endDate = null)
    {
        try
        {
            _logger.LogInformation("Fetching audit statistics from blockchain");
            var statistics = await _auditService.GetAuditStatisticsAsync(startDate, endDate);
            return Ok(statistics);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving audit statistics from blockchain");
            return StatusCode(500, new { message = "Failed to retrieve audit statistics", error = ex.Message });
        }
    }

    /// <summary>
    /// Create audit log on blockchain
    /// </summary>
    [HttpPost("log")]
    public async Task<IActionResult> LogAction([FromBody] CreateAuditLogRequest request)
    {
        try
        {
            _logger.LogInformation("Creating audit log on blockchain");
            
            var txHash = await _auditService.LogActionAsync(
                request.ActionType,
                request.TargetAddress,
                request.RecordId,
                request.ActionDetails,
                request.DataHash,
                request.Success,
                request.IpAddress,
                request.UserAgent,
                request.PrivateKey
            );

            return Ok(new
            {
                success = true,
                message = "Audit log created on blockchain",
                transactionHash = txHash,
                explorerUrl = $"https://awakening.bdagscan.com/tx/{txHash}"
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error creating audit log");
            return StatusCode(500, new { success = false, message = "Failed to create audit log", error = ex.Message });
        }
    }
}

public class CreateAuditLogRequest
{
    public int ActionType { get; set; }
    public string TargetAddress { get; set; } = string.Empty;
    public string RecordId { get; set; } = string.Empty;
    public string ActionDetails { get; set; } = string.Empty;
    public string DataHash { get; set; } = string.Empty;
    public bool Success { get; set; }
    public string IpAddress { get; set; } = string.Empty;
    public string UserAgent { get; set; } = string.Empty;
    public string PrivateKey { get; set; } = string.Empty;
}

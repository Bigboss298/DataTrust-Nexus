namespace DataTrustNexus.Api.Models.DTOs;

/// <summary>
/// DTO for audit log entry
/// </summary>
public class AuditLogDto
{
    public string Id { get; set; } = string.Empty;
    public string ActionType { get; set; } = string.Empty;
    public string ActorId { get; set; } = string.Empty;
    public string ActorName { get; set; } = string.Empty;
    public string ActorWalletAddress { get; set; } = string.Empty;
    public string? TargetWalletAddress { get; set; }
    public string? RecordId { get; set; }
    public string? DataHash { get; set; }
    public string ActionDetails { get; set; } = string.Empty;
    public bool Success { get; set; }
    public DateTime Timestamp { get; set; }
    public string? IpAddress { get; set; }
    public string? ErrorMessage { get; set; }
    public string? BlockchainTransactionHash { get; set; }
}

/// <summary>
/// DTO for querying audit logs
/// </summary>
public class AuditLogQueryDto
{
    public string? ActorWalletAddress { get; set; }
    public string? RecordId { get; set; }
    public string? ActionType { get; set; }
    public DateTime? StartDate { get; set; }
    public DateTime? EndDate { get; set; }
    public int Page { get; set; } = 1;
    public int PageSize { get; set; } = 50;
}

/// <summary>
/// Response DTO for audit logs
/// </summary>
public class AuditLogResponseDto
{
    public List<AuditLogDto> Logs { get; set; } = new();
    public int TotalCount { get; set; }
    public int Page { get; set; }
    public int PageSize { get; set; }
    public int TotalPages { get; set; }
}

/// <summary>
/// DTO for audit statistics
/// </summary>
public class AuditStatisticsDto
{
    public int TotalUploads { get; set; }
    public int TotalVerifications { get; set; }
    public int SuccessfulVerifications { get; set; }
    public int FailedVerifications { get; set; }
    public int TotalAccessGrants { get; set; }
    public int TotalAccessRevocations { get; set; }
    public int TotalInstitutions { get; set; }
    public Dictionary<string, int> ActionTypeCounts { get; set; } = new();
    public List<RecentActivityDto> RecentActivities { get; set; } = new();
}

/// <summary>
/// DTO for recent activity
/// </summary>
public class RecentActivityDto
{
    public string ActionType { get; set; } = string.Empty;
    public string ActorName { get; set; } = string.Empty;
    public string Details { get; set; } = string.Empty;
    public DateTime Timestamp { get; set; }
    public bool Success { get; set; }
}


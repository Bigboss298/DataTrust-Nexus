namespace DataTrustNexus.Api.Interfaces;

/// <summary>
/// Service for audit trail operations on BlockDAG
/// </summary>
public interface IAuditService
{
    // WRITE OPERATIONS
    Task<string> LogActionAsync(int actionType, string targetAddress, string recordId, string actionDetails, string dataHash, bool success, string ipAddress, string userAgent, string privateKey);
    
    // READ OPERATIONS
    Task<List<AuditLogEntry>> GetAllAuditLogsAsync(int skip = 0, int take = 50);
    Task<List<AuditLogEntry>> GetAuditLogsByActorAsync(string actorAddress, int skip = 0, int take = 50);
    Task<List<AuditLogEntry>> GetAuditLogsByRecordAsync(string recordId, int skip = 0, int take = 50);
    Task<List<AuditLogEntry>> GetAuditLogsByActionTypeAsync(int actionType, int skip = 0, int take = 50);
    Task<AuditLogEntry?> GetAuditLogByIdAsync(ulong logId);
    Task<List<AuditLogEntry>> GetRecentAuditLogsAsync(int count = 50);
    Task<AuditStatistics> GetAuditStatisticsAsync(string? startDate = null, string? endDate = null);
}

public class AuditLogEntry
{
    public ulong LogId { get; set; }
    public int ActionType { get; set; }
    public string Actor { get; set; } = string.Empty;
    public string TargetAddress { get; set; } = string.Empty;
    public string RecordId { get; set; } = string.Empty;
    public string ActionDetails { get; set; } = string.Empty;
    public string DataHash { get; set; } = string.Empty;
    public bool Success { get; set; }
    public long Timestamp { get; set; }
    public string TimestampFormatted { get; set; } = string.Empty;
    public string IpAddress { get; set; } = string.Empty;
    public string UserAgent { get; set; } = string.Empty;
}

public class AuditStatistics
{
    public int TotalUploads { get; set; }
    public int TotalVerifications { get; set; }
    public int SuccessfulVerifications { get; set; }
    public int FailedVerifications { get; set; }
    public int TotalAccessGrants { get; set; }
    public int TotalAccessRevocations { get; set; }
    public int TotalInstitutions { get; set; }
    public Dictionary<string, int> ActionTypeCounts { get; set; } = new();
}


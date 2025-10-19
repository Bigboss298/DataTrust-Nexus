using DataTrustNexus.Api.Interfaces;
using DataTrustNexus.Api.Models;
using DataTrustNexus.Api.Models.DTOs;

namespace DataTrustNexus.Api.Implementations.Services;

public class AccessRequestService : IAccessRequestService
{
    private readonly ILogger<AccessRequestService> _logger;
    private static readonly List<AccessRequestModel> _requests = new();
    private static readonly object _lock = new();

    public AccessRequestService(ILogger<AccessRequestService> logger)
    {
        _logger = logger;
    }

    public async Task<AccessRequestModel> SubmitAccessRequestAsync(SubmitAccessRequestDto dto, string requesterWalletAddress)
    {
        _logger.LogInformation("📝 New access request submitted for record {RecordId} by {Requester}", 
            dto.RecordId, requesterWalletAddress);

        var request = new AccessRequestModel
        {
            Id = Guid.NewGuid().ToString(),
            RecordId = dto.RecordId,
            RequesterWalletAddress = requesterWalletAddress,
            OwnerWalletAddress = string.Empty, // Will be populated from blockchain
            PermissionType = dto.PermissionType,
            RequestReason = dto.RequestReason,
            RequestedAt = DateTime.UtcNow,
            Status = "pending"
        };

        lock (_lock)
        {
            _requests.Add(request);
        }

        _logger.LogInformation("✅ Access request created with ID {RequestId}", request.Id);
        return await Task.FromResult(request);
    }

    public async Task<List<AccessRequestResponseDto>> GetPendingRequestsAsync(string ownerWalletAddress)
    {
        _logger.LogInformation("📋 Fetching pending requests for owner {Owner}", ownerWalletAddress);

        var requests = _requests
            .Where(r => r.Status == "pending" && r.OwnerWalletAddress.Equals(ownerWalletAddress, StringComparison.OrdinalIgnoreCase))
            .Select(r => new AccessRequestResponseDto
            {
                Id = r.Id,
                RecordId = r.RecordId,
                RecordFileName = "Unknown", // Will be populated from blockchain
                RequesterWalletAddress = r.RequesterWalletAddress,
                RequesterInstitutionName = "Unknown",
                OwnerWalletAddress = r.OwnerWalletAddress,
                OwnerInstitutionName = "Unknown",
                PermissionType = r.PermissionType,
                RequestReason = r.RequestReason,
                RequestedAt = r.RequestedAt,
                Status = r.Status,
                RespondedAt = r.RespondedAt,
                ResponseNote = r.ResponseNote
            })
            .ToList();

        _logger.LogInformation("✅ Found {Count} pending requests", requests.Count);
        return await Task.FromResult(requests);
    }

    public async Task<List<AccessRequestResponseDto>> GetMyRequestsAsync(string requesterWalletAddress)
    {
        _logger.LogInformation("📋 Fetching requests submitted by {Requester}", requesterWalletAddress);

        var requests = _requests
            .Where(r => r.RequesterWalletAddress.Equals(requesterWalletAddress, StringComparison.OrdinalIgnoreCase))
            .Select(r => new AccessRequestResponseDto
            {
                Id = r.Id,
                RecordId = r.RecordId,
                RecordFileName = "Unknown",
                RequesterWalletAddress = r.RequesterWalletAddress,
                RequesterInstitutionName = "Unknown",
                OwnerWalletAddress = r.OwnerWalletAddress,
                OwnerInstitutionName = "Unknown",
                PermissionType = r.PermissionType,
                RequestReason = r.RequestReason,
                RequestedAt = r.RequestedAt,
                Status = r.Status,
                RespondedAt = r.RespondedAt,
                ResponseNote = r.ResponseNote
            })
            .OrderByDescending(r => r.RequestedAt)
            .ToList();

        _logger.LogInformation("✅ Found {Count} requests", requests.Count);
        return await Task.FromResult(requests);
    }

    public async Task<AccessRequestModel?> RespondToRequestAsync(RespondToRequestDto dto, string responderWalletAddress)
    {
        _logger.LogInformation("📝 Responding to request {RequestId} with action {Action}", 
            dto.RequestId, dto.Action);

        lock (_lock)
        {
            var request = _requests.FirstOrDefault(r => r.Id == dto.RequestId);
            
            if (request == null)
            {
                _logger.LogWarning("❌ Request {RequestId} not found", dto.RequestId);
                return null;
            }

            if (!request.OwnerWalletAddress.Equals(responderWalletAddress, StringComparison.OrdinalIgnoreCase))
            {
                _logger.LogWarning("❌ Unauthorized: {Responder} is not the owner", responderWalletAddress);
                return null;
            }

            request.Status = dto.Action; // "approved" or "denied"
            request.RespondedAt = DateTime.UtcNow;
            request.ResponseNote = dto.ResponseNote;

            _logger.LogInformation("✅ Request {RequestId} marked as {Status}", request.Id, request.Status);
            return request;
        }
    }

    public async Task<bool> HasPendingRequestAsync(string recordId, string requesterWalletAddress)
    {
        var hasPending = _requests.Any(r => 
            r.RecordId == recordId && 
            r.RequesterWalletAddress.Equals(requesterWalletAddress, StringComparison.OrdinalIgnoreCase) &&
            r.Status == "pending");

        return await Task.FromResult(hasPending);
    }
}


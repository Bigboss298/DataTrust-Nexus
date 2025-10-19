using DataTrustNexus.Api.Models;
using DataTrustNexus.Api.Models.DTOs;

namespace DataTrustNexus.Api.Interfaces;

public interface IAccessRequestService
{
    Task<AccessRequestModel> SubmitAccessRequestAsync(SubmitAccessRequestDto dto, string requesterWalletAddress);
    Task<List<AccessRequestResponseDto>> GetPendingRequestsAsync(string ownerWalletAddress);
    Task<List<AccessRequestResponseDto>> GetMyRequestsAsync(string requesterWalletAddress);
    Task<AccessRequestModel?> RespondToRequestAsync(RespondToRequestDto dto, string responderWalletAddress);
    Task<bool> HasPendingRequestAsync(string recordId, string requesterWalletAddress);
}


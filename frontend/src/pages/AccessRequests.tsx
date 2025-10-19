import { useEffect, useState } from 'react';
import { useWalletStore } from '../stores/wallet-store';
import { useAccessRequestStore } from '../stores/access-request-store';
import { 
  Mail, 
  CheckCircle, 
  XCircle, 
  Clock, 
  FileText, 
  User,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';

export const AccessRequests = () => {
  const { address, isConnected } = useWalletStore();
  const { 
    pendingRequests, 
    myRequests, 
    isLoading, 
    error,
    getPendingRequests, 
    getMyRequests, 
    respondToRequest,
    submitAccessRequest,
    clearError
  } = useAccessRequestStore();
  
  const [activeTab, setActiveTab] = useState<'pending' | 'myrequests'>('pending');
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [requestForm, setRequestForm] = useState({
    recordId: '',
    permissionType: 'read',
    requestReason: '',
  });
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    if (address) {
      getPendingRequests(address);
      getMyRequests(address);
    }
  }, [address]);

  const handleRespond = async (requestId: string, action: 'approve' | 'deny', responseNote?: string) => {
    if (!address) return;

    try {
      clearError();
      setSuccess(null);

      await respondToRequest({ requestId, action, responseNote }, address);
      
      setSuccess(`Access request ${action === 'approve' ? 'approved' : 'denied'} successfully!`);
      
      // Refresh requests
      getPendingRequests(address);
      getMyRequests(address);
    } catch (err: any) {
      setSuccess(null);
      // Error is handled by the store
    }
  };

  const handleSubmitRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!address) return;

    try {
      clearError();
      setSuccess(null);
      
      await submitAccessRequest(
        {
          recordId: requestForm.recordId,
          permissionType: requestForm.permissionType,
          requestReason: requestForm.requestReason,
        },
        address
      );
      
      setSuccess('Access request submitted successfully!');
      setShowRequestModal(false);
      setRequestForm({
        recordId: '',
        permissionType: 'read',
        requestReason: '',
      });
      
      // Refresh my requests
      getMyRequests(address);
    } catch (err: any) {
      // Error is handled by the store
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return (
          <span className="px-2 py-1 bg-yellow-500/20 text-yellow-400 rounded text-xs flex items-center gap-1">
            <Clock size={12} />
            Pending
          </span>
        );
      case 'approved':
        return (
          <span className="px-2 py-1 bg-green-500/20 text-green-400 rounded text-xs flex items-center gap-1">
            <CheckCircle2 size={12} />
            Approved
          </span>
        );
      case 'denied':
        return (
          <span className="px-2 py-1 bg-red-500/20 text-red-400 rounded text-xs flex items-center gap-1">
            <XCircle size={12} />
            Denied
          </span>
        );
      default:
        return null;
    }
  };

  if (!isConnected) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <Mail className="text-primary-500 mb-4" size={64} />
        <h2 className="text-2xl font-bold text-white mb-2">Access Requests</h2>
        <p className="text-gray-400 text-center max-w-md">
          Please connect your wallet to manage access requests
        </p>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
        <h1 className="text-3xl font-bold text-white">Access Requests</h1>
        <p className="text-gray-400 mt-1">
            Manage access requests for your data
          </p>
        </div>
        
        <button
          onClick={() => setShowRequestModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition"
        >
          <Mail size={18} />
          <span>Request Access</span>
        </button>
      </div>

      {success && (
        <div className="mb-6 p-4 bg-green-500/20 border border-green-500 rounded-lg flex items-start gap-3">
          <CheckCircle className="text-green-500 flex-shrink-0" size={20} />
          <p className="text-green-400">{success}</p>
        </div>
      )}

      {error && (
        <div className="mb-6 p-4 bg-red-500/20 border border-red-500 rounded-lg flex items-start gap-3">
          <AlertCircle className="text-red-500 flex-shrink-0" size={20} />
          <p className="text-red-400">{error}</p>
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-4 mb-6 border-b border-slate-700">
        <button
          onClick={() => setActiveTab('pending')}
          className={`px-4 py-2 font-medium transition ${
            activeTab === 'pending'
              ? 'text-primary-400 border-b-2 border-primary-400'
              : 'text-gray-400 hover:text-white'
          }`}
        >
          Pending Requests ({pendingRequests.length})
        </button>
        <button
          onClick={() => setActiveTab('myrequests')}
          className={`px-4 py-2 font-medium transition ${
            activeTab === 'myrequests'
              ? 'text-primary-400 border-b-2 border-primary-400'
              : 'text-gray-400 hover:text-white'
          }`}
        >
          My Requests ({myRequests.length})
        </button>
      </div>

      {/* Content */}
      <div className="bg-slate-800 rounded-lg p-6">
        {activeTab === 'pending' ? (
          pendingRequests.length > 0 ? (
            <div className="space-y-4">
              {pendingRequests.map((request) => (
                <div
                  key={request.id}
                  className="p-4 bg-slate-700 rounded-lg"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <FileText className="text-primary-400" size={20} />
                        <h3 className="text-white font-medium">{request.recordFileName}</h3>
                        {getStatusBadge(request.status)}
                      </div>
                      <div className="text-sm text-gray-400 space-y-1">
                        <p className="flex items-center gap-2">
                          <User size={14} />
                          Requested by: {request.requesterWalletAddress.slice(0, 10)}...{request.requesterWalletAddress.slice(-8)}
                        </p>
                        <p>Permission Type: <span className="text-primary-400">{request.permissionType}</span></p>
                        <p>Requested: {new Date(request.requestedAt).toLocaleString()}</p>
                    {request.requestReason && (
                          <p className="italic mt-2">Reason: "{request.requestReason}"</p>
                        )}
                      </div>
                  </div>

                    <div className="flex gap-2">
                    <button
                        onClick={() => handleRespond(request.id, 'approve')}
                      disabled={isLoading}
                      className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition disabled:opacity-50"
                    >
                      <CheckCircle size={18} />
                      <span>Approve</span>
                    </button>
                    <button
                        onClick={() => handleRespond(request.id, 'deny')}
                      disabled={isLoading}
                      className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition disabled:opacity-50"
                    >
                      <XCircle size={18} />
                      <span>Deny</span>
                    </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-400 text-center py-10">No pending requests</p>
          )
        ) : (
          myRequests.length > 0 ? (
            <div className="space-y-4">
              {myRequests.map((request) => (
                <div
                  key={request.id}
                  className="p-4 bg-slate-700 rounded-lg"
                >
                  <div className="flex items-center gap-3 mb-2">
                    <FileText className="text-primary-400" size={20} />
                        <h3 className="text-white font-medium">{request.recordFileName}</h3>
                    {getStatusBadge(request.status)}
                      </div>
                  <div className="text-sm text-gray-400 space-y-1">
                    <p>Permission Type: <span className="text-primary-400">{request.permissionType}</span></p>
                    <p>Requested: {new Date(request.requestedAt).toLocaleString()}</p>
                    {request.respondedAt && (
                      <p>Responded: {new Date(request.respondedAt).toLocaleString()}</p>
                    )}
                    {request.requestReason && (
                      <p className="italic mt-2">Reason: "{request.requestReason}"</p>
                    )}
                    {request.responseNote && (
                      <p className={`mt-2 ${request.status === 'approved' ? 'text-green-400' : 'text-red-400'}`}>
                        Response: "{request.responseNote}"
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-400 text-center py-10">No requests submitted</p>
          )
        )}
      </div>

      {/* Request Access Modal */}
      {showRequestModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-slate-800 rounded-lg p-6 max-w-md w-full mx-4">
            <h2 className="text-xl font-bold text-white mb-4">Request Access</h2>
            
            <form onSubmit={handleSubmitRequest} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Record ID
                </label>
                <input
                  type="text"
                  value={requestForm.recordId}
                  onChange={(e) => setRequestForm({ ...requestForm, recordId: e.target.value })}
                  className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder="Enter record ID"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Permission Type
                </label>
                <select
                  value={requestForm.permissionType}
                  onChange={(e) => setRequestForm({ ...requestForm, permissionType: e.target.value })}
                  className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  <option value="read">Read</option>
                  <option value="verify">Verify</option>
                  <option value="full">Full Access</option>
                </select>
            </div>

              <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                  Reason
              </label>
              <textarea
                  value={requestForm.requestReason}
                  onChange={(e) => setRequestForm({ ...requestForm, requestReason: e.target.value })}
                className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                rows={3}
                  placeholder="Explain why you need access to this data"
                  required
              />
            </div>

            <div className="flex gap-3">
              <button
                type="button"
                  onClick={() => setShowRequestModal(false)}
                className="flex-1 px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition"
              >
                Cancel
              </button>
              <button
                  type="submit"
                disabled={isLoading}
                  className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition disabled:opacity-50"
                >
                  {isLoading ? 'Submitting...' : 'Submit Request'}
              </button>
            </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

import { useEffect, useState } from 'react';
import { useWalletStore } from '../stores/wallet-store';
import { useAccessStore } from '../stores/access-store';
import { useDataStore } from '../stores/data-store';
import { Lock, Unlock, UserPlus, CheckCircle, AlertCircle, Calendar } from 'lucide-react';

export const AccessControl = () => {
  const { address, isConnected } = useWalletStore();
  const { grantedPermissions, receivedPermissions, grantAccess, revokeAccess, getGrantedPermissions, getReceivedPermissions, isLoading } = useAccessStore();
  const { records, getInstitutionRecords } = useDataStore();
  
  const [activeTab, setActiveTab] = useState<'granted' | 'received'>('granted');
  const [showGrantModal, setShowGrantModal] = useState(false);
  const [grantForm, setGrantForm] = useState({
    recordId: '',
    granteeWalletAddress: '',
    permissionType: 'read',
    expiresAt: '',
    grantReason: '',
  });
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (address) {
      getInstitutionRecords(address);
      getGrantedPermissions(address);
      getReceivedPermissions(address);
    }
  }, [address]);

  const handleGrantAccess = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!address) return;

    try {
      setError(null);
      setSuccess(null);
      
      await grantAccess(
        {
          recordId: grantForm.recordId,
          granteeWalletAddress: grantForm.granteeWalletAddress,
          permissionType: grantForm.permissionType,
          expiresAt: grantForm.expiresAt || undefined,
          grantReason: grantForm.grantReason,
        },
        address
      );
      
      setSuccess('Access granted successfully!');
      setShowGrantModal(false);
      setGrantForm({
        recordId: '',
        granteeWalletAddress: '',
        permissionType: 'read',
        expiresAt: '',
        grantReason: '',
      });
      
      // Refresh permissions
      getGrantedPermissions(address);
    } catch (err: any) {
      setError(err.message || 'Failed to grant access');
    }
  };

  const handleRevokeAccess = async (recordId: string, granteeAddress: string) => {
    if (!address || !confirm('Are you sure you want to revoke this access?')) return;

    try {
      setError(null);
      setSuccess(null);
      
      await revokeAccess(
        {
          recordId,
          granteeWalletAddress: granteeAddress,
        },
        address
      );
      
      setSuccess('Access revoked successfully!');
      getGrantedPermissions(address);
    } catch (err: any) {
      setError(err.message || 'Failed to revoke access');
    }
  };

  if (!isConnected) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <Lock className="text-primary-500 mb-4" size={64} />
        <h2 className="text-2xl font-bold text-white mb-2">Access Control</h2>
        <p className="text-gray-400 text-center max-w-md">
          Please connect your wallet to manage access permissions
        </p>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Access Control</h1>
          <p className="text-gray-400 mt-1">
            Manage data access permissions
          </p>
        </div>
        
        <button
          onClick={() => setShowGrantModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition"
        >
          <UserPlus size={18} />
          <span>Grant Access</span>
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
          onClick={() => setActiveTab('granted')}
          className={`px-4 py-2 font-medium transition ${
            activeTab === 'granted'
              ? 'text-primary-400 border-b-2 border-primary-400'
              : 'text-gray-400 hover:text-white'
          }`}
        >
          Granted Permissions ({grantedPermissions.length})
        </button>
        <button
          onClick={() => setActiveTab('received')}
          className={`px-4 py-2 font-medium transition ${
            activeTab === 'received'
              ? 'text-primary-400 border-b-2 border-primary-400'
              : 'text-gray-400 hover:text-white'
          }`}
        >
          Received Permissions ({receivedPermissions.length})
        </button>
      </div>

      {/* Content */}
      <div className="bg-slate-800 rounded-lg p-6">
        {activeTab === 'granted' ? (
          grantedPermissions.length > 0 ? (
            <div className="space-y-4">
              {grantedPermissions.map((permission) => (
                <div
                  key={permission.id}
                  className="p-4 bg-slate-700 rounded-lg flex items-center justify-between"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <Lock className="text-primary-400" size={20} />
                      <h3 className="text-white font-medium">{permission.recordFileName}</h3>
                      <span
                        className={`px-2 py-1 rounded text-xs ${
                          permission.hasValidAccess
                            ? 'bg-green-500/20 text-green-400'
                            : 'bg-gray-500/20 text-gray-400'
                        }`}
                      >
                        {permission.hasValidAccess ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                    <div className="text-sm text-gray-400 space-y-1">
                      <p>Grantee: {permission.granteeWalletAddress.slice(0, 10)}...{permission.granteeWalletAddress.slice(-8)}</p>
                      <p>Permission: {permission.permissionType}</p>
                      <p>Granted: {new Date(permission.grantedAt).toLocaleString()}</p>
                      {permission.expiresAt && (
                        <p className="flex items-center gap-1">
                          <Calendar size={14} />
                          Expires: {new Date(permission.expiresAt).toLocaleString()}
                        </p>
                      )}
                    </div>
                  </div>
                  
                  {permission.isActive && (
                    <button
                      onClick={() => handleRevokeAccess(permission.recordId, permission.granteeWalletAddress)}
                      disabled={isLoading}
                      className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition disabled:opacity-50"
                    >
                      <Unlock size={18} />
                      <span>Revoke</span>
                    </button>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-400 text-center py-10">No granted permissions</p>
          )
        ) : (
          receivedPermissions.length > 0 ? (
            <div className="space-y-4">
              {receivedPermissions.map((permission) => (
                <div
                  key={permission.id}
                  className="p-4 bg-slate-700 rounded-lg"
                >
                  <div className="flex items-center gap-3 mb-2">
                    <Lock className="text-green-400" size={20} />
                    <h3 className="text-white font-medium">{permission.recordFileName}</h3>
                    <span
                      className={`px-2 py-1 rounded text-xs ${
                        permission.hasValidAccess
                          ? 'bg-green-500/20 text-green-400'
                          : 'bg-gray-500/20 text-gray-400'
                      }`}
                    >
                      {permission.hasValidAccess ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                  <div className="text-sm text-gray-400 space-y-1">
                    <p>Permission: {permission.permissionType}</p>
                    <p>Granted: {new Date(permission.grantedAt).toLocaleString()}</p>
                    {permission.expiresAt && (
                      <p className="flex items-center gap-1">
                        <Calendar size={14} />
                        Expires: {new Date(permission.expiresAt).toLocaleString()}
                      </p>
                    )}
                    {permission.grantReason && (
                      <p className="italic">Reason: {permission.grantReason}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-400 text-center py-10">No received permissions</p>
          )
        )}
      </div>

      {/* Grant Access Modal */}
      {showGrantModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-slate-800 rounded-lg p-6 max-w-md w-full mx-4">
            <h2 className="text-xl font-bold text-white mb-4">Grant Access</h2>
            
            <form onSubmit={handleGrantAccess} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Select Record
                </label>
                <select
                  value={grantForm.recordId}
                  onChange={(e) => setGrantForm({ ...grantForm, recordId: e.target.value })}
                  className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                  required
                >
                  <option value="">Select a record...</option>
                  {records.map((record) => (
                    <option key={record.recordId} value={record.recordId}>
                      {record.fileName}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Grantee Wallet Address
                </label>
                <input
                  type="text"
                  value={grantForm.granteeWalletAddress}
                  onChange={(e) => setGrantForm({ ...grantForm, granteeWalletAddress: e.target.value })}
                  className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder="0x..."
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Permission Type
                </label>
                <select
                  value={grantForm.permissionType}
                  onChange={(e) => setGrantForm({ ...grantForm, permissionType: e.target.value })}
                  className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  <option value="read">Read</option>
                  <option value="verify">Verify</option>
                  <option value="full">Full Access</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Expiration Date (Optional)
                </label>
                <input
                  type="datetime-local"
                  value={grantForm.expiresAt}
                  onChange={(e) => setGrantForm({ ...grantForm, expiresAt: e.target.value })}
                  className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Reason
                </label>
                <textarea
                  value={grantForm.grantReason}
                  onChange={(e) => setGrantForm({ ...grantForm, grantReason: e.target.value })}
                  className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                  rows={2}
                  placeholder="Optional reason for granting access"
                />
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowGrantModal(false)}
                  className="flex-1 px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="flex-1 px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition disabled:opacity-50"
                >
                  {isLoading ? 'Granting...' : 'Grant Access'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};


import { useEffect, useState } from 'react';
import { useWalletStore } from '../stores/wallet-store';
import { useAuditStore } from '../stores/audit-store';
import { FileText, CheckCircle, AlertCircle, Filter, Download } from 'lucide-react';
import { format } from 'date-fns';

export const AuditLogs = () => {
  const { address, isConnected } = useWalletStore();
  const { logs, recentLogs, getRecentLogs, getLogsByActor, queryLogs, isLoading } = useAuditStore();
  
  const [filter, setFilter] = useState({
    actionType: '',
    startDate: '',
    endDate: '',
  });
  
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    if (address) {
      getRecentLogs(50);
      getLogsByActor(address);
    }
  }, [address]);

  const handleFilter = () => {
    const query: any = {
      page: 1,
      pageSize: 50,
    };

    if (address) query.actorWalletAddress = address;
    if (filter.actionType) query.actionType = filter.actionType;
    if (filter.startDate) query.startDate = new Date(filter.startDate).toISOString();
    if (filter.endDate) query.endDate = new Date(filter.endDate).toISOString();

    queryLogs(query);
  };

  const exportLogs = () => {
    const dataStr = JSON.stringify(logs, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `audit-logs-${Date.now()}.json`;
    link.click();
  };

  if (!isConnected) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <FileText className="text-primary-500 mb-4" size={64} />
        <h2 className="text-2xl font-bold text-white mb-2">Audit Logs</h2>
        <p className="text-gray-400 text-center max-w-md">
          Please connect your wallet to view audit logs
        </p>
      </div>
    );
  }

  const displayLogs = logs.length > 0 ? logs : recentLogs;

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Audit Logs</h1>
          <p className="text-gray-400 mt-1">
            Complete audit trail of all platform activities
          </p>
        </div>
        
        <div className="flex gap-3">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2 px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition"
          >
            <Filter size={18} />
            <span>Filters</span>
          </button>
          
          <button
            onClick={exportLogs}
            disabled={displayLogs.length === 0}
            className="flex items-center gap-2 px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition disabled:opacity-50"
          >
            <Download size={18} />
            <span>Export</span>
          </button>
        </div>
      </div>

      {/* Filters */}
      {showFilters && (
        <div className="bg-slate-800 rounded-lg p-6 mb-6">
          <h3 className="text-lg font-semibold text-white mb-4">Filters</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Action Type
              </label>
              <select
                value={filter.actionType}
                onChange={(e) => setFilter({ ...filter, actionType: e.target.value })}
                className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="">All Actions</option>
                <option value="INSTITUTION_REGISTERED">Institution Registered</option>
                <option value="DATA_UPLOADED">Data Uploaded</option>
                <option value="ACCESS_GRANTED">Access Granted</option>
                <option value="ACCESS_REVOKED">Access Revoked</option>
                <option value="VERIFICATION_REQUESTED">Verification Requested</option>
                <option value="VERIFICATION_COMPLETED">Verification Completed</option>
                <option value="DATA_ACCESSED">Data Accessed</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Start Date
              </label>
              <input
                type="date"
                value={filter.startDate}
                onChange={(e) => setFilter({ ...filter, startDate: e.target.value })}
                className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                End Date
              </label>
              <input
                type="date"
                value={filter.endDate}
                onChange={(e) => setFilter({ ...filter, endDate: e.target.value })}
                className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
          </div>

          <button
            onClick={handleFilter}
            disabled={isLoading}
            className="px-6 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition disabled:opacity-50"
          >
            {isLoading ? 'Loading...' : 'Apply Filters'}
          </button>
        </div>
      )}

      {/* Logs List */}
      <div className="bg-slate-800 rounded-lg p-6">
        {isLoading ? (
          <p className="text-gray-400 text-center py-10">Loading audit logs...</p>
        ) : displayLogs.length > 0 ? (
          <div className="space-y-3">
            {displayLogs.map((log) => (
              <div
                key={log.id}
                className="p-4 bg-slate-700 rounded-lg hover:bg-slate-600 transition"
              >
                <div className="flex items-start gap-3">
                  <div className={`p-2 rounded-lg ${log.success ? 'bg-green-500/20' : 'bg-red-500/20'}`}>
                    {log.success ? (
                      <CheckCircle className="text-green-500" size={20} />
                    ) : (
                      <AlertCircle className="text-red-500" size={20} />
                    )}
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h3 className="text-white font-medium">
                          {log.actionType.replace(/_/g, ' ')}
                        </h3>
                        <p className="text-sm text-gray-400">{log.actionDetails}</p>
                      </div>
                      
                      <span className={`px-2 py-1 rounded text-xs ${
                        log.success
                          ? 'bg-green-500/20 text-green-400'
                          : 'bg-red-500/20 text-red-400'
                      }`}>
                        {log.success ? 'Success' : 'Failed'}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs text-gray-400">
                      <div>
                        <span className="font-medium">Actor:</span> {log.actorName}
                      </div>
                      
                      {log.recordId && (
                        <div>
                          <span className="font-medium">Record:</span> {log.recordId}
                        </div>
                      )}
                      
                      {log.targetWalletAddress && (
                        <div>
                          <span className="font-medium">Target:</span>{' '}
                          {log.targetWalletAddress.slice(0, 10)}...{log.targetWalletAddress.slice(-8)}
                        </div>
                      )}
                      
                      <div>
                        <span className="font-medium">Time:</span>{' '}
                        {format(new Date(log.timestamp), 'PPpp')}
                      </div>
                    </div>

                    {log.dataHash && (
                      <div className="mt-2 text-xs">
                        <span className="text-gray-400 font-medium">Hash:</span>{' '}
                        <span className="text-primary-400 font-mono">{log.dataHash}</span>
                      </div>
                    )}

                    {log.blockchainTransactionHash && (
                      <div className="mt-1 text-xs">
                        <span className="text-gray-400 font-medium">TX:</span>{' '}
                        <span className="text-primary-400 font-mono">{log.blockchainTransactionHash}</span>
                      </div>
                    )}

                    {!log.success && log.errorMessage && (
                      <div className="mt-2 p-2 bg-red-500/10 rounded text-xs text-red-400">
                        Error: {log.errorMessage}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-400 text-center py-10">No audit logs found</p>
        )}
      </div>

      {/* Compliance Note */}
      <div className="mt-6 bg-slate-800 rounded-lg p-4 border-l-4 border-primary-500">
        <p className="text-sm text-gray-300">
          <strong className="text-white">Compliance:</strong> All audit logs are immutable and stored both 
          on-chain and in the database to meet NIST SP 800-53 audit trail requirements. Logs include 
          timestamp, actor, action, and result information.
        </p>
      </div>
    </div>
  );
};


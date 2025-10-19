import { useEffect, useState } from 'react';
import { useWalletStore } from '../stores/wallet-store';
import { useDataStore } from '../stores/data-store';
import { useAccessRequestStore } from '../stores/access-request-store';
import { 
  Database, 
  Search, 
  Filter, 
  FileText,
  Eye,
  Mail,
  AlertCircle,
  CheckCircle
} from 'lucide-react';

export const BrowseFiles = () => {
  const { address, isConnected } = useWalletStore();
  const { records, getAllRecords, isLoading } = useDataStore();
  const { submitAccessRequest, hasPendingRequest } = useAccessRequestStore();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedInstitution, setSelectedInstitution] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'date' | 'name' | 'category'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<any>(null);
  const [requestForm, setRequestForm] = useState({
    permissionType: 'read',
    requestReason: '',
  });
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getAllRecords();
  }, []);

  // Get unique categories and institutions from records
  const categories = Array.from(new Set(records.map(r => r.category)));
  const institutions = Array.from(new Set(records.map(r => r.ownerName).filter(Boolean)));

  // Filter and sort records (exclude user's own files)
  const filteredRecords = records
    .filter(record => {
      // Exclude user's own files
      if (record.ownerWalletAddress?.toLowerCase() === address?.toLowerCase()) {
        return false;
      }
      
      const matchesSearch = record.fileName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           record.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           record.recordId.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesCategory = selectedCategory === 'all' || record.category === selectedCategory;
      const matchesInstitution = selectedInstitution === 'all' || record.ownerName === selectedInstitution;
      
      return matchesSearch && matchesCategory && matchesInstitution;
    })
    .sort((a, b) => {
      let comparison = 0;
      
      switch (sortBy) {
        case 'date':
          comparison = (a.uploadedAt * 1000) - (b.uploadedAt * 1000);
          break;
        case 'name':
          comparison = a.fileName.localeCompare(b.fileName);
          break;
        case 'category':
          comparison = a.category.localeCompare(b.category);
          break;
      }
      
      return sortOrder === 'asc' ? comparison : -comparison;
    });

  // Debug logging
  useEffect(() => {
    console.log('📊 BrowseFiles - Records loaded:', records.length);
    console.log('📊 BrowseFiles - Filtered records:', filteredRecords.length);
  }, [records, filteredRecords]);

  const handleRequestAccess = (record: any) => {
    setSelectedRecord(record);
    setShowRequestModal(true);
  };

  const handleSubmitRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!address || !selectedRecord) return;

    try {
      setError(null);
      setSuccess(null);
      
      await submitAccessRequest(
        {
          recordId: selectedRecord.recordId,
          permissionType: requestForm.permissionType,
          requestReason: requestForm.requestReason,
        },
        address
      );
      
      setSuccess('Access request submitted successfully!');
      setShowRequestModal(false);
      setRequestForm({
        permissionType: 'read',
        requestReason: '',
      });
    } catch (err: any) {
      setError(err.message || 'Failed to submit access request');
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  if (!isConnected) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <Database className="text-primary-500 mb-4" size={64} />
        <h2 className="text-2xl font-bold text-white mb-2">Browse Files</h2>
        <p className="text-gray-400 text-center max-w-md">
          Please connect your wallet to browse available files
        </p>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-white">Browse Files</h1>
        <p className="text-gray-400 mt-1">
          Discover and request access to available data files
        </p>
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

      {/* Filters */}
      <div className="mb-6 flex flex-col md:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Search by filename, description, or record ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
        </div>
        
        <div className="flex gap-2">
          <select
            value={selectedInstitution}
            onChange={(e) => setSelectedInstitution(e.target.value)}
            className="px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            <option value="all">All Institutions</option>
            {institutions.map(inst => (
              <option key={inst} value={inst}>{inst}</option>
            ))}
          </select>
          
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            <option value="all">All Categories</option>
            {categories.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
          
          <select
            value={`${sortBy}-${sortOrder}`}
            onChange={(e) => {
              const [field, order] = e.target.value.split('-');
              setSortBy(field as any);
              setSortOrder(order as any);
            }}
            className="px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            <option value="date-desc">Newest First</option>
            <option value="date-asc">Oldest First</option>
            <option value="name-asc">Name (A-Z)</option>
            <option value="name-desc">Name (Z-A)</option>
            <option value="category-asc">Category (A-Z)</option>
          </select>
        </div>
      </div>

      {/* Results */}
      <div className="bg-slate-800 rounded-lg overflow-hidden">
        {isLoading ? (
          <div className="p-10 text-center">
            <Database className="text-primary-500 mx-auto mb-4 animate-pulse" size={48} />
            <p className="text-gray-400">Loading files...</p>
          </div>
        ) : filteredRecords.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">File</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Category</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Size</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Uploaded</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Owner</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700">
                {filteredRecords.map((record) => (
                  <tr key={record.recordId} className="hover:bg-slate-700/50 transition">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <FileText className="text-primary-400" size={20} />
                        <div>
                          <p className="text-white font-medium">{record.fileName}</p>
                          <p className="text-xs text-gray-400 font-mono">{record.recordId}</p>
                          {record.description && (
                            <p className="text-xs text-gray-500 mt-1">{record.description}</p>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-2 py-1 bg-primary-500/20 text-primary-400 rounded text-xs">
                        {record.category}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-400">
                      {formatFileSize(record.fileSize)}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-400">
                      {new Date(record.uploadedAt * 1000).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric'
                      })}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-400">
                      <p className="text-white font-medium">{record.ownerName || 'Unknown'}</p>
                      <p className="font-mono text-xs text-gray-500">
                        {record.ownerWalletAddress ? `${record.ownerWalletAddress.slice(0, 6)}...${record.ownerWalletAddress.slice(-4)}` : 'N/A'}
                      </p>
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => handleRequestAccess(record)}
                        className="flex items-center gap-2 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition"
                      >
                        <Mail size={16} />
                        <span>Request Access</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-10 text-center">
            <Database className="text-gray-600 mx-auto mb-4" size={48} />
            <p className="text-gray-400">No files found</p>
          </div>
        )}
      </div>

      {/* Request Access Modal */}
      {showRequestModal && selectedRecord && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-slate-800 rounded-lg p-6 max-w-md w-full mx-4">
            <h2 className="text-xl font-bold text-white mb-4">Request Access</h2>
            
            <div className="mb-4 p-3 bg-slate-700 rounded-lg">
              <p className="text-sm text-gray-400">File</p>
              <p className="text-white font-medium">{selectedRecord.fileName}</p>
              <p className="text-xs text-gray-500 font-mono mt-1">{selectedRecord.recordId}</p>
            </div>
            
            <form onSubmit={handleSubmitRequest} className="space-y-4">
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
                  Submit Request
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};


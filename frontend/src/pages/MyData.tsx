import { useEffect, useState } from 'react';
import { useWalletStore } from '../stores/wallet-store';
import { useDataStore } from '../stores/data-store';
import { useAccessStore } from '../stores/access-store';
import { 
  Database, 
  Search, 
  Filter, 
  Eye, 
  Lock, 
  Unlock,
  Calendar,
  FileText,
  Tag,
  AlertCircle,
  CheckCircle,
  XCircle,
  Shield
} from 'lucide-react';

export const MyData = () => {
  const { address } = useWalletStore();
  const { records, isLoading, getInstitutionRecords, deactivateRecord, verifyData } = useDataStore();
  const { grantedPermissions, getGrantedPermissions } = useAccessStore();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [sortBy, setSortBy] = useState<'date' | 'name' | 'category'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [verificationStatus, setVerificationStatus] = useState<Record<string, 'verified' | 'failed' | 'verifying' | 'pending'>>({});

  useEffect(() => {
    if (address) {
      getInstitutionRecords(address);
      getGrantedPermissions(address);
    }
  }, [address, getInstitutionRecords, getGrantedPermissions]);

  // Auto-verify records when they're loaded
  useEffect(() => {
    const autoVerifyRecords = async () => {
      for (const record of records) {
        // Skip if already verified or currently verifying
        if (verificationStatus[record.recordId] === 'verified' || 
            verificationStatus[record.recordId] === 'verifying') {
          continue;
        }

        // Mark as verifying
        setVerificationStatus(prev => ({ ...prev, [record.recordId]: 'verifying' }));

        try {
          // Verify using the data hash from the record
          await verifyData(
            {
              recordId: record.recordId,
              providedHash: record.dataHash,
            },
            address!
          );
          
          // Mark as verified
          setVerificationStatus(prev => ({ ...prev, [record.recordId]: 'verified' }));
        } catch (error) {
          setVerificationStatus(prev => ({ ...prev, [record.recordId]: 'failed' }));
        }
      }
    };

    if (records.length > 0 && address) {
      autoVerifyRecords();
    }
  }, [records, address, verifyData]);

  // Get unique categories from records
  const categories = Array.from(new Set(records.map(r => r.category)));

  // Filter and sort records
  const filteredRecords = records
    .filter(record => {
      const matchesSearch = record.fileName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           record.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           record.recordId.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesCategory = selectedCategory === 'all' || record.category === selectedCategory;
      const matchesStatus = statusFilter === 'all' || 
                           (statusFilter === 'active' && record.isActive) ||
                           (statusFilter === 'inactive' && !record.isActive);
      
      return matchesSearch && matchesCategory && matchesStatus;
    })
    .sort((a, b) => {
      let comparison = 0;
      
      switch (sortBy) {
        case 'date':
          // uploadedAt is Unix timestamp in seconds, convert to milliseconds
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

  const handleDeactivate = async (recordId: string) => {
    if (window.confirm('Are you sure you want to deactivate this record?')) {
      try {
        await deactivateRecord(recordId, address!);
        await getInstitutionRecords(address!);
      } catch (error) {
        // Error handled by store
      }
    }
  };

  const getAccessCount = (recordId: string) => {
    return grantedPermissions.filter(p => p.recordId === recordId).length;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-white flex items-center gap-3">
          <Database className="text-primary-500" size={32} />
          My Data Records
        </h1>
        <p className="text-gray-400 mt-1">
          View and manage all your institution's data records
        </p>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-slate-800 rounded-lg p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-500/20 rounded-lg">
              <Database className="text-blue-400" size={20} />
            </div>
            <div>
              <p className="text-sm text-gray-400">Total Records</p>
              <p className="text-2xl font-bold text-white">{records.length}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-slate-800 rounded-lg p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-500/20 rounded-lg">
              <CheckCircle className="text-green-400" size={20} />
            </div>
            <div>
              <p className="text-sm text-gray-400">Active</p>
              <p className="text-2xl font-bold text-white">
                {records.filter(r => r.isActive).length}
              </p>
            </div>
          </div>
        </div>
        
        <div className="bg-slate-800 rounded-lg p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gray-500/20 rounded-lg">
              <XCircle className="text-gray-400" size={20} />
            </div>
            <div>
              <p className="text-sm text-gray-400">Inactive</p>
              <p className="text-2xl font-bold text-white">
                {records.filter(r => !r.isActive).length}
              </p>
            </div>
          </div>
        </div>
        
        <div className="bg-slate-800 rounded-lg p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-500/20 rounded-lg">
              <Unlock className="text-purple-400" size={20} />
            </div>
            <div>
              <p className="text-sm text-gray-400">Access Granted</p>
              <p className="text-2xl font-bold text-white">{grantedPermissions.length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-slate-800 rounded-lg p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search records..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-slate-700 text-white rounded-lg border border-slate-600 focus:border-primary-500 focus:outline-none"
            />
          </div>

          {/* Category Filter */}
          <div className="relative">
            <Tag className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-slate-700 text-white rounded-lg border border-slate-600 focus:border-primary-500 focus:outline-none appearance-none cursor-pointer"
            >
              <option value="all">All Categories</option>
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          {/* Status Filter */}
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as 'all' | 'active' | 'inactive')}
              className="w-full pl-10 pr-4 py-2 bg-slate-700 text-white rounded-lg border border-slate-600 focus:border-primary-500 focus:outline-none appearance-none cursor-pointer"
            >
              <option value="all">All Status</option>
              <option value="active">Active Only</option>
              <option value="inactive">Inactive Only</option>
            </select>
          </div>

          {/* Sort */}
          <div className="relative">
            <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <select
              value={`${sortBy}-${sortOrder}`}
              onChange={(e) => {
                const [by, order] = e.target.value.split('-');
                setSortBy(by as 'date' | 'name' | 'category');
                setSortOrder(order as 'asc' | 'desc');
              }}
              className="w-full pl-10 pr-4 py-2 bg-slate-700 text-white rounded-lg border border-slate-600 focus:border-primary-500 focus:outline-none appearance-none cursor-pointer"
            >
              <option value="date-desc">Newest First</option>
              <option value="date-asc">Oldest First</option>
              <option value="name-asc">Name (A-Z)</option>
              <option value="name-desc">Name (Z-A)</option>
              <option value="category-asc">Category (A-Z)</option>
              <option value="category-desc">Category (Z-A)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Records Table */}
      <div className="bg-slate-800 rounded-lg overflow-hidden">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Database className="text-primary-500 mb-4 animate-pulse" size={48} />
            <p className="text-gray-400">Loading your data records...</p>
          </div>
        ) : filteredRecords.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20">
            <AlertCircle className="text-gray-500 mb-4" size={48} />
            <p className="text-gray-400 text-lg mb-2">No records found</p>
            <p className="text-gray-500 text-sm">
              {searchTerm || selectedCategory !== 'all' || statusFilter !== 'all'
                ? 'Try adjusting your filters'
                : 'Upload your first data record to get started'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-700">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">File Name</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">Category</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">Size</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">Uploaded</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">Verification</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">Status</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">Access</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700">
                {filteredRecords.map((record) => (
                  <tr key={record.recordId} className="hover:bg-slate-700/50 transition">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-slate-700 rounded-lg">
                          <FileText className="text-primary-400" size={20} />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-white">{record.fileName}</p>
                          <p className="text-xs text-gray-500 font-mono mt-0.5">ID: {record.recordId}</p>
                          {record.description && (
                            <p className="text-xs text-gray-400 mt-0.5 truncate max-w-xs">
                              {record.description}
                            </p>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center gap-1 px-2 py-1 bg-slate-700 text-xs text-gray-300 rounded">
                        <Tag size={12} />
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
                    <td className="px-6 py-4">
                      {verificationStatus[record.recordId] === 'verified' ? (
                        <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-500/20 text-green-400 rounded text-xs font-medium">
                          <CheckCircle size={12} />
                          Verified
                        </span>
                      ) : verificationStatus[record.recordId] === 'failed' ? (
                        <span className="inline-flex items-center gap-1 px-2 py-1 bg-red-500/20 text-red-400 rounded text-xs font-medium">
                          <XCircle size={12} />
                          Failed
                        </span>
                      ) : verificationStatus[record.recordId] === 'verifying' ? (
                        <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-500/20 text-blue-400 rounded text-xs font-medium">
                          <Shield size={12} className="animate-pulse" />
                          Verifying...
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-1 bg-gray-500/20 text-gray-400 rounded text-xs font-medium">
                          <Shield size={12} />
                          Pending
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium ${
                        record.isActive
                          ? 'bg-green-500/20 text-green-400'
                          : 'bg-gray-500/20 text-gray-400'
                      }`}>
                        {record.isActive ? (
                          <>
                            <CheckCircle size={12} />
                            Active
                          </>
                        ) : (
                          <>
                            <XCircle size={12} />
                            Inactive
                          </>
                        )}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <Unlock className="text-purple-400" size={16} />
                        <span className="text-sm text-gray-400">
                          {getAccessCount(record.recordId)} granted
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => window.open(record.ipfsHash, '_blank')}
                          className="p-2 bg-blue-500/20 text-blue-400 rounded hover:bg-blue-500/30 transition"
                          title="View File"
                        >
                          <Eye size={16} />
                        </button>
                        {record.isActive && (
                          <button
                            onClick={() => handleDeactivate(record.recordId)}
                            className="p-2 bg-red-500/20 text-red-400 rounded hover:bg-red-500/30 transition"
                            title="Deactivate"
                          >
                            <Lock size={16} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Results Count */}
      {filteredRecords.length > 0 && (
        <div className="text-center text-sm text-gray-400">
          Showing {filteredRecords.length} of {records.length} records
        </div>
      )}
    </div>
  );
};


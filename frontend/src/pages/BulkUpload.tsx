import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useWalletStore } from '../stores/wallet-store';
import { Upload, FileText, CheckCircle, AlertCircle, X } from 'lucide-react';
import { ethers } from 'ethers';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://localhost:7218';

interface UploadFile {
  id: string;
  file: File;
  category: string;
  description: string;
  status: 'pending' | 'processing' | 'uploading' | 'success' | 'error';
  progress: number;
  error?: string;
  txHash?: string;
  recordId?: string;
}

export const BulkUpload = () => {
  const navigate = useNavigate();
  const { address, isConnected } = useWalletStore();
  
  const [files, setFiles] = useState<UploadFile[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [successCount, setSuccessCount] = useState(0);
  const [errorCount, setErrorCount] = useState(0);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || []);
    
    const newFiles: UploadFile[] = selectedFiles.map((file) => ({
      id: `${Date.now()}-${Math.random()}`,
      file,
      category: 'Academic',
      description: '',
      status: 'pending',
      progress: 0,
    }));
    
    setFiles([...files, ...newFiles]);
  };

  const updateFile = (id: string, updates: Partial<UploadFile>) => {
    setFiles(files.map(f => f.id === id ? { ...f, ...updates } : f));
  };

  const removeFile = (id: string) => {
    setFiles(files.filter(f => f.id !== id));
  };

  const handleBulkUpload = async () => {
    if (!address || files.length === 0) return;
    
    setIsUploading(true);
    setSuccessCount(0);
    setErrorCount(0);

    // Process files sequentially to avoid overwhelming the system
    for (const fileItem of files) {
      try {
        updateFile(fileItem.id, { status: 'processing', progress: 0 });
        
        // Step 1: Upload to backend (encryption + Azure Blob)
        updateFile(fileItem.id, { progress: 25 });
        const formData = new FormData();
        formData.append('file', fileItem.file);
        formData.append('category', fileItem.category);
        formData.append('description', fileItem.description);
        
        const uploadResponse = await fetch(`${API_BASE_URL}/api/Data/upload-file`, {
          method: 'POST',
          body: formData,
        });
        
        if (!uploadResponse.ok) {
          throw new Error('Failed to process file');
        }
        
        const uploadResult = await uploadResponse.json();
        updateFile(fileItem.id, { progress: 50, recordId: uploadResult.recordId });
        
        // Step 2: Sign and send transaction to blockchain
        updateFile(fileItem.id, { status: 'uploading', progress: 75 });
        
        if (!window.ethereum) {
          throw new Error('MetaMask is not installed');
        }
        
        const provider = new ethers.BrowserProvider(window.ethereum);
        const signer = await provider.getSigner();
        
        const dataVaultAbi = [
          "function uploadData(string memory _recordId, bytes32 _dataHash, string memory _fileName, string memory _fileType, uint256 _fileSize, string memory _ipfsHash, string memory _encryptionAlgorithm, string memory _category, string memory _metadataURI) external"
        ];
        
        const dataVaultAddress = '0x8D9e9A1999C8D33E335bEA01A25E0A6698D32168';
        const contract = new ethers.Contract(dataVaultAddress, dataVaultAbi, signer);
        
        const hashWithPrefix = uploadResult.dataHash.startsWith('0x') 
          ? uploadResult.dataHash 
          : `0x${uploadResult.dataHash}`;
        const dataHashBytes32 = ethers.zeroPadValue(hashWithPrefix, 32);
        
        const tx = await contract.uploadData(
          uploadResult.recordId,
          dataHashBytes32,
          uploadResult.fileName,
          uploadResult.fileType,
          uploadResult.fileSize,
          uploadResult.blobUrl,
          'AES-256-GCM',
          uploadResult.category,
          uploadResult.description
        );
        
        const receipt = await tx.wait();
        
        updateFile(fileItem.id, {
          status: 'success',
          progress: 100,
          txHash: receipt.hash,
        });
        
        setSuccessCount(prev => prev + 1);
      } catch (err: any) {
        updateFile(fileItem.id, {
          status: 'error',
          error: err.message || 'Upload failed',
        });
        setErrorCount(prev => prev + 1);
      }
    }
    
    setIsUploading(false);
  };

  if (!isConnected) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <Upload className="text-primary-500 mb-4" size={64} />
        <h2 className="text-2xl font-bold text-white mb-2">Bulk Upload</h2>
        <p className="text-gray-400 text-center max-w-md">
          Please connect your wallet to upload multiple files
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white">Bulk Upload</h1>
        <p className="text-gray-400 mt-1">
          Upload multiple files at once for efficient batch processing
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-slate-800 rounded-lg p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-500/20 rounded-lg">
              <FileText className="text-blue-400" size={24} />
            </div>
            <div>
              <p className="text-sm text-gray-400">Total Files</p>
              <p className="text-2xl font-bold text-white">{files.length}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-slate-800 rounded-lg p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-500/20 rounded-lg">
              <CheckCircle className="text-green-400" size={24} />
            </div>
            <div>
              <p className="text-sm text-gray-400">Successful</p>
              <p className="text-2xl font-bold text-green-400">{successCount}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-slate-800 rounded-lg p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-500/20 rounded-lg">
              <AlertCircle className="text-red-400" size={24} />
            </div>
            <div>
              <p className="text-sm text-gray-400">Failed</p>
              <p className="text-2xl font-bold text-red-400">{errorCount}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Upload Area */}
      {files.length === 0 && (
        <div className="bg-slate-800 rounded-lg p-12 border-2 border-dashed border-slate-700 hover:border-primary-500 transition">
          <div className="flex flex-col items-center justify-center">
            <Upload className="text-primary-500 mb-4" size={48} />
            <h3 className="text-lg font-semibold text-white mb-2">Select Multiple Files</h3>
            <p className="text-gray-400 text-center mb-6 max-w-md">
              Choose multiple files to upload at once. Supports certificates, documents, and more.
            </p>
            <label className="px-6 py-3 bg-primary-600 hover:bg-primary-700 text-white font-medium rounded-lg cursor-pointer transition">
              <input
                type="file"
                multiple
                className="hidden"
                onChange={handleFileSelect}
              />
              Select Files
            </label>
          </div>
        </div>
      )}

      {/* File List */}
      {files.length > 0 && (
        <div className="bg-slate-800 rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-white">Files to Upload ({files.length})</h2>
            <div className="flex gap-2">
              <label className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg cursor-pointer transition">
                <input
                  type="file"
                  multiple
                  className="hidden"
                  onChange={handleFileSelect}
                />
                Add More Files
              </label>
              <button
                onClick={handleBulkUpload}
                disabled={isUploading}
                className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white text-sm font-medium rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isUploading ? 'Uploading...' : 'Start Upload'}
              </button>
            </div>
          </div>

          <div className="space-y-3 max-h-96 overflow-y-auto">
            {files.map((fileItem) => (
              <div
                key={fileItem.id}
                className="bg-slate-700 rounded-lg p-4"
              >
                <div className="flex items-start gap-4">
                  <FileText className="text-primary-400 mt-1" size={24} />
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1 min-w-0">
                        <p className="text-white font-medium truncate">{fileItem.file.name}</p>
                        <p className="text-xs text-gray-400 mt-1">
                          {(fileItem.file.size / 1024 / 1024).toFixed(2)} MB
                        </p>
                      </div>
                      
                      {fileItem.status === 'pending' && (
                        <button
                          onClick={() => removeFile(fileItem.id)}
                          className="p-1 text-gray-400 hover:text-red-400 transition"
                        >
                          <X size={20} />
                        </button>
                      )}
                    </div>

                    {/* Category and Description */}
                    {fileItem.status === 'pending' && (
                      <div className="space-y-2 mt-3">
                        <select
                          value={fileItem.category}
                          onChange={(e) => updateFile(fileItem.id, { category: e.target.value })}
                          className="w-full px-3 py-2 bg-slate-800 border border-slate-600 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                        >
                          <option value="Academic">Academic</option>
                          <option value="Medical">Medical</option>
                          <option value="Legal">Legal</option>
                          <option value="Financial">Financial</option>
                          <option value="Other">Other</option>
                        </select>
                        
                        <input
                          type="text"
                          value={fileItem.description}
                          onChange={(e) => updateFile(fileItem.id, { description: e.target.value })}
                          placeholder="Description (optional)"
                          className="w-full px-3 py-2 bg-slate-800 border border-slate-600 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                        />
                      </div>
                    )}

                    {/* Status */}
                    {fileItem.status !== 'pending' && (
                      <div className="mt-3">
                        <div className="flex items-center gap-2 mb-2">
                          {fileItem.status === 'processing' && (
                            <>
                              <div className="animate-spin rounded-full h-4 w-4 border-2 border-primary-500 border-t-transparent"></div>
                              <span className="text-sm text-blue-400">Processing...</span>
                            </>
                          )}
                          {fileItem.status === 'uploading' && (
                            <>
                              <div className="animate-spin rounded-full h-4 w-4 border-2 border-primary-500 border-t-transparent"></div>
                              <span className="text-sm text-blue-400">Uploading to blockchain...</span>
                            </>
                          )}
                          {fileItem.status === 'success' && (
                            <>
                              <CheckCircle className="text-green-400" size={16} />
                              <span className="text-sm text-green-400">Uploaded successfully</span>
                            </>
                          )}
                          {fileItem.status === 'error' && (
                            <>
                              <AlertCircle className="text-red-400" size={16} />
                              <span className="text-sm text-red-400">Upload failed</span>
                            </>
                          )}
                        </div>

                        {/* Progress Bar */}
                        {(fileItem.status === 'processing' || fileItem.status === 'uploading') && (
                          <div className="w-full bg-slate-600 rounded-full h-2">
                            <div
                              className="bg-primary-500 h-2 rounded-full transition-all"
                              style={{ width: `${fileItem.progress}%` }}
                            />
                          </div>
                        )}

                        {/* Success Details */}
                        {fileItem.status === 'success' && fileItem.txHash && (
                          <div className="mt-2 p-2 bg-slate-800 rounded text-xs">
                            <p className="text-gray-400">Record ID: <span className="text-white">{fileItem.recordId}</span></p>
                            <p className="text-gray-400 mt-1">
                              TX: <a
                                href={`https://awakening.bdagscan.com/tx/${fileItem.txHash}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-primary-400 hover:text-primary-300"
                              >
                                {fileItem.txHash.slice(0, 20)}...
                              </a>
                            </p>
                          </div>
                        )}

                        {/* Error Message */}
                        {fileItem.status === 'error' && fileItem.error && (
                          <div className="mt-2 p-2 bg-red-500/10 border border-red-500/20 rounded text-xs text-red-400">
                            {fileItem.error}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Completion Message */}
      {!isUploading && successCount > 0 && (
        <div className="bg-green-500/20 border border-green-500 rounded-lg p-6">
          <div className="flex items-start gap-3">
            <CheckCircle className="text-green-500 flex-shrink-0" size={24} />
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-green-400 mb-2">
                Bulk Upload Complete! 🎉
              </h3>
              <p className="text-green-300 text-sm mb-4">
                Successfully uploaded {successCount} file(s) to the blockchain.
                {errorCount > 0 && ` ${errorCount} file(s) failed.`}
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => navigate('/dashboard')}
                  className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg transition"
                >
                  View Dashboard
                </button>
                <button
                  onClick={() => {
                    setFiles([]);
                    setSuccessCount(0);
                    setErrorCount(0);
                  }}
                  className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white font-medium rounded-lg transition"
                >
                  Upload More
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Info */}
      <div className="bg-slate-800 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-white mb-3">💡 Bulk Upload Tips</h3>
        <div className="space-y-2 text-sm text-gray-300">
          <p>• Files are processed sequentially to ensure reliability</p>
          <p>• Each file requires a MetaMask transaction confirmation</p>
          <p>• You can add more files at any time before starting the upload</p>
          <p>• Failed uploads can be retried by removing and re-adding the file</p>
          <p>• All files are encrypted with AES-256-GCM before storage</p>
        </div>
      </div>
    </div>
  );
};


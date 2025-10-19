import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useWalletStore } from '../stores/wallet-store';
import { Upload, FileText, CheckCircle, AlertCircle, Database, Shield } from 'lucide-react';
import { ethers } from 'ethers';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://localhost:7218';

export const UploadData = () => {
  const navigate = useNavigate();
  const { address, isConnected } = useWalletStore();
  
  const [formData, setFormData] = useState({
    fileName: '',
    fileType: '',
    fileSize: 0,
    category: 'Academic',
    description: '',
    dataHash: '',
    blobUrl: '',
  });
  
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [success, setSuccess] = useState(false);
  const [txHash, setTxHash] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!address) {
      setError('Please connect your wallet');
      return;
    }

    if (!selectedFile) {
      setError('Please select a file to upload');
      return;
    }

    try {
      setError(null);
      setSuccess(false);
      setIsUploading(true);
      setUploadProgress(0);
      
      // Step 1: Upload file to backend (encryption + Azure Blob Storage)
      setUploadProgress(25);
      const formDataToSend = new FormData();
      formDataToSend.append('file', selectedFile);
      formDataToSend.append('category', formData.category);
      formDataToSend.append('description', formData.description);
      
      const uploadResponse = await fetch(`${API_BASE_URL}/api/Data/upload-file`, {
        method: 'POST',
        body: formDataToSend,
      });
      
      if (!uploadResponse.ok) {
        const errorData = await uploadResponse.json();
        throw new Error(errorData.message || 'Failed to process file');
      }
      
      const uploadResult = await uploadResponse.json();
      console.log('✅ Backend upload complete:', uploadResult);
      setUploadProgress(50);
      
      // Step 2: Sign and send transaction to blockchain from frontend
      console.log('========================================');
      console.log('🚀 STARTING BLOCKCHAIN TRANSACTION');
      console.log('========================================');
      
      setUploadProgress(75);
      console.log('📝 Step 1: Checking MetaMask...');
      
      if (!window.ethereum) {
        console.error('❌ MetaMask not found!');
        throw new Error('MetaMask is not installed');
      }
      console.log('✅ MetaMask detected');
      
      console.log('📝 Step 2: Connecting to provider...');
      const provider = new ethers.BrowserProvider(window.ethereum);
      console.log('✅ Provider created:', provider);
      
      console.log('📝 Step 3: Getting signer...');
      const signer = await provider.getSigner();
      const signerAddress = await signer.getAddress();
      console.log('✅ Signer address:', signerAddress);
      
      // DataVaultContract ABI (simplified for uploadData function)
      const dataVaultAbi = [
        "function uploadData(string memory _recordId, bytes32 _dataHash, string memory _fileName, string memory _fileType, uint256 _fileSize, string memory _ipfsHash, string memory _encryptionAlgorithm, string memory _category, string memory _metadataURI) external"
      ];
      
      const dataVaultAddress = '0x8D9e9A1999C8D33E335bEA01A25E0A6698D32168';
      console.log('📝 Step 4: Creating contract instance...');
      console.log('   Contract Address:', dataVaultAddress);
      console.log('   ABI:', dataVaultAbi);
      
      const contract = new ethers.Contract(dataVaultAddress, dataVaultAbi, signer);
      console.log('✅ Contract instance created');
      
      // Convert dataHash from hex string to bytes32
      console.log('📝 Step 5: Converting dataHash to bytes32...');
      console.log('   Original hash:', uploadResult.dataHash);
      
      // Add 0x prefix if not present (ethers requires it)
      const hashWithPrefix = uploadResult.dataHash.startsWith('0x') 
        ? uploadResult.dataHash 
        : `0x${uploadResult.dataHash}`;
      console.log('   Hash with 0x prefix:', hashWithPrefix);
      
      const dataHashBytes32 = ethers.zeroPadValue(hashWithPrefix, 32);
      console.log('   Bytes32 hash:', dataHashBytes32);
      
      // Call uploadData function
      console.log('📝 Step 6: Preparing transaction parameters...');
      const txParams = {
        recordId: uploadResult.recordId,
        dataHash: uploadResult.dataHash,
        fileName: uploadResult.fileName,
        fileType: uploadResult.fileType,
        fileSize: uploadResult.fileSize,
        blobUrl: uploadResult.blobUrl,
        category: uploadResult.category,
        description: uploadResult.description
      };
      console.log('📤 Transaction parameters:', txParams);
      
      console.log('📝 Step 7: Calling uploadData function...');
      console.log('   ⚠️  MetaMask should pop up now to confirm transaction!');
      
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
      
      console.log('✅ Transaction sent successfully!');
      console.log('   Transaction Hash:', tx.hash);
      console.log('   Waiting for confirmation...');
      
      const receipt = await tx.wait();
      
      console.log('========================================');
      console.log('🎉 BLOCKCHAIN TRANSACTION CONFIRMED!');
      console.log('========================================');
      console.log('Transaction Details:', {
        hash: receipt.hash,
        blockNumber: receipt.blockNumber,
        gasUsed: receipt.gasUsed.toString(),
        from: receipt.from,
        to: receipt.to
      });
      console.log('========================================');
      setUploadProgress(100);
      setSuccess(true);
      setTxHash(receipt.hash);
      
      // Redirect to Dashboard after 3 seconds to view uploaded file
      setTimeout(() => {
        navigate('/dashboard');
      }, 3000);
    } catch (err: any) {
      console.error('========================================');
      console.error('❌ UPLOAD ERROR!');
      console.error('========================================');
      console.error('Error Message:', err.message);
      console.error('Error Object:', err);
      console.error('Error Stack:', err.stack);
      console.error('========================================');
      setError(err.message || 'Failed to upload data');
      setUploadProgress(0);
    } finally {
      setIsUploading(false);
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setSelectedFile(file);
    setFormData((prev) => ({
      ...prev,
      fileName: file.name,
      fileType: file.type,
      fileSize: file.size,
    }));
  };

  if (!isConnected) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <Upload className="text-primary-500 mb-4" size={64} />
        <h2 className="text-2xl font-bold text-white mb-2">Upload Data</h2>
        <p className="text-gray-400 text-center max-w-md">
          Please connect your wallet to upload data
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-white">Upload Data</h1>
        <p className="text-gray-400 mt-1">
          Upload encrypted data to Azure Blob Storage with blockchain verification
        </p>
        <div className="flex items-center gap-4 mt-3 text-sm text-gray-500">
          <div className="flex items-center gap-2">
            <Shield size={16} />
            <span>AES-256-GCM Encryption</span>
          </div>
          <div className="flex items-center gap-2">
            <Database size={16} />
            <span>Azure Blob Storage</span>
          </div>
        </div>
      </div>

      {success && (
        <div className="mb-6 p-4 bg-green-500/20 border border-green-500 rounded-lg">
          <div className="flex items-start gap-3">
          <CheckCircle className="text-green-500 flex-shrink-0" size={20} />
            <div className="flex-1">
              <p className="text-green-400 font-medium">File uploaded successfully! 🎉</p>
            <p className="text-green-300 text-sm mt-1">
                Your file has been encrypted, stored in Azure Blob Storage, and registered on the blockchain with your wallet signature.
              </p>
              <p className="text-green-300 text-sm mt-2 font-medium">
                Redirecting to Dashboard in 3 seconds...
              </p>
              {txHash && (
                <div className="mt-3 p-3 bg-slate-900 rounded-lg">
                  <p className="text-xs text-gray-400 mb-1">Transaction Hash:</p>
                  <p className="text-xs font-mono text-green-400 break-all">{txHash}</p>
                  <a
                    href={`https://awakening.bdagscan.com/tx/${txHash}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-primary-400 hover:text-primary-300 mt-2 inline-block"
                  >
                    View on BlockDAG Explorer →
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {error && (
        <div className="mb-6 p-4 bg-red-500/20 border border-red-500 rounded-lg flex items-start gap-3">
          <AlertCircle className="text-red-500 flex-shrink-0" size={20} />
          <div>
            <p className="text-red-400 font-medium">Upload failed</p>
            <p className="text-red-300 text-sm mt-1">{error}</p>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-slate-800 rounded-lg p-6 space-y-6">
        {/* File Upload */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Select File
          </label>
          <div className="flex items-center justify-center w-full">
            <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-slate-600 border-dashed rounded-lg cursor-pointer hover:bg-slate-700 transition">
              <div className="flex flex-col items-center justify-center pt-5 pb-6">
                <FileText className="text-gray-400 mb-2" size={32} />
                <p className="text-sm text-gray-400">
                  <span className="font-semibold">Click to upload</span> or drag and drop
                </p>
                <p className="text-xs text-gray-500">Any file type supported</p>
              </div>
              <input
                type="file"
                className="hidden"
                onChange={handleFileChange}
                required
              />
            </label>
          </div>
          {formData.fileName && (
            <p className="mt-2 text-sm text-primary-400">Selected: {formData.fileName}</p>
          )}
        </div>

        {/* Category */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Category
          </label>
          <select
            value={formData.category}
            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
            className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
            required
          >
            <option value="Academic">Academic</option>
            <option value="Medical">Medical</option>
            <option value="Financial">Financial</option>
            <option value="Legal">Legal</option>
            <option value="Government">Government</option>
            <option value="Other">Other</option>
          </select>
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Description
          </label>
          <textarea
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
            rows={3}
            placeholder="Describe the data..."
          />
        </div>

        {/* Technical Details (Read-only) */}
        {formData.fileName && (
          <div className="space-y-3 p-4 bg-slate-700 rounded-lg">
            <h3 className="text-sm font-medium text-gray-300">File Information</h3>
            <div className="grid grid-cols-2 gap-4">
            <div>
                <p className="text-xs text-gray-400 mb-1">File Name</p>
                <p className="text-xs text-white break-all">{formData.fileName}</p>
            </div>
            <div>
              <p className="text-xs text-gray-400 mb-1">File Size</p>
                <p className="text-xs text-white">
                  {formData.fileSize > 1024 * 1024 
                    ? `${(formData.fileSize / (1024 * 1024)).toFixed(2)} MB`
                    : `${(formData.fileSize / 1024).toFixed(2)} KB`}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-400 mb-1">File Type</p>
                <p className="text-xs text-white">{formData.fileType || 'Unknown'}</p>
              </div>
              <div>
                <p className="text-xs text-gray-400 mb-1">Encryption</p>
                <p className="text-xs text-white">AES-256-GCM</p>
              </div>
            </div>
            <div className="pt-2 border-t border-slate-600">
              <p className="text-xs text-gray-400 mb-1">Storage</p>
              <p className="text-xs text-primary-400">Azure Blob Storage + Blockchain Verification</p>
            </div>
          </div>
        )}

        {/* Upload Progress */}
        {isUploading && uploadProgress > 0 && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-400">Upload Progress</span>
              <span className="text-primary-400 font-medium">{uploadProgress}%</span>
            </div>
            <div className="w-full bg-slate-700 rounded-full h-2">
              <div
                className="bg-gradient-to-r from-primary-600 to-purple-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${uploadProgress}%` }}
              />
            </div>
          </div>
        )}

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isUploading || !selectedFile}
          className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-primary-600 hover:bg-primary-700 text-white font-semibold rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Upload size={20} />
          <span>
            {isUploading ? (
              uploadProgress < 50 
                ? `Processing file... ${uploadProgress}%`
                : uploadProgress < 75
                ? `Uploading to Azure Blob... ${uploadProgress}%`
                : `Signing transaction... ${uploadProgress}%`
            ) : (
              'Upload & Sign with Wallet'
            )}
          </span>
        </button>
      </form>
    </div>
  );
};


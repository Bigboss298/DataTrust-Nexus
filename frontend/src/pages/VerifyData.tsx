import { useState, useEffect } from 'react';
import { useWalletStore } from '../stores/wallet-store';
import { useDataStore } from '../stores/data-store';
import { useAccessStore } from '../stores/access-store';
import { CheckCircle, AlertCircle, Search, Shield, FileText, ExternalLink } from 'lucide-react';

export const VerifyData = () => {
  const { address, isConnected } = useWalletStore();
  const { verifyData, verificationResult, isLoading } = useDataStore();
  const { receivedPermissions, getReceivedPermissions } = useAccessStore();
  
  const [formData, setFormData] = useState({
    recordId: '',
    providedHash: '',
  });
  const [selectedRecord, setSelectedRecord] = useState<string | null>(null);

  useEffect(() => {
    if (address) {
      getReceivedPermissions(address);
    }
  }, [address, getReceivedPermissions]);

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!address) return;

    try {
      await verifyData(
        {
          recordId: formData.recordId,
          providedHash: formData.providedHash,
        },
        address
      );
    } catch (err) {
      console.error('Verification error:', err);
    }
  };

  if (!isConnected) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <Shield className="text-primary-500 mb-4" size={64} />
        <h2 className="text-2xl font-bold text-white mb-2">Verify Data</h2>
        <p className="text-gray-400 text-center max-w-md">
          Please connect your wallet to verify data integrity
        </p>
      </div>
    );
  }

  const handleSelectRecord = (recordId: string) => {
    setSelectedRecord(recordId);
    setFormData({ ...formData, recordId });
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white">Verify Data</h1>
        <p className="text-gray-400 mt-1">
          Verify the authenticity of certificates and documents you have access to
        </p>
      </div>

      {/* Accessible Records */}
      {receivedPermissions.length > 0 && (
        <div className="bg-slate-800 rounded-lg p-6">
          <h2 className="text-lg font-semibold text-white mb-4">Data You Can Verify</h2>
          <div className="space-y-3">
            {receivedPermissions.map((permission) => (
              <div
                key={permission.permissionId}
                className={`p-4 rounded-lg border transition ${
                  selectedRecord === permission.recordId
                    ? 'border-primary-500 bg-primary-500/10'
                    : 'border-slate-700 bg-slate-700/50 hover:border-slate-600'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    <FileText className="text-primary-400 mt-1" size={20} />
                    <div>
                      <p className="text-white font-medium">{permission.recordId}</p>
                      <p className="text-xs text-gray-400 mt-1">
                        From: {permission.granterName || permission.granterWalletAddress}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        Granted: {new Date(permission.grantedAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleSelectRecord(permission.recordId)}
                    className="px-3 py-1 text-sm bg-primary-600 hover:bg-primary-700 text-white rounded transition"
                  >
                    {selectedRecord === permission.recordId ? 'Selected' : 'Select'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Manual Verification Form */}
      <div className="bg-slate-800 rounded-lg p-6">
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-white mb-2">Manual Verification</h2>
          <p className="text-sm text-gray-400">
            Enter a Record ID and hash to verify data integrity
          </p>
        </div>

        <form onSubmit={handleVerify} className="space-y-6">
        {/* Record ID */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Record ID
          </label>
          <input
            type="text"
            value={formData.recordId}
            onChange={(e) => setFormData({ ...formData, recordId: e.target.value })}
            className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
            placeholder="REC-..."
            required
          />
        </div>

        {/* Data Hash */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            SHA-256 Hash to Verify
          </label>
          <input
            type="text"
            value={formData.providedHash}
            onChange={(e) => setFormData({ ...formData, providedHash: e.target.value })}
            className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white font-mono text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
            placeholder="Enter SHA-256 hash..."
            required
          />
          <p className="mt-1 text-xs text-gray-400">
            The hash should be 64 hexadecimal characters
          </p>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isLoading}
          className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-primary-600 hover:bg-primary-700 text-white font-semibold rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Search size={20} />
          <span>{isLoading ? 'Verifying...' : 'Verify Data'}</span>
        </button>
        </form>
      </div>

      {/* Verification Result */}
      {verificationResult && (
        <div className="mt-6">
          {verificationResult.isValid ? (
            <div className="bg-green-500/20 border border-green-500 rounded-lg p-6">
              <div className="flex items-center gap-3 mb-4">
                <CheckCircle className="text-green-500" size={32} />
                <div>
                  <h3 className="text-xl font-bold text-green-400">Verification Successful</h3>
                  <p className="text-green-300 text-sm">
                    The data hash matches the on-chain record
                  </p>
                </div>
              </div>

              {verificationResult.recordDetails && (
                <div className="space-y-3 p-4 bg-slate-800 rounded-lg">
                  <h4 className="text-sm font-medium text-gray-300">Record Details</h4>
                  
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-gray-400 mb-1">File Name</p>
                      <p className="text-white">{verificationResult.recordDetails.fileName}</p>
                    </div>
                    
                    <div>
                      <p className="text-gray-400 mb-1">Category</p>
                      <p className="text-white">{verificationResult.recordDetails.category}</p>
                    </div>
                    
                    <div>
                      <p className="text-gray-400 mb-1">Owner</p>
                      <p className="text-white font-mono text-xs">
                        {verificationResult.recordDetails.ownerName}
                      </p>
                    </div>
                    
                    <div>
                      <p className="text-gray-400 mb-1">Uploaded</p>
                      <p className="text-white">
                        {new Date(verificationResult.recordDetails.uploadedAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>

                  <div>
                    <p className="text-gray-400 mb-1 text-sm">On-Chain Hash</p>
                    <p className="text-primary-400 font-mono text-xs break-all">
                      {verificationResult.onChainHash}
                    </p>
                  </div>

                  <div>
                    <p className="text-gray-400 mb-1 text-sm">IPFS Hash</p>
                    <p className="text-primary-400 font-mono text-xs break-all">
                      {verificationResult.recordDetails.ipfsHash}
                    </p>
                  </div>

                  <div>
                    <p className="text-gray-400 mb-1 text-sm">Encryption Algorithm</p>
                    <p className="text-white text-xs">
                      {verificationResult.recordDetails.encryptionAlgorithm}
                    </p>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="bg-red-500/20 border border-red-500 rounded-lg p-6">
              <div className="flex items-center gap-3 mb-4">
                <AlertCircle className="text-red-500" size={32} />
                <div>
                  <h3 className="text-xl font-bold text-red-400">Verification Failed</h3>
                  <p className="text-red-300 text-sm">
                    {verificationResult.message || 'The provided hash does not match the on-chain record'}
                  </p>
                </div>
              </div>

              <div className="space-y-3 p-4 bg-slate-800 rounded-lg text-sm">
                <div>
                  <p className="text-gray-400 mb-1">Expected Hash (On-Chain)</p>
                  <p className="text-red-400 font-mono text-xs break-all">
                    {verificationResult.onChainHash || 'Not available'}
                  </p>
                </div>
                
                <div>
                  <p className="text-gray-400 mb-1">Provided Hash</p>
                  <p className="text-yellow-400 font-mono text-xs break-all">
                    {verificationResult.providedHash}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Info Section */}
      <div className="bg-slate-800 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-white mb-3">How Verification Works</h3>
        <div className="space-y-2 text-sm text-gray-300">
          <p>1. The system retrieves the SHA-256 hash stored on the blockchain for the given Record ID</p>
          <p>2. It compares this on-chain hash with the hash you provide</p>
          <p>3. If they match, the data integrity is verified and hasn't been tampered with</p>
          <p>4. This process ensures NIST SP 800-53 compliance for data verification</p>
        </div>
      </div>

      {/* Use Case Example */}
      <div className="bg-gradient-to-r from-primary-500/10 to-purple-500/10 border border-primary-500/20 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-white mb-3">💡 Use Case Example</h3>
        <div className="space-y-3 text-sm text-gray-300">
          <div className="flex items-start gap-3">
            <span className="text-primary-400 font-bold">1.</span>
            <p><strong className="text-white">Employer</strong> requests certificate verification from a school</p>
          </div>
          <div className="flex items-start gap-3">
            <span className="text-primary-400 font-bold">2.</span>
            <p><strong className="text-white">School</strong> grants access to the employer through Access Control</p>
          </div>
          <div className="flex items-start gap-3">
            <span className="text-primary-400 font-bold">3.</span>
            <p><strong className="text-white">Employer</strong> verifies the certificate authenticity here</p>
          </div>
          <div className="flex items-start gap-3">
            <span className="text-primary-400 font-bold">4.</span>
            <p><strong className="text-white">Result:</strong> Certificate verified as authentic on-chain ✅</p>
          </div>
        </div>
      </div>
    </div>
  );
};


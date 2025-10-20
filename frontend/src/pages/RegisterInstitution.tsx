import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useWalletStore } from '../stores/wallet-store';
import { Building2, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';

import API_CONFIG from '../config/api';

export const RegisterInstitution = () => {
  const navigate = useNavigate();
  const { address, isConnected } = useWalletStore();
  const [formData, setFormData] = useState({
    name: '',
    institutionType: '',
    registrationNumber: '',
    metadataUri: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Redirect if not connected
  useEffect(() => {
    if (!isConnected || !address) {
      navigate('/');
    }
  }, [isConnected, address, navigate]);

  // Redirect if not connected
  if (!isConnected || !address) {
    return null;
  }

  const institutionTypes = [
    'Individual',
    'University',
    'Bank',
    'Hospital',
    'Government',
    'School',
    'Research Institute',
    'Other'
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setSuccess(null);

    try {
      // Check if MetaMask is installed
      if (!window.ethereum) {
        throw new Error('MetaMask is not installed. Please install MetaMask to continue.');
      }

      // Request account access with timeout
      const accounts = await Promise.race([
        window.ethereum.request({
          method: 'eth_requestAccounts',
        }),
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('MetaMask request timeout. Please try again.')), 10000)
        )
      ]) as string[];

      if (accounts.length === 0 || accounts[0].toLowerCase() !== address.toLowerCase()) {
        throw new Error('Please connect with the correct wallet');
      }

      // Create the message to sign
      const message = `Register Institution: ${formData.name}|${formData.institutionType}|${formData.registrationNumber}|${address}`;
      
      // Sign the message with MetaMask with timeout
      const signature = await Promise.race([
        window.ethereum.request({
          method: 'personal_sign',
          params: [message, address],
        }),
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Signature request timeout. Please approve the signature in MetaMask.')), 60000)
        )
      ]) as string;

      if (!signature) {
        throw new Error('Failed to sign message');
      }

      // Send registration request with signature
      const response = await fetch(API_CONFIG.ENDPOINTS.INSTITUTION_REGISTER, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name,
          institutionType: formData.institutionType,
          registrationNumber: formData.registrationNumber,
          metadataUri: formData.metadataUri || '',
          walletAddress: address,
          signature: signature,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Failed to register institution');
      }

      setSuccess('Institution registered successfully! Redirecting to dashboard...');
      
      // Redirect to dashboard after 2 seconds
      setTimeout(() => {
        navigate('/dashboard');
      }, 2000);
    } catch (err: any) {
      setError(err.message || 'Failed to register institution');
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <div className="flex justify-center mb-6">
            <div className="bg-gradient-to-br from-primary-600 to-purple-600 p-4 rounded-2xl">
              <Building2 className="text-white" size={48} />
            </div>
          </div>
          <h2 className="text-3xl font-bold text-white mb-2">
            Register Your {formData.institutionType === 'Individual' ? 'Account' : 'Institution'}
          </h2>
          <p className="text-gray-400">
            {formData.institutionType === 'Individual' 
              ? 'Register as an individual to securely store and manage your personal data'
              : 'Register your institution on the BlockDAG blockchain to start using DataTrust Nexus'}
          </p>
          <div className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-slate-800 rounded-lg">
            <span className="text-sm text-gray-400">Connected Wallet:</span>
            <span className="text-sm font-mono text-primary-400">
              {address.slice(0, 6)}...{address.slice(-4)}
            </span>
          </div>
        </div>

        {/* Form */}
        <div className="bg-slate-800 rounded-xl p-8 shadow-xl">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Institution Name */}
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-300 mb-2">
                {formData.institutionType === 'Individual' ? 'Your Name' : 'Institution Name'} <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="name"
                name="name"
                required
                value={formData.name}
                onChange={handleInputChange}
                placeholder={formData.institutionType === 'Individual' ? "e.g., John Doe" : "e.g., Harvard University"}
                className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
              {formData.institutionType === 'Individual' && (
                <p className="mt-1 text-xs text-gray-500">
                  Use your personal name for individual data storage
                </p>
              )}
            </div>

            {/* Institution Type */}
            <div>
              <label htmlFor="institutionType" className="block text-sm font-medium text-gray-300 mb-2">
                Institution Type <span className="text-red-500">*</span>
              </label>
              <select
                id="institutionType"
                name="institutionType"
                required
                value={formData.institutionType}
                onChange={handleInputChange}
                className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                <option value="">Select institution type</option>
                {institutionTypes.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </div>

            {/* Registration Number */}
            {formData.institutionType !== 'Individual' && (
              <div>
                <label htmlFor="registrationNumber" className="block text-sm font-medium text-gray-300 mb-2">
                  Registration Number
                </label>
                <input
                  type="text"
                  id="registrationNumber"
                  name="registrationNumber"
                  value={formData.registrationNumber}
                  onChange={handleInputChange}
                  placeholder="Official registration number (optional)"
                  className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
                <p className="mt-1 text-xs text-gray-500">
                  Optional: Your official institution registration number
                </p>
              </div>
            )}

            {/* Metadata URI */}
            <div>
              <label htmlFor="metadataUri" className="block text-sm font-medium text-gray-300 mb-2">
                Metadata URI (Optional)
              </label>
              <input
                type="text"
                id="metadataUri"
                name="metadataUri"
                value={formData.metadataUri}
                onChange={handleInputChange}
                placeholder="https://your-institution.com/metadata.json"
                className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
              <p className="mt-1 text-xs text-gray-500">
                Optional: URL to additional institution metadata
              </p>
            </div>

            {/* Error Message */}
            {error && (
              <div className="flex items-start gap-3 p-4 bg-red-500/10 border border-red-500/50 rounded-lg">
                <AlertCircle className="text-red-500 mt-0.5 flex-shrink-0" size={20} />
                <div>
                  <h4 className="text-sm font-semibold text-red-400 mb-1">Registration Failed</h4>
                  <p className="text-sm text-red-300">{error}</p>
                </div>
              </div>
            )}

            {/* Success Message */}
            {success && (
              <div className="flex items-start gap-3 p-4 bg-green-500/10 border border-green-500/50 rounded-lg">
                <CheckCircle className="text-green-500 mt-0.5 flex-shrink-0" size={20} />
                <div>
                  <h4 className="text-sm font-semibold text-green-400 mb-1">Registration Successful!</h4>
                  <p className="text-sm text-green-300">{success}</p>
                </div>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 px-4 bg-gradient-to-r from-primary-600 to-purple-600 hover:from-primary-700 hover:to-purple-700 text-white font-semibold rounded-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <Loader2 className="animate-spin" size={20} />
                  <span>Registering on Blockchain...</span>
                </>
              ) : (
                <>
                  <Building2 size={20} />
                  <span>Register Institution</span>
                </>
              )}
            </button>
          </form>

          {/* Info Box */}
          <div className="mt-6 p-4 bg-blue-500/10 border border-blue-500/50 rounded-lg">
            <div className="flex items-start gap-3">
              <AlertCircle className="text-blue-400 mt-0.5 flex-shrink-0" size={20} />
              <div className="text-sm text-blue-300">
                <p className="font-semibold mb-1">What happens next?</p>
                <ul className="list-disc list-inside space-y-1 text-xs">
                  <li>Your institution will be registered on the BlockDAG blockchain</li>
                  <li>You'll receive a transaction hash for verification</li>
                  <li>Once registered, you can upload and manage data securely</li>
                  <li>All actions will be logged on the immutable audit trail</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Back to Dashboard Link */}
        <div className="text-center">
          <button
            onClick={() => navigate('/dashboard')}
            className="text-primary-400 hover:text-primary-300 text-sm font-medium transition-colors"
          >
            ← Back to Dashboard
          </button>
        </div>
      </div>
    </div>
  );
};


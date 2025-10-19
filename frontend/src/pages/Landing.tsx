import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useWalletStore } from '../stores/wallet-store';
import { useInstitutionStore } from '../stores/institution-store';
import { 
  Shield, 
  Lock, 
  CheckCircle, 
  FileText, 
  Users, 
  Zap, 
  Globe,
  ArrowRight,
  Database,
  Eye,
  Clock,
  Award
} from 'lucide-react';

declare global {
  interface Window {
    ethereum?: any;
  }
}

export const Landing = () => {
  const navigate = useNavigate();
  const { address, isConnected, setWalletAddress, setConnected } = useWalletStore();
  const { getInstitutionByWallet } = useInstitutionStore();
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isConnected && address) {
      navigate('/dashboard');
    }
  }, [isConnected, address, navigate]);

  const connectWallet = async () => {
    try {
      setIsConnecting(true);
      setError(null);

      if (!window.ethereum) {
        setError('MetaMask is not installed. Please install MetaMask to use this app.');
        setIsConnecting(false);
        return;
      }

      const accounts = await window.ethereum.request({
        method: 'eth_requestAccounts',
      });

      if (accounts.length > 0) {
        console.log('🔌 Landing: Wallet connected:', accounts[0]);
        setWalletAddress(accounts[0]);
        setConnected(true);
        
        // Check if wallet already has an institution
        console.log('🔍 Landing: Checking if wallet has an institution...');
        await getInstitutionByWallet(accounts[0]);
        
        // Wait a moment for the institution check to complete
        setTimeout(() => {
          navigate('/dashboard');
        }, 500);
      }

      setIsConnecting(false);
    } catch (err: any) {
      setError(err.message || 'Failed to connect wallet');
      setIsConnecting(false);
    }
  };

  const features = [
    {
      icon: Shield,
      title: 'Blockchain Security',
      description: 'Immutable audit trails on BlockDAG chain ensure data integrity and transparency'
    },
    {
      icon: Lock,
      title: 'End-to-End Encryption',
      description: 'Military-grade AES-256-GCM encryption protects your data at rest and in transit'
    },
    {
      icon: CheckCircle,
      title: 'Instant Verification',
      description: 'Verify data authenticity and integrity in real-time with SHA-256 cryptographic proofs'
    },
    {
      icon: FileText,
      title: 'Complete Audit Trail',
      description: 'Every action is logged on-chain for compliance and accountability'
    },
    {
      icon: Users,
      title: 'Granular Access Control',
      description: 'Define precise time-bound permissions for institutions'
    },
    {
      icon: Zap,
      title: 'Lightning Fast',
      description: 'BlockDAG technology provides near-instant transaction finality'
    }
  ];

  const benefits = [
    {
      icon: Database,
      title: 'Azure Blob Storage',
      description: 'Enterprise-grade encrypted storage with blockchain verification for immutable records'
    },
    {
      icon: Eye,
      title: 'Transparent & Trustless',
      description: 'Blockchain-verified data hashes ensure authenticity without trusting intermediaries'
    },
    {
      icon: Clock,
      title: 'Real-Time Updates',
      description: 'Instant notifications and updates for all data transactions on BlockDAG'
    },
    {
      icon: Award,
      title: 'Compliance Ready',
      description: 'ISO 27001 & NIST SP 800-53 compliant architecture with full audit trails'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        {/* Animated background elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary-600/20 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-600/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-32">
          <div className="text-center">
            {/* Logo */}
            <div className="flex justify-center mb-8">
              <div className="relative">
                <div className="absolute inset-0 bg-primary-600 rounded-2xl blur-xl opacity-50"></div>
                <div className="relative bg-gradient-to-br from-primary-600 to-purple-600 p-6 rounded-2xl">
                  <Shield className="text-white" size={64} />
                </div>
              </div>
            </div>

            {/* Main Heading */}
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-white mb-6">
              DataTrust <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-400 to-purple-400">Nexus</span>
            </h1>
            
            <p className="text-xl md:text-2xl text-gray-300 mb-4 max-w-3xl mx-auto">
              The Future of Secure Data Exchange
            </p>
            
            <p className="text-lg text-gray-400 mb-12 max-w-2xl mx-auto">
              A decentralized platform powered by BlockDAG technology that enables institutions and individuals to securely store, 
              exchange, verify, and audit data with complete transparency and immutability.
            </p>

            {/* CTA Button */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-8">
              <button
                onClick={connectWallet}
                disabled={isConnecting}
                className="group relative px-8 py-4 bg-gradient-to-r from-primary-600 to-purple-600 hover:from-primary-700 hover:to-purple-700 text-white font-semibold rounded-xl transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-primary-500/50"
              >
                <span className="flex items-center gap-2">
                  {isConnecting ? 'Connecting...' : 'Connect Wallet to Get Started'}
                  {!isConnecting && <ArrowRight className="group-hover:translate-x-1 transition-transform" size={20} />}
                </span>
              </button>
              
              <a
                href="#how-it-works"
                className="px-8 py-4 bg-slate-800 hover:bg-slate-700 text-white font-semibold rounded-xl transition-all duration-300 border border-slate-700 hover:border-slate-600"
              >
                Learn More
              </a>
            </div>

            {error && (
              <div className="max-w-md mx-auto bg-red-500/10 border border-red-500/50 rounded-lg p-4">
                <p className="text-red-400 text-sm">{error}</p>
              </div>
            )}

            {/* Trust Indicators */}
            <div className="flex flex-wrap justify-center gap-8 mt-16 text-sm text-gray-400">
              <div className="flex items-center gap-2">
                <CheckCircle className="text-green-500" size={20} />
                <span>BlockDAG Powered</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="text-green-500" size={20} />
                <span>ISO 27001 Compliant</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="text-green-500" size={20} />
                <span>End-to-End Encrypted</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="text-green-500" size={20} />
                <span>NIST SP 800-53</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-white mb-4">Powerful Features</h2>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">
            Everything you need for secure, compliant data exchange
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <div
                key={index}
                className="group bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl p-6 hover:border-primary-500 transition-all duration-300 hover:transform hover:scale-105"
              >
                <div className="bg-gradient-to-br from-primary-600 to-purple-600 w-12 h-12 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <Icon className="text-white" size={24} />
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">{feature.title}</h3>
                <p className="text-gray-400">{feature.description}</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* How It Works Section */}
      <div id="how-it-works" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-white mb-4">How It Works</h2>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">
            Simple, secure, and transparent data exchange in five steps
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
          {[
            {
              step: '01',
              title: 'Connect Your Wallet',
              description: 'Link your MetaMask wallet to authenticate and access the platform'
            },
            {
              step: '02',
              title: 'Register Your Account',
              description: 'Register as an individual or institution on the blockchain to start using the platform'
            },
            {
              step: '03',
              title: 'Upload Your Data',
              description: 'Upload encrypted files to Azure Blob Storage with blockchain hash verification'
            },
            {
              step: '04',
              title: 'Grant Access',
              description: 'Define time-bound permissions and grant access to trusted institutions'
            },
            {
              step: '05',
              title: 'Verify & Audit',
              description: 'Verify data integrity and track all access with immutable audit logs'
            }
          ].map((item, index) => (
            <div key={index} className="relative">
              <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl p-6 h-full">
                <div className="text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-primary-400 to-purple-400 mb-4">
                  {item.step}
                </div>
                <h3 className="text-xl font-semibold text-white mb-3">{item.title}</h3>
                <p className="text-gray-400">{item.description}</p>
              </div>
              {index < 4 && (
                <div className="hidden lg:block absolute top-1/2 -right-4 transform -translate-y-1/2">
                  <ArrowRight className="text-primary-500" size={24} />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Benefits Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-white mb-4">Why Choose DataTrust Nexus?</h2>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">
            Built for the future of data exchange
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {benefits.map((benefit, index) => {
            const Icon = benefit.icon;
            return (
              <div
                key={index}
                className="bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700 rounded-xl p-6 hover:border-primary-500 transition-all duration-300"
              >
                <div className="bg-primary-500/10 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                  <Icon className="text-primary-400" size={24} />
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">{benefit.title}</h3>
                <p className="text-gray-400">{benefit.description}</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* CTA Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="bg-gradient-to-r from-primary-600 to-purple-600 rounded-2xl p-12 text-center">
          <Globe className="text-white mx-auto mb-6" size={48} />
          <h2 className="text-4xl font-bold text-white mb-4">Ready to Get Started?</h2>
          <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
            Join the future of secure data exchange. Whether you're an individual or institution, connect your wallet and start protecting your data today.
          </p>
          <button
            onClick={connectWallet}
            disabled={isConnecting}
            className="px-8 py-4 bg-white hover:bg-gray-100 text-primary-600 font-semibold rounded-xl transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
          >
            <span className="flex items-center gap-2">
              {isConnecting ? 'Connecting...' : 'Connect Wallet Now'}
              {!isConnecting && <ArrowRight size={20} />}
            </span>
          </button>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-slate-800 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-3">
              <Shield className="text-primary-500" size={24} />
              <span className="text-white font-semibold">DataTrust Nexus</span>
            </div>
            <p className="text-sm text-gray-400 text-center">
              © 2024 DataTrust Nexus. Powered by BlockDAG Technology.
            </p>
            <div className="flex items-center gap-2 text-sm text-gray-400">
              <Globe size={16} />
              <span>Built on BlockDAG Chain</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};


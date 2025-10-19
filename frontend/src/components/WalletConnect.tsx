import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useWalletStore } from '../stores/wallet-store';
import { Wallet, LogOut } from 'lucide-react';

declare global {
  interface Window {
    ethereum?: any;
  }
}

export const WalletConnect = () => {
  const navigate = useNavigate();
  const { address, isConnected, setWalletAddress, setConnected, disconnect } = useWalletStore();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    checkIfWalletIsConnected();
    
    if (window.ethereum) {
      window.ethereum.on('accountsChanged', handleAccountsChanged);
      window.ethereum.on('chainChanged', () => window.location.reload());
    }

    return () => {
      if (window.ethereum) {
        window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
      }
    };
  }, []);

  const checkIfWalletIsConnected = async () => {
    try {
      if (!window.ethereum) return;

      const accounts = await window.ethereum.request({ method: 'eth_accounts' });
      if (accounts.length > 0) {
        console.log('🔌 WalletConnect: Checking existing connection:', accounts[0]);
        setWalletAddress(accounts[0]);
        setConnected(true);
      }
    } catch (err) {
      console.error('❌ Error checking wallet connection:', err);
    }
  };

  const handleAccountsChanged = (accounts: string[]) => {
    console.log('🔌 WalletConnect: Accounts changed:', accounts);
    if (accounts.length === 0) {
      console.log('🔌 WalletConnect: Wallet disconnected');
      disconnect();
      // Redirect to landing page when wallet is disconnected
      navigate('/');
    } else {
      console.log('🔌 WalletConnect: Wallet connected:', accounts[0]);
      setWalletAddress(accounts[0]);
      setConnected(true);
    }
  };

  const connectWallet = async () => {
    try {
      setIsLoading(true);
      setError(null);

      if (!window.ethereum) {
        setError('MetaMask is not installed. Please install it to use this app.');
        setIsLoading(false);
        return;
      }

      const accounts = await window.ethereum.request({
        method: 'eth_requestAccounts',
      });

      if (accounts.length > 0) {
        console.log('🔌 WalletConnect: Wallet connected successfully:', accounts[0]);
        setWalletAddress(accounts[0]);
        setConnected(true);
      }

      setIsLoading(false);
    } catch (err: any) {
      setError(err.message || 'Failed to connect wallet');
      setIsLoading(false);
    }
  };

  const handleDisconnect = () => {
    disconnect();
    // Redirect to landing page when wallet is disconnected
    navigate('/');
  };

  if (isConnected && address) {
    return (
      <div className="space-y-2">
        <div className="bg-slate-700 px-3 py-2 rounded-lg">
          <p className="text-xs text-gray-300">Connected</p>
          <p className="text-xs font-mono text-primary-400 truncate">
            {address.slice(0, 6)}...{address.slice(-4)}
          </p>
        </div>
        <button
          onClick={handleDisconnect}
          className="flex items-center justify-center gap-2 w-full px-3 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition text-sm"
        >
          <LogOut size={16} />
          <span>Disconnect</span>
        </button>
      </div>
    );
  }

  return (
    <div>
      <button
        onClick={connectWallet}
        disabled={isLoading}
        className="flex items-center justify-center gap-2 w-full px-4 py-2.5 bg-primary-600 hover:bg-primary-700 text-white font-semibold rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed text-sm"
      >
        <Wallet size={18} />
        <span>{isLoading ? 'Connecting...' : 'Connect Wallet'}</span>
      </button>
      
      {error && (
        <p className="mt-2 text-xs text-red-400">{error}</p>
      )}
    </div>
  );
};


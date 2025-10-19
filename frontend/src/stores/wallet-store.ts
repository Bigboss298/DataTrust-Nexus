import { create } from 'zustand';

interface WalletState {
  address: string | null;
  isConnected: boolean;
  chainId: number | null;
  
  // Actions
  setWalletAddress: (address: string | null) => void;
  setConnected: (isConnected: boolean) => void;
  setChainId: (chainId: number | null) => void;
  disconnect: () => void;
}

export const useWalletStore = create<WalletState>((set) => ({
  address: null,
  isConnected: false,
  chainId: null,

  setWalletAddress: (address) => set({ address }),
  
  setConnected: (isConnected) => set({ isConnected }),
  
  setChainId: (chainId) => set({ chainId }),
  
  disconnect: () => set({ address: null, isConnected: false, chainId: null }),
}));


import { create } from 'zustand';
import axios from 'axios';

import API_CONFIG from '../config/api';

export interface AccessPermission {
  id: string;
  recordId: string;
  recordFileName: string;
  granteeWalletAddress: string;
  grantedAt: string;
  expiresAt?: string;
  isActive: boolean;
  permissionType: string;
  grantReason?: string;
  isExpired: boolean;
  hasValidAccess: boolean;
}

export interface GrantAccessDto {
  recordId: string;
  granteeWalletAddress: string;
  expiresAt?: string;
  permissionType: string;
  grantReason?: string;
}

export interface RevokeAccessDto {
  recordId: string;
  granteeWalletAddress: string;
  revokeReason?: string;
}

interface AccessState {
  grantedPermissions: AccessPermission[];
  receivedPermissions: AccessPermission[];
  isLoading: boolean;
  error: string | null;
  
  // Actions
  grantAccess: (dto: GrantAccessDto, walletAddress: string) => Promise<void>;
  revokeAccess: (dto: RevokeAccessDto, walletAddress: string) => Promise<void>;
  checkAccess: (recordId: string, walletAddress: string) => Promise<boolean>;
  getGrantedPermissions: (walletAddress: string) => Promise<void>;
  getReceivedPermissions: (walletAddress: string) => Promise<void>;
  getRecordPermissions: (recordId: string) => Promise<AccessPermission[]>;
  clearError: () => void;
}

export const useAccessStore = create<AccessState>((set) => ({
  grantedPermissions: [],
  receivedPermissions: [],
  isLoading: false,
  error: null,

  grantAccess: async (dto: GrantAccessDto, walletAddress: string) => {
    set({ isLoading: true, error: null });
    try {
      const response = await axios.post(
        API_CONFIG.ENDPOINTS.ACCESS_GRANT,
        dto,
        { headers: { 'X-Wallet-Address': walletAddress } }
      );
      
      if (response.data.success) {
        set({ isLoading: false });
      } else {
        set({ error: response.data.message, isLoading: false });
      }
    } catch (error: any) {
      set({ 
        error: error.response?.data?.message || 'Failed to grant access', 
        isLoading: false 
      });
      throw error;
    }
  },

  revokeAccess: async (dto: RevokeAccessDto, walletAddress: string) => {
    set({ isLoading: true, error: null });
    try {
      const response = await axios.post(
        API_CONFIG.ENDPOINTS.ACCESS_REVOKE,
        dto,
        { headers: { 'X-Wallet-Address': walletAddress } }
      );
      
      if (response.data.success) {
        set({ isLoading: false });
      } else {
        set({ error: response.data.message, isLoading: false });
      }
    } catch (error: any) {
      set({ 
        error: error.response?.data?.message || 'Failed to revoke access', 
        isLoading: false 
      });
      throw error;
    }
  },

  checkAccess: async (recordId: string, walletAddress: string) => {
    try {
      const response = await axios.get(API_CONFIG.ENDPOINTS.ACCESS_CHECK, {
        params: { recordId, walletAddress }
      });
      return response.data.hasAccess;
    } catch (error) {
      return false;
    }
  },

  getGrantedPermissions: async (walletAddress: string) => {
    set({ isLoading: true, error: null });
    try {
      const response = await axios.get(API_CONFIG.ENDPOINTS.ACCESS_GRANTED(walletAddress));
      set({ grantedPermissions: response.data, isLoading: false });
    } catch (error: any) {
      set({ 
        error: error.response?.data?.message || 'Failed to fetch granted permissions', 
        isLoading: false 
      });
    }
  },

  getReceivedPermissions: async (walletAddress: string) => {
    set({ isLoading: true, error: null });
    try {
      const response = await axios.get(API_CONFIG.ENDPOINTS.ACCESS_RECEIVED(walletAddress));
      set({ receivedPermissions: response.data, isLoading: false });
    } catch (error: any) {
      set({ 
        error: error.response?.data?.message || 'Failed to fetch received permissions', 
        isLoading: false 
      });
    }
  },

  getRecordPermissions: async (recordId: string) => {
    try {
      const response = await axios.get(API_CONFIG.ENDPOINTS.ACCESS_BY_RECORD(recordId));
      return response.data;
    } catch (error: any) {
      return [];
    }
  },

  clearError: () => set({ error: null }),
}));


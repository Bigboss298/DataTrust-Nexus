import { create } from 'zustand';
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://localhost:7218/api';

export interface AccessRequest {
  id: string;
  recordId: string;
  recordFileName: string;
  requesterWalletAddress: string;
  requesterInstitutionName: string;
  ownerWalletAddress: string;
  ownerInstitutionName: string;
  permissionType: string;
  requestReason?: string;
  requestedAt: string;
  status: string;
  respondedAt?: string;
  responseNote?: string;
}

export interface SubmitAccessRequestDto {
  recordId: string;
  permissionType: string;
  requestReason?: string;
}

export interface RespondToRequestDto {
  requestId: string;
  action: 'approve' | 'deny';
  responseNote?: string;
}

interface AccessRequestState {
  pendingRequests: AccessRequest[]; // Requests I need to respond to (as owner)
  myRequests: AccessRequest[]; // Requests I submitted
  isLoading: boolean;
  error: string | null;
  
  // Actions
  submitAccessRequest: (dto: SubmitAccessRequestDto, walletAddress: string) => Promise<void>;
  getPendingRequests: (walletAddress: string) => Promise<void>;
  getMyRequests: (walletAddress: string) => Promise<void>;
  respondToRequest: (dto: RespondToRequestDto, walletAddress: string) => Promise<void>;
  hasPendingRequest: (recordId: string, walletAddress: string) => Promise<boolean>;
  clearError: () => void;
}

export const useAccessRequestStore = create<AccessRequestState>((set) => ({
  pendingRequests: [],
  myRequests: [],
  isLoading: false,
  error: null,

  submitAccessRequest: async (dto: SubmitAccessRequestDto, walletAddress: string) => {
    set({ isLoading: true, error: null });
    try {
      const response = await axios.post(
        `${API_BASE_URL}/Access/request`,
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
        error: error.response?.data?.message || 'Failed to submit access request', 
        isLoading: false 
      });
      throw error;
    }
  },

  getPendingRequests: async (walletAddress: string) => {
    set({ isLoading: true, error: null });
    try {
      const response = await axios.get(`${API_BASE_URL}/Access/requests/pending/${walletAddress}`);
      set({ pendingRequests: response.data, isLoading: false });
    } catch (error: any) {
      set({ 
        error: error.response?.data?.message || 'Failed to fetch pending requests', 
        isLoading: false 
      });
    }
  },

  getMyRequests: async (walletAddress: string) => {
    set({ isLoading: true, error: null });
    try {
      const response = await axios.get(`${API_BASE_URL}/Access/requests/my/${walletAddress}`);
      set({ myRequests: response.data, isLoading: false });
    } catch (error: any) {
      set({ 
        error: error.response?.data?.message || 'Failed to fetch my requests', 
        isLoading: false 
      });
    }
  },

  respondToRequest: async (dto: RespondToRequestDto, walletAddress: string) => {
    set({ isLoading: true, error: null });
    try {
      const response = await axios.post(
        `${API_BASE_URL}/Access/request/respond`,
        {
          requestId: dto.requestId,
          action: dto.action,
          responseNote: dto.responseNote
        },
        { headers: { 'X-Wallet-Address': walletAddress } }
      );
      
      if (response.data.success) {
        set({ isLoading: false });
      } else {
        set({ error: response.data.message, isLoading: false });
      }
    } catch (error: any) {
      set({ 
        error: error.response?.data?.message || 'Failed to respond to request', 
        isLoading: false 
      });
      throw error;
    }
  },

  hasPendingRequest: async (recordId: string, walletAddress: string) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/Access/request/check`, {
        params: { recordId, requesterWalletAddress: walletAddress }
      });
      return response.data.hasPending;
    } catch (error) {
      return false;
    }
  },

  clearError: () => set({ error: null }),
}));

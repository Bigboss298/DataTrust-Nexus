import { create } from 'zustand';
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://localhost:7218/api';

export interface AuditLog {
  id: string;
  actionType: string;
  actorId: string;
  actorName: string;
  actorWalletAddress: string;
  targetWalletAddress?: string;
  recordId?: string;
  dataHash?: string;
  actionDetails: string;
  success: boolean;
  timestamp: string;
  ipAddress?: string;
  errorMessage?: string;
  blockchainTransactionHash?: string;
}

export interface AuditStatistics {
  totalUploads: number;
  totalVerifications: number;
  successfulVerifications: number;
  failedVerifications: number;
  totalAccessGrants: number;
  totalAccessRevocations: number;
  totalInstitutions: number;
  actionTypeCounts: Record<string, number>;
  recentActivities: RecentActivity[];
}

export interface RecentActivity {
  actionType: string;
  actorName: string;
  details: string;
  timestamp: string;
  success: boolean;
}

interface AuditState {
  logs: AuditLog[];
  recentLogs: AuditLog[];
  statistics: AuditStatistics | null;
  totalCount: number;
  currentPage: number;
  pageSize: number;
  isLoading: boolean;
  error: string | null;
  
  // Actions
  getRecentLogs: (count?: number) => Promise<void>;
  getLogsByActor: (walletAddress: string) => Promise<void>;
  getLogsByRecord: (recordId: string) => Promise<void>;
  getStatistics: (startDate?: string, endDate?: string) => Promise<void>;
  queryLogs: (query: any) => Promise<void>;
  clearError: () => void;
}

export const useAuditStore = create<AuditState>((set) => ({
  logs: [],
  recentLogs: [],
  statistics: null,
  totalCount: 0,
  currentPage: 1,
  pageSize: 50,
  isLoading: false,
  error: null,

  getRecentLogs: async (count = 50) => {
    set({ isLoading: true, error: null });
    try {
      const response = await axios.get(`${API_BASE_URL}/Audit/recent`, {
        params: { count }
      });
      set({ recentLogs: response.data, isLoading: false });
    } catch (error: any) {
      set({ 
        error: error.response?.data?.message || 'Failed to fetch recent logs', 
        isLoading: false 
      });
    }
  },

  getLogsByActor: async (walletAddress: string) => {
    set({ isLoading: true, error: null });
    try {
      const response = await axios.get(`${API_BASE_URL}/Audit/actor/${walletAddress}`);
      set({ logs: response.data, isLoading: false });
    } catch (error: any) {
      set({ 
        error: error.response?.data?.message || 'Failed to fetch logs by actor', 
        isLoading: false 
      });
    }
  },

  getLogsByRecord: async (recordId: string) => {
    set({ isLoading: true, error: null });
    try {
      const response = await axios.get(`${API_BASE_URL}/Audit/record/${recordId}`);
      set({ logs: response.data, isLoading: false });
    } catch (error: any) {
      set({ 
        error: error.response?.data?.message || 'Failed to fetch logs by record', 
        isLoading: false 
      });
    }
  },

  getStatistics: async (startDate?: string, endDate?: string) => {
    set({ isLoading: true, error: null });
    try {
      const params: any = {};
      if (startDate) params.startDate = startDate;
      if (endDate) params.endDate = endDate;
      
      const response = await axios.get(`${API_BASE_URL}/Audit/statistics`, { params });
      set({ statistics: response.data, isLoading: false });
    } catch (error: any) {
      set({ 
        error: error.response?.data?.message || 'Failed to fetch statistics', 
        isLoading: false 
      });
    }
  },

  queryLogs: async (query: any) => {
    set({ isLoading: true, error: null });
    try {
      const response = await axios.post(`${API_BASE_URL}/Audit/query`, query);
      set({ 
        logs: response.data.logs,
        totalCount: response.data.totalCount,
        currentPage: response.data.page,
        pageSize: response.data.pageSize,
        isLoading: false 
      });
    } catch (error: any) {
      set({ 
        error: error.response?.data?.message || 'Failed to query logs', 
        isLoading: false 
      });
    }
  },

  clearError: () => set({ error: null }),
}));


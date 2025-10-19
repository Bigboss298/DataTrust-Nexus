import { create } from 'zustand';
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://localhost:7218/api';

export interface DataRecord {
  recordId: string;
  dataHash: string;
  ownerWalletAddress: string;
  ownerName: string;
  fileName: string;
  fileType: string;
  fileSize: number;
  ipfsHash: string;
  encryptionAlgorithm: string;
  uploadedAt: string;
  isActive: boolean;
  category: string;
  description?: string;
}

export interface UploadDataDto {
  recordId: string;
  dataHash: string;
  fileName: string;
  fileType: string;
  fileSize: number;
  ipfsHash: string;
  encryptionAlgorithm: string;
  category: string;
  description?: string;
  metadataUri?: string;
  encryptedSymmetricKey?: string;
}

export interface VerifyDataDto {
  recordId: string;
  providedHash: string;
}

interface DataState {
  records: DataRecord[];
  currentRecord: DataRecord | null;
  isLoading: boolean;
  error: string | null;
  verificationResult: any | null;
  
  // Actions
  uploadData: (dto: UploadDataDto, walletAddress: string) => Promise<void>;
  verifyData: (dto: VerifyDataDto, walletAddress: string) => Promise<void>;
  getDataRecord: (recordId: string) => Promise<void>;
  getInstitutionRecords: (walletAddress: string) => Promise<void>;
  searchRecords: (searchTerm: string) => Promise<void>;
  deactivateRecord: (recordId: string, walletAddress: string) => Promise<void>;
  clearError: () => void;
}

export const useDataStore = create<DataState>((set) => ({
  records: [],
  currentRecord: null,
  isLoading: false,
  error: null,
  verificationResult: null,

  uploadData: async (dto: UploadDataDto, walletAddress: string) => {
    set({ isLoading: true, error: null });
    try {
      const response = await axios.post(
        `${API_BASE_URL}/Data/upload`,
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
        error: error.response?.data?.message || 'Failed to upload data', 
        isLoading: false 
      });
      throw error;
    }
  },

  verifyData: async (dto: VerifyDataDto, walletAddress: string) => {
    set({ isLoading: true, error: null, verificationResult: null });
    try {
      const response = await axios.post(
        `${API_BASE_URL}/Data/verify`,
        dto,
        { headers: { 'X-Wallet-Address': walletAddress } }
      );
      
      set({ 
        verificationResult: response.data, 
        isLoading: false 
      });
    } catch (error: any) {
      set({ 
        error: error.response?.data?.message || 'Failed to verify data', 
        isLoading: false 
      });
      throw error;
    }
  },

  getDataRecord: async (recordId: string) => {
    set({ isLoading: true, error: null });
    try {
      const response = await axios.get(`${API_BASE_URL}/Data/${recordId}`);
      set({ currentRecord: response.data, isLoading: false });
    } catch (error: any) {
      set({ 
        error: error.response?.data?.message || 'Failed to fetch record', 
        isLoading: false 
      });
    }
  },

  getInstitutionRecords: async (walletAddress: string) => {
    set({ isLoading: true, error: null });
    try {
      const response = await axios.get(`${API_BASE_URL}/Data/owner/${walletAddress}`);
      set({ records: response.data, isLoading: false });
    } catch (error: any) {
      set({ 
        error: error.response?.data?.message || 'Failed to fetch records', 
        isLoading: false 
      });
    }
  },

  searchRecords: async (searchTerm: string) => {
    set({ isLoading: true, error: null });
    try {
      const response = await axios.get(`${API_BASE_URL}/Data/search`, {
        params: { searchTerm }
      });
      set({ records: response.data, isLoading: false });
    } catch (error: any) {
      set({ 
        error: error.response?.data?.message || 'Failed to search records', 
        isLoading: false 
      });
    }
  },

  deactivateRecord: async (recordId: string, walletAddress: string) => {
    set({ isLoading: true, error: null });
    try {
      await axios.post(
        `${API_BASE_URL}/Data/${recordId}/deactivate`,
        {},
        { headers: { 'X-Wallet-Address': walletAddress } }
      );
      set({ isLoading: false });
    } catch (error: any) {
      set({ 
        error: error.response?.data?.message || 'Failed to deactivate record', 
        isLoading: false 
      });
      throw error;
    }
  },

  clearError: () => set({ error: null }),
}));


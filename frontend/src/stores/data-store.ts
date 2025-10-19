import { create } from 'zustand';
import axios from 'axios';
import API_CONFIG from '../config/api';

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
  uploadedAt: number; // Unix timestamp in seconds
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
  getAllRecords: () => Promise<void>;
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
        API_CONFIG.ENDPOINTS.DATA_UPLOAD,
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
        API_CONFIG.ENDPOINTS.DATA_VERIFY,
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
      const response = await axios.get(API_CONFIG.ENDPOINTS.DATA_GET(recordId));
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
      const response = await axios.get(API_CONFIG.ENDPOINTS.DATA_GET_BY_OWNER(walletAddress));
      // Map backend response to frontend format
      const mappedRecords = response.data.map((record: any) => ({
        ...record,
        ownerWalletAddress: record.Owner || record.ownerWalletAddress,
        ownerName: record.OwnerName || record.ownerName || 'Unknown Institution',
        description: record.Description || record.description
      }));
      set({ records: mappedRecords, isLoading: false });
    } catch (error: any) {
      set({ 
        error: error.response?.data?.message || 'Failed to fetch records', 
        isLoading: false 
      });
    }
  },

  getAllRecords: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await axios.get(API_CONFIG.ENDPOINTS.DATA_GET_ALL);
      // Map backend response to frontend format
      const mappedRecords = response.data.map((record: any) => ({
        ...record,
        ownerWalletAddress: record.Owner || record.ownerWalletAddress,
        ownerName: record.OwnerName || record.ownerName || 'Unknown Institution',
        description: record.Description || record.description
      }));
      set({ records: mappedRecords, isLoading: false });
    } catch (error: any) {
      set({ 
        error: error.response?.data?.message || 'Failed to fetch all records', 
        isLoading: false 
      });
    }
  },

  searchRecords: async (searchTerm: string) => {
    set({ isLoading: true, error: null });
    try {
      const response = await axios.get(API_CONFIG.ENDPOINTS.DATA_SEARCH, {
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
        API_CONFIG.ENDPOINTS.DATA_DEACTIVATE(recordId),
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


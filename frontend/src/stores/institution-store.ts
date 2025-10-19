import { create } from 'zustand';
import axios from 'axios';
import { ethers } from 'ethers';

import API_CONFIG from '../config/api';

export interface Institution {
  name: string;
  institutionType: string;
  registrationNumber: string;
  walletAddress: string;
  registeredAt: number;
  registeredAtFormatted: string;
  isActive: boolean;
  isVerified: boolean;
  metadataUri?: string;
}

export interface RegisterInstitutionDto {
  name: string;
  institutionType: string;
  registrationNumber: string;
  walletAddress: string;
  metadataUri?: string;
  contactEmail?: string;
  contactPhone?: string;
  country?: string;
}

interface InstitutionState {
  currentInstitution: Institution | null;
  institutions: Institution[];
  isLoading: boolean;
  error: string | null;
  
  // Actions
  registerInstitution: (dto: RegisterInstitutionDto) => Promise<void>;
  getInstitutionByWallet: (walletAddress: string) => Promise<void>;
  getAllInstitutions: () => Promise<void>;
  verifyInstitution: (walletAddress: string) => Promise<boolean>;
  searchInstitutions: (searchTerm: string) => Promise<void>;
  clearError: () => void;
}

export const useInstitutionStore = create<InstitutionState>((set) => ({
  currentInstitution: null,
  institutions: [],
  isLoading: false,
  error: null,

  registerInstitution: async (dto: RegisterInstitutionDto) => {
    set({ isLoading: true, error: null });
    try {
      const response = await axios.post(API_CONFIG.ENDPOINTS.INSTITUTION_REGISTER, dto);
      if (response.data.success) {
        set({ currentInstitution: response.data.institution, isLoading: false });
      } else {
        set({ error: response.data.message, isLoading: false });
      }
    } catch (error: any) {
      set({ 
        error: error.response?.data?.message || 'Failed to register institution', 
        isLoading: false 
      });
      throw error;
    }
  },

  getInstitutionByWallet: async (walletAddress: string) => {
    console.log('🚀 getInstitutionByWallet called with wallet:', walletAddress);
    console.log('🚀 API_BASE_URL:', API_CONFIG.BASE_URL);
    set({ isLoading: true, error: null });
    try {
      // Convert to checksummed address (mixed case)
      const checksummedAddress = ethers.getAddress(walletAddress);
      console.log('🔍 Fetching institution for wallet:', walletAddress);
      console.log('🔍 Checksummed address:', checksummedAddress);
      console.log('🔗 API URL:', API_CONFIG.ENDPOINTS.INSTITUTION_GET(checksummedAddress));
      console.log('⏳ Making axios request now...');
      
      const response = await axios.get(API_CONFIG.ENDPOINTS.INSTITUTION_GET(checksummedAddress));
      console.log('✅ Institution response:', response.data);
      
      if (response.data && response.data.name) {
        console.log('✅ Institution found:', response.data.name);
        set({ currentInstitution: response.data, isLoading: false });
      } else {
        console.log('❌ No institution found - response data:', response.data);
        set({ currentInstitution: null, isLoading: false });
      }
    } catch (error: any) {
      console.error('❌ Error fetching institution:', {
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        message: error.message,
        url: error.config?.url
      });
      
      if (error.response?.status === 404) {
        console.log('❌ Institution not found (404)');
        set({ currentInstitution: null, isLoading: false });
      } else {
        console.error('❌ Failed to fetch institution:', error);
        set({ 
          error: error.response?.data?.message || 'Failed to fetch institution', 
          isLoading: false,
          currentInstitution: null 
        });
      }
    }
  },

  getAllInstitutions: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await axios.get(API_CONFIG.ENDPOINTS.INSTITUTION_GET_ALL);
      set({ institutions: response.data, isLoading: false });
    } catch (error: any) {
      set({ 
        error: error.response?.data?.message || 'Failed to fetch institutions', 
        isLoading: false 
      });
    }
  },

  verifyInstitution: async (walletAddress: string) => {
    try {
      const response = await axios.get(API_CONFIG.ENDPOINTS.INSTITUTION_VERIFY(walletAddress));
      return response.data.isVerified;
    } catch (error) {
      return false;
    }
  },

  searchInstitutions: async (searchTerm: string) => {
    set({ isLoading: true, error: null });
    try {
      const response = await axios.get(API_CONFIG.ENDPOINTS.INSTITUTION_SEARCH, {
        params: { searchTerm }
      });
      set({ institutions: response.data, isLoading: false });
    } catch (error: any) {
      set({ 
        error: error.response?.data?.message || 'Failed to search institutions', 
        isLoading: false 
      });
    }
  },

  clearError: () => set({ error: null }),
}));


/**
 * API Configuration
 * 
 * Change the BASE_URL here to switch between environments:
 * - Development: https://localhost:7218
 * - Production: https://datatrust-nexus-gng7e8f0encbdtcr.westeurope-01.azurewebsites.net
 */

// ============================================
// CHANGE THIS URL TO SWITCH ENVIRONMENTS
// ============================================
const BASE_URL ='https://datatrust-nexus-gng7e8f0encbdtcr.westeurope-01.azurewebsites.net';
// const BASE_URL ='https://localhost:7218';

// ============================================
// Alternative URLs (uncomment to use):
// ============================================
// const BASE_URL = 'https://localhost:7218'; // Local development
// const BASE_URL = 'https://datatrust-nexus-gng7e8f0encbdtcr.westeurope-01.azurewebsites.net'; // Azure production

export const API_CONFIG = {
  BASE_URL,
  TIMEOUT: 30000, // 30 seconds
  ENDPOINTS: {
    // Data endpoints
    DATA_UPLOAD: `${BASE_URL}/api/Data/upload`,
    DATA_UPLOAD_FILE: `${BASE_URL}/api/Data/upload-file`,
    DATA_VERIFY: `${BASE_URL}/api/Data/verify`,
    DATA_GET: (recordId: string) => `${BASE_URL}/api/Data/${recordId}`,
    DATA_GET_BY_OWNER: (walletAddress: string) => `${BASE_URL}/api/Data/owner/${walletAddress}`,
    DATA_GET_ALL: `${BASE_URL}/api/Data`,
    DATA_SEARCH: `${BASE_URL}/api/Data/search`,
    DATA_DEACTIVATE: (recordId: string) => `${BASE_URL}/api/Data/${recordId}/deactivate`,
    
    // Institution endpoints
    INSTITUTION_REGISTER: `${BASE_URL}/api/Institution/register`,
    INSTITUTION_GET: (walletAddress: string) => `${BASE_URL}/api/Institution/${walletAddress}`,
    INSTITUTION_GET_ALL: `${BASE_URL}/api/Institution`,
    INSTITUTION_VERIFY: (walletAddress: string) => `${BASE_URL}/api/Institution/verify/${walletAddress}`,
    INSTITUTION_SEARCH: `${BASE_URL}/api/Institution/search`,
    
    // Access endpoints
    ACCESS_GRANT: `${BASE_URL}/api/Access/grant`,
    ACCESS_REVOKE: `${BASE_URL}/api/Access/revoke`,
    ACCESS_CHECK: `${BASE_URL}/api/Access/check`,
    ACCESS_GRANTED: (walletAddress: string) => `${BASE_URL}/api/Access/granted/${walletAddress}`,
    ACCESS_RECEIVED: (walletAddress: string) => `${BASE_URL}/api/Access/received/${walletAddress}`,
    ACCESS_BY_RECORD: (recordId: string) => `${BASE_URL}/api/Access/record/${recordId}`,
    
    // Access Request endpoints
    ACCESS_REQUEST_SUBMIT: `${BASE_URL}/api/Access/request`,
    ACCESS_REQUEST_PENDING: (walletAddress: string) => `${BASE_URL}/api/Access/requests/pending/${walletAddress}`,
    ACCESS_REQUEST_MY: (walletAddress: string) => `${BASE_URL}/api/Access/requests/my/${walletAddress}`,
    ACCESS_REQUEST_RESPOND: `${BASE_URL}/api/Access/request/respond`,
    ACCESS_REQUEST_CHECK: `${BASE_URL}/api/Access/request/check`,
    
    // Audit endpoints
    AUDIT_RECENT: `${BASE_URL}/api/Audit/recent`,
    AUDIT_BY_ACTOR: (walletAddress: string) => `${BASE_URL}/api/Audit/actor/${walletAddress}`,
    AUDIT_BY_RECORD: (recordId: string) => `${BASE_URL}/api/Audit/record/${recordId}`,
    AUDIT_STATISTICS: `${BASE_URL}/api/Audit/statistics`,
    AUDIT_QUERY: `${BASE_URL}/api/Audit/query`,
  }
};

// Log the current API configuration (only in development)
if (import.meta.env.DEV) {
  console.log('🔧 API Configuration:', API_CONFIG.BASE_URL);
}

export default API_CONFIG;


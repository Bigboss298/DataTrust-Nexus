# API Configuration Guide

## 🎯 Centralized API Configuration

All API endpoints are now configured in **ONE PLACE**: `src/config/api.ts`

### How to Switch Environments:

Open `frontend/src/config/api.ts` and change the `BASE_URL`:

```typescript
// ============================================
// CHANGE THIS URL TO SWITCH ENVIRONMENTS
// ============================================
const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://datatrust-nexus-gng7e8f0encbdtcr.westeurope-01.azurewebsites.net';
```

### Available Environments:

#### Local Development:
```typescript
const BASE_URL = 'https://localhost:7218';
```

#### Azure Production:
```typescript
const BASE_URL = 'https://datatrust-nexus-gng7e8f0encbdtcr.westeurope-01.azurewebsites.net';
```

#### Custom URL:
```typescript
const BASE_URL = 'https://your-custom-url.com';
```

## 📁 Files That Use This Config:

All these files now import from `src/config/api.ts`:

- ✅ `src/stores/data-store.ts`
- ✅ `src/stores/institution-store.ts`
- ✅ `src/stores/access-store.ts`
- ✅ `src/stores/access-request-store.ts`
- ✅ `src/stores/audit-store.ts`
- ✅ `src/pages/UploadData.tsx`
- ✅ `src/pages/BulkUpload.tsx`
- ✅ `src/pages/RegisterInstitution.tsx`

## 🔧 How It Works:

1. **Single Source of Truth**: All API URLs are defined in one place
2. **Easy Switching**: Change one line to switch environments
3. **Type-Safe**: TypeScript ensures all endpoints are correctly typed
4. **Environment Variables**: Still supports `VITE_API_BASE_URL` from `.env` files

## 📝 Usage Example:

```typescript
import API_CONFIG from '../config/api';

// Use the pre-configured endpoints
const response = await axios.get(API_CONFIG.ENDPOINTS.DATA_GET_ALL);

// Or use the base URL directly
const customEndpoint = `${API_CONFIG.BASE_URL}/api/custom-endpoint`;
```

## 🚀 For Vercel Deployment:

### Option 1: Change the config file (Easiest)
Just update `src/config/api.ts` with your production URL before deploying.

### Option 2: Use Environment Variables
Set `VITE_API_BASE_URL` in Vercel dashboard:
1. Go to Vercel project settings
2. Environment Variables
3. Add: `VITE_API_BASE_URL` = your production URL
4. Redeploy

## ⚡ Quick Switch Commands:

### Switch to Local:
```bash
# Edit src/config/api.ts
# Change BASE_URL to: https://localhost:7218
npm run dev
```

### Switch to Production:
```bash
# Edit src/config/api.ts
# Change BASE_URL to: https://datatrust-nexus-gng7e8f0encbdtcr.westeurope-01.azurewebsites.net
npm run build
```

## 🎨 Benefits:

- ✅ **One place to change** - No more searching through multiple files
- ✅ **Consistent URLs** - All files use the same configuration
- ✅ **Easy to test** - Switch between environments instantly
- ✅ **Type-safe** - TypeScript catches errors at compile time
- ✅ **Maintainable** - Add new endpoints in one place

## 📍 Current Configuration:

**Default (Production):**
```
https://datatrust-nexus-gng7e8f0encbdtcr.westeurope-01.azurewebsites.net
```

**Local Development:**
```
https://localhost:7218
```

---

**Need to switch?** Just edit `src/config/api.ts` and change the `BASE_URL`! 🎯


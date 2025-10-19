# Frontend Environment Configuration

## Environment Variables

This project uses environment variables to configure the API base URL for different environments.

### Files Created:

1. **`.env`** - Local development (not committed to git)
2. **`.env.production`** - Production build (committed to git for Vercel)

### Current Configuration:

#### Development (`.env`):
```
VITE_API_BASE_URL=https://localhost:7218
```

#### Production (`.env.production`):
```
VITE_API_BASE_URL=https://datatrust-nexus-gng7e8f0encbdtcr.westeurope-01.azurewebsites.net
```

## How It Works:

### Local Development:
1. Run `npm run dev`
2. Uses `.env` file
3. Connects to `https://localhost:7218` (local backend)

### Production (Vercel):
1. Vercel automatically uses `.env.production` during build
2. Connects to Azure App Service backend
3. URL: `https://datatrust-nexus-gng7e8f0encbdtcr.westeurope-01.azurewebsites.net`

## Vercel Configuration:

If you need to override the environment variable in Vercel:

1. Go to your Vercel project dashboard
2. Navigate to **Settings** → **Environment Variables**
3. Add:
   - **Name:** `VITE_API_BASE_URL`
   - **Value:** `https://datatrust-nexus-gng7e8f0encbdtcr.westeurope-01.azurewebsites.net`
   - **Environment:** Production, Preview, Development

## Testing:

### Test Local Development:
```bash
cd frontend
npm run dev
# Frontend: http://localhost:3000
# Backend: https://localhost:7218
```

### Test Production Build Locally:
```bash
cd frontend
npm run build
npm run preview
# Frontend: http://localhost:4173
# Backend: https://datatrust-nexus-gng7e8f0encbdtcr.westeurope-01.azurewebsites.net
```

## CORS Configuration:

The backend has been configured to allow requests from:
- ✅ `http://localhost:3000` (local dev)
- ✅ `http://localhost:3001` (local dev alt port)
- ✅ `https://datatrust-nexus.vercel.app` (production)
- ✅ `https://*.vercel.app` (all Vercel preview deployments)

## Troubleshooting:

### Issue: CORS errors in production
**Solution:** Make sure the backend `AllowedOrigins` includes your Vercel domain

### Issue: API calls failing
**Solution:** Check that `VITE_API_BASE_URL` is correctly set in environment variables

### Issue: Environment variable not updating
**Solution:** 
1. Clear browser cache
2. Restart dev server
3. Rebuild the project

## Security Notes:

- ⚠️ Never commit `.env` files with secrets
- ✅ `.env.production` is safe to commit (contains public URLs only)
- ✅ `.env` is in `.gitignore` and won't be committed
- ✅ Backend connection strings are configured in Azure App Service


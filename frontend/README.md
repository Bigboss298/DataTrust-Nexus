# DataTrust Nexus - Frontend

React + TypeScript frontend for the DataTrust Nexus secure data exchange platform.

## 🎨 Features

- **Wallet Integration** - MetaMask wallet connection
- **Dashboard** - Overview of activities and statistics
- **Data Upload** - Encrypted file upload with blockchain recording
- **Access Control** - Grant and revoke data access permissions
- **Data Verification** - Verify data integrity using hash comparison
- **Audit Logs** - Complete audit trail with filtering and export
- **Real-time Stats** - Charts and analytics using Recharts

## 🔧 Tech Stack

- React 18
- TypeScript
- Zustand (State Management)
- TailwindCSS (Styling)
- Axios (HTTP Client)
- React Router (Navigation)
- Recharts (Data Visualization)
- Lucide React (Icons)
- Ethers.js (Blockchain Interaction)

## 📋 Prerequisites

- Node.js 18+ and npm
- MetaMask browser extension
- Backend API running (see Backend README)

## 🚀 Getting Started

### 1. Install Dependencies

```bash
cd frontend
npm install
```

### 2. Configure Environment

Create a `.env` file based on `.env.example`:

```env
VITE_API_BASE_URL=http://localhost:5000/api
VITE_CHAIN_ID=1337
VITE_BLOCKCHAIN_RPC_URL=http://localhost:8545
VITE_INSTITUTION_REGISTRY_ADDRESS=0x...
VITE_DATA_VAULT_ADDRESS=0x...
VITE_ACCESS_CONTROL_ADDRESS=0x...
VITE_AUDIT_TRAIL_ADDRESS=0x...
VITE_IPFS_GATEWAY=http://localhost:8080/ipfs/
```

### 3. Run Development Server

```bash
npm run dev
```

The application will be available at `http://localhost:3001`

### 4. Build for Production

```bash
npm run build
```

The built files will be in the `dist/` directory.

## 📁 Project Structure

```
frontend/
├── src/
│   ├── components/
│   │   ├── Layout.tsx
│   │   └── WalletConnect.tsx
│   ├── pages/
│   │   ├── Dashboard.tsx
│   │   ├── UploadData.tsx
│   │   ├── AccessControl.tsx
│   │   ├── VerifyData.tsx
│   │   └── AuditLogs.tsx
│   ├── stores/
│   │   ├── wallet-store.ts
│   │   ├── institution-store.ts
│   │   ├── data-store.ts
│   │   ├── access-store.ts
│   │   └── audit-store.ts
│   ├── App.tsx
│   ├── main.tsx
│   └── index.css
├── public/
├── package.json
├── tailwind.config.js
├── vite.config.ts
└── tsconfig.json
```

## 🔐 Wallet Connection

### MetaMask Setup

1. Install [MetaMask](https://metamask.io/) browser extension
2. Create or import a wallet
3. Connect to your local blockchain or BlockDAG testnet
4. Click "Connect Wallet" in the app

### Network Configuration

Add your local blockchain to MetaMask:

- **Network Name**: BlockDAG Local
- **RPC URL**: `http://localhost:8545`
- **Chain ID**: `1337`
- **Currency Symbol**: `ETH`

## 📱 Features Guide

### Dashboard

- View platform statistics (uploads, verifications, access grants)
- See activity distribution charts
- Check recent activity logs
- View your data records

### Upload Data

1. Connect your wallet
2. Click "Upload Data" in navigation
3. Select a file
4. Choose category and add description
5. Click "Upload to Blockchain"
6. Approve the transaction in MetaMask

**Note**: In production, files are encrypted client-side before upload.

### Access Control

#### Grant Access
1. Navigate to "Access Control"
2. Click "Grant Access"
3. Select a data record
4. Enter grantee wallet address
5. Set permission type (read/verify/full)
6. Optionally set expiration date
7. Submit

#### Revoke Access
1. Go to "Granted Permissions" tab
2. Find the permission to revoke
3. Click "Revoke"
4. Confirm the action

### Verify Data

1. Navigate to "Verify Data"
2. Enter the Record ID
3. Enter the SHA-256 hash to verify
4. Click "Verify Data"
5. See verification result with detailed record information

### Audit Logs

- View all platform activities
- Filter by action type, date range
- Export logs as JSON
- See detailed information for each log entry

## 🎨 Styling

The application uses TailwindCSS for styling with a dark theme.

### Color Scheme

- **Primary**: Blue (`#0ea5e9`)
- **Background**: Dark slate (`#0f172a`, `#1e293b`)
- **Text**: White/Gray
- **Success**: Green
- **Error**: Red

### Customization

Modify `tailwind.config.js` to customize colors and theme:

```js
theme: {
  extend: {
    colors: {
      primary: {
        // your custom colors
      },
    },
  },
}
```

## 🔄 State Management

The application uses Zustand for state management with separate stores per module:

### Store Structure

- **wallet-store.ts** - Wallet connection state
- **institution-store.ts** - Institution data and operations
- **data-store.ts** - Data records and upload/verify operations
- **access-store.ts** - Access control permissions
- **audit-store.ts** - Audit logs and statistics

### Example Usage

```typescript
import { useDataStore } from './stores/data-store';

function MyComponent() {
  const { uploadData, records, isLoading } = useDataStore();
  
  const handleUpload = async (data) => {
    await uploadData(data, walletAddress);
  };
  
  return (
    // component JSX
  );
}
```

## 🧪 Development

### Available Scripts

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Run linter
npm run lint
```

### Adding a New Page

1. Create component in `src/pages/`
2. Add route in `src/App.tsx`
3. Add navigation link in `src/components/Layout.tsx`
4. Create Zustand store if needed in `src/stores/`

## 🚀 Deployment

### Build

```bash
npm run build
```

### Deploy to Netlify

```bash
# Install Netlify CLI
npm install -g netlify-cli

# Deploy
netlify deploy --prod --dir=dist
```

### Deploy to Vercel

```bash
# Install Vercel CLI
npm install -g vercel

# Deploy
vercel --prod
```

### Environment Variables

Make sure to set environment variables in your deployment platform:

- `VITE_API_BASE_URL`
- `VITE_CHAIN_ID`
- `VITE_BLOCKCHAIN_RPC_URL`
- Contract addresses
- IPFS gateway

## 🔒 Security Considerations

1. **Never expose private keys** in the frontend
2. **Validate all user inputs** before sending to backend
3. **Use HTTPS** in production
4. **Implement proper error handling** for wallet transactions
5. **Verify contract addresses** before interactions

## 📊 Performance

### Optimization Tips

1. Use React.lazy() for code splitting
2. Implement virtual scrolling for large lists
3. Optimize images and assets
4. Use production build for deployment
5. Enable CDN for static assets

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

MIT License

## 📞 Support

For issues and questions, please open an issue on the repository.

## 🙏 Acknowledgments

- TailwindCSS for the styling framework
- Recharts for data visualization
- Zustand for state management
- Lucide for beautiful icons

import { useEffect } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { WalletConnect } from './WalletConnect';
import { useWalletStore } from '../stores/wallet-store';
import { useInstitutionStore } from '../stores/institution-store';
import { Shield, LayoutDashboard, Upload, Lock, CheckCircle, FileText, Building2, Database } from 'lucide-react';

export const Layout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { isConnected, address } = useWalletStore();
  const { currentInstitution, getInstitutionByWallet } = useInstitutionStore();

  // Load institution when wallet is connected
  useEffect(() => {
    if (isConnected && address && !currentInstitution) {
      getInstitutionByWallet(address);
    }
  }, [isConnected, address, currentInstitution, getInstitutionByWallet]);

  // Redirect to landing page if wallet is not connected
  useEffect(() => {
    if (!isConnected) {
      navigate('/');
    }
  }, [isConnected, navigate]);

  const navItems = [
    { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/dashboard/my-data', label: 'My Data', icon: Database },
    { path: '/dashboard/upload', label: 'Upload Data', icon: Upload },
    { path: '/dashboard/bulk-upload', label: 'Bulk Upload', icon: Database },
    { path: '/dashboard/access-control', label: 'Access Control', icon: Lock },
    { path: '/dashboard/verify', label: 'Verify Data', icon: CheckCircle },
    { path: '/dashboard/audit-logs', label: 'Audit Logs', icon: FileText },
  ];

  return (
    <div className="min-h-screen bg-slate-900 flex">
      {/* Sidebar - Fixed */}
      <aside className="fixed left-0 top-0 h-screen w-64 bg-slate-800 border-r border-slate-700 flex flex-col z-10">
        {/* Logo */}
        <div className="p-6 border-b border-slate-700">
          <div className="flex items-center gap-3">
            <Shield className="text-primary-500" size={32} />
            <div>
              <h1 className="text-lg font-bold text-white">DataTrust Nexus</h1>
              <p className="text-xs text-gray-400">Secure Data Exchange</p>
            </div>
          </div>
        </div>

        {/* Institution Info */}
        {currentInstitution && (
          <div className="p-4 border-b border-slate-700">
            <div className="flex items-center gap-3 px-3 py-2 bg-slate-700 rounded-lg">
              <Building2 className="text-primary-400" size={18} />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-white truncate">{currentInstitution.name}</p>
                <p className="text-xs text-gray-400">{currentInstitution.institutionType}</p>
              </div>
            </div>
          </div>
        )}

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition ${
                  isActive
                    ? 'bg-primary-600 text-white'
                    : 'text-gray-300 hover:bg-slate-700 hover:text-white'
                }`}
              >
                <Icon size={20} />
                <span className="text-sm font-medium">{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Wallet Connect */}
        <div className="p-4 border-t border-slate-700">
          <WalletConnect />
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 ml-64">
        {/* Main Content Area */}
        <main className="flex-1 p-6 overflow-y-auto">
          <Outlet />
        </main>

        {/* Footer - Fixed at bottom */}
        <footer className="bg-slate-800 border-t border-slate-700 py-4">
          <div className="px-6">
            <p className="text-center text-sm text-gray-400">
              © 2024 DataTrust Nexus. ISO 27001 & NIST SP 800-53 Compliant. Built on BlockDAG Chain.
            </p>
          </div>
        </footer>
      </div>
    </div>
  );
};


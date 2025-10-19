import { FileText, Shield, Clock, CheckCircle } from 'lucide-react';

export const AuditLogs = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] py-20 px-4">
      {/* Logo/Branding */}
      <div className="mb-8 flex items-center gap-4">
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-primary-500 to-purple-500 blur-2xl opacity-30 rounded-full"></div>
          <div className="relative p-6 bg-gradient-to-br from-primary-500 to-purple-600 rounded-2xl">
            <Shield className="text-white" size={48} />
          </div>
        </div>
        <div>
          <h1 className="text-3xl font-bold text-white">DataTrust Nexus</h1>
          <p className="text-gray-400 text-sm">Audit & Compliance</p>
        </div>
      </div>

      {/* Coming Soon Content */}
      <div className="text-center max-w-2xl">
        <div className="mb-6 inline-flex items-center gap-2 px-4 py-2 bg-primary-500/20 border border-primary-500/30 rounded-full">
          <Clock className="text-primary-400" size={20} />
          <span className="text-primary-300 font-medium">Coming Soon</span>
        </div>

        <h2 className="text-4xl font-bold text-white mb-4">
          Audit Logs Dashboard
        </h2>
        
        <p className="text-xl text-gray-300 mb-8">
          Complete audit trail and compliance monitoring
        </p>

        {/* Features Preview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700">
            <div className="p-3 bg-blue-500/20 rounded-lg w-fit mx-auto mb-4">
              <FileText className="text-blue-400" size={24} />
            </div>
            <h3 className="text-white font-semibold mb-2">Complete Audit Trail</h3>
            <p className="text-gray-400 text-sm">
              Track every action on the platform with full transparency
            </p>
          </div>

          <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700">
            <div className="p-3 bg-green-500/20 rounded-lg w-fit mx-auto mb-4">
              <CheckCircle className="text-green-400" size={24} />
            </div>
            <h3 className="text-white font-semibold mb-2">NIST Compliance</h3>
            <p className="text-gray-400 text-sm">
              Meet NIST SP 800-53 audit and accountability requirements
            </p>
          </div>

          <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700">
            <div className="p-3 bg-purple-500/20 rounded-lg w-fit mx-auto mb-4">
              <Shield className="text-purple-400" size={24} />
            </div>
            <h3 className="text-white font-semibold mb-2">Security Monitoring</h3>
            <p className="text-gray-400 text-sm">
              Real-time monitoring and detection of suspicious activities
            </p>
          </div>
        </div>

        {/* Info Box */}
        <div className="bg-gradient-to-r from-primary-500/10 to-purple-500/10 border border-primary-500/20 rounded-xl p-6">
          <p className="text-gray-300">
            <strong className="text-white">Audit Logs</strong> will provide complete visibility into all platform activities, 
            including data uploads, access grants, institution registrations, and more. 
            This feature ensures compliance with security standards and provides accountability for all actions.
          </p>
        </div>
      </div>
    </div>
  );
};

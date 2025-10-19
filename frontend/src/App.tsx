import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Layout } from './components/Layout';
import { Landing } from './pages/Landing';
import { RegisterInstitution } from './pages/RegisterInstitution';
import { Dashboard } from './pages/Dashboard';
import { MyData } from './pages/MyData';
import { BrowseFiles } from './pages/BrowseFiles';
import { UploadData } from './pages/UploadData';
import { BulkUpload } from './pages/BulkUpload';
import { AccessControl } from './pages/AccessControl';
import { AccessRequests } from './pages/AccessRequests';
import { VerifyData } from './pages/VerifyData';
import { AuditLogs } from './pages/AuditLogs';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/register" element={<RegisterInstitution />} />
        <Route path="/dashboard" element={<Layout />}>
          <Route index element={<Dashboard />} />
          <Route path="my-data" element={<MyData />} />
          <Route path="browse-files" element={<BrowseFiles />} />
          <Route path="upload" element={<UploadData />} />
          <Route path="bulk-upload" element={<BulkUpload />} />
          <Route path="access-control" element={<AccessControl />} />
          <Route path="access-requests" element={<AccessRequests />} />
          <Route path="verify" element={<VerifyData />} />
          <Route path="audit-logs" element={<AuditLogs />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;

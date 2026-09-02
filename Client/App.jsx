// Client/App.jsx

import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Login from './pages/Login.jsx';
import Register from './pages/Register.jsx';
import Dashboard from './pages/Dashboard.jsx';
import ScanCard from './pages/ScanCard.jsx';
import RegisterPatient from './pages/RegisterPatient.jsx';
import GenerateCard from './pages/GenerateCard.jsx';
import RecordVisit from './pages/RecordVisit.jsx';
import StaffList from './pages/StaffList.jsx';
import AuditLog from './pages/AuditLog.jsx';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/scan" element={<ScanCard />} />
        <Route path="/register-patient" element={<RegisterPatient />} />
        <Route path="/generate-card" element={<GenerateCard />} />
        <Route path="/record-visit" element={<RecordVisit />} />
        <Route path="/staff-list" element={<StaffList />} />
        <Route path="/audit-log" element={<AuditLog />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
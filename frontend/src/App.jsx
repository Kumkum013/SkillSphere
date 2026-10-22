import { Routes, Route, Navigate } from 'react-router-dom';
import ErrorBoundary from './components/ErrorBoundary';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import Dashboard from './pages/Dashboard';
import Profile from './pages/Profile';
import Projects from './pages/Projects';
import ProjectDetail from './pages/ProjectDetail';
import Invitations from './pages/Invitations';
import Todos from './pages/Todos';
import Recommendations from './pages/Recommendations';
import Notifications from './pages/Notifications';
import Chat from './pages/Chat';
import JoinRequests from './pages/JoinRequests';
import Students from './pages/Students';
import StudentProfile from './pages/StudentProfile';
import Contributions from './pages/Contributions';
import Clients from './pages/Clients';
import TimeTracking from './pages/TimeTracking';
import FinancialDashboard from './pages/FinancialDashboard';
import Reports from './pages/Reports';
import ProjectTemplates from './pages/ProjectTemplates';

function App() {
  return (
    <ErrorBoundary>
      <Routes>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password/:token" element={<ResetPassword />} />

        <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
        <Route path="/projects" element={<ProtectedRoute><Projects /></ProtectedRoute>} />
        <Route path="/projects/:id" element={<ProtectedRoute><ProjectDetail /></ProtectedRoute>} />
        <Route path="/projects/:id/contributions" element={<ProtectedRoute><Contributions /></ProtectedRoute>} />
        <Route path="/students" element={<ProtectedRoute><Students /></ProtectedRoute>} />
        <Route path="/students/:id" element={<ProtectedRoute><StudentProfile /></ProtectedRoute>} />
        <Route path="/clients" element={<ProtectedRoute><Clients /></ProtectedRoute>} />
        <Route path="/time-tracking" element={<ProtectedRoute><TimeTracking /></ProtectedRoute>} />
        <Route path="/financials" element={<ProtectedRoute><FinancialDashboard /></ProtectedRoute>} />
        <Route path="/reports" element={<ProtectedRoute><Reports /></ProtectedRoute>} />
        <Route path="/templates" element={<ProtectedRoute><ProjectTemplates /></ProtectedRoute>} />
        <Route path="/invitations" element={<ProtectedRoute><Invitations /></ProtectedRoute>} />
        <Route path="/todos" element={<ProtectedRoute><Todos /></ProtectedRoute>} />
        <Route path="/recommendations" element={<ProtectedRoute><Recommendations /></ProtectedRoute>} />
        <Route path="/notifications" element={<ProtectedRoute><Notifications /></ProtectedRoute>} />
        <Route path="/join-requests" element={<ProtectedRoute><JoinRequests /></ProtectedRoute>} />
        <Route path="/projects/:id/chat" element={<ProtectedRoute><Chat /></ProtectedRoute>} />

        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </ErrorBoundary>
  );
}

export default App;

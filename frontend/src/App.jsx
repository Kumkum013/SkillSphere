import { Routes, Route, Navigate } from 'react-router-dom';
import ErrorBoundary from './components/ErrorBoundary';
import ProtectedRoute from './components/ProtectedRoute';
import AuthenticatedLayout from './components/AuthenticatedLayout';
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

        {/* Authenticated routes wrapped with single global horizontal navbar */}
        <Route
          element={
            <ProtectedRoute>
              <AuthenticatedLayout />
            </ProtectedRoute>
          }
        >
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/projects" element={<Projects />} />
          <Route path="/projects/:id" element={<ProjectDetail />} />
          <Route path="/projects/:id/contributions" element={<Contributions />} />
          <Route path="/students" element={<Students />} />
          <Route path="/students/:id" element={<StudentProfile />} />
          <Route path="/clients" element={<Clients />} />
          <Route path="/time-tracking" element={<TimeTracking />} />
          <Route path="/financials" element={<FinancialDashboard />} />
          <Route path="/reports" element={<Reports />} />
          <Route path="/templates" element={<ProjectTemplates />} />
          <Route path="/invitations" element={<Invitations />} />
          <Route path="/todos" element={<Todos />} />
          <Route path="/recommendations" element={<Recommendations />} />
          <Route path="/notifications" element={<Notifications />} />
          <Route path="/join-requests" element={<JoinRequests />} />
          <Route path="/projects/:id/chat" element={<Chat />} />
        </Route>

        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </ErrorBoundary>
  );
}

export default App;

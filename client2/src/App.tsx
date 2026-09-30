import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Navbar } from './components/Navbar';
import { Sidebar } from './components/Sidebar';
import { Login } from './pages/Login';
import { Dashboard } from './pages/Dashboard';
import { Instruments } from './pages/Instruments';
import { NewInstrument } from './pages/NewInstrument';
import { TestCases } from './pages/TestCases';
import { NewTestCase } from './pages/NewTestCase';
import { TestingWorkspace } from './pages/TestingWorkspace';
import { Repository } from './pages/Repository';
import { Rules } from './pages/Rules';
import { AuditLogs } from './pages/AuditLogs';
import { Users } from './pages/Users';

const ProtectedLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 text-slate-500">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mr-3"></div>
        <span className="font-medium text-sm">Initializing METROLOGIX Platform...</span>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="min-h-screen flex bg-[#f8faff] text-slate-800">
      {/* Deep Navy Sidebar (Figma) */}
      <Sidebar />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        <Navbar />
        <main className="flex-1 p-6 lg:p-8 overflow-y-auto max-w-7xl w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route
            path="/"
            element={
              <ProtectedLayout>
                <Dashboard />
              </ProtectedLayout>
            }
          />
          <Route
            path="/dashboard"
            element={
              <ProtectedLayout>
                <Dashboard />
              </ProtectedLayout>
            }
          />
          <Route
            path="/instruments"
            element={
              <ProtectedLayout>
                <Instruments />
              </ProtectedLayout>
            }
          />
          <Route
            path="/instruments/new"
            element={
              <ProtectedLayout>
                <NewInstrument />
              </ProtectedLayout>
            }
          />
          <Route
            path="/tests"
            element={
              <ProtectedLayout>
                <TestCases />
              </ProtectedLayout>
            }
          />
          <Route
            path="/tests/new"
            element={
              <ProtectedLayout>
                <NewTestCase />
              </ProtectedLayout>
            }
          />
          <Route
            path="/tests/:id"
            element={
              <ProtectedLayout>
                <TestingWorkspace />
              </ProtectedLayout>
            }
          />
          <Route
            path="/repository"
            element={
              <ProtectedLayout>
                <Repository />
              </ProtectedLayout>
            }
          />
          <Route
            path="/rules"
            element={
              <ProtectedLayout>
                <Rules />
              </ProtectedLayout>
            }
          />
          <Route
            path="/audit-logs"
            element={
              <ProtectedLayout>
                <AuditLogs />
              </ProtectedLayout>
            }
          />
          <Route
            path="/users"
            element={
              <ProtectedLayout>
                <Users />
              </ProtectedLayout>
            }
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
};

export default App;

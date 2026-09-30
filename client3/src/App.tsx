import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Navbar } from './components/Navbar';
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
      <div className="min-h-screen flex items-center justify-center bg-surface text-on-surface-variant">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mr-3"></div>
        <span className="font-medium text-sm">Initializing METROLOGIX Session...</span>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="min-h-screen flex flex-col bg-surface text-on-surface">
      <Navbar />
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-6">
        {children}
      </main>
      <footer className="bg-white border-t border-surface-container py-4 text-center text-xs text-on-surface-variant">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>
            <strong>METROLOGIX</strong> • Non-Automatic Weighing Instruments Legal Metrology Platform (OIML R 76-1:2006)
          </span>
          <span className="font-mono text-[11px] text-outline">
            National Legal Metrology Evaluation Centre • Regional Directorate
          </span>
        </div>
      </footer>
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

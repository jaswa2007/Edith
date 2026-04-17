import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Link } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';

import Splash from './components/Splash';
import Login from './components/Login';
import Signup from './components/Signup';
import Dashboard from './components/Dashboard';
import History from './components/History';
import { UploadSection } from './components/UploadSection';

// Protected Route Wrapper
const PrivateRoute = ({ children }) => {
  const { token, loading } = useAuth();
  if (loading) return null;
  return token ? children : <Navigate to="/login" />;
};

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Splash />} />
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
      
      <Route path="/dashboard" element={
        <PrivateRoute>
          <Dashboard />
        </PrivateRoute>
      } />

      <Route path="/history" element={
        <PrivateRoute>
          <History />
        </PrivateRoute>
      } />

      {/* Feature Routes */}
      <Route path="/upload/:type" element={
        <PrivateRoute>
          <div className="min-h-screen p-6 flex flex-col items-center">
             <header className="w-full max-w-5xl py-6 flex justify-between items-center z-10 relative">
                <Link to="/dashboard" className="flex items-center gap-3 cursor-pointer">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-primary to-blue-500 flex items-center justify-center text-white font-display font-bold text-xl">
                    E
                  </div>
                  <h1 className="text-2xl font-display font-bold tracking-tight">EDITH</h1>
                </Link>
                <Link to="/dashboard" className="text-white/40 hover:text-white transition-colors">Back to Dashboard</Link>
             </header>
             <main className="w-full max-w-4xl mt-12 flex-1 flex flex-col items-center">
                <UploadSection />
             </main>
          </div>
        </PrivateRoute>
      } />

      {/* Redirect unknown routes to splash */}
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen bg-dark text-white selection:bg-primary/30 relative overflow-hidden">
          <AppRoutes />
          
          {/* Background decoration elements */}
          <div className="fixed top-20 -left-32 w-96 h-96 bg-primary/10 rounded-full mix-blend-screen filter blur-[100px] pointer-events-none"></div>
          <div className="fixed bottom-20 -right-32 w-96 h-96 bg-blue-500/10 rounded-full mix-blend-screen filter blur-[100px] pointer-events-none"></div>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;

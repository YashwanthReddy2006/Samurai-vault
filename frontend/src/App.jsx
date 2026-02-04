/**
 * SamuraiVault - Main Application
 */

import { useState, useEffect } from 'react';
import { useAuth } from './state/auth.store';
import Navbar from './components/Navbar';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Vault from './pages/Vault';
import Analytics from './pages/Analytics';
import Settings from './pages/Settings';

function App() {
  const { isAuthenticated, loading } = useAuth();
  const [currentPage, setCurrentPage] = useState('login');

  useEffect(() => {
    if (isAuthenticated) {
      setCurrentPage('dashboard');
    } else if (!loading) {
      setCurrentPage('login');
    }
  }, [isAuthenticated, loading]);

  const navigateTo = (page) => {
    setCurrentPage(page);
  };

  if (loading) {
    return (
      <div className="app-loading">
        <div className="loader" />
        <p>Loading SamuraiVault...</p>
      </div>
    );
  }

  // Auth pages (no navbar)
  if (!isAuthenticated) {
    return (
      <>
        {currentPage === 'login' && <Login onNavigate={navigateTo} />}
        {currentPage === 'register' && <Register onNavigate={navigateTo} />}
      </>
    );
  }

  // Main app with navbar
  return (
    <div className="app-layout">
      <Navbar currentPage={currentPage} onNavigate={navigateTo} />
      <main className="main-content">
        {currentPage === 'dashboard' && <Dashboard onNavigate={navigateTo} />}
        {currentPage === 'vault' && <Vault />}
        {currentPage === 'analytics' && <Analytics />}
        {currentPage === 'settings' && <Settings />}
      </main>

      <style>{`
        .app-loading {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          min-height: 100vh;
          gap: 1.5rem;
        }
        .app-loading p { color: var(--text-muted); }
        .app-layout { display: flex; min-height: 100vh; }
        .main-content { flex: 1; padding: 2rem; margin-left: 250px; }
        @media (max-width: 768px) { .main-content { margin-left: 0; padding: 1rem; } }
      `}</style>
    </div>
  );
}

export default App;

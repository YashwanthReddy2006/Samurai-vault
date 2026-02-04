/**
 * Navbar Component - Samurai styled navigation
 */

import { useState } from 'react';
import { useAuth } from '../state/auth.store';

const Navbar = ({ currentPage, onNavigate }) => {
    const { user, logout } = useAuth();
    const [mobileOpen, setMobileOpen] = useState(false);

    const navItems = [
        { id: 'dashboard', label: 'Dashboard', icon: '📊' },
        { id: 'vault', label: 'Vault', icon: '🔐' },
        { id: 'analytics', label: 'Analytics', icon: '📈' },
        { id: 'settings', label: 'Settings', icon: '⚙️' },
    ];

    const handleLogout = async () => {
        await logout();
        onNavigate('login');
    };

    return (
        <>
            {/* Sidebar */}
            <aside className="sidebar">
                <div className="sidebar-header">
                    <div className="logo">
                        <span className="logo-icon">⚔️</span>
                        <span className="logo-text">SamuraiVault</span>
                    </div>
                </div>

                <nav className="sidebar-nav">
                    {navItems.map((item) => (
                        <button
                            key={item.id}
                            className={`nav-item ${currentPage === item.id ? 'active' : ''}`}
                            onClick={() => onNavigate(item.id)}
                        >
                            <span className="nav-icon">{item.icon}</span>
                            <span className="nav-label">{item.label}</span>
                        </button>
                    ))}
                </nav>

                <div className="sidebar-footer">
                    <div className="user-info">
                        <div className="user-avatar">
                            {user?.username?.[0]?.toUpperCase() || 'U'}
                        </div>
                        <div className="user-details">
                            <span className="user-name">{user?.username || 'User'}</span>
                            <span className="user-email">{user?.email || ''}</span>
                        </div>
                    </div>
                    <button className="btn btn-ghost btn-sm" onClick={handleLogout}>
                        Logout
                    </button>
                </div>
            </aside>

            <style>{`
        .sidebar {
          position: fixed;
          left: 0;
          top: 0;
          bottom: 0;
          width: 250px;
          background: var(--bg-secondary);
          border-right: 1px solid var(--border-subtle);
          display: flex;
          flex-direction: column;
          z-index: 50;
        }

        .sidebar-header {
          padding: var(--space-lg);
          border-bottom: 1px solid var(--border-subtle);
        }

        .logo {
          display: flex;
          align-items: center;
          gap: var(--space-sm);
        }

        .logo-icon {
          font-size: 1.5rem;
        }

        .logo-text {
          font-size: 1.25rem;
          font-weight: 700;
          background: linear-gradient(135deg, var(--accent-primary), var(--gold-primary));
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .sidebar-nav {
          flex: 1;
          padding: var(--space-md);
          display: flex;
          flex-direction: column;
          gap: var(--space-xs);
        }

        .nav-item {
          display: flex;
          align-items: center;
          gap: var(--space-sm);
          padding: var(--space-sm) var(--space-md);
          background: transparent;
          border: none;
          border-radius: var(--radius-md);
          color: var(--text-secondary);
          font-family: inherit;
          font-size: 0.9375rem;
          cursor: pointer;
          transition: all var(--transition-fast);
          text-align: left;
        }

        .nav-item:hover {
          background: var(--bg-tertiary);
          color: var(--text-primary);
        }

        .nav-item.active {
          background: var(--accent-muted);
          color: var(--accent-primary);
        }

        .nav-icon {
          font-size: 1.125rem;
        }

        .sidebar-footer {
          padding: var(--space-md);
          border-top: 1px solid var(--border-subtle);
        }

        .user-info {
          display: flex;
          align-items: center;
          gap: var(--space-sm);
          margin-bottom: var(--space-md);
        }

        .user-avatar {
          width: 40px;
          height: 40px;
          background: linear-gradient(135deg, var(--accent-dark), var(--accent-primary));
          border-radius: var(--radius-md);
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 600;
          color: white;
        }

        .user-details {
          display: flex;
          flex-direction: column;
        }

        .user-name {
          font-weight: 500;
          font-size: 0.875rem;
        }

        .user-email {
          font-size: 0.75rem;
          color: var(--text-muted);
        }

        @media (max-width: 768px) {
          .sidebar {
            transform: translateX(-100%);
          }
          .sidebar.open {
            transform: translateX(0);
          }
        }
      `}</style>
        </>
    );
};

export default Navbar;

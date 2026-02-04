/**
 * Dashboard Page - Security Overview
 */

import { useEffect, useState } from 'react';
import { useAuth } from '../state/auth.store';
import { apiClient } from '../api/client';

const Dashboard = ({ onNavigate }) => {
    const { user } = useAuth();
    const [analytics, setAnalytics] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchAnalytics = async () => {
            try {
                const data = await apiClient.get('/api/analytics/dashboard');
                setAnalytics(data);
            } catch (err) {
                console.error('Failed to fetch analytics:', err);
            }
            setLoading(false);
        };

        fetchAnalytics();
    }, []);

    const stats = analytics ? [
        {
            label: 'Total Passwords',
            value: analytics.total_passwords,
            icon: '🔐',
            color: 'var(--accent-primary)',
        },
        {
            label: 'Weak Passwords',
            value: analytics.weak_passwords,
            icon: '⚠️',
            color: 'var(--error)',
            warning: analytics.weak_passwords > 0,
        },
        {
            label: 'Reused Passwords',
            value: analytics.reused_passwords,
            icon: '🔄',
            color: 'var(--warning)',
            warning: analytics.reused_passwords > 0,
        },
        {
            label: 'Average Strength',
            value: `${Math.round(analytics.average_strength)}%`,
            icon: '💪',
            color: 'var(--success)',
        },
    ] : [];

    if (loading) {
        return (
            <div className="dashboard-loading">
                <div className="loader" />
                <p>Loading your vault...</p>
            </div>
        );
    }

    return (
        <div className="dashboard">
            <div className="page-header">
                <div>
                    <h1 className="page-title">Welcome back, {user?.username || 'Warrior'}</h1>
                    <p className="page-subtitle">Your vault security at a glance</p>
                </div>
                <button className="btn btn-primary" onClick={() => onNavigate('vault')}>
                    Open Vault
                </button>
            </div>

            <div className="stats-grid">
                {stats.map((stat, i) => (
                    <div key={i} className={`stat-card ${stat.warning ? 'stat-warning' : ''}`}>
                        <div className="stat-icon" style={{ background: `${stat.color}20` }}>
                            {stat.icon}
                        </div>
                        <div className="stat-value" style={{ color: stat.warning ? stat.color : 'inherit' }}>
                            {stat.value}
                        </div>
                        <div className="stat-label">{stat.label}</div>
                    </div>
                ))}
            </div>

            {/* Quick Actions */}
            <div className="dashboard-section">
                <h2 className="section-title">Quick Actions</h2>
                <div className="quick-actions">
                    <button className="action-card" onClick={() => onNavigate('vault')}>
                        <span className="action-icon">➕</span>
                        <span className="action-label">Add Password</span>
                    </button>
                    <button className="action-card" onClick={() => onNavigate('analytics')}>
                        <span className="action-icon">📊</span>
                        <span className="action-label">View Analytics</span>
                    </button>
                    <button className="action-card" onClick={() => onNavigate('settings')}>
                        <span className="action-icon">🔐</span>
                        <span className="action-label">Enable MFA</span>
                    </button>
                </div>
            </div>

            {/* Security Tips */}
            <div className="dashboard-section">
                <h2 className="section-title">Security Tips</h2>
                <div className="tips-grid">
                    <div className="tip-card">
                        <span className="tip-icon">💡</span>
                        <div>
                            <h4>Use Unique Passwords</h4>
                            <p>Never reuse passwords across different accounts</p>
                        </div>
                    </div>
                    <div className="tip-card">
                        <span className="tip-icon">🔒</span>
                        <div>
                            <h4>Enable Two-Factor Auth</h4>
                            <p>Add an extra layer of protection to your vault</p>
                        </div>
                    </div>
                    <div className="tip-card">
                        <span className="tip-icon">🔄</span>
                        <div>
                            <h4>Update Old Passwords</h4>
                            <p>Regularly update passwords older than 90 days</p>
                        </div>
                    </div>
                </div>
            </div>

            <style>{`
        .dashboard {
          animation: fadeIn 0.4s ease;
        }

        .dashboard-loading {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          min-height: 400px;
          gap: var(--space-lg);
        }

        .dashboard-loading p {
          color: var(--text-muted);
        }

        .stats-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: var(--space-lg);
          margin-bottom: var(--space-xl);
        }

        @media (max-width: 1024px) {
          .stats-grid {
            grid-template-columns: repeat(2, 1fr);
          }
        }

        @media (max-width: 640px) {
          .stats-grid {
            grid-template-columns: 1fr;
          }
        }

        .stat-card {
          background: var(--bg-secondary);
          border: 1px solid var(--border-subtle);
          border-radius: var(--radius-lg);
          padding: var(--space-lg);
          position: relative;
          overflow: hidden;
          transition: all var(--transition-normal);
        }

        .stat-card::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 3px;
          background: linear-gradient(90deg, var(--accent-primary), var(--gold-primary));
        }

        .stat-card:hover {
          border-color: var(--border-accent);
          transform: translateY(-3px);
        }

        .stat-warning {
          border-color: rgba(239, 68, 68, 0.3);
        }

        .stat-icon {
          width: 48px;
          height: 48px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: var(--radius-md);
          margin-bottom: var(--space-md);
          font-size: 1.5rem;
        }

        .stat-value {
          font-size: 2rem;
          font-weight: 700;
        }

        .stat-label {
          font-size: 0.875rem;
          color: var(--text-muted);
          margin-top: var(--space-xs);
        }

        .dashboard-section {
          margin-bottom: var(--space-xl);
        }

        .section-title {
          font-size: 1.25rem;
          margin-bottom: var(--space-lg);
          color: var(--text-primary);
        }

        .quick-actions {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: var(--space-md);
        }

        @media (max-width: 768px) {
          .quick-actions {
            grid-template-columns: 1fr;
          }
        }

        .action-card {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: var(--space-sm);
          padding: var(--space-xl);
          background: var(--bg-secondary);
          border: 1px solid var(--border-subtle);
          border-radius: var(--radius-lg);
          cursor: pointer;
          transition: all var(--transition-normal);
          font-family: inherit;
          color: var(--text-primary);
        }

        .action-card:hover {
          border-color: var(--accent-primary);
          transform: translateY(-3px);
          box-shadow: var(--shadow-glow);
        }

        .action-icon {
          font-size: 2rem;
        }

        .action-label {
          font-weight: 500;
        }

        .tips-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: var(--space-md);
        }

        @media (max-width: 768px) {
          .tips-grid {
            grid-template-columns: 1fr;
          }
        }

        .tip-card {
          display: flex;
          gap: var(--space-md);
          padding: var(--space-lg);
          background: var(--bg-secondary);
          border: 1px solid var(--border-subtle);
          border-radius: var(--radius-lg);
        }

        .tip-icon {
          font-size: 1.5rem;
        }

        .tip-card h4 {
          font-size: 0.9375rem;
          margin-bottom: var(--space-xs);
        }

        .tip-card p {
          font-size: 0.8125rem;
          color: var(--text-muted);
        }
      `}</style>
        </div>
    );
};

export default Dashboard;

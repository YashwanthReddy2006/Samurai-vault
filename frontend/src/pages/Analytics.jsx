/**
 * Analytics Page - Security Insights
 */

import { useEffect, useState } from 'react';
import { apiClient } from '../api/client';

const Analytics = () => {
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

    if (loading) {
        return <div className="analytics-loading"><div className="loader" /></div>;
    }

    const securityScore = analytics ?
        Math.round(100 - ((analytics.weak_passwords * 20) + (analytics.reused_passwords * 15)) / Math.max(1, analytics.total_passwords)) : 0;

    return (
        <div className="analytics">
            <div className="page-header">
                <h1 className="page-title">Security Analytics</h1>
                <p className="page-subtitle">Detailed insights about your password security</p>
            </div>

            <div className="analytics-grid">
                <div className="analytics-card">
                    <h3>🛡️ Security Score</h3>
                    <div className="score-display">{securityScore}%</div>
                </div>

                <div className="analytics-card">
                    <h3>📊 Password Health</h3>
                    <div className="health-list">
                        <div className="health-item">
                            <span>Strong</span><span>{analytics?.total_passwords - analytics?.weak_passwords || 0}</span>
                        </div>
                        <div className="health-item">
                            <span>Weak</span><span>{analytics?.weak_passwords || 0}</span>
                        </div>
                        <div className="health-item">
                            <span>Reused</span><span>{analytics?.reused_passwords || 0}</span>
                        </div>
                    </div>
                </div>

                <div className="analytics-card">
                    <h3>💪 Average Strength</h3>
                    <div className="score-display">{Math.round(analytics?.average_strength || 0)}%</div>
                </div>

                <div className="analytics-card">
                    <h3>📁 Categories</h3>
                    <div className="category-list">
                        {analytics && Object.entries(analytics.category_breakdown || {}).map(([cat, count]) => (
                            <div key={cat} className="category-item"><span>{cat}</span><span>{count}</span></div>
                        ))}
                    </div>
                </div>
            </div>

            <style>{`
        .analytics-loading { display: flex; justify-content: center; padding: 4rem; }
        .analytics-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 1.5rem; }
        .analytics-card { background: var(--bg-secondary); border: 1px solid var(--border-subtle); border-radius: 12px; padding: 1.5rem; }
        .analytics-card h3 { margin-bottom: 1rem; }
        .score-display { font-size: 3rem; font-weight: 700; text-align: center; color: var(--accent-primary); }
        .health-list, .category-list { display: flex; flex-direction: column; gap: 0.5rem; }
        .health-item, .category-item { display: flex; justify-content: space-between; padding: 0.5rem; background: var(--bg-tertiary); border-radius: 6px; }
        @media (max-width: 768px) { .analytics-grid { grid-template-columns: 1fr; } }
      `}</style>
        </div>
    );
};

export default Analytics;

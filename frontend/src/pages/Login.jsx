/**
 * Login Page - Samurai themed authentication
 */

import { useState } from 'react';
import { useAuth } from '../state/auth.store';
import { validateEmail } from '../utils/validators';
import AlertBanner from '../components/AlertBanner';
import MFAModal from '../components/MFAModal';

const Login = ({ onNavigate }) => {
    const { login } = useAuth();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [showMFA, setShowMFA] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        // Validate
        const emailError = validateEmail(email);
        if (emailError) {
            setError(emailError);
            return;
        }
        if (!password) {
            setError('Password is required');
            return;
        }

        setLoading(true);

        try {
            await login(email, password);
            onNavigate('dashboard');
        } catch (err) {
            if (err.message === 'MFA code required') {
                setShowMFA(true);
            } else {
                setError(err.message || 'Login failed');
            }
        }

        setLoading(false);
    };

    const handleMFAVerify = async (code) => {
        await login(email, password, code);
        onNavigate('dashboard');
    };

    return (
        <div className="auth-page">
            <div className="auth-container">
                <div className="auth-header">
                    <div className="auth-logo">⚔️</div>
                    <h1 className="auth-title">SamuraiVault</h1>
                    <p className="auth-subtitle">Enter the sanctuary of your secrets</p>
                </div>

                {error && (
                    <AlertBanner type="error" message={error} onClose={() => setError('')} />
                )}

                <form onSubmit={handleSubmit} className="auth-form">
                    <div className="input-group">
                        <label htmlFor="email">Email</label>
                        <input
                            id="email"
                            type="email"
                            className="input"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="warrior@samurai.vault"
                            autoComplete="email"
                        />
                    </div>

                    <div className="input-group">
                        <label htmlFor="password">Master Password</label>
                        <input
                            id="password"
                            type="password"
                            className="input"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="••••••••••••"
                            autoComplete="current-password"
                        />
                    </div>

                    <button type="submit" className="btn btn-primary btn-lg" disabled={loading}>
                        {loading ? 'Entering...' : 'Enter the Vault'}
                    </button>
                </form>

                <div className="auth-footer">
                    <p>New warrior? <button className="link-btn" onClick={() => onNavigate('register')}>Create your vault</button></p>
                </div>
            </div>

            {/* Decorative elements */}
            <div className="auth-decoration auth-decoration-1" />
            <div className="auth-decoration auth-decoration-2" />

            {showMFA && (
                <MFAModal
                    mode="verify"
                    onVerify={handleMFAVerify}
                    onClose={() => setShowMFA(false)}
                />
            )}

            <style>{`
        .auth-page {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: var(--space-lg);
          position: relative;
          overflow: hidden;
        }

        .auth-container {
          width: 100%;
          max-width: 420px;
          background: var(--bg-secondary);
          border: 1px solid var(--border-subtle);
          border-radius: var(--radius-xl);
          padding: var(--space-2xl);
          position: relative;
          z-index: 10;
          animation: fadeIn 0.5s ease;
        }

        .auth-header {
          text-align: center;
          margin-bottom: var(--space-xl);
        }

        .auth-logo {
          font-size: 3rem;
          margin-bottom: var(--space-md);
          animation: glow 2s ease infinite;
        }

        .auth-title {
          font-size: 2rem;
          font-weight: 700;
          background: linear-gradient(135deg, var(--text-primary), var(--accent-primary));
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .auth-subtitle {
          color: var(--text-muted);
          margin-top: var(--space-xs);
        }

        .auth-form {
          display: flex;
          flex-direction: column;
          gap: var(--space-md);
        }

        .auth-form .btn {
          margin-top: var(--space-md);
        }

        .auth-footer {
          text-align: center;
          margin-top: var(--space-xl);
          padding-top: var(--space-lg);
          border-top: 1px solid var(--border-subtle);
          color: var(--text-muted);
        }

        .link-btn {
          background: none;
          border: none;
          color: var(--accent-primary);
          cursor: pointer;
          font-family: inherit;
          font-size: inherit;
          padding: 0;
        }

        .link-btn:hover {
          color: var(--accent-glow);
          text-decoration: underline;
        }

        .auth-decoration {
          position: absolute;
          border-radius: 50%;
          filter: blur(100px);
          opacity: 0.5;
        }

        .auth-decoration-1 {
          width: 400px;
          height: 400px;
          background: var(--accent-primary);
          top: -200px;
          left: -200px;
          opacity: 0.15;
        }

        .auth-decoration-2 {
          width: 300px;
          height: 300px;
          background: var(--gold-primary);
          bottom: -150px;
          right: -150px;
          opacity: 0.1;
        }

        @keyframes glow {
          0%, 100% { text-shadow: 0 0 10px rgba(220, 38, 38, 0.5); }
          50% { text-shadow: 0 0 30px rgba(220, 38, 38, 0.8); }
        }
      `}</style>
        </div>
    );
};

export default Login;

/**
 * Register Page - Create new account
 */

import { useState } from 'react';
import { useAuth } from '../state/auth.store';
import { validateEmail, validatePassword, validateUsername } from '../utils/validators';
import AlertBanner from '../components/AlertBanner';
import StrengthMeter from '../components/StrengthMeter';

const Register = ({ onNavigate }) => {
    const { register } = useAuth();
    const [formData, setFormData] = useState({
        email: '',
        username: '',
        password: '',
        confirmPassword: '',
    });
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [loading, setLoading] = useState(false);
    const [passwordScore, setPasswordScore] = useState(0);

    const calculateStrength = (password) => {
        let score = 0;
        if (password.length >= 12) score += 25;
        else if (password.length >= 8) score += 10;
        if (/[A-Z]/.test(password)) score += 20;
        if (/[a-z]/.test(password)) score += 15;
        if (/\d/.test(password)) score += 20;
        if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) score += 20;
        return Math.min(100, score);
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));

        if (name === 'password') {
            setPasswordScore(calculateStrength(value));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        // Validate
        const emailError = validateEmail(formData.email);
        if (emailError) return setError(emailError);

        const usernameError = validateUsername(formData.username);
        if (usernameError) return setError(usernameError);

        const passwordError = validatePassword(formData.password);
        if (passwordError) return setError(passwordError);

        if (formData.password !== formData.confirmPassword) {
            return setError('Passwords do not match');
        }

        setLoading(true);

        try {
            await register(formData.email, formData.username, formData.password);
            setSuccess('Account created successfully! Redirecting to login...');
            setTimeout(() => onNavigate('login'), 2000);
        } catch (err) {
            setError(err.message || 'Registration failed');
        }

        setLoading(false);
    };

    return (
        <div className="auth-page">
            <div className="auth-container">
                <div className="auth-header">
                    <div className="auth-logo">⚔️</div>
                    <h1 className="auth-title">Join the Order</h1>
                    <p className="auth-subtitle">Create your secure vault</p>
                </div>

                {error && (
                    <AlertBanner type="error" message={error} onClose={() => setError('')} />
                )}
                {success && <AlertBanner type="success" message={success} />}

                <form onSubmit={handleSubmit} className="auth-form">
                    <div className="input-group">
                        <label htmlFor="email">Email</label>
                        <input
                            id="email"
                            name="email"
                            type="email"
                            className="input"
                            value={formData.email}
                            onChange={handleChange}
                            placeholder="warrior@samurai.vault"
                        />
                    </div>

                    <div className="input-group">
                        <label htmlFor="username">Username</label>
                        <input
                            id="username"
                            name="username"
                            type="text"
                            className="input"
                            value={formData.username}
                            onChange={handleChange}
                            placeholder="ronin_master"
                        />
                    </div>

                    <div className="input-group">
                        <label htmlFor="password">Master Password</label>
                        <input
                            id="password"
                            name="password"
                            type="password"
                            className="input"
                            value={formData.password}
                            onChange={handleChange}
                            placeholder="••••••••••••"
                        />
                        <StrengthMeter score={passwordScore} />
                        <p className="password-hint">
                            Min 12 characters with uppercase, lowercase, number, and special character
                        </p>
                    </div>

                    <div className="input-group">
                        <label htmlFor="confirmPassword">Confirm Password</label>
                        <input
                            id="confirmPassword"
                            name="confirmPassword"
                            type="password"
                            className="input"
                            value={formData.confirmPassword}
                            onChange={handleChange}
                            placeholder="••••••••••••"
                        />
                    </div>

                    <button type="submit" className="btn btn-primary btn-lg" disabled={loading}>
                        {loading ? 'Creating...' : 'Create Vault'}
                    </button>
                </form>

                <div className="auth-footer">
                    <p>Already a warrior? <button className="link-btn" onClick={() => onNavigate('login')}>Enter the vault</button></p>
                </div>
            </div>

            <div className="auth-decoration auth-decoration-1" />
            <div className="auth-decoration auth-decoration-2" />

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
        }

        .auth-header {
          text-align: center;
          margin-bottom: var(--space-xl);
        }

        .auth-logo {
          font-size: 3rem;
          margin-bottom: var(--space-md);
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
        }

        .auth-form {
          display: flex;
          flex-direction: column;
          gap: var(--space-md);
        }

        .password-hint {
          font-size: 0.75rem;
          color: var(--text-muted);
          margin-top: var(--space-xs);
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
        }

        .auth-decoration {
          position: absolute;
          border-radius: 50%;
          filter: blur(100px);
        }

        .auth-decoration-1 {
          width: 400px;
          height: 400px;
          background: var(--accent-primary);
          top: -200px;
          right: -200px;
          opacity: 0.15;
        }

        .auth-decoration-2 {
          width: 300px;
          height: 300px;
          background: var(--gold-primary);
          bottom: -150px;
          left: -150px;
          opacity: 0.1;
        }
      `}</style>
        </div>
    );
};

export default Register;

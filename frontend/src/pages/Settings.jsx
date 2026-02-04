/**
 * Settings Page - User preferences and MFA
 */

import { useState, useEffect } from 'react';
import { useAuth } from '../state/auth.store';
import { mfaApi } from '../api/mfa.api';
import AlertBanner from '../components/AlertBanner';
import MFAModal from '../components/MFAModal';

const Settings = () => {
    const { user, logout } = useAuth();
    const [mfaEnabled, setMfaEnabled] = useState(false);
    const [showMFASetup, setShowMFASetup] = useState(false);
    const [showMFADisable, setShowMFADisable] = useState(false);
    const [mfaData, setMfaData] = useState(null);
    const [message, setMessage] = useState({ type: '', text: '' });

    useEffect(() => {
        if (user) {
            setMfaEnabled(user.mfa_enabled);
        }
    }, [user]);

    const handleSetupMFA = async () => {
        try {
            const data = await mfaApi.setup();
            setMfaData(data);
            setShowMFASetup(true);
        } catch (err) {
            setMessage({ type: 'error', text: err.message });
        }
    };

    const handleEnableMFA = async (code, secret) => {
        await mfaApi.enable(code, secret);
        setMfaEnabled(true);
        setMessage({ type: 'success', text: 'MFA enabled successfully!' });
    };

    const handleDisableMFA = async (code) => {
        await mfaApi.disable(code);
        setMfaEnabled(false);
        setMessage({ type: 'success', text: 'MFA disabled successfully!' });
    };

    return (
        <div className="settings">
            <div className="page-header">
                <h1 className="page-title">Settings</h1>
                <p className="page-subtitle">Manage your account and security preferences</p>
            </div>

            {message.text && (
                <AlertBanner type={message.type} message={message.text} onClose={() => setMessage({ type: '', text: '' })} />
            )}

            {/* Account Info */}
            <div className="settings-section">
                <h2 className="section-title">👤 Account</h2>
                <div className="settings-card">
                    <div className="setting-row">
                        <div className="setting-info">
                            <span className="setting-label">Email</span>
                            <span className="setting-value">{user?.email}</span>
                        </div>
                    </div>
                    <div className="setting-row">
                        <div className="setting-info">
                            <span className="setting-label">Username</span>
                            <span className="setting-value">{user?.username}</span>
                        </div>
                    </div>
                    <div className="setting-row">
                        <div className="setting-info">
                            <span className="setting-label">Member Since</span>
                            <span className="setting-value">{user?.created_at?.split('T')[0]}</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Security */}
            <div className="settings-section">
                <h2 className="section-title">🔐 Security</h2>
                <div className="settings-card">
                    <div className="setting-row">
                        <div className="setting-info">
                            <span className="setting-label">Two-Factor Authentication</span>
                            <span className="setting-desc">Add an extra layer of security to your account</span>
                        </div>
                        <div className="setting-action">
                            {mfaEnabled ? (
                                <button className="btn btn-danger btn-sm" onClick={() => setShowMFADisable(true)}>
                                    Disable MFA
                                </button>
                            ) : (
                                <button className="btn btn-primary btn-sm" onClick={handleSetupMFA}>
                                    Enable MFA
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Danger Zone */}
            <div className="settings-section">
                <h2 className="section-title danger">⚠️ Danger Zone</h2>
                <div className="settings-card danger-card">
                    <div className="setting-row">
                        <div className="setting-info">
                            <span className="setting-label">Logout</span>
                            <span className="setting-desc">Sign out of your account</span>
                        </div>
                        <button className="btn btn-secondary btn-sm" onClick={logout}>
                            Logout
                        </button>
                    </div>
                </div>
            </div>

            {showMFASetup && mfaData && (
                <MFAModal
                    mode="setup"
                    qrCode={mfaData.qr_code}
                    secret={mfaData.secret}
                    onVerify={handleEnableMFA}
                    onClose={() => setShowMFASetup(false)}
                />
            )}

            {showMFADisable && (
                <MFAModal
                    mode="disable"
                    onVerify={handleDisableMFA}
                    onClose={() => setShowMFADisable(false)}
                />
            )}

            <style>{`
        .settings-section { margin-bottom: 2rem; }
        .section-title { font-size: 1.25rem; margin-bottom: 1rem; }
        .section-title.danger { color: var(--error); }
        .settings-card { background: var(--bg-secondary); border: 1px solid var(--border-subtle); border-radius: 12px; }
        .danger-card { border-color: rgba(239, 68, 68, 0.3); }
        .setting-row { display: flex; justify-content: space-between; align-items: center; padding: 1rem 1.5rem; border-bottom: 1px solid var(--border-subtle); }
        .setting-row:last-child { border-bottom: none; }
        .setting-info { display: flex; flex-direction: column; gap: 0.25rem; }
        .setting-label { font-weight: 500; }
        .setting-value { color: var(--text-secondary); }
        .setting-desc { font-size: 0.875rem; color: var(--text-muted); }
        @media (max-width: 640px) {
          .setting-row { flex-direction: column; gap: 1rem; align-items: flex-start; }
        }
      `}</style>
        </div>
    );
};

export default Settings;

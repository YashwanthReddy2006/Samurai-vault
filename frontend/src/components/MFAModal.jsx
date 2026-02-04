/**
 * MFA Modal Component
 */

import { useState } from 'react';

const MFAModal = ({
    mode, // 'setup' | 'verify' | 'disable'
    qrCode,
    secret,
    onVerify,
    onClose
}) => {
    const [code, setCode] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (code.length !== 6) {
            setError('Code must be 6 digits');
            return;
        }

        setLoading(true);
        setError('');

        try {
            await onVerify(code, secret);
            onClose();
        } catch (err) {
            setError(err.message || 'Verification failed');
        }

        setLoading(false);
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <h2 className="modal-title">
                        {mode === 'setup' && '🔐 Set Up Two-Factor Authentication'}
                        {mode === 'verify' && '🔐 Enter MFA Code'}
                        {mode === 'disable' && '🔓 Disable Two-Factor Authentication'}
                    </h2>
                    <button className="modal-close" onClick={onClose}>×</button>
                </div>

                {mode === 'setup' && (
                    <div className="mfa-setup">
                        <p className="mfa-instructions">
                            Scan this QR code with your authenticator app (Google Authenticator, Authy, etc.)
                        </p>

                        {qrCode && (
                            <div className="qr-container">
                                <img
                                    src={`data:image/png;base64,${qrCode}`}
                                    alt="MFA QR Code"
                                    className="qr-code"
                                />
                            </div>
                        )}

                        <div className="secret-container">
                            <p className="secret-label">Or enter this code manually:</p>
                            <code className="secret-code">{secret}</code>
                        </div>

                        <div className="samurai-divider" />
                    </div>
                )}

                <form onSubmit={handleSubmit}>
                    <div className="input-group">
                        <label>Enter 6-digit code from your authenticator app</label>
                        <input
                            type="text"
                            className={`input ${error ? 'input-error' : ''}`}
                            value={code}
                            onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                            placeholder="000000"
                            maxLength={6}
                            autoFocus
                        />
                        {error && <span className="error-text">{error}</span>}
                    </div>

                    <div className="modal-actions">
                        <button type="button" className="btn btn-secondary" onClick={onClose}>
                            Cancel
                        </button>
                        <button type="submit" className="btn btn-primary" disabled={loading}>
                            {loading ? 'Verifying...' : 'Verify'}
                        </button>
                    </div>
                </form>

                <style>{`
          .modal-close {
            background: none;
            border: none;
            font-size: 1.5rem;
            color: var(--text-secondary);
            cursor: pointer;
          }

          .mfa-setup {
            margin-bottom: var(--space-lg);
          }

          .mfa-instructions {
            color: var(--text-secondary);
            margin-bottom: var(--space-lg);
          }

          .qr-container {
            display: flex;
            justify-content: center;
            padding: var(--space-lg);
            background: white;
            border-radius: var(--radius-md);
            margin-bottom: var(--space-lg);
          }

          .qr-code {
            width: 200px;
            height: 200px;
          }

          .secret-container {
            text-align: center;
          }

          .secret-label {
            font-size: 0.875rem;
            color: var(--text-muted);
            margin-bottom: var(--space-sm);
          }

          .secret-code {
            display: block;
            padding: var(--space-sm) var(--space-md);
            background: var(--bg-tertiary);
            border-radius: var(--radius-sm);
            font-family: monospace;
            font-size: 0.875rem;
            letter-spacing: 2px;
            color: var(--accent-primary);
          }

          .modal-actions {
            display: flex;
            gap: var(--space-md);
            margin-top: var(--space-lg);
          }

          .modal-actions .btn {
            flex: 1;
          }
        `}</style>
            </div>
        </div>
    );
};

export default MFAModal;

/**
 * Password Card Component - With Quick Launch
 */

import { useState } from 'react';
import StrengthMeter from './StrengthMeter';
import { getCategoryInfo } from '../utils/constants';

const PasswordCard = ({ entry, onEdit, onDelete, onView }) => {
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [password, setPassword] = useState(null);
  const [copied, setCopied] = useState(false);

  const categoryInfo = getCategoryInfo(entry.category);

  const handleTogglePassword = async () => {
    if (!showPassword && !password) {
      setLoading(true);
      try {
        const detail = await onView(entry.id);
        setPassword(detail.password);
        setShowPassword(true);
      } catch (err) {
        console.error('Failed to fetch password:', err);
      }
      setLoading(false);
    } else {
      setShowPassword(!showPassword);
    }
  };

  const handleCopy = async () => {
    try {
      if (!password) {
        const detail = await onView(entry.id);
        setPassword(detail.password);
        await navigator.clipboard.writeText(detail.password);
      } else {
        await navigator.clipboard.writeText(password);
      }
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Copy failed:', err);
    }
  };

  const handleQuickLaunch = () => {
    if (entry.url) {
      window.open(entry.url, '_blank', 'noopener,noreferrer');
    }
  };

  const getHostname = (url) => {
    try {
      return new URL(url).hostname;
    } catch {
      return url;
    }
  };

  return (
    <div className="password-card">
      <div className="password-card-header">
        <div>
          <div className="password-card-icon">
            {categoryInfo.icon}
          </div>
          <h3 className="password-card-title">{entry.title}</h3>
          {entry.url && (
            <p className="password-card-url">{getHostname(entry.url)}</p>
          )}
        </div>
        <div className="password-card-actions">
          {entry.url && (
            <button
              className="btn btn-icon btn-ghost quick-launch-btn"
              onClick={handleQuickLaunch}
              title="Quick Launch - Open in Browser"
            >
              🚀
            </button>
          )}
          <button
            className="btn btn-icon btn-ghost"
            onClick={() => onEdit(entry)}
            title="Edit"
          >
            ✏️
          </button>
          <button
            className="btn btn-icon btn-ghost btn-danger-hover"
            onClick={() => onDelete(entry.id)}
            title="Delete"
          >
            🗑️
          </button>
        </div>
      </div>

      {entry.username && (
        <div className="password-field">
          <span className="field-label">Username:</span>
          <span className="field-value">{entry.username}</span>
          <button
            className="btn btn-icon btn-ghost btn-sm"
            onClick={() => navigator.clipboard.writeText(entry.username)}
            title="Copy Username"
          >
            📋
          </button>
        </div>
      )}

      <div className="password-field">
        <span className="field-label">Password:</span>
        <span className={showPassword ? 'password-reveal' : 'password-dots'}>
          {loading ? '...' : showPassword ? password : '••••••••••'}
        </span>
        <button
          className="btn btn-icon btn-ghost btn-sm"
          onClick={handleTogglePassword}
          title={showPassword ? 'Hide' : 'Show'}
        >
          {showPassword ? '🙈' : '👁️'}
        </button>
        <button
          className={`btn btn-icon btn-ghost btn-sm ${copied ? 'copied' : ''}`}
          onClick={handleCopy}
          title="Copy Password"
        >
          {copied ? '✅' : '📋'}
        </button>
      </div>

      {/* Quick Launch Button - Prominent */}
      {entry.url && (
        <button className="quick-launch-full" onClick={handleQuickLaunch}>
          🚀 Open {getHostname(entry.url)}
        </button>
      )}

      <div className="password-card-footer">
        <span className="password-category">
          {categoryInfo.icon} {categoryInfo.label}
        </span>
        <StrengthMeter score={entry.strength_score || 0} />
      </div>

      <style>{`
        .password-card {
          background: var(--bg-secondary);
          border: 1px solid var(--border-subtle);
          border-radius: var(--radius-lg);
          padding: var(--space-lg);
          transition: all var(--transition-normal);
        }

        .password-card:hover {
          border-color: var(--border-accent);
          box-shadow: 0 4px 20px rgba(220, 38, 38, 0.15);
        }

        .password-card-header {
          display: flex;
          justify-content: space-between;
          margin-bottom: var(--space-md);
        }

        .password-card-icon {
          width: 48px;
          height: 48px;
          background: linear-gradient(135deg, var(--accent-dark), var(--accent-primary));
          border-radius: var(--radius-md);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.25rem;
          margin-bottom: var(--space-sm);
        }

        .password-card-title {
          font-size: 1.125rem;
          font-weight: 600;
          color: var(--text-primary);
        }

        .password-card-url {
          font-size: 0.8125rem;
          color: var(--text-muted);
        }

        .password-card-actions {
          display: flex;
          gap: var(--space-xs);
        }

        .quick-launch-btn {
          animation: pulse 2s infinite;
        }

        .btn-danger-hover:hover {
          color: var(--error);
        }

        @keyframes pulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.1); }
        }

        .password-field {
          display: flex;
          align-items: center;
          gap: var(--space-sm);
          padding: var(--space-sm);
          background: var(--bg-tertiary);
          border-radius: var(--radius-sm);
          margin-top: var(--space-sm);
        }

        .field-label {
          font-size: 0.75rem;
          color: var(--text-muted);
          min-width: 70px;
        }

        .field-value {
          flex: 1;
          font-size: 0.875rem;
          color: var(--text-primary);
        }

        .password-dots {
          font-family: monospace;
          letter-spacing: 2px;
          flex: 1;
          color: var(--text-secondary);
        }

        .password-reveal {
          font-family: monospace;
          flex: 1;
          color: var(--text-primary);
        }

        .copied {
          color: var(--success) !important;
        }

        .quick-launch-full {
          width: 100%;
          margin-top: var(--space-md);
          padding: var(--space-sm) var(--space-md);
          background: linear-gradient(135deg, var(--accent-dark), var(--accent-primary));
          border: none;
          border-radius: var(--radius-md);
          color: white;
          font-family: inherit;
          font-size: 0.875rem;
          font-weight: 500;
          cursor: pointer;
          transition: all var(--transition-fast);
          display: flex;
          align-items: center;
          justify-content: center;
          gap: var(--space-sm);
        }

        .quick-launch-full:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 15px rgba(220, 38, 38, 0.4);
        }

        .password-card-footer {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-top: var(--space-md);
          padding-top: var(--space-md);
          border-top: 1px solid var(--border-subtle);
        }

        .password-category {
          font-size: 0.75rem;
          padding: var(--space-xs) var(--space-sm);
          background: var(--bg-tertiary);
          border-radius: var(--radius-full);
          color: var(--text-secondary);
        }
      `}</style>
    </div>
  );
};

export default PasswordCard;

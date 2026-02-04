/**
 * Alert Banner Component
 */

const AlertBanner = ({ type = 'info', message, onClose }) => {
    const icons = {
        success: '✅',
        warning: '⚠️',
        error: '❌',
        info: 'ℹ️',
    };

    return (
        <div className={`alert-banner alert-${type}`}>
            <span className="alert-icon">{icons[type]}</span>
            <span className="alert-message">{message}</span>
            {onClose && (
                <button className="alert-close" onClick={onClose}>
                    ×
                </button>
            )}

            <style>{`
        .alert-banner {
          display: flex;
          align-items: center;
          gap: var(--space-sm);
          padding: var(--space-md) var(--space-lg);
          border-radius: var(--radius-md);
          margin-bottom: var(--space-md);
          animation: slideIn 0.3s ease;
        }

        .alert-success {
          background: rgba(34, 197, 94, 0.1);
          border: 1px solid rgba(34, 197, 94, 0.3);
          color: var(--success);
        }

        .alert-warning {
          background: rgba(245, 158, 11, 0.1);
          border: 1px solid rgba(245, 158, 11, 0.3);
          color: var(--warning);
        }

        .alert-error {
          background: rgba(239, 68, 68, 0.1);
          border: 1px solid rgba(239, 68, 68, 0.3);
          color: var(--error);
        }

        .alert-info {
          background: rgba(59, 130, 246, 0.1);
          border: 1px solid rgba(59, 130, 246, 0.3);
          color: var(--info);
        }

        .alert-icon {
          font-size: 1.25rem;
        }

        .alert-message {
          flex: 1;
          font-size: 0.9375rem;
        }

        .alert-close {
          background: none;
          border: none;
          font-size: 1.5rem;
          cursor: pointer;
          opacity: 0.7;
          transition: opacity var(--transition-fast);
          color: inherit;
        }

        .alert-close:hover {
          opacity: 1;
        }
      `}</style>
        </div>
    );
};

export default AlertBanner;

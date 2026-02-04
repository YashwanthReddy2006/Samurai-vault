/**
 * Password Strength Meter Component
 */

import { getStrengthInfo } from '../utils/constants';

const StrengthMeter = ({ score = 0, showLabel = true }) => {
    const info = getStrengthInfo(score);
    const segments = 5;
    const filledSegments = Math.ceil((score / 100) * segments);

    const getSegmentClass = (index) => {
        if (index < filledSegments) {
            if (score >= 80) return 'excellent';
            if (score >= 60) return 'strong';
            if (score >= 40) return 'good';
            if (score >= 20) return 'fair';
            return 'weak';
        }
        return '';
    };

    return (
        <div className="strength-meter-wrapper">
            <div className="strength-bar-container">
                {Array.from({ length: segments }).map((_, i) => (
                    <div key={i} className="strength-bar-segment">
                        <div
                            className={`strength-bar-fill ${getSegmentClass(i)}`}
                            style={{ width: i < filledSegments ? '100%' : '0%' }}
                        />
                    </div>
                ))}
            </div>
            {showLabel && (
                <span className="strength-label" style={{ color: info.color }}>
                    {info.label}
                </span>
            )}

            <style>{`
        .strength-meter-wrapper {
          display: flex;
          flex-direction: column;
          gap: var(--space-xs);
        }

        .strength-bar-container {
          display: flex;
          gap: 4px;
          height: 6px;
        }

        .strength-bar-segment {
          flex: 1;
          background: var(--bg-surface);
          border-radius: var(--radius-full);
          overflow: hidden;
        }

        .strength-bar-fill {
          height: 100%;
          border-radius: var(--radius-full);
          transition: width 0.3s ease;
        }

        .strength-bar-fill.weak { background: var(--error); }
        .strength-bar-fill.fair { background: var(--warning); }
        .strength-bar-fill.good { background: var(--gold-primary); }
        .strength-bar-fill.strong { background: var(--success); }
        .strength-bar-fill.excellent { background: linear-gradient(90deg, var(--success), #10b981); }

        .strength-label {
          font-size: 0.75rem;
          font-weight: 500;
        }
      `}</style>
        </div>
    );
};

export default StrengthMeter;

/**
 * Application constants
 */

export const PASSWORD_CATEGORIES = [
    { value: 'social', label: 'Social Media', icon: '👥' },
    { value: 'email', label: 'Email', icon: '📧' },
    { value: 'banking', label: 'Banking', icon: '🏦' },
    { value: 'shopping', label: 'Shopping', icon: '🛒' },
    { value: 'work', label: 'Work', icon: '💼' },
    { value: 'dev', label: 'Development', icon: '💻' },
    { value: 'gaming', label: 'Gaming', icon: '🎮' },
    { value: 'other', label: 'Other', icon: '📁' },
];

export const STRENGTH_LABELS = {
    0: { label: 'None', color: 'var(--text-muted)' },
    20: { label: 'Weak', color: 'var(--error)' },
    40: { label: 'Fair', color: 'var(--warning)' },
    60: { label: 'Good', color: 'var(--gold-primary)' },
    80: { label: 'Strong', color: 'var(--success)' },
    100: { label: 'Excellent', color: '#10b981' },
};

export const getStrengthInfo = (score) => {
    if (score >= 80) return STRENGTH_LABELS[100];
    if (score >= 60) return STRENGTH_LABELS[80];
    if (score >= 40) return STRENGTH_LABELS[60];
    if (score >= 20) return STRENGTH_LABELS[40];
    if (score > 0) return STRENGTH_LABELS[20];
    return STRENGTH_LABELS[0];
};

export const getCategoryInfo = (category) => {
    return PASSWORD_CATEGORIES.find((c) => c.value === category) || PASSWORD_CATEGORIES[7];
};

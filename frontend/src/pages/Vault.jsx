/**
 * Vault Page - Password Management
 */

import { useEffect, useState } from 'react';
import { useVault } from '../state/vault.store';
import PasswordCard from '../components/PasswordCard';
import AlertBanner from '../components/AlertBanner';
import StrengthMeter from '../components/StrengthMeter';
import { PASSWORD_CATEGORIES } from '../utils/constants';

const Vault = () => {
    const { entries, loading, error, fetchEntries, addEntry, updateEntry, deleteEntry, getEntry } = useVault();
    const [showAddModal, setShowAddModal] = useState(false);
    const [editingEntry, setEditingEntry] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [formData, setFormData] = useState({
        title: '',
        username: '',
        password: '',
        url: '',
        notes: '',
        category: 'other',
        favorite: false,
    });
    const [formError, setFormError] = useState('');
    const [passwordScore, setPasswordScore] = useState(0);

    useEffect(() => {
        fetchEntries();
    }, [fetchEntries]);

    const filteredEntries = entries.filter((entry) => {
        const matchesSearch =
            entry.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            (entry.username && entry.username.toLowerCase().includes(searchQuery.toLowerCase()));
        const matchesCategory = selectedCategory === 'all' || entry.category === selectedCategory;
        return matchesSearch && matchesCategory;
    });

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
        const { name, value, type, checked } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value,
        }));

        if (name === 'password') {
            setPasswordScore(calculateStrength(value));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setFormError('');

        if (!formData.title || !formData.password) {
            setFormError('Title and password are required');
            return;
        }

        try {
            if (editingEntry) {
                await updateEntry(editingEntry.id, formData);
            } else {
                await addEntry(formData);
            }
            closeModal();
        } catch (err) {
            setFormError(err.message);
        }
    };

    const handleEdit = async (entry) => {
        // Fetch full entry with password
        const fullEntry = await getEntry(entry.id);
        setEditingEntry(entry);
        setFormData({
            title: fullEntry.title,
            username: fullEntry.username || '',
            password: fullEntry.password,
            url: fullEntry.url || '',
            notes: fullEntry.notes || '',
            category: entry.category || 'other',
            favorite: entry.favorite,
        });
        setPasswordScore(calculateStrength(fullEntry.password));
        setShowAddModal(true);
    };

    const handleDelete = async (entryId) => {
        if (window.confirm('Are you sure you want to delete this password?')) {
            await deleteEntry(entryId);
        }
    };

    const closeModal = () => {
        setShowAddModal(false);
        setEditingEntry(null);
        setFormData({
            title: '',
            username: '',
            password: '',
            url: '',
            notes: '',
            category: 'other',
            favorite: false,
        });
        setFormError('');
        setPasswordScore(0);
    };

    const generatePassword = () => {
        const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()';
        let password = '';
        for (let i = 0; i < 16; i++) {
            password += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        setFormData((prev) => ({ ...prev, password }));
        setPasswordScore(calculateStrength(password));
    };

    return (
        <div className="vault">
            <div className="page-header">
                <div>
                    <h1 className="page-title">Password Vault</h1>
                    <p className="page-subtitle">{entries.length} passwords stored securely</p>
                </div>
                <button className="btn btn-primary" onClick={() => setShowAddModal(true)}>
                    ➕ Add Password
                </button>
            </div>

            {/* Search and Filter */}
            <div className="vault-controls">
                <div className="vault-search">
                    <span className="vault-search-icon">🔍</span>
                    <input
                        type="text"
                        placeholder="Search passwords..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
                <div className="vault-filters">
                    <select
                        value={selectedCategory}
                        onChange={(e) => setSelectedCategory(e.target.value)}
                        className="input"
                    >
                        <option value="all">All Categories</option>
                        {PASSWORD_CATEGORIES.map((cat) => (
                            <option key={cat.value} value={cat.value}>
                                {cat.icon} {cat.label}
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            {error && <AlertBanner type="error" message={error} />}

            {/* Password Grid */}
            {loading ? (
                <div className="vault-loading">
                    <div className="loader" />
                </div>
            ) : filteredEntries.length > 0 ? (
                <div className="vault-grid">
                    {filteredEntries.map((entry) => (
                        <PasswordCard
                            key={entry.id}
                            entry={entry}
                            onEdit={handleEdit}
                            onDelete={handleDelete}
                            onView={getEntry}
                        />
                    ))}
                </div>
            ) : (
                <div className="empty-state">
                    <div className="empty-state-icon">🔐</div>
                    <h3 className="empty-state-title">No passwords yet</h3>
                    <p className="empty-state-text">
                        {searchQuery ? 'No passwords match your search' : 'Add your first password to get started'}
                    </p>
                    {!searchQuery && (
                        <button className="btn btn-primary" onClick={() => setShowAddModal(true)}>
                            Add Password
                        </button>
                    )}
                </div>
            )}

            {/* Add/Edit Modal */}
            {showAddModal && (
                <div className="modal-overlay" onClick={closeModal}>
                    <div className="modal" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2 className="modal-title">
                                {editingEntry ? '✏️ Edit Password' : '➕ Add Password'}
                            </h2>
                            <button className="modal-close" onClick={closeModal}>×</button>
                        </div>

                        {formError && <AlertBanner type="error" message={formError} />}

                        <form onSubmit={handleSubmit}>
                            <div className="form-grid">
                                <div className="input-group">
                                    <label>Title *</label>
                                    <input
                                        type="text"
                                        name="title"
                                        className="input"
                                        value={formData.title}
                                        onChange={handleChange}
                                        placeholder="e.g., GitHub"
                                    />
                                </div>

                                <div className="input-group">
                                    <label>Category</label>
                                    <select
                                        name="category"
                                        className="input"
                                        value={formData.category}
                                        onChange={handleChange}
                                    >
                                        {PASSWORD_CATEGORIES.map((cat) => (
                                            <option key={cat.value} value={cat.value}>
                                                {cat.icon} {cat.label}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div className="input-group full-width">
                                    <label>Username / Email</label>
                                    <input
                                        type="text"
                                        name="username"
                                        className="input"
                                        value={formData.username}
                                        onChange={handleChange}
                                        placeholder="username or email"
                                    />
                                </div>

                                <div className="input-group full-width">
                                    <label>Password *</label>
                                    <div className="password-input-wrapper">
                                        <input
                                            type="text"
                                            name="password"
                                            className="input"
                                            value={formData.password}
                                            onChange={handleChange}
                                            placeholder="••••••••••••"
                                        />
                                        <button
                                            type="button"
                                            className="btn btn-secondary btn-sm"
                                            onClick={generatePassword}
                                        >
                                            Generate
                                        </button>
                                    </div>
                                    <StrengthMeter score={passwordScore} />
                                </div>

                                <div className="input-group full-width">
                                    <label>URL</label>
                                    <input
                                        type="url"
                                        name="url"
                                        className="input"
                                        value={formData.url}
                                        onChange={handleChange}
                                        placeholder="https://example.com"
                                    />
                                </div>

                                <div className="input-group full-width">
                                    <label>Notes</label>
                                    <textarea
                                        name="notes"
                                        className="input"
                                        value={formData.notes}
                                        onChange={handleChange}
                                        placeholder="Additional notes..."
                                        rows={3}
                                    />
                                </div>
                            </div>

                            <div className="modal-actions">
                                <button type="button" className="btn btn-secondary" onClick={closeModal}>
                                    Cancel
                                </button>
                                <button type="submit" className="btn btn-primary" disabled={loading}>
                                    {loading ? 'Saving...' : editingEntry ? 'Update' : 'Add Password'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            <style>{`
        .vault {
          animation: fadeIn 0.4s ease;
        }

        .vault-controls {
          display: flex;
          gap: var(--space-md);
          margin-bottom: var(--space-xl);
        }

        .vault-search {
          position: relative;
          flex: 1;
          max-width: 400px;
        }

        .vault-search input {
          width: 100%;
          padding: var(--space-sm) var(--space-md);
          padding-left: 40px;
          background: var(--bg-tertiary);
          border: 1px solid var(--border-normal);
          border-radius: var(--radius-md);
          color: var(--text-primary);
          font-family: inherit;
        }

        .vault-search input:focus {
          outline: none;
          border-color: var(--accent-primary);
        }

        .vault-search-icon {
          position: absolute;
          left: 12px;
          top: 50%;
          transform: translateY(-50%);
        }

        .vault-filters select {
          min-width: 180px;
        }

        .vault-loading {
          display: flex;
          justify-content: center;
          padding: var(--space-2xl);
        }

        .vault-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
          gap: var(--space-lg);
        }

        .modal-close {
          background: none;
          border: none;
          font-size: 1.5rem;
          color: var(--text-secondary);
          cursor: pointer;
        }

        .form-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: var(--space-md);
        }

        .full-width {
          grid-column: 1 / -1;
        }

        .password-input-wrapper {
          display: flex;
          gap: var(--space-sm);
        }

        .password-input-wrapper .input {
          flex: 1;
        }

        textarea.input {
          resize: vertical;
          min-height: 80px;
        }

        .modal-actions {
          display: flex;
          gap: var(--space-md);
          margin-top: var(--space-xl);
        }

        .modal-actions .btn {
          flex: 1;
        }

        @media (max-width: 640px) {
          .vault-controls {
            flex-direction: column;
          }

          .vault-search {
            max-width: none;
          }

          .form-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
        </div>
    );
};

export default Vault;

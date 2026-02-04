/**
 * Vault State Store
 */

import { useState, useCallback, useEffect } from 'react';
import { vaultApi } from '../api/vault.api';

let globalEntries = [];
let entriesListeners = [];

const notifyEntries = () => {
    entriesListeners.forEach((listener) => listener([...globalEntries]));
};

export const useVault = () => {
    const [entries, setEntries] = useState(globalEntries);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        entriesListeners.push(setEntries);
        return () => {
            entriesListeners = entriesListeners.filter((l) => l !== setEntries);
        };
    }, []);

    const fetchEntries = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const data = await vaultApi.list();
            globalEntries = data || [];
            notifyEntries();
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, []);

    const addEntry = useCallback(async (entry) => {
        setLoading(true);
        setError(null);
        try {
            const newEntry = await vaultApi.add(entry);
            globalEntries = [newEntry, ...globalEntries];
            notifyEntries();
            return newEntry;
        } catch (err) {
            setError(err.message);
            throw err;
        } finally {
            setLoading(false);
        }
    }, []);

    const updateEntry = useCallback(async (entryId, updates) => {
        setLoading(true);
        setError(null);
        try {
            const updated = await vaultApi.update(entryId, updates);
            globalEntries = globalEntries.map((e) =>
                e.id === entryId ? updated : e
            );
            notifyEntries();
            return updated;
        } catch (err) {
            setError(err.message);
            throw err;
        } finally {
            setLoading(false);
        }
    }, []);

    const deleteEntry = useCallback(async (entryId) => {
        setLoading(true);
        setError(null);
        try {
            await vaultApi.delete(entryId);
            globalEntries = globalEntries.filter((e) => e.id !== entryId);
            notifyEntries();
        } catch (err) {
            setError(err.message);
            throw err;
        } finally {
            setLoading(false);
        }
    }, []);

    const getEntry = useCallback(async (entryId) => {
        return vaultApi.get(entryId);
    }, []);

    return {
        entries,
        loading,
        error,
        fetchEntries,
        addEntry,
        updateEntry,
        deleteEntry,
        getEntry,
    };
};

export default useVault;

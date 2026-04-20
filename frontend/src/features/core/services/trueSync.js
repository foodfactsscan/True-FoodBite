/**
 * ============================================================
 * TrueSync - Global Live Data Synchronization Engine
 * ============================================================
 * Handles real-time cross-component invalidation and 
 * background data refresh without UI interruptions.
 * 
 * Future-proof, lightweight, and high-performance.
 * ============================================================
 */

import { useEffect, useState, useCallback } from 'react';

// ─── Constants & Invalidation Keys ──────────────────────────────────────────
export const SYNC_KEYS = {
    ADMIN_STATS: 'ADMIN_STATS',
    USER_LIST: 'USER_LIST',
    INGREDIENTS: 'INGREDIENTS',
    FLAGGED: 'FLAGGED',
    USER_PROFILE: 'USER_PROFILE',
    SCAN_HISTORY: 'SCAN_HISTORY',
    DAILY_INTAKE: 'DAILY_INTAKE',
};

// ─── Internal Event Hub ──────────────────────────────────────────────────────
const hub = new EventTarget();

/**
 * Invalidate a data key globally. 
 * Any component listening to this key will automatically refresh.
 */
export const invalidateSync = (key) => {
    console.log(`[TrueSync] 🔄 Invaliding: ${key}`);
    hub.dispatchEvent(new CustomEvent(key));
};

/**
 * Custom Hook: useSyncEffect
 * Automatically triggers a callback when a sync key is invalidated.
 */
export function useSyncEffect(key, callback, deps = []) {
    useEffect(() => {
        const handler = () => callback();
        hub.addEventListener(key, handler);
        return () => hub.removeEventListener(key, handler);
    }, [key, callback, ...deps]);
}

/**
 * Custom Hook: usePolling
 * High-performance polling that slows down or stops when window is not focused.
 */
export function usePolling(key, intervalMs = 15000) {
    useEffect(() => {
        let timer;
        const tick = () => {
            if (document.visibilityState === 'visible') {
                invalidateSync(key);
            }
        };

        timer = setInterval(tick, intervalMs);
        
        // Listen for visibility changes to refresh instantly when user comes back
        const handleVisibility = () => {
            if (document.visibilityState === 'visible') invalidateSync(key);
        };
        
        document.addEventListener('visibilitychange', handleVisibility);

        return () => {
            clearInterval(timer);
            document.removeEventListener('visibilitychange', handleVisibility);
        };
    }, [key, intervalMs]);
}

/**
 * TrueSync Helper: Optimistic State Handler
 * Instantly updates local state and rolls back if the server request fails.
 */
export async function optimisticMutate({
    action,         // The async API call
    onSync,         // Key to invalidate after success (optional)
    localState,     // Current react state
    setLocalState,  // State update function
    tempUpdate,     // Fn(state) -> new state (optimistic)
    onFail          // Error callback
}) {
    const backup = [...localState]; // Shallow copy for rollback
    
    // 1. Instant UI update
    console.log('[TrueSync] ✨ Optimistic Update Applied');
    setLocalState(tempUpdate(localState));

    try {
        const res = await action();
        
        if (res.success || res.status === 1) {
            // 2. Global Sync Notification
            if (onSync) invalidateSync(onSync);
            return res;
        } else {
            throw new Error(res.message || 'Action failed');
        }
    } catch (err) {
        // 3. Rollback on failure
        console.error('[TrueSync] ❌ Action failed, rolling back:', err.message);
        setLocalState(backup);
        if (onFail) onFail(err.message);
        return { success: false, error: err.message };
    }
}

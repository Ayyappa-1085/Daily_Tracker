/**
 * FocusDay Production-Safe Mutation Queue & Optimistic Sync System.
 * Ensures immediate UI response + background persistence + safe reconciliation.
 */

class MutationQueue {
  constructor() {
    this.currentUserId = null;
    this.pendingMap = new Map(); // fullKey -> { seq, optimisticData, timestamp }
    this.latestSeqMap = new Map(); // fullKey -> latest sequence number
    this.timerMap = new Map(); // mutationId -> timerId
    this.seq = 0;
    this.listeners = new Set();
  }

  setUserId(userId) {
    if (this.currentUserId && this.currentUserId !== userId) {
      this.clearUser(this.currentUserId);
    }
    this.currentUserId = userId ? String(userId) : null;
  }

  clearUser(userId) {
    if (!userId) return;
    const uid = String(userId);
    // Clear all pending retry timers
    for (const [id, timer] of this.timerMap.entries()) {
      if (id.startsWith(`${uid}:`)) {
        clearTimeout(timer);
        this.timerMap.delete(id);
      }
    }
    // Clear in-flight/pending map
    for (const key of Array.from(this.pendingMap.keys())) {
      if (key.startsWith(`${uid}:`)) {
        this.pendingMap.delete(key);
      }
    }
    for (const key of Array.from(this.latestSeqMap.keys())) {
      if (key.startsWith(`${uid}:`)) {
        this.latestSeqMap.delete(key);
      }
    }
    this.notify();
  }

  isPending(resourceKey) {
    if (!this.currentUserId) return false;
    return this.pendingMap.has(`${this.currentUserId}:${resourceKey}`);
  }

  getPending(resourceKey) {
    if (!this.currentUserId) return null;
    const item = this.pendingMap.get(`${this.currentUserId}:${resourceKey}`);
    return item ? item.optimisticData : null;
  }

  subscribe(listener) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  notify() {
    for (const listener of this.listeners) {
      try {
        listener();
      } catch {}
    }
  }

  /**
   * Enqueues an optimistic mutation with background sync, retries, and rollback.
   *
   * @param {Object} options
   * @param {string} options.userId - User ID associated with the mutation
   * @param {string} options.resourceKey - Unique identifier for the resource (e.g. habit:123:2026-09-24)
   * @param {*} options.optimisticData - Data being optimistically assumed
   * @param {Function} options.execute - Async function making the API request
   * @param {Function} [options.onSuccess] - Callback when server returns authoritative response
   * @param {Function} [options.onRollback] - Callback when mutation permanently fails
   * @param {number} [options.maxRetries=3] - Max retry attempts for temporary failures
   */
  enqueue({
    userId,
    resourceKey,
    optimisticData,
    execute,
    onSuccess,
    onRollback,
    maxRetries = 3,
  }) {
    if (!userId || !resourceKey || typeof execute !== "function") return;

    const uid = String(userId);
    const fullKey = `${uid}:${resourceKey}`;
    const seq = ++this.seq;
    this.latestSeqMap.set(fullKey, seq);

    const mutationId = `${uid}:${resourceKey}:${seq}`;

    // Store in pending map with sequence number
    this.pendingMap.set(fullKey, {
      seq,
      optimisticData,
      timestamp: Date.now(),
    });
    this.notify();

    let retryCount = 0;

    const attempt = async () => {
      // Security & User Isolation Check:
      // If user logged out or switched, drop mutation immediately.
      if (this.currentUserId !== uid) {
        this.pendingMap.delete(fullKey);
        this.notify();
        return;
      }

      try {
        const result = await execute();

        // Security check after async call:
        if (this.currentUserId !== uid) {
          this.pendingMap.delete(fullKey);
          this.notify();
          return;
        }

        // Stale Response Check (Race Condition handling):
        // If a newer mutation for this resource was enqueued while this was in flight,
        // ignore this stale response and let the newer mutation handle state!
        if (this.latestSeqMap.get(fullKey) !== seq) {
          return;
        }

        // Mutation succeeded! Clean up pending state.
        this.pendingMap.delete(fullKey);
        this.notify();

        if (onSuccess) {
          try {
            await onSuccess(result);
          } catch (err) {
            console.error("onSuccess handler failed:", err);
          }
        }
      } catch (error) {
        // Security check after async failure:
        if (this.currentUserId !== uid) {
          this.pendingMap.delete(fullKey);
          this.notify();
          return;
        }

        // If a newer mutation is already queued for this resource, do not rollback or retry!
        if (this.latestSeqMap.get(fullKey) !== seq) {
          return;
        }

        const isTemporary = this.isRetryableError(error);

        if (isTemporary && retryCount < maxRetries) {
          retryCount++;
          const delay = this.getRetryDelay(error, retryCount);

          const timer = setTimeout(() => {
            this.timerMap.delete(mutationId);
            attempt();
          }, delay);

          this.timerMap.set(mutationId, timer);
        } else {
          // Permanent failure or retries exhausted: rollback!
          this.pendingMap.delete(fullKey);
          this.notify();

          if (onRollback) {
            try {
              onRollback(error);
            } catch (rbErr) {
              console.error("onRollback handler failed:", rbErr);
            }
          }
        }
      }
    };

    // Execute asynchronously (non-blocking)
    Promise.resolve().then(attempt);
  }

  isRetryableError(error) {
    if (!error) return false;
    // Network failures (offline, connection reset, timeout, DNS)
    if (
      error.name === "TypeError" ||
      error.message?.includes("fetch") ||
      error.message?.includes("NetworkError") ||
      error.message?.includes("Failed to fetch") ||
      error.message?.includes("network")
    ) {
      return true;
    }
    const status = error.status;
    if (!status) return true; // generic network or client fetch failure

    // Permanent errors: validation, auth, forbidden, not found, conflict
    if (
      status === 400 ||
      status === 401 ||
      status === 403 ||
      status === 404 ||
      status === 409 ||
      status === 422
    ) {
      return false;
    }

    // Temporary errors: 408 (timeout), 429 (rate limited), 500+ (server errors/cold start/gateway)
    if (status === 408 || status === 429 || status >= 500) {
      return true;
    }

    return false;
  }

  getRetryDelay(error, retryCount) {
    if (error?.status === 429) {
      // Conservative backoff for rate limiting: 5s, 10s, 20s
      return Math.min(5000 * Math.pow(2, retryCount - 1), 20000);
    }
    // Standard backoff: 1.5s, 3s, 6s...
    return Math.min(1500 * Math.pow(2, retryCount - 1), 12000);
  }
}

export const mutationQueue = new MutationQueue();


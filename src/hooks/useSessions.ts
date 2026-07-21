"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { v4 as uuidv4 } from "uuid";
import {
  Session,
  saveSession,
  getActiveSessionsFromDb,
  getHistorySessionsFromDb,
  clearHistoryFromDb,
} from "../services/sessionsRepository";

export type SessionHookStatus = "loading" | "ready" | "error";

export function useSessions() {
  const [activeSessions, setActiveSessions] = useState<Session[]>([]);
  const [historySessions, setHistorySessions] = useState<Session[]>([]);
  const [hookStatus, setHookStatus] = useState<SessionHookStatus>("loading");
  const [error, setError] = useState<Error | null>(null);

  // Use a ref to prevent race conditions during concurrent loads or rapid re-renders
  const isRefreshingRef = useRef(false);

  /**
   * Refreshes active and history sessions from the IndexedDB.
   * Also checks if any "active" session has expired based on current timestamp
   * and updates its status in IndexedDB and local state.
   */
  const refreshSessions = useCallback(async () => {
    if (isRefreshingRef.current) return;
    isRefreshingRef.current = true;

    try {
      const rawActive = await getActiveSessionsFromDb();
      const now = Date.now();
      let stateChanged = false;

      // Check for temporally expired sessions that are still marked 'active' in DB
      const updatedActive = await Promise.all(
        rawActive.map(async (session) => {
          if (session.expiryTime <= now) {
            // Update status to expired
            const expiredSession: Session = {
              ...session,
              status: "expired",
            };
            // Persist the status transition in the database
            await saveSession(expiredSession);
            stateChanged = true;
            return expiredSession;
          }
          return session;
        })
      );

      // Re-query database to get fresh active and history sets if any status transitioned
      if (stateChanged) {
        const freshActive = await getActiveSessionsFromDb();
        const freshHistory = await getHistorySessionsFromDb();
        setActiveSessions(freshActive);
        setHistorySessions(freshHistory);
      } else {
        // If nothing transitioned, just read history and update active state
        const history = await getHistorySessionsFromDb();
        setActiveSessions(updatedActive);
        setHistorySessions(history);
      }

      setHookStatus("ready");
    } catch (err) {
      console.error("Failed to load sessions from IndexedDB:", err);
      setError(err instanceof Error ? err : new Error("Unknown storage error"));
      setHookStatus("error");
    } finally {
      isRefreshingRef.current = false;
    }
  }, []);

  /**
   * Captures and saves a new parking spot session to the database.
   */
  const saveSpot = useCallback(
    async (spot: {
      vehicleLabel: string;
      floor: string;
      bay: string;
      note: string;
      photoBlob: Blob | null;
      durationMinutes: number;
    }) => {
      setHookStatus("loading");
      const now = Date.now();
      const expiry = now + spot.durationMinutes * 60 * 1000;

      const newSession: Session = {
        id: uuidv4(),
        vehicleLabel: spot.vehicleLabel.trim() || "Car 1",
        floor: spot.floor.trim(),
        bay: spot.bay.trim(),
        note: spot.note.trim(),
        photoBlob: spot.photoBlob,
        startTime: now,
        durationMinutes: spot.durationMinutes,
        expiryTime: expiry,
        status: "active",
        completedAt: null,
      };

      try {
        await saveSession(newSession);
        await refreshSessions();
      } catch (err) {
        console.error("Failed to save parking spot:", err);
        setError(err instanceof Error ? err : new Error("Failed to save spot"));
        setHookStatus("ready");
      }
    },
    [refreshSessions]
  );

  /**
   * Ends an active parking session when the user locates their car.
   */
  const foundCar = useCallback(
    async (id: string) => {
      setHookStatus("loading");
      try {
        // Fetch current session state to ensure data preservation
        const activeList = await getActiveSessionsFromDb();
        const session = activeList.find((s) => s.id === id);
        
        if (session) {
          const completedSession: Session = {
            ...session,
            status: "completed",
            completedAt: Date.now(),
          };
          await saveSession(completedSession);
        }
        await refreshSessions();
      } catch (err) {
        console.error("Failed to complete parking session:", err);
        setError(err instanceof Error ? err : new Error("Failed to mark spot as found"));
        setHookStatus("ready");
      }
    },
    [refreshSessions]
  );

  /**
   * Deletes all history entries from the database.
   */
  const clearOldHistory = useCallback(async () => {
    setHookStatus("loading");
    try {
      await clearHistoryFromDb();
      await refreshSessions();
    } catch (err) {
      console.error("Failed to clear parking history:", err);
      setError(err instanceof Error ? err : new Error("Failed to clear history"));
      setHookStatus("ready");
    }
  }, [refreshSessions]);

  // Initial load inside useEffect to guarantee Hydration Safety (IndexedDB is Client-Only)
  useEffect(() => {
    refreshSessions();
  }, [refreshSessions]);

  // Hook into focus and page visibility events to keep statuses accurate upon app opening/foregrounding
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        refreshSessions();
      }
    };

    const handleFocus = () => {
      refreshSessions();
    };

    window.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("focus", handleFocus);

    return () => {
      window.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("focus", handleFocus);
    };
  }, [refreshSessions]);

  // Foreground polling: check and re-run status evaluations every 5 seconds to update timer borders dynamically
  useEffect(() => {
    const timer = setInterval(() => {
      refreshSessions();
    }, 5000);

    return () => clearInterval(timer);
  }, [refreshSessions]);

  return {
    activeSessions,
    historySessions,
    status: hookStatus,
    error,
    saveSpot,
    foundCar,
    clearOldHistory,
    refreshSessions,
  };
}

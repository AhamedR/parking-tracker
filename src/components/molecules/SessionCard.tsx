"use client";

import React, { useState, useEffect } from "react";
import { Session } from "../../services/sessionsRepository";
import { StatusDot } from "../atoms/StatusDot";

interface SessionCardProps {
  session: Session;
}

export const SessionCard: React.FC<SessionCardProps> = ({ session }) => {
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);
  const [displayTime, setDisplayTime] = useState<string>("");

  // Manage Blob URL creation and garbage collection cleanup
  useEffect(() => {
    if (session.photoBlob) {
      // Create a temporary object URL from the compressed IndexedDB Blob
      const url = URL.createObjectURL(session.photoBlob);
      setPhotoUrl(url);

      // Clean up the URL on unmount to prevent browser memory leaks
      return () => {
        URL.revokeObjectURL(url);
      };
    }
  }, [session.photoBlob]);

  // Live ticking countdown for the card summary
  useEffect(() => {
    if (session.status === "expired") {
      setDisplayTime("Expired");
      return;
    }
    if (session.status === "completed") {
      setDisplayTime("Completed");
      return;
    }

    const updateDisplayTime = () => {
      const remainingMs = session.expiryTime - Date.now();
      if (remainingMs <= 0) {
        setDisplayTime("Expired");
      } else {
        const mins = Math.ceil(remainingMs / (60 * 1000));
        if (mins >= 60) {
          const hrs = Math.floor(mins / 60);
          const remMins = mins % 60;
          setDisplayTime(`${hrs}h ${remMins}m left`);
        } else {
          setDisplayTime(`${mins}m left`);
        }
      }
    };

    updateDisplayTime();
    const interval = setInterval(updateDisplayTime, 10000);

    return () => clearInterval(interval);
  }, [session.expiryTime, session.status]);

  return (
    <div
      className="group relative flex w-full text-left items-center justify-between p-4 bg-neutral-900/60 hover:bg-neutral-800/60 border border-neutral-800 hover:border-neutral-700/80 rounded-2xl cursor-pointer transition-all duration-300 backdrop-blur-md active:scale-[0.98] overflow-hidden focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-500"
    >
      {/* Background glow effects */}
      <div className="absolute inset-0 bg-gradient-to-r from-orange-500/0 via-orange-500/0 to-orange-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

      <div className="flex items-center space-x-4 z-10">
        {/* Thumbnail representation */}
        <div className="relative h-14 w-14 rounded-xl bg-neutral-800 border border-neutral-700 overflow-hidden flex-shrink-0 flex items-center justify-center">
          {photoUrl ? (
            <img
              src={photoUrl}
              alt=""
              className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <svg
              aria-hidden="true"
              className="w-6 h-6 text-neutral-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"
              />
            </svg>
          )}
        </div>

        {/* Labels & Spot metadata */}
        <div className="flex flex-col">
          <span className="font-bold text-neutral-100 group-hover:text-orange-500 transition-colors duration-300">
            {session.vehicleLabel}
          </span>
          <div className="flex items-center space-x-2 mt-0.5 text-xs text-neutral-400 font-medium">
            {session.floor && (
              <>
                <span>Floor {session.floor}</span>
                {session.bay && <span className="h-1 w-1 rounded-full bg-neutral-700" />}
              </>
            )}
            {session.bay && <span>Bay {session.bay}</span>}
          </div>
        </div>
      </div>

      {/* Expiry visual badge and state dot */}
      <div className="flex flex-col items-end space-y-1.5 z-10 text-right">
        <div className="flex items-center space-x-2">
          <span className="text-xs font-semibold font-mono text-neutral-300">
            {displayTime}
          </span>
          <StatusDot status={session.status} expiryTime={session.expiryTime} />
        </div>
        <span aria-hidden="true" className="text-[10px] text-neutral-500 uppercase tracking-widest font-semibold group-hover:text-orange-500/70 transition-colors duration-300">
          View Detail &rarr;
        </span>
      </div>
    </div>
  );
};
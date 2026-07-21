"use client";

import React, { useState, useEffect } from "react";
import { Session } from "../../services/sessionsRepository";
import { TimerDisplay } from "../molecules/TimerDisplay";
import { Button } from "../atoms/Button";
import { StatusDot } from "../atoms/StatusDot";

interface SessionDetailProps {
  session: Session;
  onBack: () => void;
  onFoundCar: (id: string) => void;
}

export const SessionDetail: React.FC<SessionDetailProps> = ({
  session,
  onBack,
  onFoundCar,
}) => {
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);

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

  return (
    <div className="w-full flex flex-col space-y-6 bg-neutral-950 border border-neutral-800 rounded-3xl p-6 shadow-2xl backdrop-blur-md animate-fadeIn">
      {/* Header with back navigation and status indicators */}
      <div className="flex items-center justify-between pb-3 border-b border-neutral-800/80">
        <button
          onClick={onBack}
          className="flex items-center space-x-2 text-sm font-semibold text-neutral-400 hover:text-neutral-200 transition-colors"
        >
          <span>&larr; Back to Dashboard</span>
        </button>
        <div className="flex items-center space-x-2 bg-neutral-900/60 border border-neutral-800/60 px-3 py-1.5 rounded-xl">
          <span className="text-xs font-semibold capitalize text-neutral-300">
            {session.status}
          </span>
          <StatusDot status={session.status} expiryTime={session.expiryTime} />
        </div>
      </div>

      {/* Main Vehicle Label */}
      <div className="flex flex-col space-y-1">
        <span className="text-xs uppercase tracking-widest text-neutral-500 font-bold">
          Active Parking Spot
        </span>
        <h2 className="text-2xl font-black text-neutral-100">{session.vehicleLabel}</h2>
      </div>

      {/* Live Countdown Timer (only shown for active / non-completed sessions) */}
      {session.status !== "completed" && (
        <div className="p-4 bg-neutral-900/40 border border-neutral-800/60 rounded-2xl">
          <TimerDisplay expiryTime={session.expiryTime} status={session.status} />
        </div>
      )}

      {/* Floor and Bay Indicators */}
      <div className="grid grid-cols-2 gap-4">
        <div className="flex flex-col p-4 bg-neutral-900/40 border border-neutral-800/60 rounded-2xl items-center text-center">
          <span className="text-xs text-neutral-500 font-bold uppercase tracking-wider mb-1">
            Floor
          </span>
          <span className="text-xl font-black text-orange-500">
            {session.floor || "N/A"}
          </span>
        </div>
        <div className="flex flex-col p-4 bg-neutral-900/40 border border-neutral-800/60 rounded-2xl items-center text-center">
          <span className="text-xs text-neutral-500 font-bold uppercase tracking-wider mb-1">
            Bay
          </span>
          <span className="text-xl font-black text-orange-500">
            {session.bay || "N/A"}
          </span>
        </div>
      </div>

      {/* Free text notes if present */}
      {session.note && (
        <div className="flex flex-col space-y-1.5 p-4 bg-neutral-900/40 border border-neutral-800/60 rounded-2xl">
          <span className="text-xs text-neutral-500 font-bold uppercase tracking-wider">
            Notes
          </span>
          <p className="text-sm text-neutral-200 leading-relaxed whitespace-pre-wrap">
            {session.note}
          </p>
        </div>
      )}

      {/* Full Photo Display */}
      {photoUrl && (
        <div className="flex flex-col space-y-1.5">
          <span className="text-xs text-neutral-500 font-bold uppercase tracking-wider">
            Photo
          </span>
          <div className="relative w-full rounded-2xl overflow-hidden border border-neutral-800 bg-black aspect-[4/3]">
            <img
              src={photoUrl}
              alt="Captured parking spot"
              className="w-full h-full object-cover"
            />
          </div>
        </div>
      )}

      {/* Action Commands */}
      <div className="flex flex-col space-y-2 pt-2">
        {session.status === "active" && (
          <Button
            variant="primary"
            fullWidth
            onClick={() => onFoundCar(session.id)}
            className="py-3.5 rounded-2xl shadow-[0_6px_25px_rgba(249,115,22,0.4)]"
          >
            Found My Car (End Session)
          </Button>
        )}
        <Button variant="glass" fullWidth onClick={onBack} className="py-3 rounded-2xl">
          Close Detail View
        </Button>
      </div>
    </div>
  );
};

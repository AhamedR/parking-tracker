"use client";

import React, { useState, useEffect } from "react";
import { useSessions } from "../../hooks/useSessions";
import { Button } from "../atoms/Button";
import { Input } from "../atoms/Input";
import { SessionCard } from "../molecules/SessionCard";
import { TimerDisplay } from "../molecules/TimerDisplay";
import { DisclaimerBanner } from "../molecules/DisclaimerBanner";
import { VehicleLabelInput } from "../molecules/VehicleLabelInput";
import { PhotoCapture } from "./PhotoCapture";
import { SessionDetail } from "./SessionDetail";

export const ParkingDashboard: React.FC = () => {
  const {
    activeSessions,
    historySessions,
    status,
    saveSpot,
    foundCar,
    clearOldHistory,
  } = useSessions();

  // Navigation states
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [selectedSessionId, setSelectedSessionId] = useState<string | null>(null);
  const [isCapturingPhoto, setIsCapturingPhoto] = useState(false);
  const [showHistory, setShowHistory] = useState(false);

  // Form states
  const [vehicleLabel, setVehicleLabel] = useState("My car");
  const [floor, setFloor] = useState("");
  const [bay, setBay] = useState("");
  const [note, setNote] = useState("");
  const [durationMinutes, setDurationMinutes] = useState(120); // default 2 hours
  const [customDurationInput, setCustomDurationInput] = useState("");
  const [photoBlob, setPhotoBlob] = useState<Blob | null>(null);
  const [photoPreviewUrl, setPhotoPreviewUrl] = useState<string | null>(null);

  // Form errors
  const [errors, setErrors] = useState<{ vehicleLabel?: string; form?: string }>({});

  // Revoke preview URL to prevent memory leaks when photo changes or unmounts
  useEffect(() => {
    if (photoBlob) {
      const url = URL.createObjectURL(photoBlob);
      setPhotoPreviewUrl(url);
      return () => {
        URL.revokeObjectURL(url);
      };
    } else {
      setPhotoPreviewUrl(null);
    }
  }, [photoBlob]);

  // Sync isAddingNew state based on sessions: default to true if no active sessions are present
  useEffect(() => {
    if (status === "ready" && activeSessions.length === 0) {
      setIsAddingNew(true);
    }
  }, [activeSessions.length, status]);

  // Preset timers configuration (in minutes)
  const DURATION_PRESETS = [
    { label: "30m", value: 30 },
    { label: "1h", value: 60 },
    { label: "2h", value: 120 },
    { label: "4h", value: 240 },
    { label: "8h", value: 480 },
  ];

  const handlePresetSelect = (value: number) => {
    setDurationMinutes(value);
    setCustomDurationInput("");
  };

  const handleCustomDurationChange = (val: string) => {
    setCustomDurationInput(val);
    const parsed = parseInt(val, 10);
    if (!isNaN(parsed) && parsed > 0) {
      setDurationMinutes(parsed);
    }
  };

  const handleSaveSpot = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    const newErrors: typeof errors = {};
    if (!vehicleLabel.trim()) {
      newErrors.vehicleLabel = "Vehicle label is required";
    }

    // Require at least one form of locational detail (floor, bay, note, or photo)
    if (!floor.trim() && !bay.trim() && !note.trim() && !photoBlob) {
      newErrors.form = "Please provide at least one detail (Floor, Bay, Note, or Photo) to save your spot.";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    await saveSpot({
      vehicleLabel,
      floor,
      bay,
      note,
      photoBlob,
      durationMinutes,
    });

    // Reset Form fields
    setFloor("");
    setBay("");
    setNote("");
    setVehicleLabel("My car");
    setPhotoBlob(null);
    setDurationMinutes(120);
    setCustomDurationInput("");
    setIsAddingNew(false);
  };

  const sessionForDetail = [...activeSessions, ...historySessions].find((s) => s.id === selectedSessionId);

  // Loading skeleton state (satisfies SSR Hydration Safety)
  if (status === "loading") {
    return (
      <div className="w-full max-w-md mx-auto p-6 space-y-6">
        <div className="h-12 bg-neutral-900 border border-neutral-800 rounded-2xl animate-pulse" />
        <div className="h-48 bg-neutral-900 border border-neutral-800 rounded-3xl animate-pulse" />
        <div className="h-24 bg-neutral-900 border border-neutral-800 rounded-2xl animate-pulse" />
      </div>
    );
  }

  // --- SUB-FLOW: In-App Camera capture overlay ---
  if (isCapturingPhoto) {
    return (
      <div className="w-full max-w-md mx-auto">
        <PhotoCapture
          onPhotoCaptured={(blob) => {
            setPhotoBlob(blob);
            setIsCapturingPhoto(false);
          }}
          onClose={() => setIsCapturingPhoto(false)}
        />
      </div>
    );
  }

  // --- SUB-FLOW: Detailed inspection of a specific session ---
  if (sessionForDetail) {
    return (
      <div className="w-full max-w-md mx-auto">
        <SessionDetail
          session={sessionForDetail}
          onBack={() => setSelectedSessionId(null)}
          onFoundCar={(id) => {
            foundCar(id);
            setSelectedSessionId(null);
          }}
        />
      </div>
    );
  }

  // --- MAIN-FLOW: Capture Form ---
  if (isAddingNew) {
    return (
      <div className="w-full max-w-md mx-auto flex flex-col space-y-6">
        {/* Modal-style privacy disclaimer banner */}
        <DisclaimerBanner variant="modal" />

        {/* Back affordance if there are other active sessions */}
        {activeSessions.length > 0 && (
          <button
            onClick={() => setIsAddingNew(false)}
            className="flex items-center space-x-1.5 text-sm font-semibold text-neutral-400 hover:text-neutral-200 self-start transition-colors"
          >
            <span>&larr; View Active Parking</span>
          </button>
        )}

        <form
          onSubmit={handleSaveSpot}
          className="p-6 bg-neutral-950 border border-neutral-800 rounded-3xl shadow-2xl flex flex-col space-y-5"
        >
          <div className="flex flex-col space-y-1.5">
            <h2 className="text-xl font-black text-neutral-100 tracking-tight">Capture Parking Spot</h2>
            <p className="text-xs text-neutral-400 leading-normal">
              Record floor, bay number, notes, and snap a picture offline.
            </p>
          </div>

          {errors.form && (
            <div className="p-3.5 bg-rose-500/10 border border-rose-500/20 text-rose-500 text-xs font-semibold rounded-xl">
              {errors.form}
            </div>
          )}

          {/* Vehicle Label Input Molecule */}
          <VehicleLabelInput
            value={vehicleLabel}
            onChange={(val) => setVehicleLabel(val)}
            error={errors.vehicleLabel}
          />

          {/* Floor & Bay grid */}
          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Floor Level"
              placeholder='e.g., "B2", "3"'
              value={floor}
              onChange={(e) => setFloor(e.target.value)}
              maxLength={10}
            />
            <Input
              label="Bay Number"
              placeholder='e.g., "104", "A12"'
              value={bay}
              onChange={(e) => setBay(e.target.value)}
              maxLength={10}
            />
          </div>

          {/* In-App Camera Button & Thumbnail Preview */}
          <div className="flex flex-col space-y-2">
            <label className="text-xs font-semibold uppercase tracking-wider text-neutral-400">
              Spot Photo
            </label>
            {photoPreviewUrl ? (
              <div className="relative rounded-2xl border border-neutral-800 bg-neutral-900 overflow-hidden aspect-[4/3] w-full flex items-center justify-center">
                <img
                  src={photoPreviewUrl}
                  alt="Spot preview"
                  className="w-full h-full object-cover"
                />
                <button
                  type="button"
                  onClick={() => setPhotoBlob(null)}
                  className="absolute bottom-3 right-3 px-3 py-1.5 bg-neutral-950/80 hover:bg-neutral-950 border border-neutral-800 text-xs font-bold text-rose-500 rounded-xl hover:text-rose-400 active:scale-95 transition-all"
                >
                  Remove Photo
                </button>
              </div>
            ) : (
              <Button
                type="button"
                variant="glass"
                fullWidth
                onClick={() => { setIsCapturingPhoto(true) }}
                className="py-3 flex items-center justify-center space-x-2 border-dashed"
              >
                <svg
                  className="w-5 h-5 text-neutral-400"
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
                <span className="text-neutral-300 font-semibold text-sm">Take Photo (In-App)</span>
              </Button>
            )}
          </div>

          {/* Quick Note Input */}
          <Input
            label="Quick Notes"
            placeholder='e.g., "Parked next to elevator elevator doors"'
            value={note}
            onChange={(e) => setNote(e.target.value)}
            maxLength={140}
          />

          {/* Duration configuration & presets */}
          <div className="flex flex-col space-y-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-neutral-400">
              Parking Duration
            </span>
            <div className="grid grid-cols-5 gap-1">
              {DURATION_PRESETS.map((preset) => {
                const isSelected = durationMinutes === preset.value && !customDurationInput;
                return (
                  <button
                    key={preset.value}
                    type="button"
                    onClick={() => handlePresetSelect(preset.value)}
                    className={`py-2 text-xs font-semibold rounded-xl border transition-all duration-300 ${isSelected
                      ? "bg-orange-500/20 text-orange-500 border-orange-500/50"
                      : "bg-neutral-900/40 text-neutral-400 border-neutral-800 hover:border-neutral-700/80"
                      }`}
                  >
                    {preset.label}
                  </button>
                );
              })}
            </div>
            {/* Custom duration field */}
            <div className="pt-1.5">
              <Input
                type="number"
                min="1"
                placeholder="Or input custom minutes"
                value={customDurationInput}
                onChange={(e) => handleCustomDurationChange(e.target.value)}
              />
            </div>
          </div>

          <div className="pt-2">
            <Button type="submit" variant="primary" fullWidth className="py-3.5 text-sm">
              Save Spot
            </Button>
          </div>
        </form>
      </div>
    );
  }

  // --- RETRIEVAL STATE ---
  return (
    <div className="w-full max-w-md mx-auto flex flex-col space-y-6">
      {/* 
        Multiple active sessions
      */}
      <div className="flex flex-col space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-black text-neutral-200">Active Spots</h2>
          <Button variant="electric" size="sm" onClick={() => setIsAddingNew(true)}>
            + Save New Spot
          </Button>
        </div>

        <div className="flex flex-col space-y-3">
          {activeSessions.map((session) => (
            <SessionCard
              key={session.id}
              session={session}
              onClick={() => setSelectedSessionId(session.id)}
            />
          ))}
        </div>
      </div>

      {/* 
        HISTORY DRAWER: past completed/expired sessions 
      */}
      <div className="pt-4 border-t border-neutral-900 flex flex-col">
        <button
          onClick={() => setShowHistory((prev) => !prev)}
          className="flex items-center justify-between py-2 text-sm font-semibold text-neutral-400 hover:text-neutral-200 transition-colors"
        >
          <span>Past Sessions ({historySessions.length})</span>
          <span className="text-xs">{showHistory ? "Hide" : "Show"}</span>
        </button>

        {showHistory && (
          <div className="flex flex-col space-y-4 mt-3 animate-fadeIn">
            {historySessions.length > 0 ? (
              <>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-neutral-500">History Log</span>
                  <button
                    onClick={clearOldHistory}
                    className="text-xs font-bold text-rose-500 hover:text-rose-400 transition-colors"
                  >
                    Clear History
                  </button>
                </div>

                <div className="flex flex-col space-y-2.5 max-h-[250px] overflow-y-auto pr-1">
                  {historySessions.map((session) => {
                    const startedTime = session.startTime
                      ? new Date(session.startTime).toLocaleString([], {
                        month: "short",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })
                      : "Expired";

                    return (
                      <button
                        key={session.id}
                        onClick={() => setSelectedSessionId(session.id)}
                        className="flex items-center justify-between p-4 bg-neutral-900/60 hover:bg-neutral-800/60 border border-neutral-800 hover:border-neutral-700/80 rounded-2xl cursor-pointer transition-all duration-300 backdrop-blur-md focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 text-xs"
                      >
                        <div className="flex flex-col space-y-1">
                          <span className="font-bold text-neutral-300">{session.vehicleLabel}</span>
                          <span className="text-neutral-500">
                            {session.floor ? `Floor ${session.floor}` : ""}{" "}
                            {session.bay ? `| Bay ${session.bay}` : ""}
                          </span>
                        </div>
                        <div className="flex flex-col items-end space-y-1">
                          <span
                            className={`font-semibold ${session.status === "completed" ? "text-emerald-500" : "text-rose-500"
                              }`}
                          >
                            {session.status === "completed" ? "Found" : "Expired"}
                          </span>
                          <span className="text-neutral-600 text-[10px]">{startedTime}</span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </>
            ) : (
              <span className="text-xs text-neutral-500 text-center py-6">
                No past sessions recorded.
              </span>
            )}

            {/* Persistent warning disclaimer under History */}
            <DisclaimerBanner variant="inline" />
          </div>
        )}
      </div>
    </div>
  );
};

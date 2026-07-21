"use client";

import React, { useState, useEffect } from "react";

interface TimerDisplayProps {
  expiryTime: number;
  status: "active" | "completed" | "expired";
}

export const TimerDisplay: React.FC<TimerDisplayProps> = ({ expiryTime, status }) => {
  const [timeLeft, setTimeLeft] = useState<string>("");
  const [isExpired, setIsExpired] = useState<boolean>(false);

  useEffect(() => {
    // If the session is already marked completed or expired in the state, display static messages
    if (status === "completed") {
      setTimeLeft("Completed");
      setIsExpired(false);
      return;
    }
    if (status === "expired") {
      setTimeLeft("Expired");
      setIsExpired(true);
      return;
    }

    // Helper to calculate remaining time
    const calculateTimeLeft = () => {
      const difference = expiryTime - Date.now();

      if (difference <= 0) {
        setIsExpired(true);
        setTimeLeft("Expired");
        return false; // Stop the interval
      }

      // Convert differences to hours, minutes, and seconds
      const hours = Math.floor(difference / (1000 * 60 * 60));
      const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((difference % (1000 * 60)) / 1000);

      // Pad numbers to ensure double digits (e.g. 05:09)
      const paddedHours = hours.toString().padStart(2, "0");
      const paddedMinutes = minutes.toString().padStart(2, "0");
      const paddedSeconds = seconds.toString().padStart(2, "0");

      if (hours > 0) {
        setTimeLeft(`${paddedHours}:${paddedMinutes}:${paddedSeconds}`);
      } else {
        setTimeLeft(`${paddedMinutes}:${paddedSeconds}`);
      }

      setIsExpired(false);
      return true; // Continue the interval
    };

    // Run first calculation immediately on mount/update
    calculateTimeLeft();

    // Establish a 1-second interval to drive the live UI ticking countdown
    const interval = setInterval(() => {
      const active = calculateTimeLeft();
      if (!active) {
        clearInterval(interval);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [expiryTime, status]);

  return (
    <div className="flex flex-col items-center justify-center py-4">
      <span className="text-xs uppercase tracking-widest text-neutral-400 font-semibold mb-1">
        Time Remaining
      </span>
      <span
        className={`font-mono text-4xl sm:text-5xl font-bold tracking-tight transition-all duration-300 ${
          isExpired
            ? "text-rose-500 animate-pulse drop-shadow-[0_0_15px_rgba(244,63,94,0.3)]"
            : "text-orange-500 drop-shadow-[0_0_15px_rgba(249,115,22,0.35)]"
        }`}
      >
        {timeLeft}
      </span>
    </div>
  );
};

"use client";

import React, { useState, useEffect } from "react";
import { Button } from "../atoms/Button";

interface DisclaimerBannerProps {
  variant?: "modal" | "inline";
  className?: string;
}

export const DisclaimerBanner: React.FC<DisclaimerBannerProps> = ({
  variant = "inline",
  className = "",
}) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (variant === "modal") {
      // Check localStorage to determine if the first-use disclaimer has already been dismissed
      const isDismissed = localStorage.getItem("parking_disclaimer_dismissed");
      if (!isDismissed) {
        setIsVisible(true);
      }
    } else {
      // Inline disclaimer is always visible
      setIsVisible(true);
    }
  }, [variant]);

  const handleDismiss = () => {
    localStorage.setItem("parking_disclaimer_dismissed", "true");
    setIsVisible(false);
  };

  if (!isVisible) return null;

  if (variant === "modal") {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
        <div className="w-full max-w-md p-6 bg-neutral-900 border border-neutral-800 rounded-3xl shadow-[0_10px_40px_rgba(0,0,0,0.8)] transform transition-transform duration-500 scale-100 flex flex-col space-y-4">
          <div className="flex items-center space-x-3 text-orange-500">
            <svg
              className="w-8 h-8 flex-shrink-0"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
            <h2 className="text-lg font-bold tracking-tight text-neutral-100">
              Important: Privacy & Storage
            </h2>
          </div>

          <p className="text-sm text-neutral-300 leading-relaxed">
            Your parking data and photos are stored <strong>only on this device</strong>. If you
            clear your browser data, uninstall the app, or switch devices, this information will
            be lost. There is currently no cloud backup.
          </p>

          <div className="pt-2">
            <Button variant="primary" fullWidth onClick={handleDismiss}>
              I Understand
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Inline styling for persistent notice under History/Settings
  return (
    <div
      className={`p-4 bg-neutral-900/40 border border-neutral-800/80 rounded-2xl flex items-start space-x-3 text-xs leading-normal text-neutral-400 backdrop-blur-sm ${className}`}
    >
      <svg
        className="w-5 h-5 text-orange-500/80 flex-shrink-0 mt-0.5"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
        />
      </svg>
      <div className="flex flex-col space-y-1">
        <span className="font-bold text-neutral-300">Local Storage Warning</span>
        <p>
          Data and photos are kept locally in your browser storage. Clearing browser cache or
          resetting app data will permanently delete your session history.
        </p>
      </div>
    </div>
  );
};

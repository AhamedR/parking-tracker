"use client";

import React, { useRef, useState, useEffect } from "react";
import { useCamera } from "../../hooks/useCamera";
import { Button } from "../atoms/Button";

interface PhotoCaptureProps {
  onPhotoCaptured: (blob: Blob) => void;
  onClose: () => void;
}

export const PhotoCapture: React.FC<PhotoCaptureProps> = ({ onPhotoCaptured, onClose }) => {
  const { cameraState, stream, error, startCamera, stopCamera, capturePhoto } = useCamera();
  const videoRef = useRef<HTMLVideoElement>(null);
  const [useScreenFlash, setUseScreenFlash] = useState(false);
  const [triggerFlashAnim, setTriggerFlashAnim] = useState(false);

  // Auto-connect media stream to the video element srcObject when it becomes available
  useEffect(() => {
    if (videoRef.current && stream && cameraState === "streaming") {
      videoRef.current.srcObject = stream;
    }
  }, [stream, cameraState]);

  // Attempt to start the camera stream automatically when mounting this view
  useEffect(() => {
    startCamera();
    return () => {
      stopCamera();
    };
  }, [startCamera, stopCamera]);

  const handleCapture = async () => {
    if (!videoRef.current) return;

    if (useScreenFlash) {
      // Trigger the screen flash visual overlay
      setTriggerFlashAnim(true);

      // Delay photo capture slightly to allow the brightness overlay to hit peak opacity
      setTimeout(async () => {
        try {
          const blob = await capturePhoto(videoRef.current!);
          onPhotoCaptured(blob);
        } catch (err) {
          console.error("Camera capture failed:", err);
        } finally {
          setTriggerFlashAnim(false);
        }
      }, 150);
    } else {
      try {
        const blob = await capturePhoto(videoRef.current);
        onPhotoCaptured(blob);
      } catch (err) {
        console.error("Camera capture failed:", err);
      }
    }
  };

  // Fallback handler: when the native input picker receives a photo
  const handleFallbackFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Pass the file directly (it's a Blob subclass)
      onPhotoCaptured(file);
    }
  };

  return (
    <div className="relative flex flex-col items-center justify-center w-full min-h-[300px] bg-neutral-950 border border-neutral-800 rounded-3xl overflow-hidden p-4">
      {/* 
        Low-light Flash Mitigation Overlay:
        A bright white screen flash overlay that triggers momentarily when taking photos. 
      */}
      {triggerFlashAnim && (
        <div className="absolute inset-0 bg-white z-50 animate-flashOverlay pointer-events-none" />
      )}

      {cameraState === "requesting" && (
        <div className="flex flex-col items-center space-y-3 py-12">
          <div className="w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full animate-spin" />
          <span className="text-sm font-semibold text-neutral-400">Accessing camera...</span>
        </div>
      )}

      {cameraState === "streaming" && (
        <div className="relative w-full max-w-sm rounded-2xl overflow-hidden border border-neutral-800 bg-black flex flex-col items-center">
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="w-full aspect-[4/3] object-cover"
          />

          <div className="absolute top-3 right-3 flex items-center space-x-2 z-20">
            {/* Screen Flash Toggle Button */}
            <button
              onClick={() => setUseScreenFlash((prev) => !prev)}
              className={`p-2 rounded-xl transition-all duration-300 border ${useScreenFlash
                  ? "bg-amber-400 text-neutral-950 border-amber-400"
                  : "bg-neutral-900/80 text-neutral-400 border-neutral-800/80 hover:text-neutral-200"
                }`}
              title="Toggle Screen Brightness Flash"
            >
              <svg
                className="w-5 h-5"
                fill={useScreenFlash ? "currentColor" : "none"}
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 10V3L4 14h7v7l9-11h-7z"
                />
              </svg>
            </button>
          </div>

          <div className="absolute bottom-4 flex items-center justify-center space-x-6 w-full px-4 z-20">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-neutral-900/90 text-sm text-neutral-300 font-semibold rounded-xl border border-neutral-800/80 active:scale-95 transition-all"
            >
              Cancel
            </button>

            {/* Main Shutter Button */}
            <button
              onClick={handleCapture}
              className="h-14 w-14 rounded-full bg-white border-4 border-neutral-400 shadow-[0_0_20px_rgba(255,255,255,0.4)] flex items-center justify-center active:scale-90 transition-transform"
              aria-label="Take Photo"
            >
              <span className="h-10 w-10 rounded-full bg-orange-500 hover:bg-orange-600 transition-colors" />
            </button>
          </div>
        </div>
      )}

      {/* 
        Fallback State: 
        If camera access is denied, unsupported, or fails, present the native picker 
        which delegates directly to the native OS camera/gallery.
      */}
      {cameraState === "denied" && (
        <div className="flex flex-col items-center text-center p-6 space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-500">
            <svg
              className="w-6 h-6"
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
          </div>

          <div className="flex flex-col space-y-1">
            <h3 className="text-base font-bold text-neutral-200">Camera Access Blocked</h3>
            <p className="text-xs text-neutral-400 max-w-[250px] leading-relaxed">
              We could not stream your camera. Please use the device default photo selector or upload option below.
            </p>
          </div>

          <div className="flex flex-col space-y-2 w-full max-w-[200px]">
            <label className="inline-flex items-center justify-center px-4 py-2.5 bg-orange-500 hover:bg-orange-600 text-white font-semibold rounded-xl text-sm shadow-[0_4px_12px_rgba(249,115,22,0.3)] transition-all cursor-pointer text-center">
              Take Photo / Upload
              <input
                type="file"
                accept="image/*"
                capture="environment"
                onChange={handleFallbackFile}
                className="hidden"
              />
            </label>
            <Button variant="glass" size="sm" onClick={onClose}>
              Cancel
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

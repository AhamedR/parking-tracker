"use client";

import { useState, useEffect, useCallback, useRef } from "react";

export type CameraState = "idle" | "requesting" | "streaming" | "denied";

export function useCamera() {
  const [cameraState, setCameraState] = useState<CameraState>("idle");
  const stateRef = useRef<CameraState>("idle");
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [error, setError] = useState<string | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Stable helper to update both the state and the ref tracking the state
  const updateState = useCallback((state: CameraState) => {
    stateRef.current = state;
    setCameraState(state);
  }, []);

  /**
   * Helper to stop all tracks in an active media stream.
   * This is critical to release the hardware camera and clear the system camera indicator.
   */
  const stopAllTracks = useCallback((mediaStream: MediaStream | null) => {
    if (mediaStream) {
      mediaStream.getTracks().forEach((track) => {
        track.stop();
      });
    }
  }, []);

  /**
   * Shuts down the camera stream and resets the state machine back to idle.
   */
  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      stopAllTracks(streamRef.current);
    }
    setStream(null);
    streamRef.current = null;
    updateState("idle");
  }, [stopAllTracks, updateState]);

  /**
   * Requests permission and starts streaming the device environment (rear) camera.
   */
  const startCamera = useCallback(async () => {

    // Check stateRef.current to keep this callback completely reference-stable
    if (stateRef.current === "requesting" || stateRef.current === "streaming") return;

    updateState("requesting");
    setError(null);

    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: "environment", // prioritize the rear camera for capturing the parking space
          width: { ideal: 1280 },    // request a standard HD profile
          height: { ideal: 720 },
        },
        audio: false, // audio tracks are not required
      });

      setStream(mediaStream);
      streamRef.current = mediaStream;
      updateState("streaming");
    } catch (err) {
      console.warn("Failed to obtain user media stream:", err);
      // Flip state synchronously to 'denied' so the UI immediately switches to the fallback input
      updateState("denied");
      setError(
        err instanceof Error ? err.message : "Camera access was denied or is not supported"
      );
    }
  }, [updateState]);

  /**
   * Captures the current frame of a <video> element, paints it onto an off-screen canvas,
   * downscales it if it exceeds 1280px, and compresses it to a JPEG blob.
   */
  const capturePhoto = useCallback(
    (videoElement: HTMLVideoElement): Promise<Blob> => {
      return new Promise((resolve, reject) => {
        if (!videoElement || stateRef.current !== "streaming") {
          reject(new Error("Camera is not actively streaming"));
          return;
        }

        // Get actual dimensions of the video stream
        const videoWidth = videoElement.videoWidth;
        const videoHeight = videoElement.videoHeight;

        if (videoWidth === 0 || videoHeight === 0) {
          reject(new Error("Video element has not loaded metadata"));
          return;
        }

        // Canvas compression mathematics:
        // Set the maximum boundary to 1280px on the longest side to prevent heavy memory footprints in IndexedDB.
        const maxDimension = 1280;
        let targetWidth = videoWidth;
        let targetHeight = videoHeight;

        if (videoWidth > maxDimension || videoHeight > maxDimension) {
          if (videoWidth > videoHeight) {
            targetWidth = maxDimension;
            targetHeight = Math.round((videoHeight * maxDimension) / videoWidth);
          } else {
            targetHeight = maxDimension;
            targetWidth = Math.round((videoWidth * maxDimension) / videoHeight);
          }
        }

        // Create canvas offscreen
        const canvas = document.createElement("canvas");
        canvas.width = targetWidth;
        canvas.height = targetHeight;

        const ctx = canvas.getContext("2d");
        if (!ctx) {
          reject(new Error("Could not acquire 2D canvas context"));
          return;
        }

        // Draw current video frame onto the resized canvas boundaries
        ctx.drawImage(videoElement, 0, 0, targetWidth, targetHeight);

        // Convert the canvas drawing into a compressed JPEG Blob (quality 0.65)
        canvas.toBlob(
          (blob) => {
            if (blob) {
              // Capture completed, shut down camera tracks immediately to preserve battery
              stopCamera();
              resolve(blob);
            } else {
              reject(new Error("Canvas toBlob compression returned null"));
            }
          },
          "image/jpeg",
          0.65 // 65% quality achieves a great size-to-clarity balance (typically under 200KB)
        );
      });
    },
    [stopCamera]
  );

  // Guarantee cleanup: when the component unmounts, release the camera hardware
  useEffect(() => {
    return () => {
      if (streamRef.current) {
        stopAllTracks(streamRef.current);
      }
    };
  }, [stopAllTracks]);

  return {
    cameraState,
    stream,
    error,
    startCamera,
    stopCamera,
    capturePhoto,
  };
}

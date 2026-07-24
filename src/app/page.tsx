"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSessions } from "@/hooks/useSessions";
import { Button } from "@/components/atoms/Button";
import { SessionCard } from "@/components/molecules/SessionCard";
import { DisclaimerBanner } from "@/components/molecules/DisclaimerBanner";

export default function ParkingDashboard() {
  const router = useRouter();
  const { activeSessions, historySessions, status, clearOldHistory } = useSessions();
  const [showHistory, setShowHistory] = useState(false);

  // Auto-redirect to the new spot form if there are no active sessions
  useEffect(() => {
    if (status === "ready" && activeSessions.length === 0) {
      router.push("/new");
    }
  }, [activeSessions.length, status, router]);

  if (status === "loading") {
    return (
      <div className="w-full max-w-md mx-auto p-6 space-y-6">
        <div className="h-12 bg-neutral-900 border border-neutral-800 rounded-2xl animate-pulse" />
        <div className="h-48 bg-neutral-900 border border-neutral-800 rounded-3xl animate-pulse" />
        <div className="h-24 bg-neutral-900 border border-neutral-800 rounded-2xl animate-pulse" />
      </div>
    );
  }

  return (
    <div className="w-full max-w-md mx-auto flex flex-col space-y-6">
      <div className="flex flex-col space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-black text-neutral-200">Active Spots</h2>
          <Link href="/new">
            <Button variant="electric" size="sm">
              + Save New Spot
            </Button>
          </Link>
        </div>

        <div className="flex flex-col space-y-3">
          {activeSessions.map((session) => (
            <Link key={session.id} href={`/session/${session.id}`}>
              <SessionCard session={session} />
            </Link>
          ))}
          {activeSessions.length === 0 && (
            <p className="text-xs text-neutral-500 text-center py-6">
              No active sessions recorded.
            </p>
          )}
        </div>
      </div>

      <div className="pt-4 border-t border-neutral-900 flex flex-col">
        <button
          onClick={() => setShowHistory((prev) => !prev)}
          className="flex items-center justify-between py-2 text-sm font-semibold text-neutral-400 hover:text-neutral-200 transition-colors"
        >
          <p>Past Sessions ({historySessions.length})</p>
          <p className="text-xs">{showHistory ? "Hide" : "Show"}</p>
        </button>

        {showHistory && (
          <div className="flex flex-col space-y-4 mt-3 animate-fadeIn">
            {historySessions.length > 0 ? (
              <>
                <div className="flex items-center justify-between">
                  <p className="text-xs text-neutral-500">History Log</p>
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
                      <Link
                        key={session.id}
                        href={`/session/${session.id}`}
                        className="flex items-center justify-between p-4 bg-neutral-900/60 hover:bg-neutral-800/60 border border-neutral-800 hover:border-neutral-700/80 rounded-2xl cursor-pointer transition-all duration-300 backdrop-blur-md focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 text-xs"
                      >
                        <div className="flex flex-col space-y-1">
                          <p className="font-bold text-neutral-300">{session.vehicleLabel}</p>
                          <p className="text-neutral-500">
                            {session.floor ? `Floor ${session.floor}` : ""}{" "}
                            {session.bay ? `| Bay ${session.bay}` : ""}
                          </p>
                        </div>
                        <div className="flex flex-col items-end space-y-1">
                          <p
                            className={`font-semibold ${session.status === "completed" ? "text-emerald-500" : "text-rose-500"
                              }`}
                          >
                            {session.status === "completed" ? "Found" : "Expired"}
                          </p>
                          <p className="text-neutral-600 text-[10px]">{startedTime}</p>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              </>
            ) : (
              <p className="text-xs text-neutral-500 text-center py-6">
                No past sessions recorded.
              </p>
            )}

            <DisclaimerBanner variant="inline" />
          </div>
        )}
      </div>
    </div>
  );
}
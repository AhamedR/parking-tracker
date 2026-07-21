import React from "react";
import { ParkingDashboard } from "@/components/organisms/ParkingDashboard";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen bg-neutral-950 font-sans text-neutral-100">
      {/* App Header Bar */}
      <header className="sticky top-0 z-40 w-full bg-neutral-950/80 backdrop-blur-md border-b border-neutral-900 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center space-x-3 mx-auto max-w-md w-full">
          {/* Stylized PWA Logo Accent */}
          <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center font-bold text-white text-lg shadow-[0_0_15px_rgba(249,115,22,0.3)]">
            P
          </div>
          <div className="flex flex-col">
            <span className="font-black text-sm tracking-tight text-neutral-100 uppercase">
              Parking Tracker
            </span>
            <span className="text-[10px] text-orange-500 font-bold tracking-widest uppercase">
              Offline PWA
            </span>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col justify-start px-4 py-8 md:py-12 overflow-y-auto">
        <ParkingDashboard />
      </main>

      {/* Footer / Info */}
      <footer className="w-full text-center py-6 border-t border-neutral-950 text-[10px] font-semibold text-neutral-600 tracking-wider uppercase">
        Privacy-First &bull; Offline Native Storage
      </footer>
    </div>
  );
}

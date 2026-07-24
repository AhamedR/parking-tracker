interface StatusDotProps {
  status: "active" | "completed" | "expired";
  expiryTime: number;
  className?: string;
}

export const StatusDot: React.FC<StatusDotProps> = ({ status, expiryTime, className = "" }) => {
  let colorClass = "bg-neutral-500 shadow-[0_0_8px_rgba(115,115,115,0.5)]"; // default neutral
  let pulseClass = "";

  if (status === "expired") {
    // Red for expired
    colorClass = "bg-rose-500 shadow-[0_0_12px_#f43f5e]";
    pulseClass = "animate-pulse";
  } else if (status === "completed") {
    // Dim green or neutral for past completed sessions in history
    colorClass = "bg-emerald-600/60";
  } else if (status === "active") {
    const remainingMs = expiryTime - Date.now();
    const remainingMins = remainingMs / (60 * 1000);

    if (remainingMins <= 0) {
      // Recomputed as expired on client
      colorClass = "bg-rose-500 shadow-[0_0_12px_#f43f5e]";
      pulseClass = "animate-pulse";
    } else if (remainingMins <= 15) {
      // Amber/Warning for last 15 mins
      colorClass = "bg-amber-500 shadow-[0_0_12px_#f59e0b]";
      pulseClass = "animate-pulse";
    } else {
      // Green for active, plenty of time
      colorClass = "bg-emerald-500 shadow-[0_0_12px_#10b981]";
    }
  }

  return (
    <div className={`relative flex items-center justify-center ${className}`}>
      <span className={`h-2.5 w-2.5 rounded-full ${colorClass} ${pulseClass} transition-all duration-300`} />
      {pulseClass && (
        <span className={`absolute inline-flex h-4 w-4 rounded-full bg-current opacity-25 animate-ping -z-10`} style={{ color: colorClass.includes("rose") ? "#f43f5e" : "#f59e0b" }} />
      )}
    </div>
  );
};

import React from "react";
import { Input } from "../atoms/Input";

interface VehicleLabelInputProps {
  value: string;
  onChange: (value: string) => void;
  error?: string;
}

const QUICK_LABELS = ["My car", "Work van", "Rental", "Motorbike"];

export const VehicleLabelInput: React.FC<VehicleLabelInputProps> = ({
  value,
  onChange,
  error,
}) => {
  return (
    <div className="flex flex-col space-y-2 w-full">
      {/* Underlying input atom for vehicle label */}
      <Input
        label="Vehicle Label"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder='e.g., "My car", "Work van"'
        error={error}
        maxLength={30}
      />

      {/* Quick label chips for fast mobile selection */}
      <div className="flex flex-wrap gap-1.5 pt-1">
        {QUICK_LABELS.map((label) => {
          const isSelected = value.toLowerCase().trim() === label.toLowerCase().trim();
          return (
            <button
              key={label}
              type="button"
              onClick={() => onChange(label)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-xl border transition-all duration-300 active:scale-95 ${
                isSelected
                  ? "bg-orange-500/20 text-orange-500 border-orange-500/50 shadow-[0_0_12px_rgba(249,115,22,0.15)]"
                  : "bg-neutral-900/40 text-neutral-400 border-neutral-800 hover:border-neutral-700/80 hover:text-neutral-300"
              }`}
            >
              {label}
            </button>
          );
        })}
      </div>
    </div>
  );
};

import React, { useId } from "react";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const Input: React.FC<InputProps> = ({
  label,
  error,
  className = "",
  id,
  ...props
}) => {
  const generatedId = useId();
  const inputId = id || generatedId;

  return (
    <div className="flex flex-col space-y-1.5 w-full">
      {label && (
        <label
          htmlFor={inputId}
          className="text-xs font-semibold uppercase tracking-wider text-neutral-400"
        >
          {label}
        </label>
      )}
      <input
        id={inputId}
        className={`w-full px-4 py-3 bg-neutral-900/60 border border-neutral-800 text-neutral-100 rounded-xl focus:outline-none focus:border-orange-500/80 focus:ring-1 focus:ring-orange-500/50 placeholder-neutral-500 transition-all duration-300 text-sm ${error ? "border-rose-500/80 focus:border-rose-500 focus:ring-rose-500/50" : ""
          } ${className}`}
        {...props}
      />
      {error && (
        <span className="text-xs font-medium text-rose-500 animate-fadeIn">
          {error}
        </span>
      )}
    </div>
  );
};

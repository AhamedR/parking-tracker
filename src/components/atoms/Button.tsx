import React from "react";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "electric" | "danger" | "glass";
  size?: "sm" | "md" | "lg";
  fullWidth?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = "primary",
  size = "md",
  fullWidth = false,
  className = "",
  disabled,
  ...props
}) => {
  // Base classes for consistent sizing, layout, and state transition speeds
  const baseClasses =
    "inline-flex items-center justify-center font-semibold rounded-2xl transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-neutral-950 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100";

  // Sizing definitions
  const sizeClasses = {
    sm: "px-3.5 py-1.5 text-xs font-medium rounded-xl",
    md: "px-5 py-2.5 text-sm rounded-xl",
    lg: "px-6 py-3.5 text-base rounded-2xl",
  };

  // Curated premium variant color palettes (safety orange, electric blue, rose red, glass)
  const variantClasses = {
    primary:
      "bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white shadow-[0_4px_20px_rgba(249,115,22,0.35)] focus:ring-orange-500",
    electric:
      "bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white shadow-[0_4px_20px_rgba(6,182,212,0.35)] focus:ring-cyan-500",
    danger:
      "bg-gradient-to-r from-rose-500 to-red-600 hover:from-rose-600 hover:to-red-700 text-white shadow-[0_4px_20px_rgba(244,63,94,0.35)] focus:ring-rose-500",
    glass:
      "bg-neutral-900/60 hover:bg-neutral-800/80 text-neutral-200 border border-neutral-800/80 backdrop-blur-md focus:ring-neutral-700",
  };

  const widthClass = fullWidth ? "w-full" : "";

  return (
    <button
      className={`${baseClasses} ${sizeClasses[size]} ${variantClasses[variant]} ${widthClass} ${className}`}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  );
};

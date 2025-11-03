import { type ButtonHTMLAttributes, type ReactNode } from "react";
import { cn } from "@/utils/lib";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "danger" | "danger-outline";
  size?: "sm" | "md" | "lg";
  isLoading?: boolean;
  loadingText?: string;
  children: ReactNode;
}

export default function Button({
  variant = "primary",
  size = "md",
  isLoading = false,
  loadingText,
  disabled,
  className = "",
  children,
  ...props
}: ButtonProps) {
  const baseClasses =
    "font-medium rounded-md focus:outline-none focus:ring-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer";

  const variantClasses = {
    primary: "text-white bg-blue-600 hover:bg-blue-700 focus:ring-blue-500",
    secondary: "text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 focus:ring-blue-500",
    danger: "text-white bg-red-600 hover:bg-red-700 focus:ring-red-500",
    "danger-outline":
      "text-red-600 bg-white border border-red-300 hover:bg-red-50 focus:ring-red-500",
  };

  const sizeClasses = {
    sm: "px-3 py-1 text-xs rounded",
    md: "px-4 py-2 text-sm rounded-md",
    lg: "px-6 py-3 text-base rounded-md",
  };

  const combinedClasses = cn(
    `${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${className}`.trim()
  );

  return (
    <button {...props} disabled={disabled || isLoading} className={combinedClasses}>
      {isLoading ? loadingText || "Loading..." : children}
    </button>
  );
}

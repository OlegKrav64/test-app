import { type InputHTMLAttributes, forwardRef } from "react";
import { cn } from "@/utils/lib";

interface InputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "size"> {
  size?: "sm" | "md" | "lg";
  error?: boolean;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ size = "md", error = false, className = "", ...props }, ref) => {
    const baseClasses =
      "w-full border rounded-md shadow-sm focus:outline-none focus:ring-2 transition-colors disabled:bg-gray-100 disabled:cursor-not-allowed";

    const sizeClasses = {
      sm: "px-2 py-1 text-sm",
      md: "px-3 py-2 text-sm",
      lg: "px-4 py-2 text-base",
    };

    const errorClasses = error
      ? "border-red-300 focus:ring-red-500 focus:border-red-500"
      : "border-gray-300 focus:ring-blue-500 focus:border-blue-500";

    const combinedClasses = cn(baseClasses, sizeClasses[size], errorClasses, className);

    return <input ref={ref} className={combinedClasses} {...props} />;
  }
);

Input.displayName = "Input";

export default Input;

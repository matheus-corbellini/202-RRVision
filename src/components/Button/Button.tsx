"use client";

import type React from "react";
import "./Button.css";

interface ButtonProps {
  children: React.ReactNode;
  variant?: "primary" | "outline" | "secondary";
  size?: "small" | "medium" | "large";
  type?: "button" | "submit" | "reset";
  fullWidth?: boolean;
  onClick?: () => void;
  disabled?: boolean;
  className?: string;
}

export default function Button({
  children,
  variant = "primary",
  size = "medium",
  type = "button",
  fullWidth = false,
  onClick,
  disabled = false,
  className: customClassName,
}: ButtonProps) {
  const className = `btn btn-${variant} btn-${size} ${
    fullWidth ? "btn-full-width" : ""
  } ${customClassName || ""}`;

  return (
    <button
      type={type}
      className={className}
      onClick={onClick}
      disabled={disabled}
    >
      {children}
    </button>
  );
}

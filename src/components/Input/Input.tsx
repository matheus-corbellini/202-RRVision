"use client";

import type React from "react";
import "./Input.css";

interface InputProps {
  type: string;
  name: string;
  placeholder: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  required?: boolean;
  disabled?: boolean;
}

export default function Input({
  type,
  name,
  placeholder,
  value,
  onChange,
  required = false,
  disabled = false,
}: InputProps) {
  return (
    <input
      type={type}
      name={name}
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      required={required}
      disabled={disabled}
      className="input"
    />
  );
}

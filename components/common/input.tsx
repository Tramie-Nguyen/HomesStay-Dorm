import React from "react";

interface InputProps {
  note: string;
  id: string;
  type?: string;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  required?: boolean;
}

export default function Input({
  note,
  id,
  type,
  value,
  onChange,
  placeholder,
  required,
}: InputProps) {
  return (
    <div className="flex flex-col">
      <span className="text-text1 pl-4 font-semibold">{note}</span>
      <div className="relative">
        <input
          id={id}
          type={type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          className="w-full p-4 py-2 bg-background text-text1 rounded-full outline-none focus:ring-1 focus:ring-text2 transition-all duration-300"
          required={required}
        />
      </div>
    </div>
  );
}

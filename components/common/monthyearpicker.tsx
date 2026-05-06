"use client";
import { useState, useRef, useEffect } from "react";

type Props = {
  value: Date;
  onChange: (date: Date) => void;
};

export default function MonthYearPicker({ value, onChange }: Props) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const year = value.getFullYear();
  const month = value.getMonth();

  // đóng khi click ngoài
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={ref}>
      {/* Trigger */}
      <button
        onClick={() => setOpen(!open)}
        className="font-medium text-text1"
      >
        Tháng {month + 1}, {year}
      </button>

      {/* Dropdown */}
      {open && (
        <div className="absolute mt-2 bg-white border rounded-lg shadow-lg p-3 z-50 w-56">
          {/* Year control */}
          <div className="flex justify-between items-center mb-3">
            <button
              onClick={() => onChange(new Date(year - 1, month, 1))}
              className="px-2"
            >
              ←
            </button>
            <span className="font-semibold">{year}</span>
            <button
              onClick={() => onChange(new Date(year + 1, month, 1))}
              className="px-2"
            >
              →
            </button>
          </div>

          {/* Month grid */}
          <div className="grid grid-cols-3 gap-2">
            {Array.from({ length: 12 }, (_, i) => (
              <button
                key={i}
                onClick={() => {
                  onChange(new Date(year, i, 1));
                  setOpen(false);
                }}
                className={`p-2 rounded text-sm hover:bg-primary hover:text-white ${
                  i === month ? "bg-primary text-white" : ""
                }`}
              >
                T{i + 1}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
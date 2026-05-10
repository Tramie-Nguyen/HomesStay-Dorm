"use client";
import { useState, useRef, useEffect } from "react";

type Props = {
  value: Date | null;
  onChange: (date: Date) => void;
};

export default function DatePicker({ value, onChange }: Props) {
  const [open, setOpen] = useState(false);
  const [viewDate, setViewDate] = useState(value || new Date());
  const ref = useRef<HTMLDivElement>(null);

  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDay = new Date(year, month, 1).getDay();

  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const paddingStart = Array.from({ length: firstDay }, () => null);

  const today = new Date();

  return (
    <div className="relative" ref={ref}>
      {/* Input */}
      <input
        readOnly
        onClick={() => setOpen(!open)}
        value={
          value
            ? `${value.getDate()}/${value.getMonth() + 1}/${value.getFullYear()}`
            : ""
        }
        placeholder="Chọn ngày"
        className="p-1 border border-primary rounded w-full cursor-pointer"
      />

      {/* Popup */}
      {open && (
        <div className="absolute z-50 mt-2 bg-white border rounded-lg shadow p-3 w-64">
          {/* Header */}
          <div className="flex justify-between mb-2">
            <button onClick={() => setViewDate(new Date(year, month - 1, 1))}>←</button>
            <span>Tháng {month + 1}, {year}</span>
            <button onClick={() => setViewDate(new Date(year, month + 1, 1))}>→</button>
          </div>

          {/* Week */}
          <div className="grid grid-cols-7 text-xs text-center mb-1">
            {["CN","T2","T3","T4","T5","T6","T7"].map(d => (
              <div key={d}>{d}</div>
            ))}
          </div>

          {/* Days */}
          <div className="grid grid-cols-7 gap-1 text-center">
            {paddingStart.map((_, i) => <div key={i} />)}

            {days.map(d => (
              <button
                key={d}
                onClick={() => {
                  onChange(new Date(year, month, d));
                  setOpen(false);
                }}
                className="p-1 rounded hover:bg-gray-200"
              >
                {d}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
"use client";
import { useState, useRef, useEffect } from "react";

type Props = {
  value: string; // "HH:mm"
  onChange: (time: string) => void;
};

export default function TimePicker({ value, onChange }: Props) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // parse value
  const [hour, minute] = value ? value.split(":") : ["", ""];

  // đóng khi click ngoài
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const hours = Array.from({ length: 24 }, (_, i) =>
    i.toString().padStart(2, "0")
  );

  const minutes = Array.from({ length: 60 }, (_, i) =>
    i.toString().padStart(2, "0")
  );

  const selectHour = (h: string) => {
    const newTime = `${h}:${minute || "00"}`;
    onChange(newTime);
  };

  const selectMinute = (m: string) => {
    const newTime = `${hour || "00"}:${m}`;
    onChange(newTime);
  };

  return (
    <div className="relative" ref={ref}>
      {/* Input */}
      <input
        readOnly
        value={value}
        placeholder="Chọn giờ"
        onClick={() => setOpen(!open)}
        className="p-1 border border-primary rounded w-full cursor-pointer"
      />

      {/* Dropdown */}
      {open && (
        <div className="absolute mt-2 bg-white border rounded shadow p-2 flex gap-1">
          
          {/* CỘT GIỜ */}
          <div className="h-40 overflow-y-auto no-scrollbar border-r pr-2">
            <p className="text-xs text-text1 mb-1 px-1.5"><strong>Giờ</strong></p>
            {hours.map((h) => (
              <button
                key={h}
                onClick={() => selectHour(h)}
                className={`block w-full text-left px-2 py-1 rounded hover:bg-gray-200 ${
                  h === hour ? "bg-primary text-white" : ""
                }`}
              >
                {h}
              </button>
            ))}
          </div>

          {/* CỘT PHÚT */}
          <div className="h-40 overflow-y-auto no-scrollbar pl-2">
            <p className="text-xs text-text1 mb-1"> <strong>Phút</strong></p>
            {minutes.map((m) => (
              <button
                key={m}
                onClick={() => selectMinute(m)}
                className={`block w-full text-left px-2 py-1 rounded hover:bg-gray-200 ${
                  m === minute ? "bg-primary text-white" : ""
                }`}
              >
                {m}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
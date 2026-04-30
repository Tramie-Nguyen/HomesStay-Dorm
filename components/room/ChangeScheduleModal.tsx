"use client";

import { useState } from "react";
import { toast } from "react-toastify";

interface Props {
  open: boolean;
  onClose: () => void;
  maPhieu: string;
  onSuccess: () => void;
}

export default function ChangeScheduleModal({
  open,
  onClose,
  maPhieu,
  onSuccess,
}: Props) {
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");

  if (!open) return null;

  const handleSave = async () => {
    if (!date || !time) {
      toast.error("Vui lòng chọn ngày giờ");
      return;
    }

    try {
      await fetch("/api/schedule", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          maPhieu: maPhieu,
          ngay: date,
          gio: time,
        }),
      });

      toast.success("Đổi lịch thành công");

      onClose();
      onSuccess(); // 🔥 refresh lại UI
    } catch (err) {
      toast.error("Có lỗi xảy ra");
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-background rounded-xl p-6 w-80 space-y-4">
        <h2 className="font-semibold text-center">Đổi lịch nhận phòng</h2>

        <input
          type="date"
          className="w-full bg-base  p-2 rounded"
          onChange={(e) => setDate(e.target.value)}
        />

        <input
          type="time"
          className="w-full bg-base p-2 rounded"
          onChange={(e) => setTime(e.target.value)}
        />

        <div className="flex justify-end gap-2">
          <button
            onClick={onClose}
            className="cursor-pointer px-3 py-1 border rounded"
          >
            Hủy
          </button>

          <button
            onClick={handleSave}
            className="px-3 py-1 cursor-pointer bg-text2 text-white rounded"
          >
            Xác nhận
          </button>
        </div>
      </div>
    </div>
  );
}

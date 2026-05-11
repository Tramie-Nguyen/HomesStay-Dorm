"use client";
import { useState, useRef, useEffect } from "react";

interface Props {
  open: boolean;
  onClose: () => void;
  maPhieu: string;
  onSuccess: () => void;
}

export default function CancelScheduleModal({
  open,
  onClose,
  maPhieu,
  onSuccess,
}: Props) {
  if (!open) return null;

  const [isLoading, setIsLoading] = useState(false);

  const handleHuyLich = async (e: React.MouseEvent) => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/lich?maPhieu=${maPhieu}`, { method: 'DELETE' });
      if (res.ok) {
        onSuccess();
        onClose();
        //hủy thành công trả về trang trước đó
        window.history.back();
      } else {
        const data = await res.json();
        alert(`Lỗi: ${data.details || data.error}`);
      }
    } catch (error) {
      alert("Lỗi kết nối mạng.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-background rounded-xl p-6 w-96 space-y-3">
        <h2 className="font-semibold text-center text-text1">
          Xác nhận hủy lịch
        </h2>
        <p className="text-text1 text-center">
          Bạn có chắc chắn muốn hủy lịch xem phòng này?
        </p>
        <div className="flex justify-end gap-2 pt-2">
          <button
            onClick={onClose}
            className="cursor-pointer px-3 py-1 border border-text1 text-text1 rounded"
            disabled={isLoading}
          >
            Hủy
          </button>
          <button
            onClick={handleHuyLich}
            className="cursor-pointer px-3 py-1 bg-red-500 text-white rounded"
            disabled={isLoading}
          >
            {isLoading ? "Đang xử lý..." : "Xác nhận hủy"}
          </button>
        </div>
      </div>
    </div>
  );
}
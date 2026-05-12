"use client";
import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import DatePicker from "../../../components/common/datepicker";
import TimePicker from "../../../components/common/timepicker";
import * as calendarService from "@/services/calendar";
import { toast } from "react-toastify";

interface PopupProps {
  task: any;
  currentDate: Date;
  onClose: () => void;
  onRefresh: () => void;
}

export default function Popup({
  task,
  currentDate,
  onClose,
  onRefresh,
}: PopupProps) {
  const router = useRouter();
  const popupRef = useRef<HTMLDivElement>(null);
  const [isTooltipFlipped, setIsTooltipFlipped] = useState(false);

  const [isRescheduling, setIsRescheduling] = useState(false);
  const [newDate, setNewDate] = useState<Date | null>(null);
  const [newTime, setNewTime] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (popupRef.current) {
      const rect = popupRef.current.getBoundingClientRect();
      if (rect.bottom > window.innerHeight - 20) {
        setIsTooltipFlipped(true);
      }
    }
  }, []);

  return (
    <div
      ref={popupRef}
      className={`absolute z-50 left-0 w-64 md:w-72 bg-base rounded-xl shadow-2xl border border-primary cursor-pointer transform transition-all ${
        isTooltipFlipped ? "bottom-full mb-2" : "top-full mt-2"
      }`}
      // Bấm vào bất kỳ đâu trên thẻ div này sẽ chuyển trang
      onClick={() => {
        if (task.loai === "Xem phòng") {
          router.push(`/sale/lich-cua-toi/xem-phong/${task.id}`);
        } else if (task.loai?.trim().normalize() === "Nhận phòng".normalize()) {
          router.push(`/sale/lich-cua-toi/nhan-phong/${task.id}`);
        } else {
          alert("Chưa có trang chi tiết cho loại lịch này.");
        }
      }}
    >
      <img
        src={task.hinhAnh || "/placeholder.jpg"}
        alt="Room"
        className="w-full h-32 object-cover rounded-t-xl"
      />

      <div className="p-3 text-sm text-text1 relative">
        {/* Nút X đóng popup */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onClose();
          }}
          className="absolute top-2 right-2 w-6 h-6 flex items-center justify-center bg-white/50 hover:bg-white rounded-full text-text1 transition-colors"
        >
          ✕
        </button>

        <span
          className={`px-3 py-1 rounded-full text-white text-xs ${task.loai === "Xem phòng" ? "bg-accent" : "bg-primary"} gap-2 inline-flex items-center mb-2`}
        >
          <strong>{task.loai}</strong>
        </span>

        <p>
          <strong>Khách:</strong> {task.khachHang}
        </p>
        <p>
          <strong>SĐT:</strong> {task.sdt}
        </p>
        <p>
          <strong>Lịch hẹn:</strong> {task.gio} ({task.ngay}/
          {currentDate.getMonth() + 1})
        </p>
        <p>
          <strong>Mã phòng:</strong> {task.maPhong}
        </p>
        <p>
          <strong>KTX Phường:</strong> {task.ktx}
        </p>

        {/* Khu vực các nút bấm: Phải chặn stopPropagation để không bị nhảy trang khi bấm vào vùng trống của div này */}
        <div
          className="mt-3 flex flex-wrap gap-2 justify-end"
          onClick={(e) => e.stopPropagation()}
        >
          <span className="bg-gray-400 text-white px-3 py-1 rounded-full text-xs">
            {task.trangThai}
          </span>

          {task.trangThai !== "Đã xử lý" && (
            <>
              {isRescheduling ? (
                <div className="w-full flex flex-col gap-2 mt-2 bg-gray-50 p-2 rounded-lg border border-gray-200">
                  <div className="flex gap-2">
                    <DatePicker value={newDate} onChange={setNewDate} />
                    <TimePicker value={newTime} onChange={setNewTime} />
                  </div>
                  <div className="flex gap-2 justify-end">
                    <button
                      disabled={isLoading}
                      className={`px-3 py-1 rounded text-xs text-white ${isLoading ? "bg-gray-400" : "bg-primary"}`}
                      onClick={() =>
                        calendarService.handleDoiLich(
                          task.id,
                          newDate,
                          newTime,
                          setIsLoading,
                          onRefresh,
                          onClose,
                        )
                      }
                    >
                      {isLoading ? "Đang lưu..." : "Lưu"}
                    </button>
                    <button
                      className="px-3 py-1 rounded text-xs bg-gray-200 text-gray-700"
                      onClick={() => setIsRescheduling(false)}
                    >
                      Đóng
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  disabled={isLoading}
                  className="bg-text2 hover:bg-text1 text-white px-3 py-1 rounded-full text-xs transition"
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsRescheduling(true);
                  }}
                >
                  Dời lịch
                </button>
              )}

              {task.loai === "Xem phòng" && !isRescheduling && (
                <button
                  disabled={isLoading}
                  onClick={(e) => {
                    e.stopPropagation();
                    calendarService.handleHuyLich(
                      task.id,
                      setIsLoading,
                      onRefresh,
                      onClose,
                    );
                  }}
                  className={`px-3 py-1 rounded-full text-xs transition text-white ${isLoading ? "bg-gray-400" : "bg-red-500 hover:bg-red-600"}`}
                >
                  {isLoading ? "Đang xử lý..." : "Hủy lịch"}
                </button>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

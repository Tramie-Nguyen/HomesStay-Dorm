"use client";
import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { CaseUpper } from "lucide-react";
import DatePicker from "../../common/datepicker";
import TimePicker from "../../common/timepicker";

export default function Popup({ task, currentDate, onClose }: { task: any, currentDate: Date, onClose: () => void }) {
  const router = useRouter();
  const [isRescheduling, setIsRescheduling] = useState(false);
  const [newDate, setNewDate] = useState<Date | null>(null);
  const [newTime, setNewTime] = useState("");
  
  // Ref và State để xử lý vị trí popup
  const popupRef = useRef<HTMLDivElement>(null);
  const [isTooltipFlipped, setIsTooltipFlipped] = useState(false);

  useEffect(() => {
    if (popupRef.current) {
      const rect = popupRef.current.getBoundingClientRect();
      // Nếu đuôi của popup vượt quá chiều cao của trình duyệt (trừ hao 20px)
      if (rect.bottom > window.innerHeight - 20) {
        setIsTooltipFlipped(true);
      }
    }
  }, []);

  const handleActionClick = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  return (
    <div 
      ref={popupRef}
      // Đổi vị trí top/bottom linh hoạt dựa vào state isTooltipFlipped
      className={`absolute z-50 left-0 w-64 md:w-72 bg-base rounded-xl shadow-2xl border border-primary cursor-pointer transform transition-all ${
        isTooltipFlipped ? "bottom-full mb-2" : "top-full mt-2"
      }`}
      onClick={() => router.push(`/sale/thongtinthue/${task.id}`)}
    >
      <img src={task.hinhAnh} alt="Room" className="w-full h-32 object-cover rounded-t-xl" />
      <div className="p-3 text-sm text-text1 relative">
        <button 
          onClick={(e) => { e.stopPropagation(); onClose(); }} 
          className="absolute top-2 right-2 w-6 h-6 flex items-center justify-center bg-white/50 hover:bg-white rounded-full text-text1 transition-colors"
        >
          ✕
        </button>

        <span className={`px-3 py-1 rounded-full text-white text-xs ${task.loai === 'Xem phòng' ? 'bg-accent' : 'bg-primary'} gap-2 inline-flex items-center mb-2`}>
          <strong>{task.loai}</strong>
        </span>

        <p><strong>Khách:</strong> {task.khachHang}</p>
        <p><strong>SĐT:</strong> {task.sdt}</p>
        <p><strong>Lịch hẹn:</strong> {task.gio} ({task.ngay}/{currentDate.getMonth() + 1})</p>
        <p><strong>Mã phòng:</strong> {task.maPhong}</p>
        <p><strong>KTX Phường:</strong> {task.ktx}</p>

        <div className="mt-3 flex flex-wrap gap-2 justify-end" onClick={handleActionClick}>
          {/* NHÃN TRẠNG THÁI */}
          <span className="bg-gray-400 text-white px-3 py-1 rounded-full text-xs">
            {task.trangThai}
          </span>

          {/* CASE 1: Đã xử lý → chỉ hiện nhãn */}
          {task.trangThai === 'Đã xử lý' && null}

          {/* CASE 2 + 3: Chưa xử lý */}
          {task.trangThai === 'Chưa xử lý' && (
            <>
              {/* Nút dời lịch (có cho cả 2 loại) */}
              {isRescheduling ? (
                <div className="w-full flex gap-2 mt-2">
                  <DatePicker value={newDate} onChange={setNewDate} />
                  <TimePicker value={newTime} onChange={setNewTime} />

                  <button
                    className="bg-primary text-white px-2 py-1 rounded text-xs"
                    onClick={() => {
                      console.log(newDate, newTime);
                      setIsRescheduling(false);
                    }}
                  >
                    Lưu
                  </button>
                </div>
              ) : (
                <button
                  className="bg-text2 hover:bg-text1 text-white px-3 py-1 rounded-full text-xs transition"
                  onClick={() => setIsRescheduling(true)}
                >
                  Dời lịch
                </button>
              )}

              {/* CASE 3: Xem phòng → thêm nút Hủy */}
              {task.loai === 'Xem phòng' && (
                <button className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded-full text-xs transition">
                  Hủy lịch
                </button>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
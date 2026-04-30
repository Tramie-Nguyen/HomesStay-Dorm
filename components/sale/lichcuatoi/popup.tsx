"use client";
import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function Popup({ task, currentDate, onClose }: { task: any, currentDate: Date, onClose: () => void }) {
  const router = useRouter();
  const [isRescheduling, setIsRescheduling] = useState(false);
  
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
      className={`absolute z-50 left-0 w-64 md:w-72 bg-base rounded-xl shadow-2xl border border-primary overflow-hidden cursor-pointer transform transition-all ${
        isTooltipFlipped ? "bottom-full mb-2" : "top-full mt-2"
      }`}
      onClick={() => router.push(`/sale/thongtinthue/${task.id}`)}
    >
      <img src={task.hinhAnh} alt="Room" className="w-full h-32 object-cover" />
      <div className="p-3 text-sm text-text1 relative">
        <button 
          onClick={(e) => { e.stopPropagation(); onClose(); }} 
          className="absolute top-2 right-2 w-6 h-6 flex items-center justify-center bg-white/50 hover:bg-white rounded-full text-text1 transition-colors"
        >
          ✕
        </button>

        <p className="w-fit uppercase bg-primary hover:bg-text1 text-white px-3 py-1 rounded-full text-xs transition">
          <strong>{task.loai}</strong>
        </p>

        <p><strong>Khách:</strong> {task.khachHang}</p>
        <p><strong>SĐT:</strong> {task.sdt}</p>
        <p><strong>Lịch hẹn:</strong> {task.gio} ({task.ngay}/{currentDate.getMonth() + 1})</p>
        <p><strong>Mã phòng:</strong> {task.maPhong}</p>
        <p><strong>KTX Phường:</strong> {task.ktx}</p>

        <div className="mt-3 flex flex-wrap gap-2 justify-end" onClick={handleActionClick}>
          <span className={`px-3 py-1 rounded-full text-white text-xs ${task.trangThai === 'Đã xử lý' ? 'bg-accent' : 'bg-gray-400'}`}>
            {task.trangThai}
          </span>
          
          {isRescheduling ? (
            <div className="w-full flex gap-2 mt-2">
              <input type="date" className="p-1 rounded border border-primary text-xs w-full focus:outline-none" />
              <input type="time" className="p-1 rounded border border-primary text-xs w-full focus:outline-none" />
              <button className="bg-primary text-white px-2 py-1 rounded text-xs" onClick={() => setIsRescheduling(false)}>Lưu</button>
            </div>
          ) : (
            <button 
              className="bg-text2 hover:bg-text1 text-white px-3 py-1 rounded-full text-xs transition"
              onClick={() => setIsRescheduling(true)}
            >
              Dời lịch
            </button>
          )}

          {task.loai === 'Xem phòng' && task.trangThai === 'Chưa xử lý' && (
            <button className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded-full text-xs transition">
              Hủy lịch
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
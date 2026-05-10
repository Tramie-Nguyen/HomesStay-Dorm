"use client";
import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import DatePicker from "../../../components/common/datepicker";
import TimePicker from "../../../components/common/timepicker";

interface PopupProps {
  task: any;
  currentDate: Date;
  onClose: () => void;
  onRefresh: () => void;
}

export default function Popup({ task, currentDate, onClose, onRefresh }: PopupProps) {
  const router = useRouter();
  const [isRescheduling, setIsRescheduling] = useState(false);
  const [newDate, setNewDate] = useState<Date | null>(null);
  const [newTime, setNewTime] = useState("");
  const [isLoading, setIsLoading] = useState(false); // Trạng thái loading khi gọi API
  
  const popupRef = useRef<HTMLDivElement>(null);
  const [isTooltipFlipped, setIsTooltipFlipped] = useState(false);

  useEffect(() => {
    if (popupRef.current) {
      const rect = popupRef.current.getBoundingClientRect();
      if (rect.bottom > window.innerHeight - 20) {
        setIsTooltipFlipped(true);
      }
    }
  }, []);

  const handleActionClick = (e: React.MouseEvent) => {
    useEffect(() => {
      const handleClickOutside = (event: MouseEvent) => {
        // vào trnag thong-tin-thue
        if (popupRef.current && !popupRef.current.contains(event.target as Node)) {
          router.push(`/sale/thongtinthue/${task.id}`);
        }
      };
      document.addEventListener("mousedown", handleClickOutside);
      return () => {
        document.removeEventListener("mousedown", handleClickOutside);
      };
    }, [router, task.id]);
  };

  // HÀM XỬ LÝ HỦY LỊCH
  const handleHuyLich = async () => {
    if (!confirm("Bạn có chắc chắn muốn hủy lịch này?")) return;
    
    setIsLoading(true);
    try {
      const res = await fetch(`/api/lich?maPhieu=${task.id}`, { method: 'DELETE' });
      const data = await res.json();
      
      if (res.ok) {
        alert("Hủy lịch thành công!");
        onRefresh(); // Gọi hàm refresh để component cha fetch lại data
        onClose(); // Đóng popup
      } else {
        alert(`Lỗi: ${data.details || data.error}`);
      }
    } catch (error) {
      alert("Lỗi kết nối mạng khi hủy lịch.");
    } finally {
      setIsLoading(false);
    }
  };

  // HÀM XỬ LÝ DỜI LỊCH
  const handleDoiLich = async () => {
    if (!newDate || !newTime) {
      alert("Vui lòng chọn cả ngày và giờ mới!");
      return;
    }

    // Ghép Date và Time thành 1 biến DateTime hoàn chỉnh
    const [hours, minutes] = newTime.split(':').map(Number);
    const combinedDateTime = new Date(newDate);
    combinedDateTime.setHours(hours, minutes, 0, 0);

    // Bắt lỗi ngay trên Frontend nếu dời lịch về quá khứ (Trùng khớp với CHECK DB)
    if (combinedDateTime <= new Date()) {
      alert("Ngày giờ mới phải lớn hơn thời gian hiện tại!");
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch('/api/lich', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          maPhieu: task.id,
          ngayGioMoi: combinedDateTime.toISOString()
        })
      });
      const data = await res.json();

      if (res.ok) {
        alert("Dời lịch thành công!");
        onRefresh();
        onClose();
      } else {
        alert(`Lỗi: ${data.details || data.error}`);
      }
    } catch (error) {
      alert("Lỗi kết nối mạng khi dời lịch.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div 
      ref={popupRef}
      className={`absolute z-50 left-0 w-64 md:w-72 bg-base rounded-xl shadow-2xl border border-primary cursor-pointer transform transition-all ${
        isTooltipFlipped ? "bottom-full mb-2" : "top-full mt-2"
      }`}
      onClick={() => router.push(`/sale/thongtinthue/${task.id}`)}
    >
      <img src={task.hinhAnh || '/placeholder.jpg'} alt="Room" className="w-full h-32 object-cover rounded-t-xl" />
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
          <span className="bg-gray-400 text-white px-3 py-1 rounded-full text-xs">
            {task.trangThai}
          </span>

          {task.trangThai !== 'Đã xử lý' && (
            <>
              {isRescheduling ? (
                <div className="w-full flex gap-2 mt-2">
                  <DatePicker value={newDate} onChange={setNewDate} />
                  <TimePicker value={newTime} onChange={setNewTime} />

                  <button
                    disabled={isLoading}
                    className={`px-2 py-1 rounded text-xs text-white ${isLoading ? 'bg-gray-400' : 'bg-primary'}`}
                    onClick={handleDoiLich}
                  >
                    {isLoading ? 'Đang lưu...' : 'Lưu'}
                  </button>
                  <button
                    className="px-2 py-1 rounded text-xs bg-gray-200 text-gray-700"
                    onClick={() => setIsRescheduling(false)}
                  >
                    Hủy lịch
                  </button>
                </div>
              ) : (
                <button
                  disabled={isLoading}
                  className="bg-text2 hover:bg-text1 text-white px-3 py-1 rounded-full text-xs transition"
                  onClick={() => setIsRescheduling(true)}
                >
                  Dời lịch
                </button>
              )}

              {task.loai === 'Xem phòng' && !isRescheduling && (
                <button 
                  disabled={isLoading}
                  onClick={handleHuyLich}
                  className={`px-3 py-1 rounded-full text-xs transition text-white ${isLoading ? 'bg-gray-400' : 'bg-red-500 hover:bg-red-600'}`}
                >
                  {isLoading ? 'Đang xử lý...' : 'Hủy lịch'}
                </button>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
"use client";
import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import DayCell from "../../../components/sale/lichcuatoi/daycell";
import MonthYearPicker from "../../../components/common/monthyearpicker";

// Mock Data
const mockTasks = [
  { id: "KH001", khachHang: "Hình Diễm Xuân", sdt: "123456789", ngay: 26, gio: "08:30", loai: "Xem phòng", trangThai: "Chưa xử lý", maPhong: "101", ktx: "Chợ Quán", hinhAnh: "https://images.unsplash.com/photo-1555854877-bab0e564b8d5?auto=format&fit=crop&q=80&w=400" },
  { id: "KH002", khachHang: "Khưu Ngọc Ý Vy", sdt: "0987654321", ngay: 21, gio: "08:30", loai: "Nhận phòng", trangThai: "Đã xử lý", maPhong: "201", ktx: "Chợ Quán", hinhAnh: "https://images.unsplash.com/photo-1555854877-bab0e564b8d5?auto=format&fit=crop&q=80&w=400" },
];

export default function CalendarPage() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  // số ngày trong tháng
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  // Chủ nhật = 0 → giữ nguyên
  const firstDayOfMonth = new Date(year, month, 1).getDay();

  // danh sách ngày
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);

  // padding đầu
  const paddingStart = Array.from({ length: firstDayOfMonth }, () => null);

  // padding cuối (đủ 7 cột)
  const totalCells = paddingStart.length + days.length;
  const paddingEnd = Array.from({
    length: (7 - (totalCells % 7)) % 7,
  }, () => null);

  // today đúng (fix bug highlight)
  const today = new Date();
  const isToday = (day: number) =>
    day === today.getDate() &&
    month === today.getMonth() &&
    year === today.getFullYear();

  const prevMonth = () =>
    setCurrentDate(new Date(year, month - 1, 1));

  const nextMonth = () =>
    setCurrentDate(new Date(year, month + 1, 1));

  return (
    <div className="min-h-screen bg-background pt-24 pb-10 px-4 md:px-10">
      <div className="max-w-7xl mx-auto relative">
        <h1 className="text-2xl font-bold text-text1 text-center mb-6 uppercase">
          Lịch của tôi
        </h1>

        <div className="flex items-center mb-4">
          <div className="flex items-center space-x-2 bg-white rounded-lg px-4 py-2 border border-gray-400">
            <button onClick={prevMonth} className="hover:text-primary">
              <ChevronLeft size={20} />
            </button>
            <button className="font-medium text-text1">
              <MonthYearPicker
                value={currentDate}
                onChange={(date) => setCurrentDate(date)}
              />
            </button>
            <button onClick={nextMonth} className="hover:text-primary">
              <ChevronRight size={20} />
            </button>
          </div>
        </div>

        <div className="bg-white border border-gray-400 rounded-lg">
          {/* Header */}
          <div className="grid grid-cols-7 border-b border-gray-400 bg-pastel rounded-tl-lg rounded-tr-lg">
            {["CN", "T2", "T3", "T4", "T5", "T6", "T7"].map((day) => (
              <div
                key={day}
                className="py-2 text-center text-sm font-medium text-text1 border-r last:border-r-0"
              >
                {day}
              </div>
            ))}
          </div>

          {/* Body */}
          <div className="grid grid-cols-7 auto-rows-fr">
            {/* padding đầu */}
            {paddingStart.map((_, index) => (
              <div
                key={`start-${index}`}
                className="min-h-[120px] border-b border-r border-gray-400 bg-gray-100"
              ></div>
            ))}

            {/* ngày trong tháng */}
            {days.map((day) => (
              <DayCell
                key={`${month}-${day}`}
                day={day}
                isToday={isToday(day)}
                dayTasks={mockTasks.filter((t) => t.ngay === day)}
                currentDate={currentDate}
                selectedTaskId={selectedTaskId}
                onSelectTask={(task) =>
                  setSelectedTaskId(task ? task.id : null)
                }
              />
            ))}

            {/* padding cuối */}
            {paddingEnd.map((_, index) => (
              <div
                key={`end-${index}`}
                className="min-h-[120px] border-b border-r border-gray-400 bg-gray-100"
              ></div>
            ))}
          </div>
        </div>

        {selectedTaskId && (
          <div
            className="fixed inset-0 z-40"
            onClick={() => setSelectedTaskId(null)}
          ></div>
        )}
      </div>
    </div>
  );
}
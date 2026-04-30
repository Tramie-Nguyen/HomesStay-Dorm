"use client";
import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import DayCell from "../../../components/sale/lichcuatoi/daycell";

// Mock Data
const mockTasks = [
  { id: "KH001", khachHang: "Hình Diễm Xuân", sdt: "123456789", ngay: 26, gio: "08:30", loai: "Xem phòng", trangThai: "Chưa xử lý", maPhong: "101", ktx: "Chợ Quán", hinhAnh: "https://images.unsplash.com/photo-1555854877-bab0e564b8d5?auto=format&fit=crop&q=80&w=400" },
  { id: "KH002", khachHang: "Khưu Ngọc Ý Vy", sdt: "0987654321", ngay: 21, gio: "08:30", loai: "Nhận phòng", trangThai: "Đã xử lý", maPhong: "201", ktx: "Chợ Quán", hinhAnh: "https://images.unsplash.com/photo-1555854877-bab0e564b8d5?auto=format&fit=crop&q=80&w=400" },
];

export default function CalendarPage() {
  const [currentDate, setCurrentDate] = useState(new Date(2026, 4, 1)); // Tháng 5, 2026
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);

  const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
  const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay();
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const paddingDays = Array.from({ length: firstDayOfMonth }, (_, i) => null);
  const today = 26;

  const prevMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));

  return (
    <div className="min-h-screen bg-background pt-24 pb-10 px-4 md:px-10">
      <div className="max-w-7xl mx-auto relative">
        <h1 className="text-2xl font-bold text-text1 text-center mb-6 uppercase">Lịch của tôi</h1>

        <div className="flex items-center mb-4">
          <div className="flex items-center space-x-2 bg-white rounded-lg px-4 py-2 shadow-sm border border-gray-200">
            <button onClick={prevMonth} className="hover:text-primary"><ChevronLeft size={20} /></button>
            <span className="font-medium text-text1">Tháng {currentDate.getMonth() + 1}, {currentDate.getFullYear()}</span>
            <button onClick={nextMonth} className="hover:text-primary"><ChevronRight size={20} /></button>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg shadow-sm">
          <div className="grid grid-cols-7 border-b border-gray-200 bg-gray-50">
            {['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'].map(day => (
              <div key={day} className="py-2 text-center text-sm font-medium text-text1 border-r last:border-r-0">{day}</div>
            ))}
          </div>

          <div className="grid grid-cols-7 auto-rows-fr">
            {paddingDays.map((_, index) => (
              <div key={`empty-${index}`} className="min-h-[120px] border-b border-r border-gray-100 bg-gray-50/50"></div>
            ))}
            
            {days.map(day => (
              <DayCell 
                key={day}
                day={day}
                isToday={day === today}
                dayTasks={mockTasks.filter(t => t.ngay === day)}
                currentDate={currentDate}
                selectedTaskId={selectedTaskId}
                onSelectTask={(task) => setSelectedTaskId(task ? task.id : null)}
              />
            ))}
          </div>
        </div>

        {selectedTaskId && (
          <div className="fixed inset-0 z-40" onClick={() => setSelectedTaskId(null)}></div>
        )}
      </div>
    </div>
  );
}
"use client";
import { MapPin } from "lucide-react";

export default function RoomAndScheduleInfo({ scheduleData }: { scheduleData: any }) {
  return (
    <>
      <h2 className="text-lg font-bold text-text2 mb-2">Thông tin phòng</h2>
      <div className="bg-base rounded-2xl p-6 relative flex flex-col md:flex-row gap-6 shadow-sm">
        <div className="w-full md:w-1/3">
          <img src="https://images.unsplash.com/photo-1522771731478-44eb10e5c8e9?auto=format&fit=crop&q=80&w=400" alt="Room" className="w-full h-48 object-cover rounded-lg mb-2" />
          <a href="#" className="flex items-center justify-center gap-1 text-text2 font-medium hover:text-text1">
            <MapPin size={16} /> Link GoogleMap
          </a>
        </div>

        <div className="flex-1 flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-start mb-4">
              <h3 className="font-bold text-lg text-text1 uppercase">Ký Túc Xá Chợ Quán - Phòng 302<br/>Giường <span className="font-normal">205, 206</span></h3>
              <button className="border border-text2 text-text2 px-3 py-1 rounded-full text-sm hover:bg-text2 hover:text-white transition">Xem chi tiết</button>
            </div>

            <div className="grid grid-cols-2 gap-y-2 text-sm text-text1">
              <p>Giá: <span className="text-accent">1tr2/tháng</span></p>
              <p>Wifi: free</p>
              <p>Điện: 4k/kWh</p>
              <p>Xe: 100k/xe</p>
              <p>Nước: 25k/m3</p>
              <p>Phí DV: 100k/ph</p>
            </div>
            <p className="text-text2 font-bold mt-4">Trạng thái: Đang chờ {scheduleData.loaiLich.toLowerCase()}</p>
          </div>

          <div className="flex flex-wrap items-center gap-2 mt-6">
            <div className="bg-text2 text-white px-4 py-2 rounded-lg text-sm flex-1 text-center font-medium">
              Lịch: {scheduleData.thoiGian}
            </div>
            
            {scheduleData.loaiLich !== 'Nhận phòng' && (
              <button className="bg-text1 text-white px-6 py-2 rounded-lg text-sm hover:bg-black transition">
                Hủy lịch
              </button>
            )}
            <button className="bg-text2 text-white px-6 py-2 rounded-lg text-sm hover:bg-text1 transition">
              Dời lịch
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
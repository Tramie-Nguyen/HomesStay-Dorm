"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft } from "lucide-react";

import CustomerInfo from "../../../../components/sale/thongtinthue/customerinfo";
import RoomAndScheduleInfo from "../../../../components/sale/thongtinthue/roominfo";
import DepositPopup from "../../../../components/sale/thongtinthue/popup";

export default function ThongTinThuePage() {
  const router = useRouter();
  const [showDepositPopup, setShowDepositPopup] = useState(false);
  
  // Data giả lập
  const scheduleData = { loaiLich: "Xem phòng", thoiGian: "08:00 04/05/2026" };
  const customerData = {
    ma: "KH001", ten: "Hình Diễm Xuân", sdt: "123456789", ngaySinh: "30/4/1995",
    cccd: "123456123", gioiTinh: "Nữ", email: "hdxuan.sv@gmail.com"
  };

  const handleConfirmDeposit = () => {
    setShowDepositPopup(false);
    alert("Đã chuyển hướng sang quy trình thanh toán đặt cọc!");
  };

  return (
    <div className="min-h-screen bg-background pt-24 pb-20 px-4 md:px-10 font-sans">
      <div className="max-w-4xl mx-auto relative">
        
        <div className="flex items-center mb-6">
          <button onClick={() => router.back()} className="text-accent hover:text-text1 transition p-2">
            <ChevronLeft size={28} />
          </button>
          <h1 className="text-xl md:text-2xl font-bold text-text1 absolute left-1/2 -translate-x-1/2 uppercase">
            Thông tin thuê
          </h1>
        </div>

        {/* Gọi các Components đã tách */}
        <CustomerInfo initialCustomer={customerData} />
        
        <RoomAndScheduleInfo scheduleData={scheduleData} />

        <div className="flex justify-center gap-4 mt-10">
          <button 
            onClick={() => setShowDepositPopup(true)}
            className="bg-accent text-white px-8 py-3 rounded-xl font-bold hover:bg-pink-600 transition shadow-lg"
          >
            Đặt cọc
          </button>
          <button className="bg-gray-500 text-white px-8 py-3 rounded-xl font-bold hover:bg-gray-600 transition shadow-lg">
            Kết thúc
          </button>
        </div>

      </div>

      <DepositPopup 
        isOpen={showDepositPopup} 
        onClose={() => setShowDepositPopup(false)} 
        onConfirm={handleConfirmDeposit} 
      />
    </div>
  );
}
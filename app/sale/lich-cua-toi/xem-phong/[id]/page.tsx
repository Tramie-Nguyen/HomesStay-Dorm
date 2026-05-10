"use client";

import { useEffect, useState } from "react";
import RoomCard from "@/components/room/roomCard";
import CustomerCard from "@/components/customer/CustomerCard";
import { useRouter, useParams } from "next/navigation";
import { RentalData } from "@/types/rental";
import ConfirmPopup from "./popup"; // Import modal mới

export default function RentalDetail() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const [data, setData] = useState<RentalData | null>(null);
  
  // States cho 2 chức năng mới
  const [openConfirmModal, setOpenConfirmModal] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const fetchData = async () => {
    try {
      const res = await fetch(`/api/rental/${id}`, {
        cache: "no-store",
      });

      if (!res.ok) {
        setData(null);
        return;
      }

      const json = await res.json();

      setData({
        ...json,
        GIUONGS: Array.isArray(json?.GIUONGS) ? json.GIUONGS : [],
      });
    } catch (err) {
      console.error("Fetch error:", err);
      setData(null);
    }
  };

  useEffect(() => {
    fetchData();
  }, [id]);

  // Hàm xử lý khi bấm nút "Kết thúc"
  const handleEndSchedule = async () => {
    if (!confirm("Bạn có chắc chắn muốn kết thúc lịch này?")) return;
    setIsProcessing(true);
    try {
      // Thay đổi endpoint này cho đúng với route API của bạn
      const res = await fetch(`/api/rental/${id}/status`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "Đã xử lý" }),
      });

      if (res.ok) {
        alert("Đã cập nhật trạng thái lịch thành 'Đã xử lý'!");
        fetchData(); // Load lại data
      } else {
        alert("Có lỗi xảy ra khi cập nhật trạng thái!");
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsProcessing(false);
    }
  };

  // Hàm xử lý khi chọn "Có" trong popup Đặt Cọc
  const handleCreateDeposit = async () => {
    setIsProcessing(true);
    try {
      // Gọi API tạo phiếu đặt cọc với thông tin phòng và khách hàng
      const res = await fetch(`/api/deposit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          MA_KH: data?.MA_KH,
          MA_PHONG: data?.MA_PHONG,
          MA_PHIEU: data?.MA_PHIEU,
          // Truyền thêm các trường cần thiết khác ở đây...
        }),
      });

      if (res.ok) {
        alert("Tạo phiếu đặt cọc thành công!");
        setOpenConfirmModal(false); // Đóng modal
        fetchData(); // Load lại data 
      } else {
        alert("Có lỗi xảy ra khi tạo phiếu đặt cọc!");
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsProcessing(false);
    }
  };

  if (!data) return <div>Loading...</div>;

  const beds = Array.isArray(data.GIUONGS) ? data.GIUONGS : [];

  return (
    <div className="min-h-screen bg-background px-20 relative pb-20">
      {/* BACK */}
      <button
        onClick={() => router.back()}
        className="text-[#FF4081] text-3xl cursor-pointer absolute top-4 left-20"
      >
        ←
      </button>

      <h2 className="text-center font-bold text-text1 text-xl pt-6 uppercase">THÔNG TIN THUÊ</h2>

      {/* ===== CUSTOMER ===== */}
      {/* Trong UI tham khảo, khối Thông tin khách nằm trên Thông tin phòng */}
      <div className="mt-6">
        <h3 className="font-semibold mb-2 text-text2">Thông tin khách</h3>
        <div className="border border-[#009BDE] rounded-2xl">
           <CustomerCard
            id={data.MA_KH}
            name={data.TEN_KH}
            code={data.MA_KH}
            phone={data.SDT}
            dob={data.NGAY_SINH}
            cccd={data.CCCD}
            gender={data.GIOI_TINH}
            email={data.EMAIL ?? "—"}
            startDate={data.NGAY_BD}
            endDate={data.NGAY_KT}
            contractStatus={data.TRANG_THAI_HOP_DONG}
            disableEdit={!!data.HOP_DONG_IMAGE && !!data.BIEN_BAN_IMAGE}
            scheduleType={data.LOAI}
            onRefresh={fetchData}
          />
        </div>
      </div>

      {/* ===== ROOM ===== */}
      <div className="mt-6">
        <h3 className="font-semibold mb-2 text-text2">Thông tin phòng</h3>
        <RoomCard
          maPhieu={data.MA_PHIEU}
          roomId={data.MA_PHONG}
          name={data.TEN_PHONG}
          bedCode={beds.map((g) => g.MA_GIUONG).join(", ")}
          totalPrice={data.TONG_TIEN}
          electricity={data.GIA_DIEN}
          water={data.GIA_NUOC}
          wifi={data.WIFI}
          vehicle={data.GUI_XE}
          service={data.DICH_VU}
          checkinTime={
            data.NGAY_GIO ? new Date(data.NGAY_GIO).toLocaleString("vi-VN") : ""
          }
          status={data.TRANG_THAI_PHONG}
          scheduleType={data.LOAI}
          scheduleStatus={data.TRANG_THAI_LICH}
          imageUrl="/room.png"
          onRefresh={fetchData}
        />
      </div>

      {/* ===== ACTIONS (ĐẶT CỌC / KẾT THÚC) ===== */}
      <div className="flex justify-center items-center gap-4 mt-10">
        <button
          onClick={() => setOpenConfirmModal(true)}
          disabled={isProcessing}
          className="bg-accent hover:bg-pink-600 text-white font-medium py-2 px-8 rounded-lg shadow-sm transition-all disabled:opacity-50"
        >
          Đặt cọc
        </button>
        <button
          onClick={handleEndSchedule}
          disabled={isProcessing}
          className="bg-grey hover:bg-gray-600 text-white font-medium py-2 px-8 rounded-lg shadow-sm transition-all disabled:opacity-50"
        >
          {isProcessing ? "Đang xử lý..." : "Kết thúc"}
        </button>
      </div>

      {/* ===== MODAL ĐẶT CỌC ===== */}
      <ConfirmPopup
        open={openConfirmModal}
        onClose={() => setOpenConfirmModal(false)}
        onConfirm={handleCreateDeposit}
        isProcessing={isProcessing}
      />
    </div>
  );
}
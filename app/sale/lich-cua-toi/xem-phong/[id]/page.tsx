"use client";

import { useEffect, useState } from "react";
import RoomCard from "@/components/room/roomCard";
import CustomerCard from "@/components/customer/CustomerCard";
import { useRouter, useParams } from "next/navigation";
import { RentalData } from "@/types/rental";
import ConfirmPopup from "./popup"; 
import * as depositService from "@/services/deposit";
import * as calendarService from "@/services/calendar";
import { toast } from "react-toastify"; // Đảm bảo bạn đã import toast

export default function RentalDetail() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const [data, setData] = useState<RentalData | null>(null);
  const [openConfirmModal, setOpenConfirmModal] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [maNv, setMaNv] = useState<string>("");

  // 1. Đưa localStorage vào useEffect để tránh lỗi SSR trên Next.js
  useEffect(() => {
    if (typeof window !== "undefined") {
      const storedData = localStorage.getItem("auth");
      if (storedData) {
        try {
          const parsedData = JSON.parse(storedData);
          if (parsedData?.user?.MA_NV) {
            setMaNv(parsedData.user.MA_NV);
          }
        } catch (e) {
          console.error("Lỗi parse localStorage:", e);
        }
      }
    }
  }, []);

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
      const giuongs = Array.isArray(json?.GIUONGS) ? json.GIUONGS : [];

      // 2. Tính toán tổng tiền ngay khi lấy được dữ liệu chính xác từ API
      const tongTienCalc = depositService.calculateDepositAmount(
        giuongs.map((g: any) => g.GIA)
      );

      setData({
        ...json,
        GIUONGS: giuongs,
        TONG_TIEN: tongTienCalc, // Gán trực tiếp vào state
      });
    } catch (err) {
      console.error("Fetch error:", err);
      setData(null);
    }
  };

  useEffect(() => {
    if (id) {
      fetchData();
    }
  }, [id]);

  // 3. Nếu data là null thì dừng render tại đây (tránh lỗi truy cập thuộc tính phía dưới)
  if (!data) return <div className="min-h-screen bg-background flex items-center justify-center font-medium text-text1">Loading...</div>;

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

      {/* ===== ACTIONS ===== */}
      <div className="flex justify-center items-center gap-4 mt-10">
        <button
          onClick={() => setOpenConfirmModal(true)}
          disabled={isProcessing}
          className="bg-accent hover:bg-pink-600 text-white font-medium py-2 px-8 rounded-lg shadow-sm transition-all disabled:opacity-50 cursor-pointer"
        >
          Đặt cọc
        </button>
        <button
          onClick={() => calendarService.handleCapNhatLich(data.MA_PHIEU, 'Đã xử lý', setIsProcessing, fetchData)}
          disabled={isProcessing}
          className="bg-grey hover:bg-gray-600 text-white font-medium py-2 px-8 rounded-lg shadow-sm transition-all disabled:opacity-50 cursor-pointer"
        >
          {isProcessing ? "Đang xử lý..." : "Kết thúc"}
        </button>
      </div>

      {/* ===== MODAL ĐẶT CỌC ===== */}
      <ConfirmPopup
        open={openConfirmModal}
        onClose={() => setOpenConfirmModal(false)}
        onConfirm={async () => {
          if (!maNv) {
            toast.error("Không tìm thấy thông tin nhân viên, vui lòng đăng nhập lại!");
            return;
          }

          setIsProcessing(true);
          try {
            const result = await depositService.handleCreateDeposit({
              soTien: data.TONG_TIEN,
              maKh: data.MA_KH,
              maNv: maNv
            });

            setOpenConfirmModal(false);
            toast.success("Tạo phiếu đặt cọc thành công!");

            // Chuyển sang trang hoàn tất thanh toán đặt cọc (trang có QR code)
            if (result && result.maPdc) {
              router.push(`/sale/dat-coc/${result.maPdc}`); 
            } else {
              toast.error("Không nhận được mã phiếu đặt cọc để chuyển trang!");
              fetchData(); // Reset lại data nếu không chuyển trang
            }
          } catch (error) {
            console.error("Error during deposit:", error);
            // toast.error đã được gọi bên trong service nên không cần gọi lại ở đây
          } finally {
            setIsProcessing(false);
          }
        }}
        isProcessing={isProcessing}
      />
    </div>
  );
}
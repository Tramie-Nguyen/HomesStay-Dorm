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

export interface RentalCalendarData {
  // ===== LỊCH =====
  id: string;
  NGAY_GIO: string;

  ngay: number;
  gio: string;

  loai: string;
  trangThai: string;

  maPdk: string | null;
  maPdc: string | null;

  // ===== KHÁCH HÀNG =====
  maKh: string;
  khachHang: string;
  sdt: string;
  cccd: string;
  gioiTinh: string;
  ngaySinh: string;

  // ===== PHÒNG =====
  maKtx: string;
  tenKtx: string;

  maPhong: string;

  hinhAnhPhong: string | null;
  moTaPhong: string | null;
  trangThaiPhong: string;

  SL_GIUONG: number;
  SL_GIUONG_TRONG: number;

  // ===== DỊCH VỤ =====
  GIA_DIEN: number;
  GIA_NUOC: number;
  WIFI: string;
  GUI_XE: number;
  DICH_VU: number;

  // ===== NHÂN VIÊN =====
  maNv: string;
  tenNv: string;

  // ===== PHIẾU =====
  HINH_THUC_THUE: string | null;

  SO_TIEN: number | null;
  trangThaiDatCoc: string | null;

  // ===== GIƯỜNG =====
  GIUONGS: {
    MA_GIUONG: string;
    GIA: number;
  }[];

  // ===== FE =====
  TONG_TIEN: number;
}

export default function RentalDetail() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const [data, setData] = useState<RentalCalendarData | null>(null);
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
      const res = await calendarService.handleLayChiTietLich(id);

      if (!res) {
        setData(null);
        return;
      }
      const giuongs = Array.isArray(res?.GIUONGS) ? res.GIUONGS : [];

      // 2. Tính toán tổng tiền ngay khi lấy được dữ liệu chính xác từ API
      const tongTienCalc = depositService.calculateDepositAmount(
        giuongs.map((g: any) => g.GIA)
      );

      setData({
        ...res,
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
            id={data.maKh}
            name={data.khachHang}
            code={data.maKh}
            phone={data.sdt}
            dob={data.ngaySinh}
            cccd={data.cccd}
            gender={data.gioiTinh}
            email={"—"}
            scheduleType={data.loai}
            onRefresh={fetchData}
          />
        </div>
      </div>

      {/* ===== ROOM ===== */}
      <div className="mt-6">
        <h3 className="font-semibold mb-2 text-text2">Thông tin phòng</h3>
        <RoomCard
          maPhieu={data.id}
          roomId={data.maPhong}
          name={data.tenKtx}
          beds={beds}
          bedCode={beds.map((g) => g.MA_GIUONG).join(", ")}
          totalPrice={data.TONG_TIEN}
          electricity={data.GIA_DIEN}
          water={data.GIA_NUOC}
          wifi={data.WIFI}
          vehicle={data.GUI_XE}
          service={data.DICH_VU}
          checkinTime={
            data.NGAY_GIO
              ? new Date(data.NGAY_GIO).toLocaleString("vi-VN")
              : ""
          }
          status={data.trangThaiPhong}
          imageUrl={data.hinhAnhPhong || "/room.png"}
          mapLink=""
          canChangeSchedule={
            data.trangThai !== "Đã xử lý"
          }
          scheduleType={data.loai}
          scheduleStatus={data.trangThai}
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
            // Tạo phiếu đặt cọc
            const result = await depositService.handleCreateDeposit({
              soTien: data.TONG_TIEN,
              maKh: data.maKh,
              maNv: maNv
            });

            setOpenConfirmModal(false);
            toast.success("Tạo phiếu đặt cọc thành công!");

            // thêm pdc vào lịch
            await calendarService.handleThemPdcVaoLich(data.id, result.maPdc, setIsProcessing, fetchData);
            // cập nhật trạng thái lịch
            await calendarService.handleCapNhatLich(data.id, 'Đã xử lý', setIsProcessing, fetchData);

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
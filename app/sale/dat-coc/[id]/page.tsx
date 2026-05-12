"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import DatePicker from "@/components/common/datepicker";
import TimePicker from "@/components/common/timepicker";
import { toast } from "react-toastify";
import * as paymentService from "@/services/payment";
import * as depositService from "@/services/deposit";
import * as calendarService from "@/services/calendar";

interface DepositData {
  MA_PDC: string;
  SO_TIEN: number;
  TRANG_THAI: string;
  KHACH_HANG: {
    MA_KH: string;
    TEN_KH: string;
    SDT: string;
    NGAY_SINH: string;
    CCCD: string;
    GIOI_TINH: string;
    EMAIL: string;
  };
  PHONG: {
    MA_KTX: string;
    TEN_KTX: string;
    MA_PHONG: string;
    GIUONGS: string[];
    GIA_DIEN: number;
    GIA_NUOC: number;
    WIFI: number;
    DICH_VU: number;
    GUI_XE: number;
  };
  onFresh?: () => void; // Hàm này sẽ được gọi sau khi cập nhật trạng thái lịch
  onClose?: () => void; // Hàm này sẽ được gọi sau khi hoàn tất xử lý
}

export default function DepositPage() {
  const params = useParams();
  const router = useRouter();
  const maPdc = params.id as string;

  const [data, setData] = useState<DepositData | null>(null);
  const [loading, setLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);

  // Form states
  const [phuongThuc, setPhuongThuc] = useState<"Tiền mặt" | "QR">("QR");
  const [ngayNhan, setNgayNhan] = useState<Date | null>(new Date());
  const [gioNhan, setGioNhan] = useState<string>("08:00");

  // 1. Fetch dữ liệu phiếu đặt cọc vừa khởi tạo
  useEffect(() => {
    const fetchDepositDetail = async () => {
      try {
        const res = await depositService.handleGetDepositDetail(maPdc);
        setData(res);
      } catch (err) {
        console.error(err);
        alert("Lỗi tải dữ liệu phiếu đặt cọc!");
      } finally {
        setLoading(false);
      }
    };
    if (maPdc) fetchDepositDetail();
  }, [maPdc]);

  // Thông tin tạo VietQR động
  const bankAccount = "123456789"; // Thay bằng STK của bạn
  const bankId = "techcombank"; // Mã ngân hàng
  const qrUrl = data
    ? `https://img.vietqr.io/image/${bankId}-${bankAccount}-compact2.png?amount=${data.SO_TIEN}&addInfo=DATCOC%20${data.MA_PDC}`
    : "";

  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center text-lg font-medium">
        Đang tải dữ liệu...
      </div>
    );
  if (!data)
    return (
      <div className="min-h-screen flex items-center justify-center text-red-500">
        Dữ liệu không hợp lệ!
      </div>
    );

  return (
    <div className="min-h-screen bg-[#eafaf9] p-8 text-gray-800 font-inter pb-20">
      <button
        onClick={() => router.back()}
        className="text-[#FF4081] text-3xl font-bold mb-4 block cursor-pointer"
      >
        ←
      </button>

      <h1 className="text-center font-bold text-text1 text-xl pt-6 mb-8 uppercase tracking-wide">
        ĐẶT CỌC
      </h1>

      <div className="lg:col-span-8 flex flex-col justify-between bg-white rounded-3xl p-8 shadow-sm border border-base">
        {/* THÔNG TIN KHÁCH & PHÒNG */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8 border-b border-base pb-6">
          <div className="bg-base p-5 rounded-xl border border-[#d8f3f0]">
            <h2 className="font-bold text-text2 text-base mb-3 border-b pb-2 border-[#d8f3f0]">
              Thông tin khách hàng
            </h2>
            <div className="space-y-2 text-sm">
              <p className="font-bold text-base text-gray-900">{data.KHACH_HANG.TEN_KH}</p>
              <p><span className="text-text1">Mã KH:</span> {data.KHACH_HANG.MA_KH}</p>
              <p><span className="text-text1">SĐT:</span> {data.KHACH_HANG.SDT}</p>
              <p><span className="text-text1">Ngày sinh:</span> {data.KHACH_HANG.NGAY_SINH}</p>
              <p><span className="text-text1">CCCD:</span> {data.KHACH_HANG.CCCD}</p>
              <p><span className="text-text1">Giới tính:</span> {data.KHACH_HANG.GIOI_TINH}</p>
              <p><span className="text-text1">Email:</span> {data.KHACH_HANG.EMAIL || "—"}</p>
            </div>
          </div>

          <div className="bg-base p-5 rounded-xl border border-[#d8f3f0]">
            <h2 className="font-bold text-text2 text-base mb-3 border-b pb-2 border-[#d8f3f0]">
              Thông tin phòng thuê
            </h2>
            <div className="space-y-2 text-sm">
              <p className="font-bold text-base text-gray-900">
                {data.PHONG.TEN_KTX}
              </p>
              <p>
                <span className="text-text1">Phòng:</span> {data.PHONG.MA_PHONG}
              </p>
              <p>
                <span className="text-text1">Giường:</span>{" "}
                <span className="font-semibold text-[#FF4081]">
                  {data.PHONG.GIUONGS.join(", ")}
                </span>
              </p>
              <p>
                <span className="text-text1">Giá điện:</span>{" "}
                {data.PHONG.GIA_DIEN?.toLocaleString()}đ/kwh
              </p>
              <p>
                <span className="text-text1">Giá nước:</span>{" "}
                {data.PHONG.GIA_NUOC?.toLocaleString()}đ/khối
              </p>
              <p>
                <span className="text-text1">Wi-Fi:</span>{" "}
                {data.PHONG.WIFI?.toLocaleString()}đ/tháng
              </p>
              <p>
                <span className="text-text1">Dịch vụ:</span>{" "}
                {data.PHONG.DICH_VU?.toLocaleString()}đ/tháng
              </p>
              <p>
                <span className="text-text1">Gửi xe:</span>{" "}
                {data.PHONG.GUI_XE?.toLocaleString()}đ/tháng
              </p>
            </div>
          </div>
        </div>

        {/* THÔNG TIN TIỀN CỌC & PHƯƠNG THỨC */}
        <div className="bg-base p-6 rounded-xl border border-[#d8f3f0] mb-8">
          <h2 className="font-bold text-text2 text-base mb-4">
            Chi tiết thanh toán
          </h2>

          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 bg-white p-4 rounded-lg border border-gray-100 shadow-sm">
            <div>
              <p className="text-sm text-gray-500">
                Tổng tiền đặt cọc cần thanh toán
              </p>
              <p className="text-2xl font-extrabold text-accent mt-0.5">
                {data.SO_TIEN.toLocaleString("vi-VN")} VND
              </p>
            </div>

            {/* CHỌN PHƯƠNG THỨC */}
            <div className="flex items-center gap-2 bg-gray-100 p-1 rounded-lg">
              <button
                type="button"
                onClick={() => setPhuongThuc("Tiền mặt")}
                className={`px-4 py-2 rounded-md text-xs font-bold transition-all ${
                  phuongThuc === "Tiền mặt"
                    ? "bg-[#208b81] text-white shadow-md"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                Tiền mặt
              </button>
              <button
                type="button"
                onClick={() => setPhuongThuc("QR")}
                className={`px-4 py-2 rounded-md text-xs font-bold transition-all ${
                  phuongThuc === "QR"
                    ? "bg-[#208b81] text-white shadow-md"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                Chuyển khoản
              </button>
            </div>
          </div>

          {/* CHỌN NGÀY GIỜ NHẬN PHÒNG */}
          <div className="border-t border-[#d8f3f0] pt-4">
            <p className="font-semibold text-sm mb-3 text-gray-700">
              Dự kiến thời gian nhận phòng:
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-md">
              <div className="flex items-center gap-2">
                <span className="text-xs font-medium text-gray-500 w-10">
                  Ngày:
                </span>
                <div className="flex-1">
                  <DatePicker value={ngayNhan} onChange={setNgayNhan} />
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-medium text-gray-500 w-10">
                  Giờ:
                </span>
                <div className="flex-1">
                  <TimePicker value={gioNhan} onChange={setGioNhan} />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* QR CODE DÀNH CHO CHUYỂN KHOẢN */}
        {phuongThuc === "QR" && (
          <div className="flex flex-col items-center justify-center bg-white p-6 rounded-xl border-2 border-dashed border-[#208b81] mb-8 animate-fadeIn">
            <div className="p-2 bg-white shadow-md rounded-lg border">
              <img
                src={qrUrl}
                alt="VietQR"
                className="w-64 h-64 object-contain"
              />
            </div>
            <p className="text-xs text-gray-500 mt-3 font-Inter bg-gray-50 px-3 py-1 rounded border">
              Nội dung CK:{" "}
              <strong className="text-gray-800">DATCOC {data.MA_PDC}</strong>
            </p>
          </div>
        )}

        {/* HỆ THỐNG NÚT */}
        <div className="flex justify-center gap-6 mt-4">
          <button
            type="button"
            disabled={isProcessing}
            onClick={async () => {
              if (!ngayNhan || !gioNhan || !data) {
                toast.error(
                  "Vui lòng chọn đầy đủ ngày giờ và đảm bảo dữ liệu phiếu đặt cọc hợp lệ.",
                );
                return;
              }

              setIsProcessing(true);
              try {
                const result = await paymentService.handleCreatePayment({
                  hinhThuc: phuongThuc,
                  soTien: data.SO_TIEN,
                  trangThai: "Đã thanh toán",
                  maHd: null,
                  ma_Pdc: data.MA_PDC,
                });
                const changePDCstatus =
                  await depositService.changeDepositStatus(
                    data.MA_PDC,
                    "Đã đặt cọc",
                  );
                if (result?.success) {
                  toast.success("Ghi nhận thanh toán sau thành công.");
                  router.push("/sale/lich-cua-toi");
                } else {
                  toast.error(
                    result?.error || "Lỗi khi ghi nhận thanh toán sau.",
                  );
                }
              } catch (error) {
                console.error(error);
                toast.error("Lỗi kết nối đến máy chủ.");
              } finally {
                setIsProcessing(false);
              }
            }}
            className="bg-accent hover:bg-[#e0356f] text-white font-semibold px-10 py-3 rounded-xl shadow-lg transition-all disabled:opacity-50 w-48 text-center cursor-pointer"
          >
            {isProcessing ? "Đang xử lý..." : "Hoàn tất"}
          </button>

          <button
            type="button"
            disabled={isProcessing}
            onClick={async () => {
              if (!ngayNhan || !gioNhan || !data) {
                toast.error(
                  "Vui lòng chọn đầy đủ ngày giờ và đảm bảo dữ liệu phiếu đặt cọc hợp lệ.",
                );
                return;
              }

              setIsProcessing(true);
              try {
                const result = await paymentService.handleCreatePayment({
                  hinhThuc: phuongThuc,
                  soTien: data.SO_TIEN,
                  trangThai: "Chưa thanh toán",
                  maHd: null,
                  ma_Pdc: data.MA_PDC,
                });

                if (result?.success) {
                  toast.success("Ghi nhận thanh toán sau thành công.");
                  router.push("/sale/lich-cua-toi");
                } else {
                  toast.error(
                    result?.error || "Lỗi khi ghi nhận thanh toán sau.",
                  );
                }
              } catch (error) {
                console.error(error);
                toast.error("Lỗi kết nối đến máy chủ.");
              } finally {
                setIsProcessing(false);
              }
            }}
            className="bg-grey hover:bg-gray-700 text-white font-semibold px-10 py-3 rounded-xl shadow-lg transition-all disabled:opacity-50 w-48 text-center cursor-pointer"
          >
            Thanh toán sau
          </button>
        </div>
      </div>
    </div>
  );
}

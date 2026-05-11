"use client";

import { useEffect, useState } from "react";
import RoomCard from "@/components/room/roomCard";
import CustomerCard from "@/components/customer/CustomerCard";
import { useRouter, useParams } from "next/navigation";
import { RentalData } from "@/types/rental";
import HandoverModal from "@/components/room/HandoverModal";
import Image from "next/image";
import { getRentalDetail } from "@/services/rental";

export default function RentalDetail() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const [data, setData] = useState<RentalData | null>(null);
  const [openHandover, setOpenHandover] = useState(false);

  const fetchData = async () => {
    setData(await getRentalDetail(id));
  };

  useEffect(() => {
    const loadInitialData = async () => {
      if (!id) return;

      setData(await getRentalDetail(id));
    };

    loadInitialData();
  }, [id]);

  if (!data) return <div>Loading...</div>;

  console.log("Rental data received:", data);
  console.log("GIUONGS data:", data.GIUONGS);

  const canHandover = !!data.MA_HOP_DONG;
  const beds = Array.isArray(data.GIUONGS) ? data.GIUONGS : [];
  const contractStatus =
    data.HOP_DONG_IMAGE && data.BIEN_BAN_IMAGE ? "Đã ký" : "Chưa ký";
  const roomStatus =
    data.HOP_DONG_IMAGE && data.BIEN_BAN_IMAGE
      ? "Đã bàn giao"
      : "Đang chờ bàn giao";

  return (
    <div className="min-h-screen bg-background px-40">
      {/* BACK */}
      <button
        onClick={() => router.back()}
        className="text-accent text-3xl cursor-pointer"
      >
        ←
      </button>

      <h2 className="text-center font-bold text-text1">THÔNG TIN THUÊ</h2>

      {/* ===== ROOM ===== */}
      <div>
        <h3 className="font-semibold mb-2 text-text2">Thông tin phòng</h3>

        <RoomCard
          maPhieu={data.MA_PHIEU}
          roomId={data.MA_PHONG}
          name={data.TEN_PHONG}
          beds={beds}
          totalPrice={data.TONG_TIEN}
          electricity={data.GIA_DIEN}
          water={data.GIA_NUOC}
          wifi={data.WIFI}
          vehicle={data.GUI_XE}
          service={data.DICH_VU}
          checkinTime={
            data.NGAY_GIO ? new Date(data.NGAY_GIO).toLocaleString("vi-VN") : ""
          }
          status={roomStatus}
          scheduleType={data.LOAI}
          scheduleStatus={data.TRANG_THAI_LICH}
          imageUrl="/room.png"
          onRefresh={fetchData}
        />
      </div>

      {/* ===== CUSTOMER ===== */}
      <div className="mt-6">
        <h3 className="font-semibold mb-2 text-text2">Thông tin khách</h3>

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
          contractStatus={contractStatus}
          onRefresh={fetchData}
          disableEdit={!!data.HOP_DONG_IMAGE && !!data.BIEN_BAN_IMAGE}
          scheduleType={data.LOAI}
        />
      </div>

      {(data.HOP_DONG_IMAGE || data.BIEN_BAN_IMAGE) && (
        <div className="mt-6">
          <h3 className="font-semibold mb-2 text-text2">Tài liệu</h3>

          <div className="flex gap-6">
            {data.HOP_DONG_IMAGE && (
              <div>
                <p className="text-sm mb-1">Hợp đồng</p>
                <Image
                  src={
                    data.HOP_DONG_IMAGE?.startsWith("/")
                      ? data.HOP_DONG_IMAGE
                      : `/${data.HOP_DONG_IMAGE}`
                  }
                  alt="Hợp đồng"
                  width={160}
                  height={112}
                  className="object-cover rounded-lg border"
                />
                <a
                  href={
                    data.HOP_DONG_IMAGE?.startsWith("/")
                      ? data.HOP_DONG_IMAGE
                      : `/${data.HOP_DONG_IMAGE}`
                  }
                  download
                  className="text-accent hover:underline mt-1 block"
                >
                  Tải xuống
                </a>
              </div>
            )}

            {data.BIEN_BAN_IMAGE && (
              <div>
                <p className="text-sm mb-1">Biên bản</p>
                <Image
                  src={
                    data.BIEN_BAN_IMAGE?.startsWith("/")
                      ? data.BIEN_BAN_IMAGE
                      : `/${data.BIEN_BAN_IMAGE}`
                  }
                  alt="Biên bản"
                  width={160}
                  height={112}
                  className="object-cover rounded-lg border"
                />
                <a
                  href={
                    data.BIEN_BAN_IMAGE?.startsWith("/")
                      ? data.BIEN_BAN_IMAGE
                      : `/${data.BIEN_BAN_IMAGE}`
                  }
                  download
                  className="text-accent hover:underline mt-1 block"
                >
                  Tải xuống
                </a>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ===== ACTION ===== */}
      <div className="flex flex-col items-center mt-6 gap-2 pb-6">
        {data.HOP_DONG_IMAGE && data.BIEN_BAN_IMAGE ? (
          <button
            onClick={() => setOpenHandover(true)}
            className="bg-accent text-white px-6 py-2 rounded-lg"
          >
            Chỉnh sửa tài liệu
          </button>
        ) : (
          <button
            onClick={() => setOpenHandover(true)}
            className="bg-accent text-white px-6 py-2 rounded-lg"
          >
            Bàn giao phòng
          </button>
        )}
      </div>

      {/* ===== HANDOVER MODAL ===== */}
      <HandoverModal
        open={openHandover}
        onClose={() => setOpenHandover(false)}
        rentalId={data.MA_PHIEU}
      />
    </div>
  );
}

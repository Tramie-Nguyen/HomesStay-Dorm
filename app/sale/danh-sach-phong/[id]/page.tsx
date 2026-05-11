"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import { formatGiaRange, formatGia } from "@/lib/format";

interface Bed {
  id: string;
  status: "Đã thuê" | "Trống";
  price: number;
}

interface RoomDetail {
  id: string;
  code: string;

  totalBeds: number;
  availableBeds: number;
  status: "Còn chỗ" | "Hết chỗ";

  imageUrl: string | null;

  ktxName: string;
  address: string;
  quyDinh: string;

  moTaPhong: string;

  giaMin: number;
  giaMax: number;

  giaDien: number;
  giaNuoc: number;
  wifi: number;
  guiXe: number;
  dichVu: number;

  beds: Bed[];
}

export default function ChiTietPhongPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [room, setRoom] = useState<RoomDetail | null>(null);
  const [loading, setLoading] = useState(true);

  const handleBookingRedirect = () => {
    // Chuyển hướng sang trang đặt lịch kèm theo ID phòng
    router.push(`/sale/dat-lich-xem-phong?roomId=${id}`);
  };
  useEffect(() => {
    fetch(`/api/phong/${id}`)
      .then((res) => res.json())
      .then(({ room }) => setRoom(room))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [id]);

  // Xử lý danh sách mô tả (Số giường, Vệ sinh, Vị trí, Tiện nghi + Giá chi tiết từng giường)
  // Loại bỏ logic map giá cũ trong roomDescriptionItems
  const roomDescriptionItems = useMemo(() => {
    if (!room) return [];
    // Chỉ lấy thông tin cơ bản: Số giường, vệ sinh, vị trí, tiện nghi
    return room.moTaPhong ? room.moTaPhong.split(/\r?\n/).filter(Boolean) : [];
  }, [room]);

  if (loading) return <p className="py-20 text-center">Đang tải...</p>;
  if (!room) return <p className="py-20 text-center">Không tìm thấy phòng</p>;

  return (
    <div
      className="min-h-screen bg-background
     px-6 py-8"
    >
      <div className="mx-auto max-w-5xl">
        {/* <button onClick={() => router.back()} className="mb-4 text-pink-500">
          <ChevronLeft size={40} />
        </button> */}

        <h1 className="mb-6 text-2xl font-bold text-text1">
          {room.ktxName.toUpperCase()} - PHÒNG {room.code}
        </h1>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1.2fr_0.8fr]">
          {/* Khung ảnh */}
          <div className="relative rounded-3xl bg-base p-8 flex items-center justify-center">
            <div className="relative w-full aspect-[4/3] overflow-hidden rounded-lg shadow-sm">
              <Image
                src={room.imageUrl ? `/${room.imageUrl}` : "/room.png"}
                alt="Room"
                fill
                className="object-cover"
              />
            </div>
          </div>

          {/* Thông tin nhanh */}
          <div className="space-y-5 text-lg">
            <p>
              <span className="font-bold text-text2">Giường trống:</span>{" "}
              {room.availableBeds}/{room.totalBeds}
            </p>
            <p>
              <span className="font-bold text-text2">Giá:</span>{" "}
              <span className="font-bold text-accent">
                {formatGiaRange(room.giaMin, room.giaMax)}
              </span>
            </p>
            <p>
              <span className="font-bold text-text2">Đối tượng:</span>{" "}
              {room.quyDinh?.includes("nữ") ? "Chỉ nữ" : "Chỉ nam"}
            </p>
            <p>
              <span className="font-bold text-text2">Địa chỉ:</span>{" "}
              {room.address}
            </p>
            <button
              onClick={handleBookingRedirect}
              disabled={room.availableBeds === 0}
              className={`w-full rounded-xl py-3 text-xl font-bold text-white shadow-sm transition-colors
    ${
      room.availableBeds === 0
        ? "bg-grey cursor-not-allowed"
        : "bg-accent hover:bg-pink-600"
    }`}
            >
              ĐẶT LỊCH XEM PHÒNG
            </button>
          </div>
        </div>

        {/* Section MÔ TẢ */}
        <section className="mt-10">
          <h2 className="mb-3 text-xl font-bold text-text1">MÔ TẢ</h2>
          <div className="rounded-3xl bg-base p-8 shadow-sm">
            <ul className="space-y-3">
              {roomDescriptionItems.map((item, index) => (
                <li key={index} className="flex items-start gap-2 text-text1">
                  <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-black" />
                  <span>
                    {item.includes(":") ? (
                      <>
                        <span className="underline font-semibold">
                          {item.split(":")[0]}
                        </span>
                        :{item.split(":")[1]}
                      </>
                    ) : (
                      item
                    )}
                  </span>
                </li>
              ))}
              <ul className="space-y-3 text-[18px] leading-relaxed text-text1">
                {/* 1. HIỂN THỊ THÔNG TIN CƠ BẢN (Số giường, vệ sinh...) */}
                {roomDescriptionItems.map((item, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <span className="mt-2.5 h-1.5 w-1.5 shrink-0 rounded-full bg-black" />
                    <span>
                      {item.includes(":") ? (
                        <>
                          <span className="underline font-semibold">
                            {item.split(":")[0]}
                          </span>
                          :{item.split(":")[1]}
                        </>
                      ) : (
                        item
                      )}
                    </span>
                  </li>
                ))}

                {/* 2. HIỂN THỊ GIÁ THUÊ CHI TIẾT TỪNG GIƯỜNG */}
                <li className="flex items-start gap-2">
                  <span className="mt-2.5 h-1.5 w-1.5 shrink-0 rounded-full bg-black" />
                  <div className="flex flex-wrap items-baseline gap-x-1">
                    <span className="underline font-semibold">Giá thuê</span>
                    <span>:</span>
                    <div className="ml-4 mt-1 space-y-1">
                      {room.beds.map((bed, idx) => (
                        <div key={bed.id}>
                          Giường {idx + 1}: {formatGia(bed.price)}/tháng{" "}
                          <span
                            className={
                              bed.status === "Đã thuê"
                                ? "text-grey"
                                : "text-accent font-medium"
                            }
                          >
                            ({bed.status === "Đã thuê" ? "Đã thuê" : "Trống"})
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </li>

                {/* 3. HIỂN THỊ CHI PHÍ DỊCH VỤ (Lấy từ thongTinChiPhi) */}
                <li className="flex items-start gap-2">
                  <span className="mt-2.5 h-1.5 w-1.5 shrink-0 rounded-full bg-black" />
                  <span>
                    <span className="underline font-semibold">Giá điện</span>:{" "}
                    {formatGia(room.giaDien)}/kWh
                  </span>
                </li>

                <li className="flex items-start gap-2">
                  <span className="mt-2.5 h-1.5 w-1.5 shrink-0 rounded-full bg-black" />
                  <span>
                    <span className="underline font-semibold">Giá nước</span>:{" "}
                    {formatGia(room.giaNuoc)}/m³
                  </span>
                </li>

                <li className="flex items-start gap-2">
                  <span className="mt-2.5 h-1.5 w-1.5 shrink-0 rounded-full bg-black" />
                  <span>
                    <span className="underline font-semibold">Wifi</span>:{" "}
                    {formatGia(room.wifi)}/tháng
                  </span>
                </li>

                <li className="flex items-start gap-2">
                  <span className="mt-2.5 h-1.5 w-1.5 shrink-0 rounded-full bg-black" />
                  <span>
                    <span className="underline font-semibold">Gửi xe</span>:{" "}
                    {formatGia(room.guiXe)}/tháng
                  </span>
                </li>

                <li className="flex items-start gap-2">
                  <span className="mt-2.5 h-1.5 w-1.5 shrink-0 rounded-full bg-black" />
                  <span>
                    <span className="underline font-semibold">Dịch vụ</span>:{" "}
                    {formatGia(room.dichVu)}/tháng
                  </span>
                </li>
              </ul>
            </ul>
          </div>
        </section>

        {/* Section QUY ĐỊNH */}
        <section className="mt-10">
          <h2 className="mb-3 text-xl font-bold text-text1">QUY ĐỊNH KTX</h2>
          <div className="rounded-3xl bg-base p-8 shadow-sm">
            <ul className="space-y-3">
              {room.quyDinh
                ?.split(/\r?\n/)
                .filter(Boolean)
                .map((item, index) => (
                  <li key={index} className="flex items-start gap-2 text-text1">
                    <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-black" />
                    <span
                      className={
                        item.includes("nữ") || item.includes("nam")
                          ? "font-bold"
                          : ""
                      }
                    >
                      {item}
                    </span>
                  </li>
                ))}
            </ul>
          </div>
        </section>
      </div>
    </div>
  );
}

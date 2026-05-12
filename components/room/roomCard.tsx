"use client";

import { useRouter } from "next/navigation";
import { MapPin } from "lucide-react";
import { useState } from "react";
import ChangeScheduleModal from "../room/ChangeScheduleModal";
import CancelScheduleModal from "./CancelScheduleModal";
import Image from "next/image";

interface RoomCardProps {
  maPhieu: string;
  roomId: string;
  name: string;

  beds?: { MA_GIUONG: string; GIA: number }[];
  bedCode?: string;
  totalPrice?: number;

  electricity: number;
  water: number;

  wifi: string;
  vehicle: number;
  service: number;

  checkinTime: string;
  status: string;

  imageUrl?: string | null;
  mapLink?: string;
  onRefresh?: () => void;
  canChangeSchedule?: boolean;
  scheduleType?: string; // Thêm loại lịch (Xem phòng / Nhận phòng)
  scheduleStatus?: string; // Thêm trạng thái lịch
}

export default function RoomCard({
  maPhieu,
  roomId,
  name,
  beds,
  bedCode,
  totalPrice,
  electricity,
  water,
  wifi,
  vehicle,
  service,
  checkinTime,
  status,
  imageUrl,
  mapLink,
  onRefresh,
  canChangeSchedule,
  scheduleType,
  scheduleStatus,
}: RoomCardProps) {
  const router = useRouter();
  const [openModal, setOpenModal] = useState(false);
  const [openCancelModal, setOpenCancelModal] = useState(false);

  console.log("RoomCard beds prop:", beds);

  const formatMoney = (value?: number) =>
    value ? value.toLocaleString("vi-VN") + "đ" : "—";

  const isChuaXuLy =
    scheduleStatus?.trim().normalize() === "Chưa xử lý".normalize();
  const isXemPhong =
    scheduleType?.trim().normalize() === "Xem phòng".normalize();

  return (
    <>
      <div className="bg-base rounded-2xl p-4 flex gap-4">
        <Image
          src={
            imageUrl
              ? imageUrl.startsWith("/")
                ? imageUrl
                : `/${imageUrl}`
              : "/room.png"
          }
          alt={name}
          width={192}
          height={128}
          className="w-80 h-80 object-cover rounded-xl"
        />

        <div className="flex-1 text-text1 text-sm px-6">
          <div className="flex justify-between">
            <div>
              <p className="font-semibold text-lg text-text1">{name}</p>
            </div>

            <button
              onClick={() => router.push(`/chi-tiet-phong/${roomId}`)}
              className="border text-lg cursor-pointer border-text2 px-4 rounded-full text-text2 hover:bg-text2 hover:text-white transition"
            >
              Xem chi tiết
            </button>
          </div>

          <div className="mt-2">
            <div>
              {beds && beds.length > 0 ? (
                <>
                  <p className="text-text1">
                    <span className=" text-text1 text-lg">Giường:</span>
                  </p>
                  {beds.map((bed) => (
                    <p key={bed.MA_GIUONG} className=" text-text2">
                      {bed.MA_GIUONG} - {formatMoney(bed.GIA)}
                    </p>
                  ))}
                  <p className="mt-2 text-lg text-text1">
                    Tổng giá:{" "}
                    <span className="text-accent font-semibold">
                      {formatMoney(totalPrice)}
                    </span>
                  </p>
                </>
              ) : (
                <>
                  <p className="text-lg">Mã giường: {bedCode || "—"}</p>
                  <p className="mt-2 text-text1 text-lg">
                    Giá:{" "}
                    <span className="text-accent font-semibold">
                      {formatMoney(totalPrice)}
                    </span>
                  </p>
                </>
              )}
            </div>

            <div className="flex justify-between">
              <div>
                <p className="text-text1 text-lg">
                  Điện: {formatMoney(electricity)}/kWh
                </p>
                <p className="text-text1 text-lg">
                  Nước: {formatMoney(water)}/m³
                </p>
                <p className="text-text1 text-lg">Wifi: {wifi}</p>
              </div>
              <div>
                <p className="text-text1 text-lg">Xe: {formatMoney(vehicle)}</p>
                <p className="text-text1 text-lg">
                  Phí DV: {formatMoney(service)}
                </p>
              </div>
            </div>
          </div>

          <p className="text-accent text-lg font-medium mt-2">{status}</p>

          <div className="flex justify-between items-center mt-3">
            {mapLink ? (
              <a
                href={mapLink}
                target="_blank"
                className="flex text-text2 font-medium cursor-pointer gap-1"
              >
                <MapPin size={24} />
                Link Google Map
              </a>
            ) : (
              <span className="text-gray-400 text-lg flex gap-1">
                <MapPin size={24} />
                Không có map
              </span>
            )}

            {/* CẬP NHẬT LOGIC BUTTON Ở ĐÂY */}
            {(isChuaXuLy || canChangeSchedule) && (
              <div className="flex items-center gap-2">
                <span className="bg-text2 text-white px-3 py-1.5 rounded-md font-medium text-sm">
                  Lịch {isXemPhong ? "xem" : "nhận"} phòng: {checkinTime}
                </span>

                {isXemPhong && (
                  <button
                    onClick={() => setOpenCancelModal(true)}
                    className="bg-text1 hover:bg-opacity-90 transition cursor-pointer text-white px-4 py-1.5 rounded-md text-sm"
                  >
                    Hủy lịch
                  </button>
                )}

                <button
                  onClick={() => setOpenModal(true)}
                  className="bg-text2 hover:bg-opacity-90 transition cursor-pointer text-white px-4 py-1.5 rounded-md text-sm"
                >
                  Dời lịch
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      <CancelScheduleModal
        open={openCancelModal}
        onClose={() => setOpenCancelModal(false)}
        maPhieu={maPhieu}
        onSuccess={onRefresh ?? (() => {})}
      />

      <ChangeScheduleModal
        open={openModal}
        onClose={() => setOpenModal(false)}
        maPhieu={maPhieu}
        onSuccess={onRefresh ?? (() => {})}
      />
    </>
  );
}

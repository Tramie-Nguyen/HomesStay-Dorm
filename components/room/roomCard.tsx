"use client";

import { useRouter } from "next/navigation";
import { MapPin } from "lucide-react";
import { useState } from "react";
import ChangeScheduleModal from "../room/ChangeScheduleModal";
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
}: RoomCardProps) {
  const router = useRouter();
  const [openModal, setOpenModal] = useState(false);

  console.log("RoomCard beds prop:", beds);

  const formatMoney = (value?: number) =>
    value ? value.toLocaleString("vi-VN") + "đ" : "—";

  return (
    <>
      <div className="bg-base rounded-2xl p-4 flex gap-4">
        <Image
          src={imageUrl || "/room.png"}
          alt={name}
          width={192}
          height={128}
          className="w-48 h-48 object-cover rounded-xl"
        />

        <div className="flex-1 text-text1 text-sm">
          <div className="flex justify-between">
            <div>
              <p className="font-semibold">{name}</p>
            </div>

            <button
              onClick={() => router.push(`/chi-tiet-phong/${roomId}`)}
              className="border cursor-pointer border-text2 px-3 py-1 rounded-full text-xs"
            >
              Xem chi tiết
            </button>
          </div>

          <div className="mt-2">
            <div>
              {beds && beds.length > 0 ? (
                <>
                  <p className="mb-1">
                    <span className="font-semibold">Giường:</span>
                  </p>
                  {beds.map((bed) => (
                    <p key={bed.MA_GIUONG} className="text-xs text-text2">
                      {bed.MA_GIUONG} - {formatMoney(bed.GIA)}
                    </p>
                  ))}
                  <p className="mt-2">
                    Tổng giá:{" "}
                    <span className="text-accent font-semibold">
                      {formatMoney(totalPrice)}
                    </span>
                  </p>
                </>
              ) : (
                <>
                  <p>Mã giường: {bedCode || "—"}</p>
                  <p>
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
                <p>Điện: {formatMoney(electricity)}/kWh</p>
                <p>Nước: {formatMoney(water)}/m³</p>
              </div>
              <div>
                <p>Wifi: {wifi}</p>
                <p>Xe: {formatMoney(vehicle)}</p>
                <p>Phí DV: {formatMoney(service)}</p>
              </div>
            </div>
          </div>

          <p className="text-text2 font-medium mt-2">{status}</p>

          <div className="flex justify-between items-center mt-3">
            {mapLink ? (
              <a
                href={mapLink}
                target="_blank"
                className="flex text-text2 font-medium cursor-pointer gap-1"
              >
                <MapPin size={18} />
                Link Google Map
              </a>
            ) : (
              <span className="text-gray-400 flex gap-1">
                <MapPin size={18} />
                Không có map
              </span>
            )}

            {canChangeSchedule && (
              <>
                <span className="bg-text2 text-white px-4 py-2 rounded-full text-xs">
                  Lịch nhận phòng: {checkinTime}
                </span>

                <button
                  onClick={() => setOpenModal(true)}
                  className="bg-text2 cursor-pointer text-white px-4 py-2 rounded-lg"
                >
                  Đổi lịch
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      <ChangeScheduleModal
        open={openModal}
        onClose={() => setOpenModal(false)}
        maPhieu={maPhieu}
        onSuccess={onRefresh ?? (() => {})}
      />
    </>
  );
}

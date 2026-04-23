"use client";

import { useRouter } from "next/navigation";
import { MapPin } from "lucide-react";
import { useState } from "react";
import ChangeScheduleModal from "../room/ChangeScheduleModal";

interface RoomCardProps {
  roomId: string;
  name: string;
  beds: string;
  price: string;
  electricity: string;
  water: string;
  wifi: string;
  vehicle: string;
  service: string;
  checkinTime: string;
  status: string;

  imageUrl: string;
  mapLink: string;
}

export default function RoomCard({
  roomId,
  name,
  beds,
  price,
  electricity,
  water,
  wifi,
  vehicle,
  service,
  checkinTime,
  status,
  imageUrl,
  mapLink,
}: RoomCardProps) {
  const router = useRouter();
  const [openModal, setOpenModal] = useState(false);

  return (
    <>
      <div className="bg-base rounded-2xl p-4 flex gap-4">
        <img src={imageUrl} className="w-48 h-32 object-cover rounded-xl" />

        <div className="flex-1 text-text1 text-sm">
          <div className="flex justify-between">
            <div>
              <p className="font-semibold">{name}</p>
              <p>{beds}</p>
            </div>

            <button
              onClick={() => router.push(`/chi-tiet-phong/${roomId}`)}
              className="border cursor-pointer border-text2 px-3 py-1 rounded-full text-xs"
            >
              Xem chi tiết
            </button>
          </div>

          <div className="flex justify-between mt-2">
            <div>
              <p>
                Giá: <span className="text-accent font-semibold">{price}</span>
              </p>
              <p>Điện: {electricity}</p>
              <p>Nước: {water}</p>
            </div>

            <div>
              <p>Wifi: {wifi}</p>
              <p>Xe: {vehicle}</p>
              <p>Phí DV: {service}</p>
            </div>
          </div>

          <p className="text-text2 font-medium mt-2">{status}</p>

          <div className="flex justify-between items-center mt-3">
            <a
              href={mapLink}
              target="_blank"
              className="flex text-text2 font-medium cursor-pointer gap-1"
            >
              <MapPin size={18} />
              Link Google Map
            </a>

            <span className="bg-text2 text-white px-4 py-2 rounded-full text-xs">
              Lịch nhận phòng: {checkinTime}
            </span>

            <button
              onClick={() => setOpenModal(true)}
              className="bg-text2 cursor-pointer text-white px-4 py-2 rounded-lg"
            >
              Đổi lịch
            </button>
          </div>
        </div>
      </div>

      <ChangeScheduleModal
        open={openModal}
        onClose={() => setOpenModal(false)}
        roomId={roomId}
      />
    </>
  );
}

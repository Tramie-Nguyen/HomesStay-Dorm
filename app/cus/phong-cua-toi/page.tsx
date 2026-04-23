"use client";

import RoomCard from "@/components/room/roomCard";
import CustomerCard from "@/components/customer/CustomerCard";
import { MapPin } from "@phosphor-icons/react/dist/icons/MapPin";
import { useRouter } from "next/navigation";
import { useState } from "react";
import HandoverModal from "@/components/room/HandoverModal";

export default function RentalDetail() {
  const router = useRouter();
  const [openHandover, setOpenHandover] = useState(false);

  return (
    <div className="min-h-screen bg-background px-20 py-4">
      <div className="mt-4">
        <button onClick={() => router.back()} className="text-accent text-3xl">
          ←
        </button>
        <h2 className="text-center text-text1 font-bold mt-2">
          THÔNG TIN THUÊ
        </h2>
      </div>

      <div className="mt-6">
        <h3 className="font-semibold mb-2 text-text2">Thông tin phòng</h3>

        <RoomCard
          roomId="101"
          name="Phòng Deluxe"
          beds="2 giường"
          price="5.000.000đ"
          electricity="3.500đ/kWh"
          water="15.000đ/m3"
          wifi="Miễn phí"
          vehicle="100.000đ"
          service="200.000đ"
          checkinTime="22/05/2026 14:00"
          status="Còn phòng"
          imageUrl="https://images.unsplash.com/photo-1505693416388-ac5ce068fe85"
          mapLink="https://maps.google.com"
        />
      </div>

      <div className="mt-6">
        <h3 className="font-semibold mb-2 text-text2">Thông tin khách</h3>

        <CustomerCard
          id="KH002"
          name="Khuu Ngọc Ý Vy"
          code="KH002"
          phone="0987654321"
          dob="2000-05-01"
          cccd="098xxxxxxxx"
          gender="Nữ"
          email="khvyv.sv@gmail.com"
        />
      </div>

      <div className="flex justify-center mt-6">
        <button
          onClick={() => setOpenHandover(true)}
          className="bg-accent cursor-pointer text-white px-6 py-2 rounded-lg font-semibold"
        >
          Bàn giao phòng
        </button>

        <HandoverModal
          open={openHandover}
          onClose={() => setOpenHandover(false)}
        />
      </div>
    </div>
  );
}

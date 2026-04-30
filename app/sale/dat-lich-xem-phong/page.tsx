"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import Image from "next/image";
import DatePicker from "react-datepicker"; //nhớ npm install react-datepicker lucide-react.
import "react-datepicker/dist/react-datepicker.css";
import { Calendar, Clock } from "lucide-react";

export default function DatLichPage() {
  const searchParams = useSearchParams();
  const roomId = searchParams.get("roomId");

  // State
  const [type, setType] = useState<"khach" | "vanglai">("khach");
  const [roomData, setRoomData] = useState<any>(null);
  const [selectedBeds, setSelectedBeds] = useState<string[]>([]);
  const [startDate, setStartDate] = useState<Date | null>(new Date());
  const [isAgreed, setIsAgreed] = useState(false);

  const [form, setForm] = useState({
    hoTen: "",
    ngaySinh: "",
    sdt: "",
    email: "",
    cccd: "",
    gioiTinh: "Nữ",
  });

  // Fetch dữ liệu phòng (giống trang chi tiết để lấy danh sách giường)
  useEffect(() => {
    if (roomId) {
      fetch(`/api/phong/${roomId}`)
        .then((res) => res.json())
        .then((data) => setRoomData(data.room));
    }
  }, [roomId]);

  // Tìm kiếm khách hàng
  const handleSearchCustomer = async () => {
    if (form.sdt.length < 10) return;
    const res = await fetch(`/api/dat-lich?sdt=${form.sdt}`);
    if (res.ok) {
      const data = await res.json();
      setForm({
        ...form,
        hoTen: data.HO_TEN,
        email: data.EMAIL,
        cccd: data.CCCD,
        gioiTinh: data.GIOI_TINH,
      });
    }
  };

  const handleToggleBed = (bedId: string, status: string) => {
    if (status === "Đã thuê") return;
    setSelectedBeds((prev) =>
      prev.includes(bedId)
        ? prev.filter((id) => id !== bedId)
        : [...prev, bedId],
    );
  };

  const validate = () => {
    return (
      form.hoTen && form.sdt && selectedBeds.length > 0 && startDate && isAgreed
    );
  };

  return (
    <div className="min-h-screen bg-[#F0F9F9] p-6 text-slate-800">
      <div className="mx-auto max-w-4xl space-y-6">
        <h1 className="text-center text-2xl font-bold uppercase">
          Đặt lịch xem phòng
        </h1>

        {/* THÔNG TIN KHÁCH HÀNG */}
        <div className="rounded-2xl bg-[#DDF2F2] p-6 shadow-sm">
          <div className="mb-4 flex items-center gap-4">
            <h2 className="text-lg font-bold uppercase">
              Thông tin khách hàng
            </h2>
            <div className="flex gap-2">
              <button
                onClick={() => setType("khach")}
                className={`rounded-md px-3 py-1 ${type === "khach" ? "bg-[#2D7A7A] text-white" : "bg-gray-400 text-white"}`}
              >
                khách hàng
              </button>
              <button
                onClick={() => setType("vanglai")}
                className={`rounded-md px-3 py-1 ${type === "vanglai" ? "bg-[#2D7A7A] text-white" : "bg-gray-400 text-white"}`}
              >
                vãng lai
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block font-bold">Họ tên:</label>
              <input
                value={form.hoTen}
                onChange={(e) => setForm({ ...form, hoTen: e.target.value })}
                className="w-full rounded-md p-2 outline-none"
              />
            </div>
            <div>
              <label className="block font-bold">Ngày sinh:</label>
              <input
                type="date"
                value={form.ngaySinh}
                onChange={(e) => setForm({ ...form, ngaySinh: e.target.value })}
                className="w-full rounded-md p-2 outline-none"
              />
            </div>
            <div>
              <label className="block font-bold">SĐT:</label>
              <input
                value={form.sdt}
                onBlur={type === "khach" ? handleSearchCustomer : undefined}
                onChange={(e) => setForm({ ...form, sdt: e.target.value })}
                className="w-full rounded-md p-2 outline-none"
              />
            </div>
            <div>
              <label className="block font-bold">Email:</label>
              <input
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="w-full rounded-md p-2 outline-none"
              />
            </div>
            <div>
              <label className="block font-bold">CCCD:</label>
              <input
                value={form.cccd}
                onChange={(e) => setForm({ ...form, cccd: e.target.value })}
                className="w-full rounded-md p-2 outline-none"
                placeholder="Nhập CCCD"
              />
            </div>
            <div>
              <label className="block font-bold">Giới tính:</label>
              <select
                value={form.gioiTinh}
                onChange={(e) => setForm({ ...form, gioiTinh: e.target.value })}
                className="w-full rounded-md p-2 outline-none"
              >
                <option>Nam</option>
                <option>Nữ</option>
              </select>
            </div>
          </div>
        </div>

        {/* THÔNG TIN XEM PHÒNG */}
        <div className="rounded-2xl bg-[#DDF2F2] p-6 flex gap-6 shadow-sm">
          <div className="flex-1 space-y-3">
            <h2 className="text-lg font-bold uppercase">Thông tin xem phòng</h2>
            <p>
              <span className="font-bold">KTX:</span> {roomData?.ktxName}
            </p>
            <p>
              <span className="font-bold">Địa chỉ:</span> {roomData?.address}
            </p>
            <p>
              <span className="font-bold">Phòng:</span> {roomData?.code}
            </p>
            <div className="flex flex-wrap gap-2">
              <span className="font-bold w-full">Giường:</span>
              {roomData?.beds.map((bed: any, idx: number) => (
                <button
                  key={bed.id}
                  disabled={bed.status === "Đã thuê"}
                  onClick={() => handleToggleBed(bed.id, bed.status)}
                  className={`px-4 py-1 rounded-md border-2 transition ${
                    bed.status === "Đã thuê"
                      ? "bg-gray-300 border-gray-300 cursor-not-allowed"
                      : selectedBeds.includes(bed.id)
                        ? "bg-[#2D7A7A] text-white border-[#2D7A7A]"
                        : "bg-white border-white"
                  }`}
                >
                  Giường {idx + 1}
                </button>
              ))}
            </div>
          </div>
          <div className="relative w-64 h-48 rounded-2xl overflow-hidden shadow-md">
            <Image
              src={roomData?.imageUrl || "/room.png"}
              fill
              alt="room"
              className="object-cover"
            />
          </div>
        </div>

        {/* THỜI GIAN */}
        <div className="rounded-2xl bg-[#DDF2F2] p-6 shadow-sm grid grid-cols-2 gap-4">
          <div className="relative">
            <label className="block font-bold mb-1 uppercase">Ngày:</label>
            <div className="relative">
              <DatePicker
                selected={startDate}
                onChange={(date) => setStartDate(date)}
                dateFormat="dd/MM/yyyy"
                minDate={new Date()}
                className="w-full rounded-md p-2 pl-10"
              />
              <Calendar
                className="absolute left-2 top-2.5 text-gray-400"
                size={20}
              />
            </div>
          </div>
          <div className="relative">
            <label className="block font-bold mb-1 uppercase">Giờ:</label>
            <div className="relative">
              <DatePicker
                selected={startDate}
                onChange={(date) => setStartDate(date)}
                showTimeSelect
                showTimeSelectOnly
                timeIntervals={30}
                timeCaption="Giờ"
                dateFormat="HH:mm"
                className="w-full rounded-md p-2 pl-10"
              />
              <Clock
                className="absolute left-2 top-2.5 text-gray-400"
                size={20}
              />
            </div>
          </div>
        </div>

        {/* ĐIỀU KHOẢN */}
        <div className="space-y-4">
          <div className="rounded-2xl bg-[#DDF2F2] p-4 text-sm max-h-32 overflow-y-auto border border-teal-100">
            <p className="font-bold">Điều khoản xem phòng:</p>
            <ul className="list-disc ml-5">
              <li>Vui lòng đến đúng giờ đã hẹn.</li>
              <li>Mang theo CCCD gốc để đối chiếu khi vào KTX.</li>
              <li>Không làm ồn, gây mất trật tự trong quá trình xem phòng.</li>
              <li>Tuân thủ các quy định hiện hành của Homestay Dorm.</li>
            </ul>
          </div>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={isAgreed}
              onChange={(e) => setIsAgreed(e.target.checked)}
              className="w-5 h-5 accent-pink-500"
            />
            <span className="font-medium italic">
              Tôi đã đọc và đồng ý với điều khoản trên
            </span>
          </label>
        </div>

        <button
          disabled={!validate()}
          className="w-full rounded-xl bg-pink-500 py-3 text-xl font-bold text-white shadow-lg disabled:bg-gray-400 transition-all hover:bg-pink-600 uppercase"
        >
          Đặt lịch
        </button>
      </div>
    </div>
  );
}

"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import Image from "next/image";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { Calendar, Clock, Search } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-center gap-2 min-w-0">
      <label
        className="font-bold whitespace-nowrap shrink-0 text-md"
        style={{ width: "5rem" }}
      >
        {label}:
      </label>
      <div className="min-w-0" style={{ flex: "1 1 0" }}>
        {children}
      </div>
    </div>
  );
}

const inputBase =
  "w-full rounded-md px-3 py-2 text-md outline-none bg-white text-text1 placeholder-grey transition focus:ring-2 focus:ring-primary";
const borderedStyle = { border: "1px solid #7e7e7e" };
const readonlyStyle = {
  border: "1px solid #989898",
  backgroundColor: "#989898",
  color: "white",
};
// Thiết lập mốc 7h sáng
const minTime = new Date();
minTime.setHours(7, 0, 0);

// Thiết lập mốc 6h tối (18:00)
const maxTime = new Date();
maxTime.setHours(18, 0, 0);
// Tính toán ngày mai
const tomorrow = new Date();
tomorrow.setDate(tomorrow.getDate() + 1);

export default function DatLichPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const roomId = searchParams.get("roomId");

  const [type, setType] = useState<"khach" | "vanglai">("khach");
  const [roomData, setRoomData] = useState<any>(null);
  const [selectedBeds, setSelectedBeds] = useState<string[]>([]);
  const [startDate, setStartDate] = useState<Date | null>(() => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    d.setHours(7, 0, 0, 0); // Thiết lập 7:00:00
    return d;
  });
  const [isAgreed, setIsAgreed] = useState(false);
  const [searchSdt, setSearchSdt] = useState("");
  const [searchError, setSearchError] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [hinhThucThue, setHinhThucThue] = useState("");

  const [form, setForm] = useState({
    tenKh: "",
    ngaySinh: "",
    sdt: "",
    email: "",
    cccd: "",
    gioiTinh: "Nữ",
  });

  useEffect(() => {
    if (roomId) {
      fetch(`/api/phong/${roomId}`)
        .then((res) => res.json())
        .then((data) => setRoomData(data.room));
    }
  }, [roomId]);

  useEffect(() => {
    setForm({
      tenKh: "",
      ngaySinh: "",
      sdt: "",
      email: "",
      cccd: "",
      gioiTinh: "Nữ",
    });
    setSearchSdt("");
    setSearchError("");
  }, [type]);

  const isGenderMatched = () => {
    if (!roomData?.quyDinh) return true; // Nếu phòng không quy định thì bỏ qua

    const quyDinhText = roomData.quyDinh.toLowerCase();
    const gioiTinhKhach = form.gioiTinh.toLowerCase();

    return quyDinhText.includes(gioiTinhKhach);
  };
  const isFormValid = () => {
    if (type === "khach") {
      return (
        !!form.sdt?.trim() &&
        selectedBeds.length > 0 &&
        !!startDate &&
        !!hinhThucThue &&
        isAgreed
      );
    }

    return (
      !!form.tenKh?.trim() &&
      !!form.ngaySinh &&
      !!form.cccd?.trim() &&
      form.email?.includes("@") &&
      form.sdt?.trim().length >= 10 &&
      selectedBeds.length > 0 &&
      !!startDate &&
      !!hinhThucThue &&
      isAgreed
    );
  };

  const handleSearchCustomer = async () => {
    if (searchSdt.trim().length < 10) {
      setSearchError("Vui lòng nhập số điện thoại hợp lệ (ít nhất 10 số).");
      setForm({
        tenKh: "",
        ngaySinh: "",
        sdt: "",
        email: "",
        cccd: "",
        gioiTinh: "Nữ",
      });
      return;
    }

    setIsSearching(true);
    setSearchError("");
    try {
      const res = await fetch(`/api/dat-lich?sdt=${searchSdt.trim()}`);
      const data = await res.json();
      if (res.ok) {
        setForm({
          tenKh: data.TEN_KH || data.tenKh || "",
          ngaySinh: data.NGAY_SINH
            ? data.NGAY_SINH.split("T")[0]
            : data.ngaySinh || "",
          sdt: data.SDT || data.sdt || searchSdt.trim(),
          email: data.EMAIL || data.email || "",
          cccd: data.CCCD || data.cccd || "",
          gioiTinh: data.GIOI_TINH || data.gioiTinh || "Nữ",
        });
      } else {
        setSearchError(data.message || "Không tìm thấy khách hàng.");
      }
    } catch {
      setSearchError("Lỗi kết nối.");
    } finally {
      setIsSearching(false);
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

  const handleSubmit = async () => {
    if (!roomData?.code || !roomData?.maKtx) {
      alert("Thiếu thông tin phòng");
      return;
    }
    if (!startDate) {
      alert("Vui lòng chọn ngày giờ");
      return;
    }

    // Tạo một chuỗi format YYYY-MM-DD HH:mm:ss từ địa phương
    // Điều này tránh việc bị convert sang UTC làm lệch giờ hoặc mất giờ
    const pad = (n: any) => n.toString().padStart(2, "0");
    const dateStr = `${startDate.getFullYear()}-${pad(startDate.getMonth() + 1)}-${pad(startDate.getDate())}`;
    const timeStr = `${pad(startDate.getHours())}:${pad(startDate.getMinutes())}:00`;
    const finalDateTime = `${dateStr} ${timeStr}`;

    console.log("Chuỗi gửi đi:", finalDateTime);

    try {
      const res = await fetch("/api/dat-lich", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type,
          tenKh: form.tenKh,
          sdt: form.sdt,
          ngaySinh: form.ngaySinh,
          email: form.email,
          cccd: form.cccd,
          gioiTinh: form.gioiTinh,
          maPhong: roomData?.code,
          maKtx: roomData?.maKtx,
          hinhThucThue,
          selectedBeds,
          ngayXem: finalDateTime,
        }),
      });

      const result = await res.json();
      if (res.ok) {
        toast.success("Đặt lịch thành công");
        setTimeout(() => {
          router.push("/sale/lich-hen");
        }, 1500);
      } else {
        alert(
          `Lỗi: ${result.error}${result.details ? "\n" + result.details : ""}`,
        );
      }
    } catch (err) {
      alert("Có lỗi xảy ra kết nối, vui lòng thử lại.");
    }
  };

  const isKhach = type === "khach";
  const showFields = type === "vanglai" || (isKhach && form.tenKh.length > 0);

  const [loadingRoom, setLoadingRoom] = useState(true);

  useEffect(() => {
    if (roomId) {
      setLoadingRoom(true);
      fetch(`/api/phong/${roomId}`)
        .then((res) => res.json())
        .then((data) => {
          setRoomData(data.room);
          setLoadingRoom(false);
        })
        .catch(() => setLoadingRoom(false));
    }
  }, [roomId]);

  if (loadingRoom)
    return <div className="p-10 text-center">Đang tải thông tin phòng...</div>;
  if (!roomData)
    return (
      <div className="p-10 text-center text-red-500">
        Không tìm thấy thông tin phòng hợp lệ.
      </div>
    );

  return (
    <div className="min-h-screen bg-background p-6 text-text1">
      <div className="mx-auto max-w-4xl space-y-6">
        <h1 className="text-center text-2xl font-bold uppercase tracking-wide">
          Đặt lịch xem phòng
        </h1>

        {/* ── THÔNG TIN KHÁCH HÀNG ── */}
        <div className="rounded-2xl bg-base p-6 shadow-md space-y-5">
          <div className="flex items-center gap-4 flex-wrap">
            <h2 className="text-lg font-bold uppercase">
              Thông tin khách hàng
            </h2>
            <div className="flex gap-2">
              <button
                onClick={() => setType("khach")}
                className={`rounded-md px-3 py-2 text-md font-semibold transition-colors ${
                  isKhach
                    ? "bg-text2 text-white"
                    : "bg-pastel text-text1 hover:bg-primary hover:text-white"
                }`}
              >
                Khách hàng
              </button>
              <button
                onClick={() => setType("vanglai")}
                className={`rounded-md px-3 py-2 text-md font-semibold transition-colors ${
                  !isKhach
                    ? "bg-text2 text-white"
                    : "bg-pastel text-text1 hover:bg-primary hover:text-white"
                }`}
              >
                Vãng lai
              </button>
            </div>
          </div>

          {/* Tìm kiếm SĐT */}
          {isKhach && (
            <div className="space-y-2">
              <div className="flex gap-2 items-center">
                <input
                  value={searchSdt}
                  onChange={(e) => {
                    setSearchSdt(e.target.value);
                    setSearchError("");
                  }}
                  onKeyDown={(e) => e.key === "Enter" && handleSearchCustomer()}
                  className={inputBase}
                  style={{ ...borderedStyle, maxWidth: "280px" }}
                  placeholder="Nhập SĐT để tìm khách hàng..."
                />
                <button
                  onClick={handleSearchCustomer}
                  disabled={isSearching}
                  className="flex items-center gap-1.5 rounded-md bg-text2 px-4 py-2 text-md font-semibold text-white hover:bg-primary transition disabled:opacity-60"
                >
                  <Search size={15} />
                  {isSearching ? "Đang tìm..." : "Tìm kiếm"}
                </button>
              </div>
              {searchError && (
                <p className="text-accent text-md font-medium">{searchError}</p>
              )}
            </div>
          )}

          {showFields && (
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr 1fr",
                rowGap: "16px",
                columnGap: "20px",
              }}
            >
              <Field label="Họ tên">
                <input
                  value={form.tenKh}
                  onChange={(e) => setForm({ ...form, tenKh: e.target.value })}
                  readOnly={isKhach}
                  placeholder="Nhập họ tên"
                  className={inputBase}
                  style={isKhach ? readonlyStyle : borderedStyle}
                />
              </Field>
              <Field label="Ngày sinh">
                <input
                  type="date"
                  value={form.ngaySinh}
                  onChange={(e) =>
                    setForm({ ...form, ngaySinh: e.target.value })
                  }
                  readOnly={isKhach}
                  className={inputBase}
                  style={isKhach ? readonlyStyle : borderedStyle}
                />
              </Field>
              <Field label="Giới tính">
                {isKhach ? (
                  <input
                    value={form.gioiTinh}
                    readOnly
                    className={inputBase}
                    style={readonlyStyle}
                  />
                ) : (
                  <select
                    value={form.gioiTinh}
                    onChange={(e) =>
                      setForm({ ...form, gioiTinh: e.target.value })
                    }
                    className={inputBase}
                    style={borderedStyle}
                  >
                    <option>Nam</option>
                    <option>Nữ</option>
                  </select>
                )}
              </Field>
              <Field label="SĐT">
                <input
                  value={form.sdt}
                  onChange={(e) => setForm({ ...form, sdt: e.target.value })}
                  readOnly={isKhach}
                  placeholder="Nhập số điện thoại"
                  className={inputBase}
                  style={isKhach ? readonlyStyle : borderedStyle}
                />
              </Field>
              <Field label="Email">
                <input
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  readOnly={isKhach}
                  placeholder="Nhập email"
                  className={inputBase}
                  style={isKhach ? readonlyStyle : borderedStyle}
                />
              </Field>
              <Field label="CCCD">
                <input
                  value={form.cccd}
                  onChange={(e) => setForm({ ...form, cccd: e.target.value })}
                  readOnly={isKhach}
                  placeholder="Nhập CCCD"
                  className={inputBase}
                  style={isKhach ? readonlyStyle : borderedStyle}
                />
              </Field>
            </div>
          )}
          {!isGenderMatched() && (
            <div className="mt-2 p-2 bg-red-100 border border-red-400 rounded-md">
              <p className="text-red-700 text-sm font-bold">
                ⚠️ Giới tính không khớp với quy định của phòng
              </p>
            </div>
          )}
        </div>

        {/* ── THÔNG TIN XEM PHÒNG ── */}
        <div className="rounded-2xl bg-base p-6 flex gap-6 shadow-md">
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
            <p>
              <span className="font-bold">Đối tượng: </span>
              {(() => {
                const text = roomData.quyDinh.toLowerCase();

                if (text.includes("nữ")) return "Chỉ nữ";
                return "Chỉ nam";
              })()}
            </p>
            <div className="flex flex-wrap gap-2 items-center">
              <span className="font-bold">Giường:</span>
              {roomData?.beds.map((bed: any, idx: number) => (
                <button
                  key={bed.id}
                  disabled={bed.status === "Đã thuê"}
                  onClick={() => handleToggleBed(bed.id, bed.status)}
                  className={`px-4 py-1 rounded-md text-md font-medium transition ${
                    bed.status === "Đã thuê"
                      ? "bg-gray-400 text-white cursor-not-allowed"
                      : selectedBeds.includes(bed.id)
                        ? "bg-text2 text-white"
                        : "bg-white text-text1"
                  }`}
                  style={{ border: "1px solid #7e7e7e" }}
                >
                  Giường {idx + 1}
                </button>
              ))}
            </div>
          </div>
          <div className="relative w-64 h-48 rounded-2xl overflow-hidden shadow-md shrink-0">
            <Image
              src={roomData?.imageUrl ? `/${roomData.imageUrl}` : "/room.png"}
              fill
              alt="room"
              className="object-cover"
            />
          </div>
        </div>

        {/* ── THỜI GIAN ── */}
        <div className="rounded-2xl bg-base p-6 shadow-md">
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr 1fr",
              gap: "24px",
            }}
          >
            {/* Cột 1 — Ngày */}
            <div style={{ minWidth: 0 }}>
              <label className="block font-bold mb-2 uppercase text-md">
                Ngày:
              </label>
              <div style={{ position: "relative" }}>
                <DatePicker
                  selected={startDate}
                  onChange={(date) => setStartDate(date)}
                  dateFormat="dd/MM/yyyy"
                  minDate={tomorrow}
                  customInput={
                    <input
                      style={{ ...borderedStyle, width: "100%" }}
                      className={inputBase + " pl-10"}
                    />
                  }
                />
                <Calendar
                  style={{
                    position: "absolute",
                    left: 8,
                    top: 10,
                    pointerEvents: "none",
                  }}
                  className="text-grey"
                  size={18}
                />
              </div>
            </div>

            {/* Cột 2 — Giờ */}
            <div style={{ minWidth: 0 }}>
              <label className="block font-bold mb-2 uppercase text-md">
                Giờ:
              </label>
              <div style={{ position: "relative" }}>
                <DatePicker
                  selected={startDate}
                  onChange={(date) => setStartDate(date)}
                  showTimeSelect
                  showTimeSelectOnly
                  timeIntervals={30}
                  timeCaption="Giờ"
                  dateFormat="HH:mm"
                  timeFormat="HH:mm"
                  minTime={minTime}
                  maxTime={maxTime}
                  showTimeInput={false}
                  customInput={
                    <input
                      style={{ ...borderedStyle, width: "100%" }}
                      className={inputBase + " pl-10"}
                    />
                  }
                />
                <Clock
                  style={{
                    position: "absolute",
                    left: 8,
                    top: 10,
                    pointerEvents: "none",
                  }}
                  className="text-grey"
                  size={18}
                />
              </div>
            </div>

            {/* Cột 3 — Hình thức thuê */}
            <div style={{ minWidth: 0 }}>
              <label className="block font-bold mb-2 uppercase text-md">
                Hình thức thuê:
              </label>
              <select
                value={hinhThucThue}
                onChange={(e) => setHinhThucThue(e.target.value)}
                className={inputBase}
                style={borderedStyle}
              >
                <option value="">-- Chọn hình thức --</option>
                <option value="Cá nhân">Cá nhân</option>
                <option value="Nhóm">Nhóm</option>
              </select>
            </div>
          </div>
        </div>

        {/* ── ĐIỀU KHOẢN ── */}
        <div className="space-y-3">
          <div className="rounded-2xl bg-base p-4 text-md max-h-32 overflow-y-auto">
            <p className="font-bold mb-1">Điều khoản xem phòng:</p>
            <ul className="list-disc ml-5 space-y-1 opacity-80">
              <li>Vui lòng đến đúng giờ đã hẹn.</li>
              <li>Mang theo CCCD gốc để đối chiếu khi vào KTX.</li>
              <li>Không làm ồn, gây mất trật tự trong quá trình xem phòng.</li>
              <li>Tuân thủ các quy định hiện hành của Homestay Dorm.</li>
            </ul>
          </div>
          <label className="flex items-center gap-2 cursor-pointer select-none">
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

        {/* ── NÚT ĐẶT LỊCH ── */}
        <button
          disabled={!isFormValid() || !isGenderMatched()}
          onClick={handleSubmit}
          className="w-full rounded-xl bg-accent py-3 text-xl font-bold text-white shadow-lg disabled:bg-grey disabled:cursor-not-allowed transition-all hover:opacity-90 uppercase"
        >
          Đặt lịch
        </button>
      </div>
    </div>
  );
}

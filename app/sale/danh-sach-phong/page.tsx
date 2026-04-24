"use client";

import { useState } from "react";
import {
  Search,
  SlidersHorizontal,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import Image from "next/image";

// ────────────────────────────────────────────────────────────────────────────
// Hình gán cứng tạm thời — thay bằng URL từ backend sau
// ────────────────────────────────────────────────────────────────────────────
const PLACEHOLDER_IMAGE = "/room.png";

// ── Types ────────────────────────────────────────────────────────────────────
interface Room {
  id: number;
  code: string;
  availableBeds: number;
  totalBeds: number;
  pricePerBed: string;
  status: "Còn chỗ" | "Hết chỗ";
}

// ── Mock data ─────────────────────────────────────────────────────────────────
const mockRooms: Room[] = [
  {
    id: 1,
    code: "101",
    availableBeds: 3,
    totalBeds: 5,
    pricePerBed: "1.500.000",
    status: "Còn chỗ",
  },
  {
    id: 2,
    code: "102",
    availableBeds: 3,
    totalBeds: 5,
    pricePerBed: "1.500.000",
    status: "Còn chỗ",
  },
  {
    id: 3,
    code: "103",
    availableBeds: 3,
    totalBeds: 5,
    pricePerBed: "1.500.000",
    status: "Còn chỗ",
  },
  {
    id: 4,
    code: "104",
    availableBeds: 3,
    totalBeds: 5,
    pricePerBed: "1.500.000",
    status: "Còn chỗ",
  },
  {
    id: 5,
    code: "105",
    availableBeds: 3,
    totalBeds: 5,
    pricePerBed: "1.500.000",
    status: "Còn chỗ",
  },
  {
    id: 6,
    code: "106",
    availableBeds: 3,
    totalBeds: 5,
    pricePerBed: "1.500.000",
    status: "Còn chỗ",
  },
];

const TOTAL_PAGES = 8;

// ────────────────────────────────────────────────────────────────────────────
export default function DanhSachPhongPage() {
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [ward, setWard] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState<
    "Còn chỗ" | "Hết chỗ" | null
  >(null);
  const filteredRooms = mockRooms.filter((room) => {
    if (!statusFilter) return true;
    return room.status === statusFilter;
  });
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: gọi API với { searchQuery, sortOrder, ward, currentPage }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-[1360px] mx-auto px-6 py-8">
        {/* ── Tiêu đề ── */}
        <h1 className="text-center text-2xl font-bold text-text1 tracking-widest mb-6">
          DANH SÁCH PHÒNG
        </h1>

        {/* ── Bộ lọc ── */}
        <section
          aria-label="Bộ lọc"
          className="bg-base rounded-2xl px-6 py-4 mb-6 flex flex-wrap items-center gap-3 shadow-sm"
        >
          {/* Sắp xếp */}
          <span className="text-sm font-semibold text-text1 whitespace-nowrap shrink-0">
            Sắp xếp theo giá
          </span>
          <button
            onClick={() => setSortOrder("asc")}
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${
              sortOrder === "asc"
                ? "bg-accent text-white"
                : "border border-colorgrey/40 text-text1 bg-white"
            }`}
          >
            Thấp đến cao
          </button>
          <button
            onClick={() => setSortOrder("desc")}
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${
              sortOrder === "desc"
                ? "bg-accent text-white"
                : "border border-colorgrey/40 text-text-1 bg-white"
            }`}
          >
            Cao đến thấp
          </button>

          {/* Dropdown phường */}
          <select
            value={ward}
            onChange={(e) => setWard(e.target.value)}
            className="border border-colorgrey/40 rounded-lg px-4 py-2 text-sm text-text-1 bg-white focus:outline-none focus:ring-2 focus:ring-primary min-w-[160px]"
          >
            <option value="">Phường</option>
            <option value="p1">Phường Tân Sơn Hòa</option>
            <option value="p2">Phường Tân Sơn Nhất</option>
            <option value="p3">Phường Tân Hòa</option>
            <option value="p4">Phường Sài Gòn</option>
            <option value="p5">Phường Tân Định</option>
            <option value="p6">Phường Bến Thành</option>
            <option value="p7">Phường Bình Phú</option>
          </select>

          {/* Tìm kiếm */}
          <form onSubmit={handleSearch} className="flex-1 min-w-[200px]">
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Tìm kiếm phòng"
                className="w-full border border-grey/40 rounded-lg pl-4 pr-10 py-2 text-sm text-text-1 focus:outline-none focus:ring-2 focus:ring-primary placeholder:text-grey bg-white"
              />
              <button
                type="submit"
                aria-label="Tìm kiếm"
                className="absolute right-2 top-1/2 -translate-y-1/2 text-grey hover:text-primary transition-colors"
              >
                <Search size={18} />
              </button>
            </div>
          </form>

          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold text-text1">
              Trạng thái:
            </span>

            <button
              onClick={() =>
                setStatusFilter((prev) =>
                  prev === "Còn chỗ" ? null : "Còn chỗ",
                )
              }
              className={`px-4 py-2 rounded-lg text-sm font-semibold transition ${
                statusFilter === "Còn chỗ"
                  ? "bg-accent text-white"
                  : "border border-grey/40 text-text1 bg-white"
              }`}
            >
              Còn chỗ
            </button>

            <button
              onClick={() =>
                setStatusFilter((prev) =>
                  prev === "Hết chỗ" ? null : "Hết chỗ",
                )
              }
              className={`px-4 py-2 rounded-lg text-sm font-semibold transition ${
                statusFilter === "Hết chỗ"
                  ? "bg-accent text-white"
                  : "border border-grey/40 text-text1 bg-white"
              }`}
            >
              Hết chỗ
            </button>
          </div>
        </section>

        {/* ── Danh sách phòng ── */}
        <section aria-label="Danh sách phòng">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10">
            {filteredRooms.map((room) => (
              <article
                key={room.id}
                className={`bg-base rounded-2xl p-3 shadow-sm transition-all duration-200 hover:shadow-md hover:-translate-y-0.5 cursor-pointer 
                  `}
              >
                {/* Hình phòng*/}
                <div className="relative w-full h-[185px] bg-base overflow-hidden rounded-2xl">
                  <Image
                    src={PLACEHOLDER_IMAGE}
                    alt={`Phòng ${room.code}`}
                    fill
                    className="object-cover rounded-2xl"
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  />
                </div>

                {/* Thông tin */}
                <div className="p-4 space-y-1.5">
                  <p className="text-text1 text-sm">
                    Mã phòng: <span className="font-semibold">{room.code}</span>
                  </p>
                  <p className="text-text1 text-sm">
                    Số giường còn trống:{" "}
                    <span className="font-medium">
                      {room.availableBeds}/{room.totalBeds} giường
                    </span>
                  </p>
                  <p className="text-text1 text-sm">
                    Giá:{" "}
                    <span className="font-medium">
                      {room.pricePerBed} / giường
                    </span>
                  </p>
                  <p className="text-sm">
                    Trạng thái:{" "}
                    <span
                      className={
                        room.status === "Còn chỗ"
                          ? "font-semibold text-accent"
                          : "font-semibold text-grey"
                      }
                    >
                      {room.status}
                    </span>
                  </p>
                </div>
              </article>
            ))}
          </div>
        </section>

        {/* ── Phân trang ── */}
        <div className="flex items-center justify-center gap-4 py-8">
          <button
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            aria-label="Trang trước"
            className="w-9 h-9 flex items-center justify-center rounded-lg bg-grey/20 hover:bg-grey/30 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronLeft size={18} className="text-text1" />
          </button>

          <span className="text-lg font-bold">
            <span className="text-accent">{currentPage}</span>
            <span className="text-grey"> / {TOTAL_PAGES}</span>
          </span>

          <button
            onClick={() => setCurrentPage((p) => Math.min(TOTAL_PAGES, p + 1))}
            disabled={currentPage === TOTAL_PAGES}
            aria-label="Trang sau"
            className="w-9 h-9 flex items-center justify-center rounded-lg bg-primary hover:bg-primary/80 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronRight size={18} className="text-text1" />
          </button>
        </div>
      </div>
    </div>
  );
}

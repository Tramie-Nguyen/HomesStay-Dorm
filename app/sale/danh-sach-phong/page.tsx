"use client";

import { useState, useEffect } from "react";
import { Search, ChevronLeft, ChevronRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { formatGiaRange } from "@/lib/format";
import { useSearchParams, useRouter, usePathname } from "next/navigation";

// ── Types ────────────────────────────────────────────────────────────────────
interface Room {
  id: string;
  code: string;
  availableBeds: number;
  totalBeds: number;
  status: "Trống" | "Đã thuê";
  imageUrl: string | null;
  ktxName: string;
  giaMin: number; // ← thay pricePerBed string bằng 2 số thô
  giaMax: number;
  address: string;
}

async function fetchRooms(params: {
  search: string;
  status: string;
  sort: string;
  page: number;
  ward: string;
  gioiTinh: string;
  minBeds: number;
}) {
  const qs = new URLSearchParams({
    search: params.search,
    status: params.status,
    sort: params.sort,
    page: String(params.page),
    ward: params.ward,
    gioiTinh: params.gioiTinh,
    minBeds: String(params.minBeds),
  });

  const res = await fetch(`/api/phong?${qs}`, {
    cache: "no-store", // Thêm dòng này để ép fetch mới hoàn toàn
    headers: {
      "Cache-Control": "no-cache",
    },
  });
  if (!res.ok) {
    const body = await res.text();
    // Log rõ status + nội dung lỗi từ server
    console.error(`[fetchRooms] HTTP ${res.status}:`, body);
    throw new Error(`Fetch thất bại: ${res.status} - ${body}`);
  }

  return res.json() as Promise<{
    rooms: Room[];
    totalPages: number;
    total: number;
  }>;
}

// ── Component ─────────────────────────────────────────────────────────────────
export default function DanhSachPhongPage() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [rooms, setRooms] = useState<Room[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [sortOrder, setSortOrder] = useState<"ASC" | "DESC">("ASC");
  const [ward, setWard] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState<"Trống" | "Đã thuê" | "">(
    "",
  );
  const [gioiTinh, setGioiTinh] = useState("");
  const [error, setError] = useState("");
  const [minBeds, setMinBeds] = useState(
    Number(searchParams.get("minBeds")) || 1,
  );

  const updateUrl = (newParams: Record<string, string | number>) => {
    const params = new URLSearchParams(searchParams.toString());
    Object.entries(newParams).forEach(([key, value]) => {
      if (value) params.set(key, String(value));
      else params.delete(key);
    });
    router.push(`${pathname}?${params.toString()}`, { scroll: false });
  };

  // Gọi API mỗi khi filter/sort/page thay đổi
  useEffect(() => {
    setLoading(true);
    setError("");
    fetchRooms({
      search: searchQuery,
      status: statusFilter,
      sort: sortOrder,
      page: currentPage,
      ward: ward,
      gioiTinh: gioiTinh,
      minBeds: minBeds,
    })
      .then(({ rooms, totalPages }) => {
        setRooms(rooms);
        setTotalPages(totalPages);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [
    searchQuery,
    statusFilter,
    sortOrder,
    currentPage,
    ward,
    gioiTinh,
    minBeds,
  ]);

  // Reset về trang 1 khi đổi filter
  const handleStatusFilter = (val: "Trống" | "Đã thuê") => {
    setStatusFilter((prev) => (prev === val ? "" : val));
    setCurrentPage(1);
  };

  return (
    <div className="min-h-screen bg-base">
      <div className="max-w-[1360px] mx-auto px-6 py-8">
        <h1 className="text-center text-3xl font-bold text-text1 tracking-widest mb-6">
          DANH SÁCH PHÒNG
        </h1>

        {/* ── Bộ lọc ── */}
        <section className="bg-pastel rounded-2xl px-6 py-4 mb-6 flex flex-wrap items-center gap-3 shadow-sm">
          <select
            value={sortOrder}
            onChange={(e) => {
              setSortOrder(e.target.value as "ASC" | "DESC");
              setCurrentPage(1);
            }}
            className="border border-grey/40 rounded-lg px-4 py-2  text-text1 bg-white focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="ASC">Giá: Thấp đến cao</option>
            <option value="DESC">Giá: Cao đến thấp</option>
          </select>

          <select
            value={ward}
            onChange={(e) => {
              const val = e.target.value;
              setWard(e.target.value);
              setCurrentPage(1);
              updateUrl({ ward: val, page: 1 });
            }}
            className="border border-grey/40 rounded-lg px-4 py-2 text-text1 bg-white focus:outline-none focus:ring-2 focus:ring-primary min-w-[160px]"
          >
            <option value="">Phường</option>
            {/* value = tên thật → SP sẽ LIKE '%Tân Sơn Hòa%' trong DIA_CHI */}
            <option value="Tân Sơn Hòa">Phường Tân Sơn Hòa</option>
            <option value="Tân Sơn Nhất">Phường Tân Sơn Nhất</option>
            <option value="Tân Hòa">Phường Tân Hòa</option>
            <option value="Sài Gòn">Phường Sài Gòn</option>
            <option value="Tân Định">Phường Tân Định</option>
            <option value="Bến Thành">Phường Bến Thành</option>
            <option value="Bình Phú">Phường Bình Phú</option>
          </select>

          <select
            value={gioiTinh}
            onChange={(e) => {
              setGioiTinh(e.target.value);
              setCurrentPage(1);
            }}
            className="border border-grey/40 rounded-lg px-4 py-2 text-text1 bg-white focus:outline-none focus:ring-2 focus:ring-primary min-w-[120px]"
          >
            <option value="">Giới tính</option>
            <option value="Nam">Nam</option>
            <option value="Nữ">Nữ</option>{" "}
            {/* ← phải khớp với chuỗi trong QUY_DINH của DB */}
          </select>
          {/* TRƯỜNG NUMERIC UPDOWN MỚI THÊM */}
          <div className="flex items-center gap-2 bg-white border border-grey/40 rounded-lg px-3 py-1">
            <span className="text-sm font-medium text-grey">Số giường:</span>
            <input
              type="number"
              min="1"
              value={minBeds}
              onChange={(e) => {
                const val = parseInt(e.target.value);

                if (!isNaN(val) && val >= 1) {
                  setMinBeds(val);
                  setCurrentPage(1);
                  updateUrl({ minBeds: val, page: 1 });
                } else if (e.target.value === "") {
                  setMinBeds(1);
                  updateUrl({ minBeds: 1, page: 1 });
                }
              }}
              className="w-12 text-center text-text2 font-bold outline-none bg-transparent"
            />
          </div>
          {/* Tìm kiếm — dùng onBlur + Enter để tránh gọi API mỗi keystroke */}
          <div className="flex-1 min-w-[200px] relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onBlur={() => updateUrl({ search: searchQuery, page: 1 })}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  setCurrentPage(1);
                  updateUrl({ search: searchQuery, page: 1 });
                }
              }}
              placeholder="Tìm kiếm phòng"
              className="w-full border border-grey/40 rounded-lg pl-4 pr-10 py-2  text-text1 focus:outline-none focus:ring-2 focus:ring-primary placeholder:text-grey bg-white"
            />
            <Search
              size={18}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-grey"
            />
          </div>

          <div className="flex items-center gap-2">
            <span className=" font-semibold text-text1">Trạng thái:</span>
            {(["Trống", "Đã thuê"] as const).map((val) => (
              <button
                key={val}
                onClick={() => handleStatusFilter(val)}
                className={`px-4 py-2 rounded-lg  font-semibold transition ${
                  statusFilter === val
                    ? "bg-accent text-white"
                    : "border border-grey/40 text-text1 bg-white"
                }`}
              >
                {val}
              </button>
            ))}
          </div>
        </section>

        {/* ── Danh sách phòng ── */}
        <section>
          {loading ? (
            <p className="text-center text-grey py-12">Đang tải...</p>
          ) : rooms.length === 0 ? (
            <p className="text-center text-grey py-12">
              Không tìm thấy phòng nào.
            </p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10">
              {rooms.map((room) => (
                <Link key={room.id} href={`/sale/danh-sach-phong/${room.id}`}>
                  <article className="bg-white rounded-2xl p-3 shadow-sm transition-all duration-200 hover:shadow-md hover:-translate-y-0.5 cursor-pointer">
                    <div className="relative w-full h-[185px] overflow-hidden rounded-2xl">
                      <Image
                        src={room.imageUrl ?? "/room.png"}
                        alt={`Phòng ${room.code}`}
                        fill
                        className="object-cover rounded-2xl"
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                      />
                    </div>
                    <div className="p-4 space-y-1.5">
                      <p className="text-text1 ">
                        Mã phòng:{" "}
                        <span className="font-semibold">{room.code}</span>
                      </p>
                      <p className="text-text1 ">
                        Số giường còn trống:{" "}
                        <span className="font-medium">
                          {room.availableBeds}/{room.totalBeds} giường
                        </span>
                      </p>
                      <p className="text-text1 ">
                        Giá:{" "}
                        <span className="font-medium">
                          {formatGiaRange(room.giaMin, room.giaMax)}/tháng
                        </span>
                      </p>
                      <p className="">
                        Trạng thái:{" "}
                        <span
                          className={
                            room.status === "Trống"
                              ? "font-semibold text-accent"
                              : "font-semibold text-grey"
                          }
                        >
                          {room.status}
                        </span>
                      </p>
                      <p className="text-text1 ">
                        Vị trí:{" "}
                        <span className="font-semibold">{room.address}</span> (
                        {""}
                        <span className="font-semibold">{room.ktxName}</span>)
                      </p>
                    </div>
                  </article>
                </Link>
              ))}
            </div>
          )}
        </section>

        {/* ── Phân trang ── */}
        <div className="flex items-center justify-center gap-4 py-8">
          <button
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="w-9 h-9 flex items-center justify-center rounded-lg bg-grey/20 hover:bg-grey/30 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronLeft size={18} className="text-text1" />
          </button>
          <span className="text-lg font-bold">
            <span className="text-accent">{currentPage}</span>
            <span className="text-grey"> / {totalPages}</span>
          </span>
          <button
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            className="w-9 h-9 flex items-center justify-center rounded-lg bg-primary hover:bg-primary/80 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronRight size={18} className="text-text1" />
          </button>
        </div>
      </div>
    </div>
  );
}

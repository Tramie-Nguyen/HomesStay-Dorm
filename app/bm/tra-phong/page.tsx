"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import NavBar from "../../../components/layout/nav";

type TraPhongRow = {
  id: string;
  maKhachHang: string;
  fullName: string;
  roomCode: string;
  checkoutDate: string;
  status: string;
};

const initialData: TraPhongRow[] = [];

export default function QL_dsTraPhongPage() {
  const router = useRouter();
  const [sortOrder, setSortOrder] = useState<"desc" | "asc">("desc");
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState<string | null>(null);
  const [data, setData] = useState(initialData);
  const [loading, setLoading] = useState(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filterStatus) params.append("status", filterStatus);
      params.append("sort", sortOrder === "desc" ? "DESC" : "ASC");

      const response = await fetch(`/api/ds-tra-phong?${params.toString()}`);
      if (response.ok) {
        const result = (await response.json()) as { data?: TraPhongRow[] };
        setData(result.data ?? initialData);
      } else {
        setData(initialData);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  }, [filterStatus, sortOrder]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const filteredData = data
    .filter((item) => item.status === "Đang chờ xử lí") // Only show rows with status 'Đang chờ xử lí'
    .filter((item) => {
      const keyword = search.trim().toLowerCase();
      return (
        (item.roomCode ?? "").toLowerCase().includes(keyword) ||
        (item.fullName ?? "").toLowerCase().includes(keyword)
      );
    })
    .sort((a, b) => {
      const dateA = new Date(a.checkoutDate).getTime();
      const dateB = new Date(b.checkoutDate).getTime();
      return sortOrder === "desc" ? dateB - dateA : dateA - dateB;
    });

  const handleChangeStatus = async (id: string, newStatus: string) => {
    try {
      const item = data.find((d) => d.id === id);
      if (!item) return;

      const response = await fetch(`/api/ds-tra-phong`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status: newStatus }),
      });

      if (response.ok) {
        await fetchData();
      } else {
        const errorBody = await response.json().catch(() => null);
        console.error("Update status failed:", errorBody);
      }
    } catch (error) {
      console.error("Error updating status:", error);
    }
  };

  return (
    <>
      <NavBar />
      <main className="min-h-screen bg-background font-sans p-6 pt-24 pb-24">
        <h1 className="mb-6 text-center text-2xl font-bold text-text1 uppercase tracking-wide">
          Quản lý - Danh sách khách trả phòng
        </h1>
        <div className="mx-auto max-w-5xl">
          <div className="mb-6 flex flex-wrap items-center justify-between rounded-md bg-primary/30 p-4">
            <div className="flex items-center gap-4">
              <span className="font-semibold text-accent text-sm">
                Sắp xếp theo:
              </span>
              <button
                className={`rounded-md px-6 py-1.5 text-sm font-medium shadow-sm transition-colors ${sortOrder === "desc" ? "bg-accent text-white hover:bg-accent/80" : "border border-base bg-white text-text2 hover:bg-base"}`}
                onClick={() => setSortOrder("desc")}
              >
                Mới nhất
              </button>
              <button
                className={`rounded-md px-6 py-1.5 text-sm font-medium shadow-sm transition-colors ${sortOrder === "asc" ? "bg-accent text-white hover:bg-accent/80" : "border border-base bg-white text-text2 hover:bg-base"}`}
                onClick={() => setSortOrder("asc")}
              >
                Cũ nhất
              </button>
            </div>
            <div className="flex items-center gap-4">
              <input
                className="rounded-md border border-base px-3 py-1.5 text-sm bg-white"
                type="text"
                placeholder="Tìm kiếm phòng..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              {/* <select
                className="rounded-md border border-base px-3 py-1.5 text-sm bg-white"
                value={filterStatus ?? ""}
                onChange={(e) => setFilterStatus(e.target.value || null)}
              >
                <option value="">Tất cả trạng thái</option>
                <option value="Đang chờ xử lí">Đang chờ xử lí</option>
              </select> */}
            </div>
          </div>

          <table className="w-full border-collapse bg-base/50 shadow-md">
            <thead>
              <tr>
                <th className="border-x border-base px-4 py-3 align-middle font-bold text-text1">
                  Họ tên
                </th>
                <th className="border-x border-base px-4 py-3 align-middle font-bold text-text1">
                  Phòng
                </th>
                <th className="border-x border-base px-4 py-3 align-middle font-bold text-text1">
                  Ngày trả
                </th>
                <th className="border-x border-base px-4 py-3 align-middle font-bold text-text1">
                  Trạng thái
                </th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td
                    colSpan={4}
                    className="text-center py-8 text-text2 align-middle"
                  >
                    Đang tải dữ liệu...
                  </td>
                </tr>
              ) : filteredData.length === 0 ? (
                <tr>
                  <td
                    colSpan={4}
                    className="text-center py-8 text-gray-500 align-middle"
                  >
                    Không có dữ liệu
                  </td>
                </tr>
              ) : (
                filteredData.map((item) => (
                  <tr
                    key={item.id}
                    className="cursor-pointer hover:bg-primary/10 transition-colors border-b border-gray-200 last:border-0"
                    onClick={() => {
                      const targetKh = String(item.maKhachHang ?? "").trim();
                      if (!targetKh || targetKh.toUpperCase() === "N/A") {
                        window.alert(
                          "Mã khách hàng không tồn tại — không thể xem thông tin hoàn cọc.",
                        );
                        return;
                      }
                      router.push(
                        `/bm/ttHoanCoc?ma_kh=${encodeURIComponent(targetKh)}`,
                      );
                    }}
                  >
                    <td className="border-x border-base px-4 py-3 align-middle text-text1">
                      {item.fullName}
                    </td>
                    <td className="border-x border-base px-4 py-3 align-middle text-text1">
                      {item.roomCode}
                    </td>
                    <td className="border-x border-base px-4 py-3 align-middle text-text1">
                      {item.checkoutDate}
                    </td>

                    {/* Nút trạng thái (Sử dụng e.stopPropagation() để không bị dính sự kiện click chuyển trang) */}
                    <td
                      className="border-x border-gray-200 px-4 py-3 align-middle flex justify-center items-center"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <select
                        value={item.status}
                        className={`min-w-36 cursor-pointer rounded-full px-4 py-1.5 text-sm font-medium text-white shadow-sm outline-none transition-opacity hover:opacity-90 ${item.status === "Đã xử lí" ? "bg-primary" : item.status === "Đang chờ xử lí" ? "bg-text2" : "bg-accent"}`}
                        onClick={(e) => e.stopPropagation()}
                        onChange={async (e) => {
                          e.stopPropagation();
                          await handleChangeStatus(item.id, e.target.value);
                        }}
                      >
                        <option value="Đã hẹn">Đã hẹn</option>
                        <option value="Đang chờ xử lí">Đang chờ xử lí</option>
                        <option value="Đã xử lí">Đã xử lí</option>
                      </select>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </main>
    </>
  );
}

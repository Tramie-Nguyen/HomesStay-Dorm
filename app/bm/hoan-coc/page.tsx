"use client";

import React, { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import NavBar from "../../../components/layout/nav";

// Định nghĩa kiểu dữ liệu khớp với DB
type HoanCocRow = {
  id: string;
  maKhachHang: string;
  fullName: string;
  roomCode: string;
  checkoutDate: string;
  status: string;
};

export default function QL_DanhSachHoanCocPage() {
  const router = useRouter();
  const [sortOrder, setSortOrder] = useState<"desc" | "asc">("desc");
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState<string | null>(null);
  const [data, setData] = useState<HoanCocRow[]>([]); // Khởi tạo mảng rỗng thay vì mock data
  const [loading, setLoading] = useState(false);

  // Reusable fetch function so pages can reload after updates
  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filterStatus) params.append("status", filterStatus);
      params.append("sort", sortOrder === "desc" ? "DESC" : "ASC");

      const response = await fetch(`/api/hoan-coc?${params.toString()}`);

      if (response.ok) {
        const result = (await response.json()) as { data?: HoanCocRow[] };
        setData(result.data ?? []);
      } else {
        setData([]);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  }, [filterStatus, sortOrder]);

  // 1. Gọi API lấy dữ liệu từ DB
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // 3. Lọc và sắp xếp dữ liệu ở Frontend (kết hợp với tìm kiếm)
  const filteredData = data
    .filter((item: HoanCocRow) => {
      const keyword = search.trim().toLowerCase();
      return (
        (item.roomCode ?? "").toLowerCase().includes(keyword) ||
        (item.fullName ?? "").toLowerCase().includes(keyword)
      );
    })
    .filter((item: HoanCocRow) =>
      filterStatus ? item.status === filterStatus : true,
    )
    .sort((a: HoanCocRow, b: HoanCocRow) => {
      // Sắp xếp theo ngày trả
      const dateA = new Date(a.checkoutDate).getTime();
      const dateB = new Date(b.checkoutDate).getTime();
      return sortOrder === "desc" ? dateB - dateA : dateA - dateB;
    });

  // 4. Xử lý đổi trạng thái (Gọi API Update)
  const handleChangeStatus = async (id: string, newStatus: string) => {
    try {
      const item = data.find((d: HoanCocRow) => d.id === id);
      if (!item) return;

      const response = await fetch(`/api/hoan-coc/${encodeURIComponent(id)}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });

      if (response.ok) {
        setData((prev) =>
          prev.map((row) =>
            row.id === id ? { ...row, status: newStatus } : row,
          ),
        );
        // Reload list from server to reflect DB update
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
      <main className="min-h-screen bg-base font-sans p-6 pt-24 pb-24">
        <h1 className="mb-6 text-center text-2xl font-bold text-text1 uppercase tracking-wide">
          Quản lý - Danh sách hoàn cọc
        </h1>
        <div className="mx-auto max-w-5xl">
          {/* Toolbar */}
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
                className="rounded-md border border-base px-3 py-1.5 text-sm outline-none focus:border-accent"
                type="text"
                placeholder="Tìm kiếm phòng..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              <select
                className="rounded-md border border-base px-3 py-1.5 text-sm outline-none focus:border-accent"
                value={filterStatus ?? ""}
                onChange={(e) => setFilterStatus(e.target.value || null)}
              >
                <option value="">Tất cả trạng thái</option>
                <option value="Đã hẹn">Đã hẹn</option>
                <option value="Đang chờ xử lí">Đang chờ xử lí</option>
                <option value="Đã xử lí">Đã xử lí</option>
              </select>
            </div>
          </div>

          {/* Table hiển thị danh sách */}
          <div className="overflow-visible rounded-md shadow-sm bg-white">
            <table className="w-full border-collapse text-center">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="border-x border-gray-200 px-4 py-3 align-middle font-bold text-gray-700">
                    Họ tên
                  </th>
                  <th className="border-x border-gray-200 px-4 py-3 align-middle font-bold text-gray-700">
                    Phòng
                  </th>
                  <th className="border-x border-gray-200 px-4 py-3 align-middle font-bold text-gray-700">
                    Ngày trả
                  </th>
                  <th className="border-x border-gray-200 px-4 py-3 align-middle font-bold text-gray-700">
                    Trạng thái
                  </th>
                </tr>
              </thead>
              <tbody>
                {/* Xử lý hiển thị loading hoặc không có dữ liệu */}
                {loading ? (
                  <tr>
                    <td
                      colSpan={4}
                      className="text-center py-8 text-gray-500 align-middle"
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
                  filteredData.map((item: HoanCocRow) => (
                    <tr
                      key={item.id}
                      className="cursor-pointer hover:bg-primary/10 transition-colors border-b border-gray-200 last:border-0"
                      onClick={() =>
                        router.push(
                          `/QuanLy/ttHoanCoc?ma_kh=${encodeURIComponent(item.maKhachHang)}`,
                        )
                      }
                    >
                      <td className="border-x border-gray-200 px-4 py-3 align-middle text-gray-800">
                        {item.fullName}
                      </td>
                      <td className="border-x border-gray-200 px-4 py-3 align-middle text-gray-800">
                        {item.roomCode}
                      </td>
                      <td className="border-x border-gray-200 px-4 py-3 align-middle text-gray-800">
                        {item.checkoutDate}
                      </td>

                      {/* Nút trạng thái (Sử dụng e.stopPropagation() để không bị dính sự kiện click chuyển trang) */}
                      <td
                        className="border-x border-gray-200 px-4 py-3 align-middle"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <select
                          value={item.status}
                          className={`min-w-36 cursor-pointer rounded-full px-4 py-1.5 text-sm font-medium text-white shadow-sm outline-none transition-opacity hover:opacity-90 ${item.status === "Đã xử lí" ? "bg-green-600" : item.status === "Đang chờ xử lí" ? "bg-yellow-600" : "bg-accent"}`}
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
        </div>
      </main>
    </>
  );
}

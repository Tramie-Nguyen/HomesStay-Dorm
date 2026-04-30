"use client";

import { useCallback, useEffect, useRef, useState } from "react";
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
  const [openDropdownId, setOpenDropdownId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filterStatus) params.append("status", filterStatus);
      params.append("sort", sortOrder === "desc" ? "DESC" : "ASC");

      const response = await fetch(
        `/api/bien-ban-tra-phong?${params.toString()}`,
      );
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

  const dropdownRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setOpenDropdownId(null);
      }
    }

    if (openDropdownId !== null) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [openDropdownId]);

  const filteredData = data
    .filter((item) => {
      const keyword = search.trim().toLowerCase();
      return (
        (item.roomCode ?? "").toLowerCase().includes(keyword) ||
        (item.fullName ?? "").toLowerCase().includes(keyword)
      );
    })
    .filter((item) => (filterStatus ? item.status === filterStatus : true))
    .sort((a, b) => {
      const dateA = new Date(a.checkoutDate).getTime();
      const dateB = new Date(b.checkoutDate).getTime();
      return sortOrder === "desc" ? dateB - dateA : dateA - dateB;
    });

  const handleChangeStatus = async (id: string, newStatus: string) => {
    try {
      const item = data.find((d) => d.id === id);
      if (!item) return;

      const response = await fetch(`/api/bien-ban-tra-phong/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });

      if (response.ok) {
        await fetchData();
      }
    } catch (error) {
      console.error("Error updating status:", error);
    }

    setOpenDropdownId(null);
  };

  return (
    <>
      <NavBar />
      <main className="min-h-screen bg-base font-sans p-6 pt-24">
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
                className="rounded-md border border-base px-3 py-1.5 text-sm"
                type="text"
                placeholder="Tìm kiếm phòng..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              <select
                className="rounded-md border border-base px-3 py-1.5 text-sm"
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

          <table className="w-full border-collapse bg-white shadow-md">
            <thead>
              <tr>
                <th className="border px-4 py-2">Họ tên</th>
                <th className="border px-4 py-2">Phòng</th>
                <th className="border px-4 py-2">Ngày trả</th>
                <th className="border px-4 py-2">Trạng thái</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={4} className="text-center py-4 text-gray-500">
                    Đang tải dữ liệu...
                  </td>
                </tr>
              ) : filteredData.length === 0 ? (
                <tr>
                  <td colSpan={4} className="text-center py-4 text-gray-500">
                    Không có dữ liệu
                  </td>
                </tr>
              ) : (
                filteredData.map((item) => (
                  <tr
                    key={item.id}
                    className="hover:bg-gray-50 cursor-pointer"
                    onClick={() =>
                      router.push(
                        `/QuanLy/ttHoanCoc?maKhachHang=${item.maKhachHang}`,
                      )
                    }
                  >
                    <td className="border px-4 py-2">{item.fullName}</td>
                    <td className="border px-4 py-2">{item.roomCode}</td>
                    <td className="border px-4 py-2">{item.checkoutDate}</td>
                    <td
                      className="border px-4 py-2"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <div className="relative inline-block" ref={dropdownRef}>
                        <button
                          className={`min-w-30 rounded-full px-4 py-1 text-sm font-medium text-white shadow-sm focus:outline-none ${item.status === "Đã xử lí" ? "bg-green-600" : item.status === "Đang chờ xử lí" ? "bg-yellow-600" : "bg-pink-500"}`}
                          onClick={() =>
                            setOpenDropdownId(
                              openDropdownId === item.id ? null : item.id,
                            )
                          }
                        >
                          {item.status}
                        </button>
                        {openDropdownId === item.id && (
                          <div className="absolute left-0 mt-2 w-40 bg-white border border-base rounded shadow z-10">
                            <button
                              className="block w-full text-left px-4 py-2 hover:bg-base"
                              onClick={() =>
                                handleChangeStatus(item.id, "Đã hẹn")
                              }
                            >
                              Đã hẹn
                            </button>
                            <button
                              className="block w-full text-left px-4 py-2 hover:bg-base"
                              onClick={() =>
                                handleChangeStatus(item.id, "Đang chờ xử lí")
                              }
                            >
                              Đang chờ xử lí
                            </button>
                            <button
                              className="block w-full text-left px-4 py-2 hover:bg-base"
                              onClick={() =>
                                handleChangeStatus(item.id, "Đã xử lí")
                              }
                            >
                              Đã xử lí
                            </button>
                          </div>
                        )}
                      </div>
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

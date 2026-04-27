"use client";
import { useState } from "react";

import Link from "next/link";

function NavBarBM() {
  const bmItems = [
    { href: "/bm/danh-sach-phong", label: "Danh sách phòng" },
    { href: "/bm/khach-cua-toi", label: "Khách của tôi" },
    { href: "/bm/tra-phong", label: "Trả phòng" },
    { href: "/bm/hoan-coc", label: "Hoàn cọc" },
    { href: "/bm/chinh-sach", label: "Chính sách" },
  ];
  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-primary">
      <div className="container mx-auto px-6 flex items-center justify-between h-15">
        <Link href="/" className="flex items-center space-x-3 group">
          <span className="font-bold text-xl text-text1">Homestay Dorm</span>
        </Link>
        <nav className="flex items-center space-x-4">
          {bmItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="px-4 py-2 text-lg font-medium rounded-lg text-text2 hover:text-text1"
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}

// Dữ liệu mẫu
const initialData = [
  {
    id: 1,
    fullName: "Nguyễn Văn A",
    roomCode: "P101",
    requestDate: "2024-04-01",
    checkoutDate: "2024-04-10",
    status: "Đã hoàn cọc",
  },
  {
    id: 2,
    fullName: "Trần Thị B",
    roomCode: "P102",
    requestDate: "2024-04-02",
    checkoutDate: "2024-04-12",
    status: "Chờ hoàn cọc",
  },
];

import { useRef } from "react";
import React from "react";

export default function QL_dsHoanCocPage() {
  const [sortOrder, setSortOrder] = useState<"desc" | "asc">("desc");
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState<string | null>(null);
  const [data, setData] = useState(initialData);
  const [openDropdownId, setOpenDropdownId] = useState<number | null>(null);

  // Đóng dropdown khi click ra ngoài
  const dropdownRef = useRef<HTMLDivElement>(null);
  React.useEffect(() => {
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
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [openDropdownId]);

  // Lọc và sắp xếp dữ liệu
  const filteredData = data
    .filter((item) => {
      const keyword = search.toLowerCase();
      return (
        item.roomCode.toLowerCase().includes(keyword) ||
        item.fullName.toLowerCase().includes(keyword)
      );
    })
    .filter((item) => (filterStatus ? item.status === filterStatus : true))
    .sort((a, b) => {
      const dateA = new Date(a.requestDate).getTime();
      const dateB = new Date(b.requestDate).getTime();
      return sortOrder === "desc" ? dateB - dateA : dateA - dateB;
    });

  // Đổi trạng thái
  const handleChangeStatus = (id: number, newStatus: string) => {
    setData((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, status: newStatus } : item,
      ),
    );
    setOpenDropdownId(null);
  };

  return (
    <>
      <NavBarBM />
      <main className="min-h-screen bg-base font-sans p-6 pt-24">
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
                <option value="Đã hoàn cọc">Đã hoàn cọc</option>
                <option value="Chờ hoàn cọc">Chờ hoàn cọc</option>
              </select>
            </div>
          </div>
          {/* Danh sách */}
          <table className="w-full border-collapse bg-white shadow-md">
            <thead>
              <tr>
                <th className="border px-4 py-2">Họ tên</th>
                <th className="border px-4 py-2">Phòng</th>
                <th className="border px-4 py-2">Ngày yêu cầu</th>
                <th className="border px-4 py-2">Ngày trả</th>
                <th className="border px-4 py-2">Trạng thái</th>
              </tr>
            </thead>
            <tbody>
              {filteredData.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center py-4 text-gray-500">
                    Không có dữ liệu
                  </td>
                </tr>
              ) : (
                filteredData.map((item) => (
                  <tr key={item.id}>
                    <td className="border px-4 py-2">{item.fullName}</td>
                    <td className="border px-4 py-2">{item.roomCode}</td>
                    <td className="border px-4 py-2">{item.requestDate}</td>
                    <td className="border px-4 py-2">{item.checkoutDate}</td>
                    <td className="border px-4 py-2">
                      <div className="relative inline-block" ref={dropdownRef}>
                        <button
                          className={`min-w-30 rounded-full px-4 py-1 text-sm font-medium text-white shadow-sm focus:outline-none ${item.status === "Đã hoàn cọc" ? "bg-grey" : "bg-accent"}`}
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
                                handleChangeStatus(item.id, "Đã hoàn cọc")
                              }
                            >
                              Đã hoàn cọc
                            </button>
                            <button
                              className="block w-full text-left px-4 py-2 hover:bg-base"
                              onClick={() =>
                                handleChangeStatus(item.id, "Chờ hoàn cọc")
                              }
                            >
                              Chờ hoàn cọc
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

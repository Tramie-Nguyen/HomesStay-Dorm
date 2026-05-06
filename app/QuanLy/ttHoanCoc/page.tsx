"use client";
import { useState, useEffect, Key } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import Link from "next/link";
import NavBar from "../../../components/layout/nav";

export default function TT_HoanCocPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const ma_kh = searchParams?.get("ma_kh");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [userInfo, setUserInfo] = useState<any>(null);
  const [roomInfo, setRoomInfo] = useState<any>({
    images: [] as string[],
    dormName: "",
    bed: "",
    price: "",
  });
  const [items, setItems] = useState<any[]>([]);
  const [reason, setReason] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      if (!ma_kh) return;
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`/api/hoancoc/${encodeURIComponent(ma_kh)}`);
        const json = await res.json();
        console.debug("/api/hoancoc response:", json);
        if (!res.ok) {
          setError(json?.error || "API error");
          setUserInfo(null);
          setRoomInfo({ images: [], dormName: "", bed: "", price: "" });
          setItems([]);
          return;
        }
        const customer = json.customer || null;
        const itemsArr = json.items || [];
        const reasonText = json.reason || null;
        if (!customer) {
          setError("Không tìm thấy dữ liệu khách hàng cho mã này.");
          setUserInfo(null);
          setRoomInfo({ images: [], dormName: "", bed: "", price: "" });
          setItems([]);
          setReason(reasonText);
        } else {
          setError(null);
          setReason(reasonText);
          setUserInfo({
            fullName: customer.TEN_KH || "",
            email: customer.EMAIL || "",
            idCard: customer.CCCD || "",
            phone: customer.SDT || "",
            gender: customer.GIOI_TINH || "",
            dob: customer.NGAY_SINH
              ? String(customer.NGAY_SINH).split("T")[0]
              : "",
          });
          setRoomInfo({
            images: customer.IMAGE_URL ? [customer.IMAGE_URL] : [],
            dormName: customer.TEN_KTX || "",
            bed: customer.MA_GIUONG || "",
            price: customer.GIA ? String(customer.GIA) : "",
          });
          const mapped = itemsArr.map((r: any, idx: number) => ({
            id: idx + 1,
            name: r.TEN_VAT_TU || r.MA_VT || "",
            unit: "cái",
            quantity: r.SO_LUONG || 0,
          }));
          setItems(mapped);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [ma_kh]);

  const mockUserInfo = userInfo || {
    fullName: "-",
    email: "-",
    idCard: "-",
    phone: "-",
    gender: "-",
    dob: "-",
  };
  const mockRoomInfo = roomInfo || {
    images: [],
    dormName: "-",
    bed: "-",
    price: "-",
  };
  const mockItems = items.length
    ? items
    : [{ id: 1, name: "-", unit: "-", quantity: 0 }];

  return (
    <>
      <NavBar />
      <div className="min-h-screen bg-background p-6 font-sans pt-20">
        <div className="mx-auto max-w-5xl bg-base/40 p-6 rounded-xl shadow-sm border border-base">
          {/* Header: Nút Back & Tiêu đề */}
          <div className="relative mb-8 flex items-center justify-center">
            <button className="absolute left-0 text-accent hover:opacity-80 transition-opacity">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="28"
                height="28"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M9 14 4 9l5-5" />
                <path d="M4 9h10.5a5.5 5.5 0 0 1 5.5 5.5v0a5.5 5.5 0 0 1-5.5 5.5H11" />
              </svg>
            </button>
            <h1 className="text-2xl font-bold text-text1 uppercase tracking-wide">
              Thông tin
            </h1>
          </div>

          {/* Khối Thông tin khách hàng & Thông tin phòng */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-8">
            {/* Cột trái: Thông tin cá nhân */}
            <div className="flex flex-col gap-4">
              <InputField label="Họ và tên" value={mockUserInfo.fullName} />
              <InputField label="Email" value={mockUserInfo.email} />
              <InputField label="CCCD" value={mockUserInfo.idCard} />
              <InputField label="Số điện thoại" value={mockUserInfo.phone} />
              <InputField label="Giới tính" value={mockUserInfo.gender} />
              <InputField label="Ngày sinh" value={mockUserInfo.dob} />
            </div>
            {/* Cột phải: Khối Phòng */}
            <div>
              <div className="overflow-hidden rounded-xl bg-primary/20 shadow-sm">
                <div className="bg-primary py-3 text-center text-sm font-bold text-text1">
                  PHÒNG
                </div>
                <div className="p-6">
                  {/* Hình ảnh phòng */}
                  <div className="mb-6 flex justify-center gap-4">
                    {mockRoomInfo.images.map(
                      (
                        src: string | Blob | undefined,
                        idx: Key | null | undefined,
                      ) => (
                        <img
                          key={String(idx)}
                          src={src || "/placeholder.png"}
                          alt={`Room img ${String(idx)}`}
                          className="h-50 w-70 object-cover rounded border border-gray-300 shadow-sm"
                        />
                      ),
                    )}
                  </div>
                  {/* Chi tiết phòng */}
                  <div className="space-y-3 text-text1">
                    <h3 className="text-text1 font-bold uppercase">
                      {mockRoomInfo.dormName}
                    </h3>
                    <p className="text-text1">
                      <span className="font-bold">GIƯỜNG</span>{" "}
                      {mockRoomInfo.bed}
                    </p>
                    <p className="text-text1">
                      <span className="font-bold">Giá:</span>{" "}
                      <span className="text-accent">{mockRoomInfo.price}</span>
                    </p>
                  </div>
                  {/* Trạng thái thuê */}
                  <div className="mt-6 flex items-center justify-start gap-8 font-medium text-text2">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <div className="flex h-5 w-5 items-center justify-center rounded border border-grey bg-transparent">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="14"
                          height="14"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="3"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          className="text-transparent"
                        >
                          <polyline points="20 6 9 17 4 12"></polyline>
                        </svg>
                      </div>
                      Khách chưa thuê
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer text-primary">
                      <div className="flex h-5 w-5 items-center justify-center rounded bg-primary">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="14"
                          height="14"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="white"
                          strokeWidth="3"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <polyline points="20 6 9 17 4 12"></polyline>
                        </svg>
                      </div>
                      Khách thuê
                    </label>
                  </div>
                </div>
              </div>
            </div>
          </div>
          {/* Khối Lý do trả phòng */}
          <div className="mb-8">
            <h2 className="mb-3 text-lg font-bold text-text1">
              Lý do trả phòng:
            </h2>
            <div className="w-full rounded-2xl border border-grey bg-base p-4 min-h-[100px] text-text1 text-base shadow-sm">
              {reason || "Chưa có lý do trả phòng."}
            </div>
          </div>
          {/* Khối Danh sách vật dụng */}
          <div className="mb-8">
            <h2 className="mb-4 text-center text-lg font-bold uppercase text-text1">
              Danh sách vật dụng
            </h2>
            {error && (
              <div className="mb-3 rounded-md border border-red-300 bg-red-50 px-4 py-2 text-sm text-red-700">
                {error}
              </div>
            )}
            <div className="overflow-hidden bg-base shadow-sm border border-grey">
              <table className="w-full border-collapse text-center">
                <thead>
                  <tr>
                    <th className="border border-grey p-3 text-base font-bold text-text1">
                      Tên vật dụng
                    </th>
                    <th className="border border-grey p-3 text-base font-bold text-text1">
                      Đơn vị tính
                    </th>
                    <th className="border border-grey p-3 text-base font-bold text-text1">
                      Số lượng
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {mockItems.map((item) => (
                    <tr key={item.id} className="hover:bg-primary/10">
                      <td className="border border-grey p-2.5 text-text1 font-medium text-left pl-6">
                        {item.name}
                      </td>
                      <td className="border border-grey p-2.5 text-text1 font-medium">
                        {item.unit}
                      </td>
                      <td className="border border-grey p-2.5 text-text1 font-medium">
                        {item.quantity}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          {/* Nút Tính toán chi phí */}
          <div className="flex justify-end">
            <button
              className="rounded-full bg-accent px-8 py-2.5 text-base font-bold text-white shadow-md hover:bg-primary transition-colors"
              onClick={() =>
                router.push(
                  `/QuanLy/LapPhieuHoanCoc${ma_kh ? `?ma_kh=${encodeURIComponent(ma_kh)}` : ""}`,
                )
              }
            >
              Tính toán chi phí
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

// Component phụ trợ cho các ô input (Read-only UI)
function InputField({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col">
      <label className="mb-1 text-sm font-bold text-text1">{label}</label>
      <div className="rounded-md bg-primary/10 px-3 py-2 text-text2 font-semibold">
        {value}
      </div>
    </div>
  );
}

// Đảm bảo InputField được định nghĩa trước khi sử dụng

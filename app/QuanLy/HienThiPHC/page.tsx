"use client";
import React, { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import NavBar from "../../../components/layout/nav";

export default function HienThiPHCPage() {
  const searchParams = useSearchParams();
  const ma_phieu = searchParams?.get("ma_phieu");
  const totalParam = searchParams?.get("total");

  const [customer, setCustomer] = useState<any>(null);
  const [summary, setSummary] = useState<any>(null);
  const [images, setImages] = useState<string[]>([]);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [confirmed, setConfirmed] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<string>("Tiền mặt");

  useEffect(() => {
    async function load() {
      if (!ma_phieu) return;
      try {
        const res = await fetch(
          `/api/hien-thi-phc?ma_phieu=${encodeURIComponent(ma_phieu)}`,
        );
        const json = await res.json();
        if (res.ok) {
          setCustomer(json.customer);
          setSummary(json.summary);
          // use IMAGE_URL from customer/room if available, otherwise placeholder
          const img = json.customer?.IMAGE_URL || "/images/room1.jpg";
          setImages([img, img, img]);
        } else {
          console.error(json);
        }
      } catch (err) {
        console.error(err);
      }
    }
    load();
  }, [ma_phieu]);

  const parsedTotal = totalParam ? Number(totalParam) : undefined;
  const displayTotal =
    typeof parsedTotal === "number" && !Number.isNaN(parsedTotal)
      ? parsedTotal
      : (summary?.TIEN_COC ?? 0);

  const formatDate = (dateStr: string | undefined) => {
    if (!dateStr) return "-";
    try {
      const date = new Date(dateStr);
      const day = String(date.getDate()).padStart(2, "0");
      const month = String(date.getMonth() + 1).padStart(2, "0");
      const year = date.getFullYear();
      return `${day}/${month}/${year}`;
    } catch {
      return dateStr;
    }
  };

  const handleMainClick = () => {
    setIsConfirmOpen(true);
  };

  const handleConfirm = async () => {
    try {
      const amount = Math.abs(Number(displayTotal) || 0);
      const payload = {
        ma_phieu: ma_phieu,
        ma_hop_dong: ma_phieu,
        hinh_thuc: paymentMethod,
        so_tien: amount,
      };
      const res = await fetch("/api/hien-thi-phc", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const json = await res.json();
      if (!res.ok) {
        alert(
          "Lỗi khi lưu thanh toán: " +
            (json?.error || json?.detail || "Unknown"),
        );
        return;
      }
      // mark confirmed and close popup
      setConfirmed(true);
      setIsConfirmOpen(false);
    } catch (err) {
      console.error(err);
      alert("Lỗi khi xác nhận thanh toán");
    }
  };

  return (
    <>
      <NavBar />
      <main className="min-h-screen bg-background pt-24 pb-8 font-sans">
        <div className="mx-auto max-w-5xl px-6">
          <h1 className="mb-6 text-center text-2xl font-bold uppercase text-text1">
            Thông tin thanh toán
          </h1>

          <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
            <section className="space-y-4">
              <div className="rounded-md bg-base/50 p-4">
                <label className="block text-sm font-semibold text-text2">
                  Họ và tên
                </label>
                <div className="mt-2 rounded-md bg-primary/10 px-3 py-2 text-text2">
                  {customer?.TEN_KH || "-"}
                </div>

                <label className="mt-4 block text-sm font-semibold text-text2">
                  Email
                </label>
                <div className="mt-2 rounded-md bg-primary/10 px-3 py-2 text-text2">
                  {customer?.EMAIL || "-"}
                </div>

                <label className="mt-4 block text-sm font-semibold text-text2">
                  CCCD
                </label>
                <div className="mt-2 rounded-md bg-primary/10 px-3 py-2 text-text2">
                  {customer?.CCCD || "-"}
                </div>

                <label className="mt-4 block text-sm font-semibold text-text2">
                  Số điện thoại
                </label>
                <div className="mt-2 rounded-md bg-primary/10 px-3 py-2 text-text2">
                  {customer?.SDT || "-"}
                </div>

                <div className="mt-4 grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-text2">
                      Giới tính
                    </label>
                    <div className="mt-2 rounded-md bg-primary/10 px-3 py-2 text-text2">
                      {customer?.GIOI_TINH || "-"}
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-text2">
                      Ngày sinh
                    </label>
                    <div className="mt-2 rounded-md bg-primary/10 px-3 py-2 text-text2">
                      {formatDate(customer?.NGAY_SINH)}
                    </div>
                  </div>
                </div>
              </div>

              {displayTotal < 0 && (
                <div className="w-44 rounded-lg bg-white p-3 shadow">
                  <img
                    src="/images/qr-placeholder.png"
                    alt="qr"
                    className="h-auto w-full"
                  />
                </div>
              )}
            </section>

            <section>
              <div className="rounded-md bg-base/50 p-4">
                <div className="flex gap-3">
                  <div className="w-[50px] h-[70px] overflow-hidden rounded bg-gray-100">
                    <img
                      src={images[0] || "/images/room1.jpg"}
                      alt="room"
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>

                <div className="mt-4 rounded bg-base p-4">
                  <h4 className="font-bold text-text1">
                    {customer?.MA_PHONG ? `${customer.MA_PHONG}` : "-"}
                  </h4>
                  <p className="mt-2">
                    <span className="font-semibold">GIƯỜNG</span>{" "}
                    {customer?.MA_GIUONG || "-"}
                  </p>
                  <p className="mt-2">
                    Giá:{" "}
                    <span className="text-accent">
                      {customer?.GIA ? `${customer.GIA}` : "-"}
                    </span>
                  </p>

                  <div className="mt-4 flex items-center gap-4">
                    <label className="flex items-center gap-2 text-text2">
                      <input
                        type="checkbox"
                        checked={false}
                        readOnly
                        className="accent-primary"
                      />
                      Khách chưa thuê
                    </label>
                    <label className="flex items-center gap-2 text-primary">
                      <input
                        type="checkbox"
                        checked={true}
                        readOnly
                        className="accent-primary"
                      />
                      Khách thuê
                    </label>
                  </div>
                </div>

                <div className="mt-4 rounded-md bg-base/70 p-4">
                  <h3 className="text-lg font-bold leading-snug text-primary">
                    VUI LÒNG KIỂM TRA LẠI TOÀN BỘ THÔNG TIN TRƯỚC KHI THANH
                    TOÁN!!!
                  </h3>
                  <p className="mt-2 font-medium text-text2">
                    Số tiền thanh toán đã bao gồm toàn bộ chi phí và không phát
                    sinh thêm bất kỳ khoản thu nào!
                  </p>
                </div>

                <div className="mt-6 text-center">
                  {displayTotal < 0 ? (
                    <p className="text-2xl font-bold text-text1">
                      Thành tiền:{" "}
                      <span className="text-accent">
                        {Math.abs(displayTotal).toLocaleString()} VND
                      </span>
                    </p>
                  ) : (
                    <p className="text-2xl font-bold text-text1">
                      Số tiền phải hoàn cho khách là:{" "}
                      <span className="text-accent">
                        {displayTotal.toLocaleString()} VND
                      </span>
                    </p>
                  )}

                  <button
                    onClick={handleMainClick}
                    disabled={confirmed}
                    className={`mt-6 inline-block rounded-full px-6 py-2 font-semibold text-white transition ${confirmed ? "bg-gray-400 cursor-not-allowed" : "bg-accent hover:bg-primary"}`}
                  >
                    {confirmed ? "Đã giao dịch thành công" : "Đã Thanh toán"}
                  </button>
                </div>
              </div>
            </section>
          </div>
        </div>

        {isConfirmOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
            <div className="mt-4 rounded-md bg-base p-6 shadow-2xl">
              <h2 className="text-center text-xl font-bold text-text1">
                Xác nhận thanh toán
              </h2>

              <div className="mt-4">
                <label className="block text-sm font-medium text-text2 mb-2">
                  Hình thức thanh toán
                </label>
                <div className="flex items-center gap-3 mb-4 justify-center">
                  <select
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="rounded-md border px-3 py-2"
                  >
                    <option>Tiền mặt</option>
                    <option>Chuyển khoản</option>
                  </select>
                </div>

                <div className="text-center mb-4">
                  <div className="text-sm text-text2">Số tiền</div>
                  <div className="text-lg font-bold">
                    {Math.abs(displayTotal).toLocaleString()} VND
                  </div>
                </div>

                <div className="flex justify-center">
                  <button
                    onClick={() => {
                      handleConfirm();
                    }}
                    disabled={confirmed}
                    className="rounded-full bg-accent px-8 py-2.5 text-[16px] font-bold text-white shadow-md transition-colors hover:bg-primary disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    {confirmed ? "Đã giao dịch thành công" : "Xác nhận"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </>
  );
}

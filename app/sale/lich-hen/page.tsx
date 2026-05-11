"use client";

import { useEffect, useMemo, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { getAuthData } from "@/utils/auth";
import {
  getDanhSachLichHen,
  xuLyLichHen,
  type Appointment,
} from "@/services/lichHenService";

const ITEMS_PER_PAGE = 3;

const formatCurrency = (value: number | null | undefined) => {
  if (value === null || value === undefined) return "-";
  return `${new Intl.NumberFormat("vi-VN").format(value)}/tháng`;
};

const formatFee = (value: number | null | undefined, unit: string) => {
  if (value === null || value === undefined) return "-";
  return `${new Intl.NumberFormat("vi-VN").format(value)}${unit}`;
};

const resolveImageSrc = (value: string | null) => {
  if (!value) return "/room.png";
  if (value.startsWith("http://") || value.startsWith("https://")) return value;
  if (value.startsWith("/")) return value;
  return `/${value}`;
};

export default function SaleLichHenPage() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [submittingId, setSubmittingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);

  const fetchAppointments = async () => {
    try {
      setLoading(true);
      setError(null);

      const data = await getDanhSachLichHen(); // ← gọi service

      setAppointments(data);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Đã có lỗi xảy ra";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, []);

  const totalPages = Math.max(
    1,
    Math.ceil(appointments.length / ITEMS_PER_PAGE),
  );

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  const paginatedAppointments = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return appointments.slice(start, start + ITEMS_PER_PAGE);
  }, [appointments, currentPage]);

  const handleAction = async (
    appointment: Appointment,
    action: "accept" | "cancel",
  ) => {
    if (submittingId) return;

    try {
      setSubmittingId(appointment.MA_PHIEU);
      setError(null);

      const authData = getAuthData();
      const maNv = authData?.user?.MA_NV ?? "";

      await xuLyLichHen(appointment.MA_PHIEU, action, maNv); // ← gọi service
      await fetchAppointments();
    } catch (err) {
      const message = err instanceof Error ? err.message : "Đã có lỗi xảy ra";
      setError(message);
    } finally {
      setSubmittingId(null);
    }
  };

  return (
    <div
      className="min-h-screen bg-background py-8"
      style={{ paddingLeft: "100pt", paddingRight: "100pt" }}
    >
      <div className="mx-auto max-w-7xl">
        <h1 className="mb-8 text-center text-4xl font-bold uppercase tracking-wide text-text1">
          Lịch hẹn
        </h1>

        {error && (
          <div className="mb-4 rounded-xl border border-accent/30 bg-accent/10 px-4 py-3 text-sm text-text1">
            {error}
          </div>
        )}

        {loading ? (
          <div className="rounded-2xl bg-base p-8 text-center text-text2">
            Đang tải dữ liệu...
          </div>
        ) : paginatedAppointments.length === 0 ? (
          <div className="rounded-2xl bg-base p-8 text-center text-text2">
            Không có lịch hẹn cần xử lý.
          </div>
        ) : (
          <div className="space-y-5">
            {paginatedAppointments.map((item) => {
              const isSubmitting = submittingId === item.MA_PHIEU;

              return (
                <article
                  key={item.MA_PHIEU}
                  className="rounded-2xl bg-base p-4 shadow-sm md:p-6"
                >
                  <div className="flex flex-col gap-4 md:flex-row md:gap-6">
                    <div className="w-full md:w-64">
                      <div className="relative h-54 w-64 overflow-hidden rounded-xl border border-primary/30 bg-pastel">
                        <img
                          src={resolveImageSrc(item.IMAGE_URL)}
                          alt={`Phòng ${item.MA_PHONG}`}
                          className="h-full w-full object-cover"
                        />
                      </div>
                      <p className="mt-3 font-semibold text-text2">
                        Loại: <span className="text-accent">{item.LOAI}</span>
                      </p>
                    </div>

                    <div
                      className="flex flex-1 flex-col gap-4"
                      style={{ paddingLeft: "10pt" }}
                    >
                      <div className="flex flex-col justify-between gap-3 md:flex-row md:items-start">
                        <div>
                          <h2 className="text-2xl font-bold uppercase text-text1">
                            {item.TEN_KTX} - Phòng {item.MA_PHONG}
                          </h2>
                          <p className="font-medium text-text2">
                            Giường {item.MA_GIUONGS || "-"}
                          </p>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 gap-2 text-lg text-text1 md:grid-cols-2">
                        <div>
                          <p>
                            Giá:{" "}
                            <span className="font-semibold text-accent">
                              {formatCurrency(item.GIA_PHONG)}
                            </span>
                          </p>
                          <p>Điện: {formatFee(item.GIA_DIEN, "/kWh")}</p>
                          <p>Nước: {formatFee(item.GIA_NUOC, "/m3")}</p>
                        </div>

                        <div>
                          <p>Wifi: {formatCurrency(item.WIFI)}</p>
                          <p>Xe: {formatFee(item.GUI_XE, "/xe")}</p>
                          <p>Phí DV: {formatFee(item.DICH_VU, "/ph")}</p>
                        </div>
                      </div>

                      <p className="text-lg font-semibold text-text2">
                        {item.TRANG_THAI}
                      </p>

                      <div className="mt-1 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                        <div className="rounded-lg bg-text2 px-4 py-2 font-semibold text-background">
                          Lịch xem phòng: {item.GIO_HEN} {item.NGAY_HEN}
                        </div>

                        <div className="flex flex-wrap gap-3">
                          <button
                            onClick={() => handleAction(item, "cancel")}
                            disabled={isSubmitting}
                            className="min-w-32 rounded-lg bg-text1 px-4 py-2 font-semibold text-background transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
                          >
                            Hủy lịch
                          </button>

                          <button
                            onClick={() => handleAction(item, "accept")}
                            disabled={isSubmitting}
                            className="min-w-32 rounded-lg bg-text2 px-4 py-2 font-semibold text-background transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
                          >
                            {isSubmitting ? "Đang xử lý..." : "Nhận lịch"}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}

        <div className="mt-8 flex items-center justify-center gap-4">
          <button
            onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
            disabled={currentPage === 1 || loading}
            className="flex h-8 w-8 items-center justify-center rounded bg-grey/25 text-text1 transition hover:bg-grey/40 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <ChevronLeft size={16} />
          </button>

          <p className="text-sm font-bold text-text1">
            <span className="text-accent">{currentPage}</span> / {totalPages}
          </p>

          <button
            onClick={() =>
              setCurrentPage((prev) => Math.min(totalPages, prev + 1))
            }
            disabled={currentPage === totalPages || loading}
            className="flex h-8 w-8 items-center justify-center rounded bg-primary text-text1 transition hover:bg-primary/80 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <ChevronRight size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}

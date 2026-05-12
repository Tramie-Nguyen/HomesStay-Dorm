"use client";

import { useEffect, useMemo, useState, type ReactNode } from "react";
import NavBar from "@/components/layout/nav";
import { getAuthData } from "@/utils/auth";
import { toast } from "react-toastify";
import { RefreshCw, Search, Send } from "lucide-react";

type SaleCustomerRow = {
  maHopDong: string;
  maPhieu: string | null;
  maKhachHang: string;
  tenKhachHang: string;
  sdt: string | null;
  maPhong: string | null;
  ngayBatDau: string | null;
  ngayKetThuc: string | null;
  trangThaiHopDong: string | null;
  hopDongImage: string | null;
  maBanGiao: string | null;
  ngayBanGiao: string | null;
  bienBanImage: string | null;
  trangThaiBanGiao: string | null;
  maTraPhong: string | null;
  ngayTraPhong: string | null;
  trangThaiTraPhong: string | null;
  noiDungTraPhong: string | null;
};

const formatDate = (value: string | null) => {
  if (!value) return "—";

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return value;

  return parsed.toLocaleDateString("vi-VN");
};

const formatShort = (value: string | null) => value || "—";

export default function SaleKhachCuaToiPage() {
  const [rows, setRows] = useState<SaleCustomerRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [submittingId, setSubmittingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchRows = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch("/api/sale/khach-cua-toi", {
        cache: "no-store",
      });

      const result = (await response.json().catch(() => null)) as {
        data?: SaleCustomerRow[];
        error?: string;
      } | null;

      if (!response.ok) {
        throw new Error(result?.error || "Không thể tải danh sách khách");
      }

      setRows(result?.data ?? []);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Đã có lỗi xảy ra";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRows();
  }, []);

  const filteredRows = useMemo(() => {
    const keyword = search.trim().toLowerCase();

    return rows.filter((row) => {
      if (!keyword) return true;

      return [
        row.maHopDong,
        row.maPhieu,
        row.maKhachHang,
        row.tenKhachHang,
        row.maPhong,
        row.sdt,
      ]
        .filter(Boolean)
        .some((value) => value!.toLowerCase().includes(keyword));
    });
  }, [rows, search]);

  const stats = useMemo(() => {
    const total = rows.length;
    const handoverSaved = rows.filter((row) => row.maBanGiao).length;
    const pendingCheckout = rows.filter(
      (row) =>
        row.trangThaiTraPhong === "Đang chờ xử lí" ||
        row.trangThaiTraPhong === "Đã hẹn",
    ).length;

    return { total, handoverSaved, pendingCheckout };
  }, [rows]);

  const handleSendRequest = async (row: SaleCustomerRow) => {
    if (submittingId) return;

    const authData = getAuthData();
    const maNv = authData?.user?.MA_NV ?? "";

    if (!maNv) {
      toast.error("Không tìm thấy mã nhân viên, vui lòng đăng nhập lại");
      return;
    }

    try {
      setSubmittingId(row.maHopDong);

      const response = await fetch("/api/sale/khach-cua-toi", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          maHopDong: row.maHopDong,
          maNv,
          noiDung: `Khách ${row.tenKhachHang} (${row.maKhachHang}) gọi yêu cầu trả phòng`,
        }),
      });

      const result = (await response.json().catch(() => null)) as {
        error?: string;
      } | null;

      if (!response.ok) {
        throw new Error(result?.error || "Không thể gửi yêu cầu trả phòng");
      }

      toast.success("Đã gửi yêu cầu trả phòng đến quản lý");
      await fetchRows();
    } catch (err) {
      const message = err instanceof Error ? err.message : "Đã có lỗi xảy ra";
      toast.error(message);
    } finally {
      setSubmittingId(null);
    }
  };

  return (
    <>
      <NavBar />

      <main className="min-h-screen bg-background px-6 py-8 pt-24 md:px-10">
        <div className="mx-auto max-w-7xl">
          <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <h1 className="mt-2 text-3xl font-bold text-text1 md:text-4xl">
                Danh sách khách đã thuê phòng
              </h1>
            </div>

            <button
              onClick={fetchRows}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-text2 bg-white px-4 py-2 text-sm font-semibold text-text1 transition hover:border-accent hover:text-accent"
            >
              <RefreshCw size={16} />
              Làm mới
            </button>
          </div>

          <section className="mb-6 grid gap-4 md:grid-cols-3">
            <StatCard label="Tổng hợp đồng" value={stats.total} tone="accent" />
            <StatCard
              label="Đã lưu bàn giao"
              value={stats.handoverSaved}
              tone="success"
            />
            <StatCard
              label="Yêu cầu trả phòng"
              value={stats.pendingCheckout}
              tone="warning"
            />
          </section>

          <section className="mb-6 rounded-2xl border border-primary/20 bg-white p-4 shadow-sm md:p-5">
            <div className="relative max-w-xl">
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Tìm theo tên khách, mã phòng, mã hợp đồng, SĐT..."
                className="w-full rounded-xl border border-text2/20 bg-background py-3 pl-11 pr-4 text-text1 outline-none transition focus:border-accent"
              />
              <Search
                className="absolute left-4 top-1/2 -translate-y-1/2 text-text2"
                size={18}
              />
            </div>
          </section>

          {error && (
            <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}

          {loading ? (
            <div className="rounded-2xl bg-white p-8 text-center text-text2 shadow-sm">
              Đang tải dữ liệu...
            </div>
          ) : filteredRows.length === 0 ? (
            <div className="rounded-2xl bg-white p-8 text-center text-text2 shadow-sm">
              Không tìm thấy hợp đồng phù hợp.
            </div>
          ) : (
            <div className="grid gap-5">
              {filteredRows.map((row) => {
                const hasHandover = !!row.maBanGiao;
                const checkoutDisabled =
                  !hasHandover ||
                  row.trangThaiTraPhong === "Đang chờ xử lí" ||
                  row.trangThaiTraPhong === "Đã hẹn";

                return (
                  <article
                    key={row.maHopDong}
                    className="rounded-2xl border border-primary/20 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
                  >
                    <div className="mb-4 flex flex-col gap-3 border-b border-text2/10 pb-4 md:flex-row md:items-start md:justify-between">
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <h2 className="text-2xl font-bold text-text1">
                            {row.tenKhachHang}
                          </h2>
                          <span className="rounded-full bg-accent/10 px-3 py-1 text-xs font-semibold text-accent">
                            {row.maKhachHang}
                          </span>
                        </div>
                        <p className="mt-1 text-sm text-text2">
                          Hợp đồng:{" "}
                          <span className="font-semibold text-text1">
                            {row.maHopDong}
                          </span>
                          {row.maPhieu ? (
                            <span>
                              {" "}
                              · Phiếu:{" "}
                              <span className="font-semibold text-text1">
                                {row.maPhieu}
                              </span>
                            </span>
                          ) : null}
                        </p>
                      </div>

                      <div className="flex flex-wrap gap-2">
                        <Badge
                          tone={
                            row.trangThaiHopDong === "Đã ký"
                              ? "success"
                              : "muted"
                          }
                        >
                          {row.trangThaiHopDong ?? "—"}
                        </Badge>
                        <Badge tone={hasHandover ? "success" : "muted"}>
                          {row.trangThaiBanGiao ?? "Chưa lưu"}
                        </Badge>
                        {row.trangThaiTraPhong ? (
                          <Badge
                            tone={
                              row.trangThaiTraPhong === "Đã xử lí"
                                ? "success"
                                : "warning"
                            }
                          >
                            {row.trangThaiTraPhong}
                          </Badge>
                        ) : null}
                      </div>
                    </div>

                    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                      <InfoBlock
                        label="Mã phòng"
                        value={formatShort(row.maPhong)}
                      />
                      <InfoBlock label="SĐT" value={formatShort(row.sdt)} />
                      <InfoBlock
                        label="Ngày bắt đầu"
                        value={formatDate(row.ngayBatDau)}
                      />
                      <InfoBlock
                        label="Ngày kết thúc"
                        value={formatDate(row.ngayKetThuc)}
                      />
                    </div>

                    <div className="mt-4 grid gap-4 rounded-2xl bg-background p-4 md:grid-cols-3">
                      <InfoBlock
                        label="Biên bản bàn giao"
                        value={
                          hasHandover
                            ? `Đã lưu ${row.maBanGiao}`
                            : "Chưa có dữ liệu"
                        }
                      />
                      <InfoBlock
                        label="Ngày bàn giao"
                        value={formatDate(row.ngayBanGiao)}
                      />
                      <InfoBlock
                        label="Ngày yêu cầu trả phòng"
                        value={formatDate(row.ngayTraPhong)}
                      />
                    </div>

                    <div className="mt-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                      <div className="text-sm text-text2">
                        <span className="font-semibold text-text1">
                          Nội dung yêu cầu gần nhất:
                        </span>{" "}
                        {row.noiDungTraPhong ?? "Chưa có yêu cầu trả phòng"}
                      </div>

                      <button
                        onClick={() => handleSendRequest(row)}
                        disabled={
                          checkoutDisabled || submittingId === row.maHopDong
                        }
                        className="inline-flex items-center justify-center gap-2 rounded-xl bg-accent px-4 py-2 text-sm font-semibold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        <Send size={16} />
                        {submittingId === row.maHopDong
                          ? "Đang gửi..."
                          : checkoutDisabled
                            ? hasHandover
                              ? "Đã gửi / đang xử lí"
                              : "Chờ hoàn tất bàn giao"
                            : "Gửi yêu cầu trả phòng"}
                      </button>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </div>
      </main>
    </>
  );
}

function StatCard({
  label,
  value,
  tone,
}: {
  label: string;
  value: number;
  tone: "accent" | "success" | "warning";
}) {
  const toneClass =
    tone === "accent"
      ? "border-accent/20 bg-accent/5 text-accent"
      : tone === "success"
        ? "border-emerald-200 bg-emerald-50 text-emerald-700"
        : "border-amber-200 bg-amber-50 text-amber-700";

  return (
    <div className={`rounded-2xl border p-5 shadow-sm ${toneClass}`}>
      <div className="text-sm font-medium uppercase tracking-[0.2em] opacity-80">
        {label}
      </div>
      <div className="mt-3 text-3xl font-bold">{value}</div>
    </div>
  );
}

function Badge({
  tone,
  children,
}: {
  tone: "success" | "warning" | "muted";
  children: ReactNode;
}) {
  const className =
    tone === "success"
      ? "bg-emerald-50 text-emerald-700 border-emerald-200"
      : tone === "warning"
        ? "bg-amber-50 text-amber-700 border-amber-200"
        : "bg-slate-50 text-slate-600 border-slate-200";

  return (
    <span
      className={`rounded-full border px-3 py-1 text-xs font-semibold ${className}`}
    >
      {children}
    </span>
  );
}

function InfoBlock({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-text2">
        {label}
      </p>
      <p className="mt-1 text-sm font-semibold text-text1">{value}</p>
    </div>
  );
}

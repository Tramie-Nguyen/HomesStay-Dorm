// ── Types ────────────────────────────────────────────────────────────────────
export type Appointment = {
  MA_PHIEU: string;
  LOAI: string;
  TRANG_THAI: string;
  NGAY_HEN: string;
  GIO_HEN: string;
  MA_PHONG: string;
  IMAGE_URL: string | null;
  MA_KTX: string;
  TEN_KTX: string;
  GIA_PHONG: number | null;
  GIA_DIEN: number | null;
  GIA_NUOC: number | null;
  WIFI: string | null;
  GUI_XE: number | null;
  DICH_VU: number | null;
  MA_GIUONGS: string;
};

// ── Nghiệp vụ: validate action ───────────────────────────────────────────────
export function validateAction(action: string): "accept" | "cancel" {
  if (action !== "accept" && action !== "cancel") {
    throw new Error("Action không hợp lệ.");
  }
  return action;
}

export function validateMaNv(maNv: string | undefined): string {
  if (!maNv?.trim()) {
    throw new Error("Không tìm thấy mã nhân viên. Vui lòng đăng nhập lại.");
  }
  return maNv.trim();
}

// ── Nghiệp vụ: lấy danh sách lịch hẹn ──────────────────────────────────────
export async function getDanhSachLichHen(): Promise<Appointment[]> {
  const res = await fetch("/api/lich-hen", { cache: "no-store" });
  const data = await res.json();

  if (!res.ok) {
    throw new Error(data?.detail || "Không thể tải danh sách lịch hẹn.");
  }

  return (data?.appointments ?? []) as Appointment[];
}

// ── Nghiệp vụ: xử lý nhận / hủy lịch ───────────────────────────────────────
export async function xuLyLichHen(
  maPhieu: string,
  action: "accept" | "cancel",
  maNv: string,
): Promise<void> {
  validateAction(action);
  if (action === "accept") validateMaNv(maNv);

  const res = await fetch("/api/lich-hen", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ action, maPhieu, maNv }),
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data?.detail || data?.error || "Thao tác thất bại.");
  }
}

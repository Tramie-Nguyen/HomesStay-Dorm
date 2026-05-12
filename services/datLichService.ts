// ── Types ────────────────────────────────────────────────────────────────────
export interface KhachHangInfo {
  maKh: string;
  tenKh: string;
  ngaySinh: string;
  sdt: string;
  email: string;
  cccd: string;
  gioiTinh: string;
}

export interface DatLichPayload {
  type: "khach" | "vanglai";
  tenKh: string;
  sdt: string;
  ngaySinh: string;
  email: string;
  cccd: string;
  gioiTinh: string;
  maPhong: string;
  maKtx: string;
  hinhThucThue: string;
  selectedBeds: string[];
  ngayXem: string;
}

export interface CapNhatKhachHang {
  maKh: string;
  tenKh: string;
  sdt: string;
  cccd: string;
  gioiTinh: string;
  email: string;
}

// ── Nghiệp vụ: validate SĐT ─────────────────────────────────────────────────
export function validateSdt(sdt: string): string {
  const trimmed = sdt.trim();
  if (trimmed.length < 10 || trimmed.length > 11) {
    throw new Error("Số điện thoại không hợp lệ (10–11 số).");
  }
  if (!/^\d+$/.test(trimmed)) {
    throw new Error("Số điện thoại chỉ được chứa chữ số.");
  }
  return trimmed;
}

// ── Nghiệp vụ: validate form đặt lịch ───────────────────────────────────────
export function validateDatLich(payload: DatLichPayload): string | null {
  if (!payload.maPhong || !payload.maKtx) return "Thiếu thông tin phòng.";
  if (payload.selectedBeds.length === 0)
    return "Vui lòng chọn ít nhất 1 giường.";
  if (!payload.ngayXem) return "Vui lòng chọn ngày xem phòng.";
  if (!payload.hinhThucThue) return "Vui lòng chọn hình thức thuê.";

  if (payload.type === "khach") {
    if (!payload.sdt?.trim()) return "Vui lòng nhập số điện thoại.";
  } else {
    if (!payload.tenKh?.trim()) return "Vui lòng nhập họ tên.";
    if (!payload.ngaySinh) return "Vui lòng nhập ngày sinh.";
    if (!payload.cccd?.trim()) return "Vui lòng nhập CCCD.";
    if (!payload.email?.includes("@")) return "Email không hợp lệ.";
    if (payload.sdt?.trim().length < 10) return "Số điện thoại không hợp lệ.";
  }

  return null; // hợp lệ
}

// ── Nghiệp vụ: tìm khách hàng theo SĐT ─────────────────────────────────────
export async function timKhachHang(sdt: string): Promise<KhachHangInfo> {
  const validatedSdt = validateSdt(sdt);

  const res = await fetch(`/api/dat-lich?sdt=${validatedSdt}`);
  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.message || "Không tìm thấy khách hàng.");
  }

  return {
    maKh: data.MA_KH || "",
    tenKh: data.TEN_KH || data.tenKh || "",
    ngaySinh: data.NGAY_SINH
      ? data.NGAY_SINH.split("T")[0]
      : data.ngaySinh || "",
    sdt: data.SDT || data.sdt || validatedSdt,
    email: data.EMAIL || data.email || "",
    cccd: data.CCCD || data.cccd || "",
    gioiTinh: data.GIOI_TINH || data.gioiTinh || "Nữ",
  };
}

// ── Nghiệp vụ: gửi đặt lịch ─────────────────────────────────────────────────
export async function guiDatLich(payload: DatLichPayload): Promise<void> {
  const error = validateDatLich(payload);
  if (error) throw new Error(error);

  const res = await fetch("/api/dat-lich", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  const result = await res.json();
  if (!res.ok) {
    throw new Error(
      `${result.error}${result.details ? "\n" + result.details : ""}`,
    );
  }
}

// ── Nghiệp vụ: kiểm tra có thay đổi không ──────────────────────────────────
export function daThayDoi(
  original: KhachHangInfo & { maKh: string },
  current: KhachHangInfo & { maKh: string },
): boolean {
  return (
    original.tenKh !== current.tenKh ||
    original.sdt !== current.sdt ||
    original.cccd !== current.cccd ||
    original.gioiTinh !== current.gioiTinh ||
    original.email !== current.email
  );
}

// ── Nghiệp vụ: cập nhật thông tin khách hàng ────────────────────────────────
export async function capNhatKhachHang(data: CapNhatKhachHang): Promise<void> {
  const res = await fetch("/api/khach-hang", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

  const result = await res.json();
  if (!res.ok) {
    throw new Error(result.error || "Cập nhật thông tin thất bại.");
  }
}

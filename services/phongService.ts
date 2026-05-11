export interface PhongFilter {
  search: string;
  status: string;
  sort: string;
  page: number;
  ward: string;
  gioiTinh: string;
  minBeds: number;
}

export interface Room {
  id: string;
  code: string;
  availableBeds: number;
  totalBeds: number;
  status: "Trống" | "Đã thuê";
  imageUrl: string | null;
  ktxName: string;
  giaMin: number;
  giaMax: number;
  address: string;
}

export interface PhongResult {
  rooms: Room[];
  totalPages: number;
  total: number;
}

// ── Types cho chi tiết phòng ─────────────────────────────────────────────────
export interface Bed {
  id: string;
  status: "Đã thuê" | "Trống";
  price: number;
}

export interface RoomDetail {
  id: string;
  code: string;
  totalBeds: number;
  availableBeds: number;
  status: "Còn chỗ" | "Hết chỗ";
  imageUrl: string | null;
  ktxName: string;
  address: string;
  quyDinh: string;
  moTaPhong: string;
  giaMin: number;
  giaMax: number;
  giaDien: number;
  giaNuoc: number;
  wifi: string;
  guiXe: number;
  dichVu: number;
  beds: Bed[];
}

// ── Nghiệp vụ: validate & chuẩn hóa filter ──────────────────────────────────
export function validatePhongFilter(raw: Partial<PhongFilter>): PhongFilter {
  const page = Number(raw.page);
  const minBeds = Number(raw.minBeds);
  const allowedSort = ["ASC", "DESC"];
  const allowedStatus = ["Trống", "Đã thuê", ""];
  const allowedGioiTinh = ["Nam", "Nữ", ""];

  return {
    search:
      typeof raw.search === "string" ? raw.search.trim().slice(0, 100) : "",
    status: allowedStatus.includes(raw.status ?? "") ? (raw.status ?? "") : "",
    sort: allowedSort.includes((raw.sort ?? "").toUpperCase())
      ? (raw.sort ?? "ASC").toUpperCase()
      : "ASC",
    page: Number.isInteger(page) && page >= 1 ? page : 1,
    ward: typeof raw.ward === "string" ? raw.ward.trim() : "",
    gioiTinh: allowedGioiTinh.includes(raw.gioiTinh ?? "")
      ? (raw.gioiTinh ?? "")
      : "",
    minBeds: Number.isInteger(minBeds) && minBeds >= 1 ? minBeds : 1,
  };
}

// ── Nghiệp vụ: gọi API route và trả về kết quả ──────────────────────────────
export async function getDanhSachPhong(
  filter: PhongFilter,
): Promise<PhongResult> {
  const validated = validatePhongFilter(filter);

  const qs = new URLSearchParams({
    search: validated.search,
    status: validated.status,
    sort: validated.sort,
    page: String(validated.page),
    ward: validated.ward,
    gioiTinh: validated.gioiTinh,
    minBeds: String(validated.minBeds),
  });

  const res = await fetch(`/api/phong?${qs}`, {
    cache: "no-store",
    headers: { "Cache-Control": "no-cache" },
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Lỗi khi tải danh sách phòng: ${res.status} - ${body}`);
  }

  return res.json() as Promise<PhongResult>;
}

// ── Nghiệp vụ: validate ID ───────────────────────────────────────────────────
export function validateRoomId(id: string): string {
  const trimmed = id?.trim();
  if (!trimmed || trimmed.length > 10) {
    throw new Error("Mã phòng không hợp lệ");
  }
  return trimmed;
}

// ── Nghiệp vụ: lấy chi tiết phòng ───────────────────────────────────────────
export async function getChiTietPhong(id: string): Promise<RoomDetail> {
  const validatedId = validateRoomId(id);

  const res = await fetch(`/api/phong/${validatedId}`, {
    cache: "no-store",
  });

  if (res.status === 404) {
    throw new Error("Không tìm thấy phòng");
  }
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Lỗi khi tải chi tiết phòng: ${res.status} - ${body}`);
  }

  const { room } = await res.json();
  return room as RoomDetail;
}

// Thêm vào cuối file phongService.ts
export async function getThongTinPhongDatLich(
  roomId: string,
): Promise<RoomDetail> {
  const validatedId = validateRoomId(roomId);

  const res = await fetch(`/api/phong/${validatedId}`, {
    cache: "no-store",
  });

  if (res.status === 404) throw new Error("Không tìm thấy phòng");
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Lỗi khi tải thông tin phòng: ${res.status} - ${body}`);
  }

  const { room } = await res.json();
  return room as RoomDetail;
}

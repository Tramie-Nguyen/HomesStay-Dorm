export interface RentalData {
  // ===== ROOM =====
  MA_PHONG: string;
  TEN_PHONG: string;
  IMAGE_URL: string | null;

  GIUONGS: {
    MA_GIUONG: string;
  }[];

  SL_GIUONG: number;
  SL_GIUONG_TRONG: number;
  TRANG_THAI_PHONG: string;
  TONG_TIEN: number;

  GIA_DIEN: number;
  GIA_NUOC: number;
  WIFI: string;
  GUI_XE: number;
  DICH_VU: number;

  // ===== CUSTOMER =====
  MA_KH: string;
  TEN_KH: string;
  SDT: string;
  NGAY_SINH: string;
  CCCD: string;
  GIOI_TINH: string;
  EMAIL: string | null;

  // ===== LICH =====
  MA_PHIEU: string;
  NGAY: string;
  GIO: string | null;
  LOAI: string;
  TRANG_THAI_LICH: string;

  // ===== CONTRACT =====
  MA_HOP_DONG: string | null;
  NGAY_BD: string | null;
  NGAY_KT: string | null;
  TRANG_THAI_HOP_DONG: string | null;
  HOP_DONG_IMAGE: string | null;
  BIEN_BAN_IMAGE: string | null;
}

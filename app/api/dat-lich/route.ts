import { NextRequest, NextResponse } from "next/server";
import { getPool } from "@/lib/db";
import sql from "mssql";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const sdt = searchParams.get("sdt");

  if (!sdt)
    return NextResponse.json({ error: "Thiếu số điện thoại" }, { status: 400 });

  try {
    const pool = await getPool();
    const result = await pool
      .request()
      .input("SDT", sql.VarChar(11), sdt)
      .execute("SP_GetThongTinKhachHang");

    if (result.recordset.length > 0) {
      return NextResponse.json(result.recordset[0]);
    }
    return NextResponse.json({ message: "Không tìm thấy" }, { status: 404 });
  } catch (err) {
    return NextResponse.json({ error: "Lỗi Server" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      type,
      tenKh,
      sdt,
      ngaySinh,
      email,
      cccd,
      gioiTinh,
      maPhong,
      maKtx,
      hinhThucThue,
      selectedBeds,
      ngayXem,
    } = body;

    const pool = await getPool();
    const maNv = "NV001";
    const ngayDangKy = new Date();
    const loaiLich = "Xem phòng";
    const trangThai = "Chưa xử lý";
    const dsGiuong = Array.isArray(selectedBeds) ? selectedBeds.join(",") : "";
    const ngayHen = new Date(ngayXem); // DATETIME - giữ nguyên giờ từ DatePicker

    if (type === "khach") {
      const customerCheck = await pool
        .request()
        .input("SDT", sql.VarChar(11), sdt)
        .execute("SP_GetThongTinKhachHang");

      if (customerCheck.recordset.length === 0) {
        return NextResponse.json(
          { error: "Không tìm thấy khách hàng với SĐT này" },
          { status: 400 },
        );
      }
      const maKh = customerCheck.recordset[0].MA_KH;

      await pool
        .request()
        .input("NGAY_DANG_KY", sql.Date, ngayDangKy)
        .input("MA_NV", sql.VarChar(5), maNv)
        .input("MA_KH", sql.VarChar(5), maKh)
        .input("HINH_THUC_THUE", sql.NVarChar(25), hinhThucThue)
        .input("NGAY_HEN", sql.DateTime, ngayHen) // ✅ DateTime
        .input("LOAI", sql.NVarChar(14), loaiLich)
        .input("TRANG_THAI", sql.NVarChar(20), trangThai)
        .input("MA_KTX", sql.VarChar(6), maKtx)
        .input("MA_PHONG", sql.VarChar(10), maPhong)
        .input("DS_MA_GIUONG", sql.NVarChar(sql.MAX), dsGiuong)
        .execute("SP_XuLyDatLichXemPhongKH");
    } else {
      if (!tenKh || !sdt || !ngaySinh || !email || !cccd || !gioiTinh) {
        return NextResponse.json(
          { error: "Thiếu thông tin khách vãng lai" },
          { status: 400 },
        );
      }

      await pool
        .request()
        .input("NGAY_DANG_KY", sql.Date, ngayDangKy)
        .input("MA_NV", sql.VarChar(5), maNv)
        .input("TEN_KH", sql.NVarChar(250), tenKh)
        .input("NGAY_SINH", sql.Date, new Date(ngaySinh))
        .input("CCCD", sql.VarChar(12), cccd)
        .input("SDT", sql.VarChar(11), sdt)
        .input("GIOI_TINH", sql.NVarChar(3), gioiTinh.substring(0, 3))
        .input("EMAIL", sql.VarChar(100), email)
        .input("HINH_THUC_THUE", sql.NVarChar(25), hinhThucThue)
        .input("NGAY_HEN", sql.DateTime, ngayHen)
        .input("LOAI", sql.NVarChar(14), loaiLich)
        .input("TRANG_THAI", sql.NVarChar(20), trangThai)
        .input("MA_KTX", sql.VarChar(6), maKtx)
        .input("MA_PHONG", sql.VarChar(10), maPhong)
        .input("DS_MA_GIUONG", sql.NVarChar(sql.MAX), dsGiuong)
        .execute("SP_XuLyDatLichXemPhongVL");
    }

    return NextResponse.json({
      success: true,
      message: "Đặt lịch thành công!",
    });
  } catch (err: any) {
    console.error("=== LOI DAT LICH ===", err);
    return NextResponse.json(
      { error: "Lỗi xử lý dữ liệu", details: err.message },
      { status: 500 },
    );
  }
}

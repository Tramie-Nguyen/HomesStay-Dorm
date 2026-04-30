import { NextRequest, NextResponse } from "next/server";
import { getPool } from "@/lib/db";
import sql from "mssql";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const sdt = searchParams.get("sdt");

  try {
    const pool = await getPool();
    const result = await pool
      .request()
      .input("SDT", sql.VarChar(15), sdt)
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
      type, // 'khach' hoặc 'vanglai'
      hoTen,
      sdt,
      ngaySinh,
      email,
      cccd,
      gioiTinh,
      maPhong,
      selectedBeds, // Mảng các ID giường: ['G01', 'G02']
      ngayXem, // Date object hoặc string ISO
    } = body;

    const pool = await getPool();

    // Thực thi Stored Procedure tổng hợp
    // SP này sẽ:
    // 1. Kiểm tra nếu là vãng lai thì INSERT vào KHACH_HANG
    // 2. INSERT vào bảng LICH_HEN
    // 3. INSERT vào bảng CHI_TIET_LICH_HEN (để lưu các giường khách muốn xem)
    const result = await pool
      .request()
      .input("Type", sql.NVarChar(20), type)
      .input("HoTen", sql.NVarChar(150), hoTen)
      .input("SDT", sql.VarChar(15), sdt)
      .input("NgaySinh", sql.Date, ngaySinh)
      .input("Email", sql.VarChar(100), email)
      .input("CCCD", sql.VarChar(20), cccd)
      .input("GioiTinh", sql.NVarChar(10), gioiTinh)
      .input("MaPhong", sql.VarChar(10), maPhong)
      .input("SelectedBeds", sql.NVarChar(sql.MAX), selectedBeds.join(",")) // Gửi chuỗi ID cách nhau dấu phẩy
      .input("NgayXem", sql.DateTime, ngayXem)
      .execute("SP_XuLyDatLichXemPhong");

    return NextResponse.json({
      success: true,
      message: "Đặt lịch thành công!",
    });
  } catch (err: any) {
    console.error("Lỗi đặt lịch:", err);
    return NextResponse.json(
      {
        error: "Không thể lưu lịch hẹn",
        details: err.message,
      },
      { status: 500 },
    );
  }
}

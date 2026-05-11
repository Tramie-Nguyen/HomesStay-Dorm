import { NextResponse } from "next/server";
import { getPool } from "@/lib/db";
import sql from "mssql";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const {
      maPdc,
      soTien,
      ngayNhanPhong,
      gioNhanPhong,
      emailKhach,
      qrUrl,
      maPhong,
      danhSachGiuong,
    } = body;

    const ngayGioNhan = new Date(
      `${ngayNhanPhong}T${gioNhanPhong}:00`
    );

    const pool = await getPool();

    await pool
      .request()
      .input("maPdc", sql.VarChar(10), maPdc)
      .input("ngayGio", sql.DateTime, ngayGioNhan)
      .query(`
        UPDATE LICH
        SET NGAY_GIO = @ngayGio
        WHERE MA_PDC = @maPdc
      `);

    return NextResponse.json({
      success: true,
    });

  } catch (error: any) {
    console.error(error);

    return NextResponse.json(
      {
        success: false,
        error: error?.message || "Server error",
      },
      {
        status: 500,
      }
    );
  }
}
import { NextRequest, NextResponse } from "next/server";
import { getPool } from "@/lib/db";
import sql from "mssql";

export async function PUT(req: NextRequest) {
  try {
    const { maKh, tenKh, sdt, cccd, gioiTinh, email } = await req.json();

    if (!maKh) {
      return NextResponse.json(
        { error: "Thiếu mã khách hàng" },
        { status: 400 },
      );
    }

    const pool = await getPool();
    await pool
      .request()
      .input("MA_KH", sql.VarChar(5), maKh)
      .input("TEN_KH", sql.NVarChar(250), tenKh)
      .input("SDT", sql.VarChar(11), sdt)
      .input("CCCD", sql.VarChar(12), cccd)
      .input("GIOI_TINH", sql.NVarChar(3), gioiTinh)
      .input("EMAIL", sql.VarChar(150), email || null)
      .execute("SP_UPDATE_KHACH_HANG");

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("[PUT /api/khach-hang]", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

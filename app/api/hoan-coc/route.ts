import { NextRequest, NextResponse } from "next/server";
import { getPool } from "@/lib/db";
import sql from "mssql";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status") || "";
    const sort = searchParams.get("sort") || "DESC";

    const pool = await getPool();

    const result = await pool
      .request()
      .input("TrangThai", sql.NVarChar(50), status)
      .input("SortDir", sql.VarChar(4), sort.toUpperCase())
      .execute("SP_GetBienBanTraPhong");

    // Map SQL column names to camelCase
    const mappedData = (result.recordset || []).map((row: any) => ({
      id: String(row.ID),
      maKhachHang: row.MA_KHACH_HANG,
      fullName: row.HO_TEN,
      roomCode: row.MA_PHONG,
      checkoutDate: row.NGAY_TRA
        ? new Date(row.NGAY_TRA).toISOString().split("T")[0]
        : "",
      status: row.TRANG_THAI,
    }));

    console.log("[GET /api/hoan-coc] Mapped Data:", mappedData);

    return NextResponse.json({
      data: mappedData,
    });
  } catch (err) {
    console.error("[GET /api/hoan-coc]", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

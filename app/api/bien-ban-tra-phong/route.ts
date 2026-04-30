import { NextRequest, NextResponse } from "next/server";
import { getPool } from "@/lib/db";
import sql from "mssql";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);

  const status = searchParams.get("status") ?? "";
  const sort = searchParams.get("sort") ?? "DESC";

  try {
    console.log(
      "[API GET bien-ban-tra-phong] Query params - status:",
      status,
      "sort:",
      sort,
    );
    const pool = await getPool();
    const result = await pool
      .request()
      .input("TrangThai", sql.NVarChar(50), status)
      .input(
        "SortDir",
        sql.VarChar(4),
        sort.toUpperCase() === "ASC" ? "ASC" : "DESC",
      )
      .execute("SP_GetBienBanTraPhong");
    console.log(
      "[API GET bien-ban-tra-phong] SP executed, recordset length:",
      result.recordset?.length,
    );

    const rows = result.recordset ?? [];
    console.log("[API GET bien-ban-tra-phong] Raw rows count:", rows.length);
    console.log("[API GET bien-ban-tra-phong] First row:", rows[0]);

    const data = rows.map((row: any) => ({
      id: String(row.ID),
      maKhachHang: row.MA_KHACH_HANG,
      fullName: row.HO_TEN,
      roomCode: row.MA_PHONG,
      checkoutDate: row.NGAY_TRA
        ? new Date(row.NGAY_TRA).toISOString().split("T")[0]
        : "",
      status: row.TRANG_THAI,
    }));

    console.log("[API GET bien-ban-tra-phong] Mapped data:", data);
    return NextResponse.json({ data });
  } catch (err) {
    console.error("[GET /api/bien-ban-tra-phong]", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

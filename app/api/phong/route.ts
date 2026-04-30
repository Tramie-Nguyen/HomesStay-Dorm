import { NextRequest, NextResponse } from "next/server";
import { getPool } from "@/lib/db";
import sql from "mssql";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);

  const search = searchParams.get("search") ?? "";
  const status = searchParams.get("status") ?? "";
  const sort = searchParams.get("sort") ?? "ASC";
  const page = parseInt(searchParams.get("page") ?? "1");
  const ward = searchParams.get("ward") ?? ""; // ← tên phường thật, vd: "Tân Sơn Hòa"
  const gioiTinh = searchParams.get("gioiTinh") ?? ""; // ← "Nam" | "Nữ" | ""
  const pageSize = 6;

  try {
    const pool = await getPool();
    const result = await pool
      .request()
      .input("Search", sql.NVarChar(100), search)
      .input("TrangThai", sql.NVarChar(10), status)
      .input(
        "SortDir",
        sql.VarChar(4),
        sort.toUpperCase() === "DESC" ? "DESC" : "ASC",
      )
      .input("Ward", sql.NVarChar(100), ward)
      .input("GioiTinh", sql.NVarChar(3), gioiTinh)
      .input("Page", sql.Int, page)
      .input("PageSize", sql.Int, pageSize)
      .execute("SP_GetDanhSachPhong");

    const recordsets = result.recordsets as any[];
    const tongBanGhi = recordsets[0]?.[0]?.TONG_BAN_GHI ?? 0;
    const rows = recordsets[1] ?? [];
    const totalPages = Math.ceil(tongBanGhi / pageSize) || 1;

    const rooms = rows.map((row: any) => ({
      id: row.MA_PHONG,
      code: row.MA_PHONG,
      totalBeds: row.SL_GIUONG,
      availableBeds: row.SL_GIUONG_TRONG,
      status: row.TRANG_THAI,
      imageUrl: row.IMAGE_URL ? `/${row.IMAGE_URL}` : null,
      ktxName: row.TEN_KTX,
      address: row.DIA_CHI,
      giaMin: row.GIA_MIN,
      giaMax: row.GIA_MAX,
    }));

    return NextResponse.json({ rooms, totalPages, total: tongBanGhi });
  } catch (err) {
    console.error("[GET /api/phong]", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

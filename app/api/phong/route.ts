import { NextRequest, NextResponse } from "next/server";
import { getPool } from "@/lib/db";
import sql from "mssql";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);

  const search = searchParams.get("search") ?? "";
  const status = searchParams.get("status") ?? "";
  const sort = searchParams.get("sort") ?? "ASC";
  const page = parseInt(searchParams.get("page") ?? "1");
  const ward = searchParams.get("ward") ?? "";
  const pageSize = 6;

  try {
    const pool = await getPool();
    const result = await pool
      .request()
      .input("Search", sql.NVarChar(100), search)
      .input("TrangThai", sql.NVarChar(10), status)
      .input("Ward", sql.NVarChar(50), ward)
      .input(
        "SortDir",
        sql.VarChar(4),
        sort.toUpperCase() === "DESC" ? "DESC" : "ASC",
      )
      .input("Page", sql.Int, page)
      .input("PageSize", sql.Int, pageSize)
      .execute("SP_GetDanhSachPhong");

    // SP trả về 2 recordset
    const recordsets = result.recordsets as any[];

    const tongBanGhi = recordsets[0]?.[0]?.TONG_BAN_GHI ?? 0;

    const rows = recordsets[1] ?? [];
    const totalPages = Math.ceil(tongBanGhi / pageSize);

    const rooms = rows.map((row: any) => ({
      id: row.MA_PHONG,
      code: row.MA_PHONG,
      totalBeds: row.SL_GIUONG,
      availableBeds: row.SL_GIUONG_TRONG,
      status: row.TRANG_THAI, // đã là 'Còn chỗ' / 'Hết chỗ' trong DB
      imageUrl: row.IMAGE_URL ? `/${row.IMAGE_URL}` : null,
      ktxName: row.TEN_KTX,
      address: row.DIA_CHI,
      giaMin: row.GIA_MIN, // số thô — format ở FE
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

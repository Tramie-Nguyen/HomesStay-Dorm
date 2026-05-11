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
    const mappedData = (result.recordset || []).map((row: any) => {
      const maKh =
        row.MA_KHACH_HANG ||
        row.MA_KH ||
        row.MA_KHACH ||
        row.MA_KHACHHANG ||
        row.MA_KHACH_HANG ||
        row.MA_KHACH_HANG?.trim?.();
      const fullName = row.HO_TEN || row.TEN_KH || row.TEN || row.HO_TEN_KH;
      return {
        id: String(
          row.ID ?? row.MA_BB_TRA_PHONG ?? row.MA_BB ?? row.MA_BB_TRA_PHONG,
        ),
        maKhachHang: maKh ?? "",
        fullName: fullName ?? "",
        roomCode: row.MA_PHONG || row.PHONG || "",
        checkoutDate: row.NGAY_TRA
          ? new Date(row.NGAY_TRA).toISOString().split("T")[0]
          : "",
        status: row.TRANG_THAI || row.TRANGTHAI || "",
      };
    });

    console.log(
      "[GET /api/hoan-coc] Mapped Data (sample):",
      mappedData.slice(0, 10),
    );

    // For debugging: also include a small sample of the raw recordset so we can
    // see the exact column names returned by the stored procedure.
    const rawSample = (result.recordset || []).slice(0, 5);

    return NextResponse.json({
      data: mappedData,
      _debug_rawSample: rawSample,
    });
  } catch (err) {
    console.error("[GET /api/hoan-coc]", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, status } = body ?? {};

    if (!id || !status) {
      return NextResponse.json(
        { error: "Missing id or status" },
        { status: 400 },
      );
    }

    const pool = await getPool();
    await pool
      .request()
      .input("MA_BB_TRA_PHONG", sql.VarChar(50), id)
      .input("TRANG_THAI", sql.NVarChar(50), status)
      .execute("SP_UpdateBienBanTraPhong");

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[PUT /api/danh-sach]", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

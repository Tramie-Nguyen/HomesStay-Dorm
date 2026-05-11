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

    const data = rows.map((row: any) => {
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
          row.ID ??
            row.MA_BB_TRA_PHONG ??
            row.MA_BB ??
            row.MA_BB_TRA_PHONG ??
            "",
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

    console.log("[API GET bien-ban-tra-phong] Mapped data:", data.slice(0, 20));
    const rawSample = rows.slice(0, 5);
    return NextResponse.json({ data, _debug_rawSample: rawSample });
  } catch (err) {
    console.error("[GET /api/bien-ban-tra-phong]", err);
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
    console.error("[PUT /api/ds-tra-phong]", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

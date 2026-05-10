import { NextResponse } from "next/server";
import { getPool } from "@/lib/db";
import sql from "mssql";

export async function GET() {
  try {
    const pool = await getPool();
    const result = await pool.request().execute("sp_get_lich_hen_nhan_vien");

    return NextResponse.json({
      appointments: result.recordset ?? [],
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error("API /api/lich-hen GET error", error);
    return NextResponse.json(
      { error: "Internal server error", detail: errorMessage },
      { status: 500 },
    );
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const action = body?.action as string | undefined;
    const maPhieu = body?.maPhieu as string | undefined;
    const maNv = body?.maNv as string | undefined;

    if (!action || !maPhieu) {
      return NextResponse.json(
        { error: "Thiếu action hoặc maPhieu" },
        { status: 400 },
      );
    }

    const pool = await getPool();
    const request = pool.request();

    if (action === "accept") {
      if (!maNv) {
        return NextResponse.json(
          { error: "Thiếu maNv khi nhận lịch" },
          { status: 400 },
        );
      }

      request.input("MA_PHIEU", sql.VarChar(10), maPhieu);
      request.input("MA_NV", sql.VarChar(5), maNv);
      await request.execute("sp_nhan_vien_nhan_lich");

      return NextResponse.json({ success: true });
    }

    if (action === "cancel") {
      request.input("MA_PHIEU", sql.VarChar(10), maPhieu);
      await request.execute("sp_nhan_vien_huy_lich");

      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: "Action không hợp lệ" }, { status: 400 });
  } catch (error: any) {
    console.error("API /api/lich-hen POST error", error);
    const detail = error?.message || String(error);
    return NextResponse.json(
      { error: "Internal server error", detail },
      { status: 500 },
    );
  }
}

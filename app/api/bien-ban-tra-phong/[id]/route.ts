import { NextRequest, NextResponse } from "next/server";
import { getPool } from "@/lib/db";
import sql from "mssql";

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const body = await req.json();
    const status = body.status;
    const id = params.id?.trim();

    console.log("Updating:", { id, status });

    if (!id) {
      return NextResponse.json({ error: "Invalid id" }, { status: 400 });
    }

    const result = await (await getPool())
      .request()
      .input("MA_BB_TRA_PHONG", sql.VarChar(5), id)
      .input("TRANG_THAI", sql.NVarChar(20), status)
      .execute("SP_UpdateBienBanTraPhong");

    return NextResponse.json({
      success: true,
      result,
    });
  } catch (err: any) {
    console.error("UPDATE ERROR:", err);
    return NextResponse.json(
      { error: err.message },
      { status: 500 }
    );
  }
}
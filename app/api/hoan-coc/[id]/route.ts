import { NextRequest, NextResponse } from "next/server";
import { getPool } from "@/lib/db";
import sql from "mssql";

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { status } = (await req.json()) as { status?: string };
    const { id: rawId } = await params;
    const id = rawId?.trim();

    if (!id) {
      return NextResponse.json({ error: "Invalid id" }, { status: 400 });
    }

    if (!status) {
      return NextResponse.json(
        { error: "Status is required" },
        { status: 400 },
      );
    }

    const pool = await getPool();
    await pool
      .request()
      .input("ID", sql.VarChar(5), id)
      .input("TRANG_THAI", sql.NVarChar(50), status)
      .execute("SP_UpdateBienBanTraPhong");

    return NextResponse.json({ message: "Status updated successfully" });
  } catch (err) {
    console.error("[PUT /api/hoan-coc/[id]]", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

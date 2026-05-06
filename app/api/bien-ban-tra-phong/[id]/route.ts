import { NextRequest, NextResponse } from "next/server";
import { getPool } from "@/lib/db";
import sql from "mssql";

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const body = await req.json();
    const status = body.status;
    const { id: rawId } = await params;
    const id = rawId?.trim();

    console.log("Updating:", { id, status });

    if (!id) {
      return NextResponse.json({ error: "Invalid id" }, { status: 400 });
    }

    const result = await (await getPool())
      .request()
      .input("ID", sql.VarChar(5), id)
      .input("TRANG_THAI", sql.NVarChar(50), status)
      .execute("SP_UpdateBienBanTraPhong");

    return NextResponse.json({ message: "Status updated successfully" });
  } catch (err: any) {
    console.error("UPDATE ERROR:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

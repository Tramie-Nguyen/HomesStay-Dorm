import { NextResponse } from "next/server";
import { getPool } from "@/lib/db";
import sql from "mssql";

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const ma_kh = url.searchParams.get("ma_kh");
    if (!ma_kh)
      return NextResponse.json({ error: "Missing ma_kh" }, { status: 400 });

    const pool = await getPool();
    const request = pool.request();
    request.input("MA_KH", sql.VarChar(10), ma_kh);
    const result = await request.execute("sp_GetThongTinHoanCoc");

    const recordsets = Array.isArray(result.recordsets)
      ? result.recordsets
      : [];

    console.log(`/api/hoancoc for MA_KH=${ma_kh}`, {
      recordsetCount: recordsets.length,
      customerCount: recordsets[0]?.length,
      itemsCount: recordsets[1]?.length,
    });

    // sp_GetThongTinHoanCoc returns two SELECTs: first = customer+room (TOP 1), second = items
    const customer = recordsets[0]?.[0] ?? null;
    const items = recordsets[1] ?? [];

    return NextResponse.json({ customer, items });
  } catch (err: any) {
    console.error("API /api/hoancoc error", err);
    const detail = err?.message || String(err);
    return NextResponse.json(
      { error: "Internal server error", detail },
      { status: 500 },
    );
  }
}

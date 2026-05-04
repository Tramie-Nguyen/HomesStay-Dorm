import { NextResponse } from "next/server";
import { getPool } from "@/lib/db";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ ma_kh: string }> },
) {
  try {
    const { ma_kh } = await params;
    if (!ma_kh)
      return NextResponse.json({ error: "Missing ma_kh" }, { status: 400 });

    const pool = await getPool();
    const request = pool.request();
    // ensure parameter type
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const sql = require("mssql");
    request.input("MA_KH", sql.VarChar(5), ma_kh);
    const result = await request.execute("sp_GetThongTinHoanCoc");

    const recordsets = Array.isArray(result.recordsets)
      ? result.recordsets
      : [];
    console.log(`Fetching hoancoc for ma_kh=${ma_kh}`, {
      recordsetCount: recordsets.length,
      customerCount: recordsets[0]?.length,
      itemsCount: recordsets[1]?.length,
    });

    // sp_GetThongTinHoanCoc returns two SELECTs: first = customer+room (TOP 1), second = items
    const customer = recordsets[0]?.[0] || null;
    const items = recordsets[1] || [];

    // fetch NOI_DUNG from BIEN_BAN_TRA_PHONG linked to MA_KH (if exists)
    const nnReq = pool.request();
    nnReq.input("MA_KH", sql.VarChar(5), ma_kh);
    const noiDungQ = `
      SELECT TOP 1 b.NOI_DUNG
      FROM BIEN_BAN_TRA_PHONG b
      LEFT JOIN HOP_DONG_THUE hd ON b.MA_HOP_DONG = hd.MA_HOP_DONG
      LEFT JOIN LICH l ON hd.MA_PHIEU = l.MA_PHIEU
      LEFT JOIN PHIEU_DAT_COC pdc ON l.MA_PDC = pdc.MA_PDC
      LEFT JOIN KHACH_HANG kh ON pdc.MA_KH = kh.MA_KH
      WHERE kh.MA_KH = @MA_KH
      ORDER BY b.NGAY DESC`;
    const ndRes = await nnReq.query(noiDungQ);
    const reason =
      (ndRes &&
        ndRes.recordset &&
        ndRes.recordset[0] &&
        ndRes.recordset[0].NOI_DUNG) ||
      null;

    return NextResponse.json({ customer, items, reason });
  } catch (err: any) {
    console.error("API /api/hoancoc/[ma_kh] error", err);
    const detail = err?.message || String(err);
    return NextResponse.json(
      { error: "Internal server error", detail },
      { status: 500 },
    );
  }
}

import { NextResponse } from "next/server";
import { getPool } from "@/lib/db";

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    let ma_hop_dong = url.searchParams.get("ma_hop_dong");
    const ma_kh = url.searchParams.get("ma_kh");

    // If ma_kh provided, find ma_hop_dong from database
    if (ma_kh && !ma_hop_dong) {
      const pool = await getPool();
      const findReq = pool.request();
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const sql = require("mssql");
      findReq.input("MA_KH", sql.VarChar(5), ma_kh);
      const findRes = await findReq.query(`
        SELECT TOP 1 hd.MA_HOP_DONG
        FROM HOP_DONG_THUE hd
        JOIN LICH l ON hd.MA_PHIEU = l.MA_PHIEU
        JOIN PHIEU_DAT_COC pdc ON l.MA_PDC = pdc.MA_PDC
        JOIN KHACH_HANG kh ON pdc.MA_KH = kh.MA_KH
        WHERE kh.MA_KH = @MA_KH
        ORDER BY hd.NGAY_BD DESC
      `);
      ma_hop_dong = findRes.recordset?.[0]?.MA_HOP_DONG;
      if (!ma_hop_dong) {
        return NextResponse.json(
          { error: "No contract found for customer" },
          { status: 404 },
        );
      }
    }

    if (!ma_hop_dong) {
      return NextResponse.json(
        { error: "Missing ma_hop_dong or ma_kh" },
        { status: 400 },
      );
    }

    const pool = await getPool();
    const request = pool.request();
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const sql = require("mssql");
    request.input("MA_HOP_DONG", sql.VarChar(5), ma_hop_dong);
    const result = await request.execute("sp_GetLapPhieuHoanCoc");

    const recordsets = Array.isArray(result.recordsets)
      ? result.recordsets
      : [];

    console.log(`Fetching lap phieu hoan coc for ma_hop_dong=${ma_hop_dong}`, {
      recordsetCount: recordsets.length,
      itemsCount: recordsets[0]?.length,
      summaryCount: recordsets[1]?.length,
    });

    const items = recordsets[0] || [];
    const summary = recordsets[1]?.[0] || { TIEN_COC: 0 };

    return NextResponse.json({ items, summary, ma_hop_dong });
  } catch (err: any) {
    console.error(`API /api/lap-phieu-hoan-coc error`, err);
    const detail = err?.message || String(err);
    return NextResponse.json(
      { error: "Internal server error", detail },
      { status: 500 },
    );
  }
}

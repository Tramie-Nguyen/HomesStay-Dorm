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
        FROM KHACH_HANG kh
        INNER JOIN PHIEU_DANG_KY_THUE pdk ON kh.MA_KH = pdk.MA_KH
        INNER JOIN LICH l ON pdk.MA_PDK = l.MA_PDK
        INNER JOIN HOP_DONG_THUE hd ON l.MA_PHIEU = hd.MA_PHIEU
        WHERE kh.MA_KH = @MA_KH
        ORDER BY hd.NGAY_BD DESC
      `);
      ma_hop_dong = findRes.recordset?.[0]?.MA_HOP_DONG;
      console.log(`Looking up MA_HOP_DONG for MA_KH=${ma_kh}:`, {
        found: !!ma_hop_dong,
        ma_hop_dong,
      });
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

    console.log(`API response: ma_hop_dong=${ma_hop_dong}`, {
      items: items.length,
      summary,
    });
    return NextResponse.json({ items, summary, ma_hop_dong });
  } catch (err: any) {
    console.error(`API /api/lap-phieu-hoan-coc GET error`, err);
    const detail = err?.message || String(err);
    return NextResponse.json(
      { error: "Internal server error", detail },
      { status: 500 },
    );
  }
}

export async function POST(req: Request) {
  try {
    const payload = await req.json();
    console.log("POST /api/lap-phieu-hoan-coc - payload:", payload);

    // For now, we just return success with the ma_hop_dong as the phieu identifier
    // In a real system, you'd save this to a database table
    const { ma_kh, ma_hop_dong, items, extraNote, extraCost, total } = payload;

    // TODO: Save phiếu to database (e.g., into a PHIEU_HOAN_COC table)
    // For now, just validate and return success
    if (!ma_hop_dong) {
      return NextResponse.json(
        { error: "Missing ma_hop_dong" },
        { status: 400 },
      );
    }

    return NextResponse.json({
      success: true,
      message: "Phiếu hoàn cọc đã được xác nhận",
      ma_phieu: ma_hop_dong, // Using ma_hop_dong as the phieu identifier
      data: {
        ma_kh,
        ma_hop_dong,
        items,
        extraNote,
        extraCost,
        total,
      },
    });
  } catch (err: any) {
    console.error("POST /api/lap-phieu-hoan-coc error", err);
    const detail = err?.message || String(err);
    return NextResponse.json(
      { error: "Internal server error", detail },
      { status: 500 },
    );
  }
}

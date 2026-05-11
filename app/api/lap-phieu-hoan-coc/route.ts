import { NextResponse } from "next/server";
import { getPool } from "@/lib/db";
import sql from "mssql";

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    let ma_hop_dong = url.searchParams.get("ma_hop_dong");
    const ma_kh = url.searchParams.get("ma_kh");

    // If ma_kh provided, find ma_hop_dong from database
    if (ma_kh && !ma_hop_dong) {
      const pool = await getPool();
      const findReq = pool.request();
      findReq.input("MA_KH", sql.VarChar(10), ma_kh);

      // Query dựa trên schema: tìm MA_HOP_DONG từ MA_KH
      // Dùng EXISTS để tìm hợp đồng có liên kết với khách hàng
      const findRes = await findReq.query(`
        SELECT TOP 1 hd.MA_HOP_DONG
        FROM HOP_DONG_THUE hd
        WHERE EXISTS (
          SELECT 1 FROM LICH l
          WHERE l.MA_PHIEU = hd.MA_PHIEU
          AND (
            l.MA_PDC IN (
              SELECT MA_PDC FROM PHIEU_DAT_COC WHERE MA_KH = @MA_KH
            )
            OR l.MA_PDK IN (
              SELECT MA_PDK FROM PHIEU_DANG_KY_THUE WHERE MA_KH = @MA_KH
            )
          )
        )
        ORDER BY hd.MA_HOP_DONG DESC
      `);

      ma_hop_dong = findRes.recordset?.[0]?.MA_HOP_DONG;

      console.log(`Looking up MA_HOP_DONG for MA_KH=${ma_kh}:`, {
        found: !!ma_hop_dong,
        ma_hop_dong,
        recordsetLength: findRes.recordset?.length || 0,
      });

      if (!ma_hop_dong) {
        return NextResponse.json(
          { error: "No contract found for customer", ma_kh },
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

    // Call sp_GetLapPhieuHoanCoc
    const pool = await getPool();
    const request = pool.request();
    request.input("MA_HOP_DONG", sql.VarChar(10), ma_hop_dong);
    const result = await request.execute("sp_GetLapPhieuHoanCoc");

    const recordsets = Array.isArray(result.recordsets)
      ? result.recordsets
      : [];

    console.log(`Fetching lap phieu hoan coc for ma_hop_dong=${ma_hop_dong}`, {
      recordsetCount: recordsets.length,
      itemsCount: recordsets[0]?.length,
      summaryCount: recordsets[1]?.length,
    });

    const items = (recordsets[0] || []).map((r: any) => ({
      MA_VT: r.MA_VT || "",
      TEN_VAT_TU: r.TEN_VAT_TU || "",
      VALUE: Number(r.VALUE) || 0,
      QUANTITY: Number(r.QUANTITY) || 0,
    }));
    const summary = {
      TIEN_COC: Number(recordsets[1]?.[0]?.TIEN_COC) || 0,
    };

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

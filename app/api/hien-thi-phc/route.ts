import { NextResponse } from "next/server";
import { getPool } from "@/lib/db";

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    let ma_hop_dong =
      url.searchParams.get("ma_hop_dong") || url.searchParams.get("ma_phieu");
    if (!ma_hop_dong) {
      return NextResponse.json(
        { error: "Missing ma_hop_dong or ma_phieu" },
        { status: 400 },
      );
    }

    const pool = await getPool();
    const request = pool.request();
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const sql = require("mssql");
    request.input("MA_HOP_DONG", sql.VarChar(5), ma_hop_dong);
    const result = await request.execute("sp_GetHienThiPHC");

    const recordsets = Array.isArray(result.recordsets)
      ? result.recordsets
      : [];
    const customer = recordsets[0]?.[0] || null;
    const summary = recordsets[1]?.[0] || { TIEN_COC: 0 };

    return NextResponse.json({ customer, summary, ma_hop_dong });
  } catch (err: any) {
    console.error("API /api/hien-thi-phc GET error", err);
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
    const ma_hop_dong = payload.ma_hop_dong || payload.ma_phieu;
    const hinh_thuc = payload.hinh_thuc;
    const so_tien = Number(payload.so_tien || payload.amount || 0);

    if (!ma_hop_dong || !hinh_thuc || !so_tien) {
      return NextResponse.json(
        { error: "Missing parameters" },
        { status: 400 },
      );
    }

    const pool = await getPool();
    const request = pool.request();
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const sql = require("mssql");
    request.input("MA_HOP_DONG", sql.VarChar(5), ma_hop_dong);
    request.input("HINH_THUC", sql.NVarChar(50), hinh_thuc);
    request.input("SO_TIEN", sql.Int, so_tien);

    const result = await request.execute("sp_ThanhToanHoanCoc");
    const ma_thanhtoan = result.recordset?.[0]?.MA_THANH_TOAN || null;

    return NextResponse.json({ success: true, ma_thanhtoan });
  } catch (err: any) {
    console.error("API /api/hien-thi-phc POST error", err);
    const detail = err?.message || String(err);
    return NextResponse.json(
      { error: "Internal server error", detail },
      { status: 500 },
    );
  }
}

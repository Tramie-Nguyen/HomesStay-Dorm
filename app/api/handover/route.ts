import { NextResponse } from "next/server";
import { getPool } from "@/lib/db";

interface Body {
  maHopDong: string;
  contractUrl: string;
  handoverUrl: string;
}

export async function POST(req: Request) {
  try {
    const { maHopDong, contractUrl, handoverUrl }: Body = await req.json();

    const pool = await getPool();

    // ===== UPDATE HỢP ĐỒNG =====
    await pool.request().input("ma", maHopDong).input("img", contractUrl)
      .query(`
        UPDATE HOP_DONG_THUE
        SET IMAGE_URL = @img
        WHERE MA_HOP_DONG = @ma
      `);

    // ===== UPDATE BIÊN BẢN =====
    await pool.request().input("ma", maHopDong).input("img", handoverUrl)
      .query(`
        UPDATE BIEN_BAN_BAN_GIAO
        SET IMAGE_URL = @img
        WHERE MA_HOP_DONG = @ma
      `);

    // ===== UPDATE TRANG_THAI IN LICH =====
    await pool.request().input("ma", maHopDong).query(`
      UPDATE LICH
      SET TRANG_THAI = N'Đã xử lý'
      WHERE MA_PHIEU = (
        SELECT MA_PHIEU
        FROM HOP_DONG_THUE
        WHERE MA_HOP_DONG = @ma
      )
    `);

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

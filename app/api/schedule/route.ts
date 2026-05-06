import { NextResponse } from "next/server";
import { getPool } from "@/lib/db";

export async function PUT(req: Request) {
  try {
    const body = await req.json();
    const { maPhieu, ngay, gio } = body;
    const pool = await getPool();

    const dateTime = new Date(`${ngay}T${gio}:00`);

    await pool
      .request()
      .input("maPhieu", maPhieu)
      .input("ngay", dateTime)
      .input("gio", gio).query(`
        UPDATE LICH
        SET NGAY = @ngay,
            GIO = @gio
        WHERE MA_PHIEU = @maPhieu
      `);

    return NextResponse.json({ message: "Updated" });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ message: "Error" }, { status: 500 });
  }
}

import { NextResponse } from "next/server";
import { getPool } from "@/lib/db";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    // Không cần nhận maPdc nữa, nhận thêm soTien
    const { soTien, maKh, maNv } = body; 
    const pool = await getPool();

    const result = await pool
      .request()
      .input("SO_TIEN", soTien)
      .input("MA_KH", maKh)
      .input("MA_NV", maNv)
      .execute("SP_ThemPhieuDatCoc");

    // Lấy mã PDC được SELECT về từ Store Procedure
    const newMaPdc = result.recordset[0]?.MA_PDC;

    if (!newMaPdc) {
      throw new Error("Không lấy được mã phiếu đặt cọc mới");
    }

    // Trả về cho Frontend
    return NextResponse.json({ success: true, maPdc: newMaPdc });
  } catch (error) {
    console.error("Error creating deposit:", error);
    return NextResponse.json({ error: "Failed to create deposit" }, { status: 500 });
  }
}
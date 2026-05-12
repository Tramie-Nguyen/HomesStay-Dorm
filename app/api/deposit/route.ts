import { NextResponse } from "next/server";
import { getPool } from "@/lib/db";
import sql from "mssql";

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
    return NextResponse.json(
      { error: "Failed to create deposit" },
      { status: 500 },
    );
  }
}

// Cập nhật trạng thái phiếu đặt cọc
export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { maPdc, newTrangThai } = body;

    if (!maPdc || !newTrangThai) {
      return NextResponse.json({ error: 'Thiếu mã phiếu đặt cọc hoặc trạng thái mới' }, { status: 400 });
    }

    const pool = await getPool();
    await pool.request()
      .input('MaPdc', sql.VarChar, maPdc)
      .input('NewTrangThai', sql.VarChar, newTrangThai)
      .execute('SP_CapNhatTrangThaiPhieuDatCoc');

    return NextResponse.json({ success: true, message: 'Cập nhật trạng thái phiếu đặt cọc thành công' });
  } catch (error: any) {
    console.error('Lỗi PUT API deposit:', error);
    return NextResponse.json({ error: 'Lỗi khi cập nhật trạng thái phiếu đặt cọc', details: error.message }, { status: 500 });
  }
};
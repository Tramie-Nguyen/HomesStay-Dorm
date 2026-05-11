import { NextResponse } from "next/server";
import { getPool } from "@/lib/db";
import sql from "mssql";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { maPdc, soTien, phuongThuc } = body;

    if (!maPdc || !soTien || !phuongThuc) {
      return NextResponse.json({ error: "Thiếu dữ liệu cần thiết" }, { status: 400 });
    }

    const pool = await getPool();
    const result = await pool
      .request()
      .input("MaPdc", sql.VarChar(10), maPdc)
      .input("HinhThuc", sql.NVarChar(50), phuongThuc)
      .input("SoTien", sql.Int, soTien)
      .input("TrangThai", sql.NVarChar(20), "Đã đặt cọc")
      .query(`
        DECLARE @MaThanhToan VARCHAR(8) = LEFT(REPLACE(CONVERT(VARCHAR(36), NEWID()), '-', ''), 5);

        INSERT INTO PHIEU_THANH_TOAN (MA_THANH_TOAN, HINH_THUC, NGAY, SO_TIEN, TRANG_THAI, MA_PDC)
        VALUES (@MaThanhToan, @HinhThuc, CAST(GETDATE() AS DATE), @SoTien, N'Đã thanh toán', @MaPdc);

        UPDATE PHIEU_DAT_COC
        SET TRANG_THAI = N'Đã đặt cọc'
        WHERE MA_PDC = @MaPdc;

        SELECT @MaThanhToan AS MA_THANH_TOAN;
      `);

    const maThanhToan = result.recordset?.[0]?.MA_THANH_TOAN;
    return NextResponse.json({ success: true, maThanhToan });
  } catch (error: any) {
    console.error("Error completing deposit:", error);
    return NextResponse.json(
      { success: false, error: error?.message || "Lỗi khi hoàn tất đặt cọc" },
      { status: 500 }
    );
  }
}


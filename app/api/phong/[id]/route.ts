import { NextRequest, NextResponse } from "next/server";
import { getPool } from "@/lib/db";
import sql from "mssql";

export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const pool = await getPool();
    const result = await pool
      .request()
      .input("MaPhong", sql.VarChar(4), params.id)
      .execute("SP_GetChiTietPhong");

    const recordsets = result.recordsets as any[];

    if (!recordsets[0] || recordsets[0].length === 0) {
      return NextResponse.json(
        { error: "Không tìm thấy phòng" },
        { status: 404 },
      );
    }

    const row = recordsets[0][0];
    const beds = recordsets[1];

    const room = {
      id: row.MA_PHONG,
      code: row.MA_PHONG,
      totalBeds: row.SL_GIUONG,
      availableBeds: row.SL_GIUONG_TRONG,
      status: row.TRANG_THAI,
      imageUrl: row.IMAGE_URL ? `/${row.IMAGE_URL}` : null,
      ktxName: row.TEN_KTX,
      address: row.DIA_CHI,
      quyDinh: row.QUY_DINH,
      chinhSach: row.TEN_DIEU_KHOAN,
      noiDungCS: row.NOI_DUNG_CHINH_SACH,
      giaMin: row.GIA_MIN,
      giaMax: row.GIA_MAX,
      beds: beds.map((b: any) => ({
        id: b.MA_GIUONG,
        status: b.TRANG_THAI,
        price: b.GIA,
      })),
    };

    return NextResponse.json({ room });
  } catch (err) {
    console.error("[GET /api/phong/:id]", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

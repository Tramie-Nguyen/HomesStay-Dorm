import { NextRequest, NextResponse } from "next/server";
import { getPool } from "@/lib/db";
import sql from "mssql";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;

    const pool = await getPool();

    const result = await pool
      .request()
      .input("MaPhong", sql.VarChar(10), id)
      .execute("SP_GetChiTietPhong");

    const recordsets = result.recordsets as any[];
    console.log(">>> [Debug] Recordsets Length:", recordsets.length);

    if (!recordsets[0] || recordsets[0].length === 0) {
      return NextResponse.json(
        { error: "Không tìm thấy phòng" },
        { status: 404 },
      );
    }

    const row = recordsets[0][0];

    const beds = recordsets[1] || [];
    const room = {
      id: row.MA_PHONG,
      code: row.MA_PHONG,
      maKtx: row.MA_KTX,

      totalBeds: row.SL_GIUONG,
      availableBeds: row.SL_GIUONG_TRONG,
      status: row.TRANG_THAI,

      imageUrl: row.IMAGE_URL || null,
      ktxName: row.TEN_KTX,
      address: row.DIA_CHI,

      moTaPhong: row.MO_TA_PHONG,
      quyDinh: row.QUY_DINH,

      giaDien: row.GIA_DIEN ?? row.gia_dien ?? 0,
      giaNuoc: row.GIA_NUOC ?? row.gia_nuoc ?? 0,
      wifi: row.WIFI,
      guiXe: row.GUI_XE,
      dichVu: row.DICH_VU,

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

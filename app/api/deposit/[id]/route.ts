import { NextResponse } from "next/server";
import { getPool } from "@/lib/db";

export async function PUT(req: Request) {
  try {
    const body = await req.json();
    const { MA_PDC, status } = body;
    const pool = await getPool();

    const result = await pool
      .request()
      .input("MA_PDC", MA_PDC)
      .input("TRANG_THAI", status)
      .execute("SP_CapNhatTrangThaiPDC");
      
    return NextResponse.json(result);
  } catch (error) {
    console.error("Error updating deposit status:", error);
    return NextResponse.json({ error: "Failed to update deposit status" }, { status: 500 });
  }
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const pool = await getPool();

    const result = await pool
      .request()
      .input("MA_PDC", id)
      .execute("SP_GetPhieuDatCoc");

    // RESULT SET 1
    const baseResult = result.recordsets[0];

    // RESULT SET 2
    const giuongResult = result.recordsets[1];

    if (!baseResult || baseResult.length === 0) {
      return NextResponse.json(
        { error: "Không tìm thấy phiếu đặt cọc" },
        { status: 404 }
      );
    }

    const baseData = baseResult[0];

    const responseData = {
      MA_PDC: baseData.MA_PDC,
      SO_TIEN: baseData.SO_TIEN,
      TRANG_THAI: baseData.TRANG_THAI,

      KHACH_HANG: {
        MA_KH: baseData.MA_KH,
        TEN_KH: baseData.TEN_KH,
        SDT: baseData.SDT,
        NGAY_SINH: baseData.NGAY_SINH,
        CCCD: baseData.CCCD,
        GIOI_TINH: baseData.GIOI_TINH,
        EMAIL: baseData.EMAIL
      },

      PHONG: {
        MA_KTX: baseData.MA_KTX,
        TEN_KTX: baseData.TEN_KTX,
        MA_PHONG: baseData.MA_PHONG,

        GIUONGS: giuongResult.map((g: any) => g.MA_GIUONG),

        GIA_DIEN: baseData.GIA_DIEN,
        GIA_NUOC: baseData.GIA_NUOC,
        WIFI: baseData.WIFI,
        DICH_VU: baseData.DICH_VU,
        GUI_XE: baseData.GUI_XE
      }
    };

    return NextResponse.json(responseData);

  } catch (error) {
    console.error("Error fetching deposit details:", error);

    return NextResponse.json(
      { error: "Failed to fetch deposit details" },
      { status: 500 }
    );
  }
};

import { NextResponse } from 'next/server';
import { getPool } from '@/lib/db';
import sql from 'mssql';

// Lấy chi tiết lịch theo ID
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const pool = await getPool();

    const result = await pool
      .request()
      .input("MA_LICH", sql.VarChar, id)
      .execute("SP_GetChiTietLich");

    if (!result.recordsets[0]?.length) {
      return NextResponse.json(
        { error: "Không tìm thấy lịch" },
        { status: 404 }
      );
    }

    const detail = result.recordsets[0][0];

    const giuongs = result.recordsets[1] || [];

    return NextResponse.json({
      ...detail,
      GIUONGS: giuongs,
    });

  } catch (error: any) {
    console.error("Lỗi GET API lich by ID:", error);

    return NextResponse.json(
      {
        error: "Lỗi server",
        details: error.message,
      },
      { status: 500 }
    );
  }
}
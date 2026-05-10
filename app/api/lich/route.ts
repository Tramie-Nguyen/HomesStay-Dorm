import { NextResponse } from 'next/server';
import { getPool } from '@/lib/db';
import sql from 'mssql';

// Lấy danh sách lịch
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const maNv = searchParams.get('maNv'); 
  const thang = searchParams.get('thang');
  const nam = searchParams.get('nam');

  if (!thang || !nam) {
    return NextResponse.json({ error: 'Thiếu tháng hoặc năm' }, { status: 400 });
  }

  try {
    const pool = await getPool();
    const result = await pool.request()
      .input('MaNV', sql.VarChar, maNv) 
      .input('Thang', sql.Int, parseInt(thang))
      .input('Nam', sql.Int, parseInt(nam))
      .execute('SP_GetLichByNhanVien');

    return NextResponse.json(result.recordset);
  } catch (error: any) {
    console.error('Lỗi GET API lich:', error);
    return NextResponse.json({ error: 'Lỗi server', details: error.message }, { status: 500 });
  }
}

// Dời lịch
export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { maPhieu, ngayGioMoi } = body;

    if (!maPhieu || !ngayGioMoi) {
      return NextResponse.json({ error: 'Thiếu mã phiếu hoặc ngày giờ mới' }, { status: 400 });
    }

    const pool = await getPool();
    await pool.request()
      .input('MaPhieu', sql.VarChar, maPhieu)
      .input('NgayGioMoi', sql.DateTime, new Date(ngayGioMoi))
      .execute('SP_DoiLich');

    return NextResponse.json({ success: true, message: 'Dời lịch thành công' });
  } catch (error: any) {
    console.error('Lỗi PUT API lich:', error);
    return NextResponse.json({ error: 'Lỗi khi dời lịch', details: error.message }, { status: 500 });
  }
}

// Hủy lịch
export async function DELETE(request: Request) {
  const { searchParams } = new URL(request.url);
  const maPhieu = searchParams.get('maPhieu');

  if (!maPhieu) {
    return NextResponse.json({ error: 'Thiếu mã phiếu' }, { status: 400 });
  }

  try {
    const pool = await getPool();
    await pool.request()
      .input('MaPhieu', sql.VarChar, maPhieu)
      .execute('SP_HuyLich');

    return NextResponse.json({ success: true, message: 'Hủy lịch thành công' });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
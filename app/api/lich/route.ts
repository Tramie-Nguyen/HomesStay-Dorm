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

// Dời lịch hoặc cập nhật trạng thái lịch
export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { maPhieu, ngayGioMoi, newTrangThai } = body;

    if (!maPhieu) {
      return NextResponse.json({ error: 'Thiếu mã phiếu' }, { status: 400 });
    }

    const pool = await getPool();

    if (ngayGioMoi) {
      await pool.request()
        .input('MaPhieu', sql.VarChar, maPhieu)
        .input('NgayGioMoi', sql.DateTime, new Date(ngayGioMoi))
        .execute('SP_DoiLich');

      return NextResponse.json({ success: true, message: 'Dời lịch thành công' });
    }

    if (newTrangThai) {
      await pool.request()
        .input('MaPhieu', sql.VarChar, maPhieu)
        .input('NewTrangThai', sql.VarChar, newTrangThai)
        .execute('SP_CapNhatTrangThaiLich');

      return NextResponse.json({ success: true, message: 'Cập nhật trạng thái lịch thành công' });
    }

    return NextResponse.json({ error: 'Thiếu ngày giờ mới hoặc trạng thái mới' }, { status: 400 });
  } catch (error: any) {
    console.error('Lỗi PUT API lich:', error);
    return NextResponse.json({ error: 'Lỗi khi cập nhật lịch', details: error.message }, { status: 500 });
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

// Thêm lịch mới
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { ngayGio, loai, maPdk, maPdc, maKtx, maPhong, maNv } = body;
    if (!ngayGio || !loai || !maKtx || !maPhong || !maNv) {
      return NextResponse.json({ error: 'Thiếu thông tin bắt buộc' }, { status: 400 });
    }
    const pool = await getPool();
    const result = await pool.request()
      .input('NgayGio', sql.DateTime, new Date(ngayGio))
      .input('Loai', sql.VarChar, loai)
      .input('MaPdk', sql.VarChar, maPdk || null)
      .input('MaPdc', sql.VarChar, maPdc || null)
      .input('MaKtx', sql.VarChar, maKtx)
      .input('MaPhong', sql.VarChar, maPhong)
      .input('MaNv', sql.VarChar, maNv)
      .execute('SP_ThemLich');
    return NextResponse.json({ success: true, maPhieu: result.recordset[0]?.MA_PHIEU });
  } catch (error: any) {
    console.error('Lỗi POST API lich:', error);
    return NextResponse.json({ error: 'Lỗi khi thêm lịch', details: error.message }, { status: 500 });
  }
};

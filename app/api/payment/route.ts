import { NextResponse } from 'next/server';
import { getPool } from '@/lib/db';
import sql from 'mssql';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { hinhThuc, ngay, soTien, trangThai, maHd, ma_Pdc } = body;
    const pool = await getPool();
    await pool.request()
      .input('HINH_THUC', sql.NVarChar(50), hinhThuc)
      .input('SO_TIEN', sql.Int, soTien)
      .input('TRANG_THAI', sql.NVarChar(20), trangThai)
      .input('MA_HOP_DONG', sql.VarChar(10), maHd || null)
      .input('MA_PDC', sql.VarChar(10), ma_Pdc || null)
      .execute('SP_ThemPhieuThanhToan');
    return NextResponse.json({ success: true });
  }
    catch (error) {
    console.error('Lỗi POST API payment:', error);
    return NextResponse.json({ error: 'Lỗi server' }, { status: 500 });
  }
};
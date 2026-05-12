import { NextResponse } from 'next/server';
import { getPool } from '@/lib/db';
import sql from 'mssql';

// thêm phiếu đặt cọc vào lịch
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { maPhieu, maPdc } = body;
    const pool = await getPool();
    await pool.request()
      .input('MA_PHIEU', sql.VarChar, maPhieu)
      .input('MA_PDC', sql.VarChar, maPdc)
      .execute('SP_GanPhieuDatCocVaoLich');
    return NextResponse.json({ success: true, message: 'Thêm phiếu đặt cọc vào lịch thành công' });
  } catch (error: any) {
    console.error('Lỗi POST API lich:', error);
    return NextResponse.json({ error: 'Lỗi khi thêm phiếu đặt cọc vào lịch', details: error.message }, { status: 500 });
  }
};
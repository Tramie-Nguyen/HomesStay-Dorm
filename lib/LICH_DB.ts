import { poolPromise } from '../db';
import sql from 'mssql';

export class Lich_DB {
  public static async LayDanhSach(thang: number, nam: number) {
    const pool = await poolPromise;
    const result = await pool.request()
      .input('Thang', sql.Int, thang)
      .input('Nam', sql.Int, nam)
      .query(`SELECT * FROM LICH WHERE MONTH(NGAY) = @Thang AND YEAR(NGAY) = @Nam`);
    return result.recordset;
  }

  public static async CapNhat(ma: string, ngay: string, gio: string) {
    const pool = await poolPromise;
    const result = await pool.request()
      .input('Ma', sql.VarChar, ma)
      .input('Ngay', sql.Date, ngay)
      .input('Gio', sql.Time, gio)
      .query(`UPDATE LICH SET NGAY = @Ngay, GIO = @Gio WHERE MA_PHIEU = @Ma`);
    return result.rowsAffected[0] > 0;
  }

  public static async Xoa(ma: string) {
    const pool = await poolPromise;
    const result = await pool.request()
      .input('Ma', sql.VarChar, ma)
      .query(`DELETE FROM LICH WHERE MA_PHIEU = @Ma`);
    return result.rowsAffected[0] > 0;
  }
}
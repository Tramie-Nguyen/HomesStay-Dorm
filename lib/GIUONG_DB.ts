import { poolPromise } from '../db';
import sql from 'mssql';

export class Giuong_DB {
    public static async LayChiTietGiuong(maKTX: string, maPhong: string, maGiuong: string) {
        const pool = await poolPromise;
        const result = await pool.request()
            .input('MaKTX', sql.VarChar, maKTX)
            .input('MaPhong', sql.VarChar, maPhong)
            .input('MaGiuong', sql.VarChar, maGiuong)
            .query(`SELECT * FROM GIUONG WHERE MA_KTX = @MaKTX AND MA_PHONG = @MaPhong AND MA_GIUONG = @MaGiuong`);
        return result.recordset[0];
    }
}
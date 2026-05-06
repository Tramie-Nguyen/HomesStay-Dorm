import { getPool } from "@/lib/db";

export async function GET() {
  const pool = await getPool();

  const result = await pool.request().query(`
    SELECT 
        l.MA_PHIEU,
        l.NGAY,
        l.GIO,
        l.LOAI,
        l.TRANG_THAI,
        l.MA_PHONG,
        ktx.TEN_KTX,

        kh.TEN_KH,
        kh.SDT

    FROM LICH l
    LEFT JOIN PHIEU_DANG_KY_THUE pdk ON l.MA_PDK = pdk.MA_PDK
    LEFT JOIN KHACH_HANG kh ON pdk.MA_KH = kh.MA_KH
    LEFT JOIN KY_TUC_XA ktx ON l.MA_KTX = ktx.MA_KTX
  `);

  return Response.json(result.recordset);
}
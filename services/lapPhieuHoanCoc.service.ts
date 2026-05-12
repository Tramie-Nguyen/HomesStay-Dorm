import { getPool } from "@/lib/db";
import sql from "mssql";

export async function getLapPhieuHoanCoc(data: {
  ma_hop_dong?: string;
  ma_kh?: string;
}) {

  let {
    ma_hop_dong,
    ma_kh,
  } = data;

  const pool =
    await getPool();

  // tìm mã hợp đồng từ khách hàng
  if (ma_kh && !ma_hop_dong) {

    const findReq =
      pool.request();

    findReq.input(
      "MA_KH",
      sql.VarChar(10),
      ma_kh
    );

    const findRes =
      await findReq.query(`
        SELECT TOP 1 hd.MA_HOP_DONG
        FROM HOP_DONG_THUE hd
        WHERE EXISTS (
          SELECT 1
          FROM LICH l
          WHERE l.MA_PHIEU = hd.MA_PHIEU
          AND (
            l.MA_PDC IN (
              SELECT MA_PDC
              FROM PHIEU_DAT_COC
              WHERE MA_KH = @MA_KH
            )
            OR l.MA_PDK IN (
              SELECT MA_PDK
              FROM PHIEU_DANG_KY_THUE
              WHERE MA_KH = @MA_KH
            )
          )
        )
        ORDER BY hd.MA_HOP_DONG DESC
      `);

    ma_hop_dong =
      findRes.recordset?.[0]
        ?.MA_HOP_DONG;

    if (!ma_hop_dong) {
      throw new Error(
        "No contract found for customer"
      );
    }
  }

  if (!ma_hop_dong) {
    throw new Error(
      "Missing ma_hop_dong or ma_kh"
    );
  }

  const request =
    pool.request();

  request.input(
    "MA_HOP_DONG",
    sql.VarChar(10),
    ma_hop_dong
  );

  const result =
    await request.execute(
      "sp_GetLapPhieuHoanCoc"
    );

  const recordsets =
    Array.isArray(
      result.recordsets
    )
      ? result.recordsets
      : [];

  const items =
    (recordsets[0] || []).map(
      (r: any) => ({
        MA_VT:
          r.MA_VT || "",

        TEN_VAT_TU:
          r.TEN_VAT_TU || "",

        VALUE:
          Number(r.VALUE) || 0,

        QUANTITY:
          Number(r.QUANTITY) || 0,
      })
    );

  const summary = {
    TIEN_COC:
      Number(
        recordsets[1]?.[0]
          ?.TIEN_COC
      ) || 0,
  };

  return {
    items,
    summary,
    ma_hop_dong,
  };
}

export async function createLapPhieuHoanCoc(
  payload: any
) {

  const {
    ma_kh,
    ma_hop_dong,
    items,
    extraNote,
    extraCost,
    total,
  } = payload;

  if (!ma_hop_dong) {
    throw new Error(
      "Missing ma_hop_dong"
    );
  }

  // TODO:
  // save database

  return {
    success: true,

    message:
      "Phiếu hoàn cọc đã được xác nhận",

    ma_phieu:
      ma_hop_dong,

    data: {
      ma_kh,
      ma_hop_dong,
      items,
      extraNote,
      extraCost,
      total,
    },
  };
}

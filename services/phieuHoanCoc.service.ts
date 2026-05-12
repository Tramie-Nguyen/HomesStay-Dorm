import { getPool } from "@/lib/db";
import sql from "mssql";

export async function hienThiPhieuHoanCoc(
  ma_hop_dong: string
) {

  if (!ma_hop_dong) {
    throw new Error("Thiếu mã hợp đồng");
  }

  const pool = await getPool();

  const request = pool.request();

  request.input(
    "MA_HOP_DONG",
    sql.VarChar(5),
    ma_hop_dong
  );

  const result = await request.execute(
    "sp_GetHienThiPHC"
  );

  const recordsets = Array.isArray(result.recordsets)
    ? result.recordsets
    : [];

  const customer = recordsets[0]?.[0] || null;

  const summary = recordsets[1]?.[0] || {
    TIEN_COC: 0,
  };

  return {
    customer,
    summary,
    ma_hop_dong,
  };
}

export async function thanhToanHoanCoc(data: {
  ma_hop_dong: string;
  hinh_thuc: string;
  so_tien: number;
}) {

  const {
    ma_hop_dong,
    hinh_thuc,
    so_tien,
  } = data;

  if (!ma_hop_dong || !hinh_thuc || !so_tien) {
    throw new Error("Thiếu dữ liệu");
  }

  const pool = await getPool();

  const request = pool.request();

  request.input(
    "MA_HOP_DONG",
    sql.VarChar(5),
    ma_hop_dong
  );

  request.input(
    "HINH_THUC",
    sql.NVarChar(50),
    hinh_thuc
  );

  request.input(
    "SO_TIEN",
    sql.Int,
    so_tien
  );

  const result = await request.execute(
    "sp_ThanhToanHoanCoc"
  );

  const ma_thanhtoan =
    result.recordset?.[0]?.MA_THANH_TOAN || null;

  return {
    success: true,
    ma_thanhtoan,
  };
}
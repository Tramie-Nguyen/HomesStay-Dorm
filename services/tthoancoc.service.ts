import { getPool } from "@/lib/db";
import sql from "mssql";

export async function getThongTinHoanCoc(
  ma_kh: string
) {

  if (!ma_kh) {
    throw new Error("Missing ma_kh");
  }

  const pool = await getPool();

  const request = pool.request();

  request.input(
    "MA_KH",
    sql.VarChar(10),
    ma_kh
  );

  const result = await request.execute(
    "sp_GetThongTinHoanCoc"
  );

  const recordsets = Array.isArray(
    result.recordsets
  )
    ? result.recordsets
    : [];

  console.log(
    `sp_GetThongTinHoanCoc for ${ma_kh}`,
    {
      recordsetCount:
        recordsets.length,

      customerCount:
        recordsets[0]?.length,

      itemsCount:
        recordsets[1]?.length,
    }
  );

  const customer =
    recordsets[0]?.[0] ?? null;

  const items =
    recordsets[1] ?? [];

  return {
    customer,
    items,
  };
}
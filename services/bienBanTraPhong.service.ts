import { getPool } from "@/lib/db";
import sql from "mssql";

export async function getBienBanTraPhong(
  data: {
    status?: string;
    sort?: string;
  }
) {

  const {
    status = "",
    sort = "DESC",
  } = data;

  console.log(
    "[Service] Query params",
    {
      status,
      sort,
    }
  );

  const pool =
    await getPool();

  const result =
    await pool
      .request()

      .input(
        "TrangThai",
        sql.NVarChar(50),
        status
      )

      .input(
        "SortDir",
        sql.VarChar(4),

        sort.toUpperCase() ===
          "ASC"
          ? "ASC"
          : "DESC"
      )

      .execute(
        "SP_GetBienBanTraPhong"
      );

  const rows =
    result.recordset ?? [];

  console.log(
    "[Service] Raw rows:",
    rows.length
  );

  const mapped =
    rows.map((row: any) => {

      const maKh =
        row.MA_KHACH_HANG ||
        row.MA_KH ||
        row.MA_KHACH ||
        row.MA_KHACHHANG ||
        row.MA_KHACH_HANG?.trim?.();

      const fullName =
        row.HO_TEN ||
        row.TEN_KH ||
        row.TEN ||
        row.HO_TEN_KH;

      return {

        id: String(
          row.ID ??
          row.MA_BB_TRA_PHONG ??
          row.MA_BB ??
          ""
        ),

        maKhachHang:
          maKh ?? "",

        fullName:
          fullName ?? "",

        roomCode:
          row.MA_PHONG ||
          row.PHONG ||
          "",

        checkoutDate:
          row.NGAY_TRA
            ? new Date(
                row.NGAY_TRA
              )
                .toISOString()
                .split("T")[0]
            : "",

        status:
          row.TRANG_THAI ||
          row.TRANGTHAI ||
          "",
      };
    });

  return {
    data: mapped,
    _debug_rawSample:
      rows.slice(0, 5),
  };
}

export async function updateBienBanTraPhong(
  body: any
) {

  const {
    id,
    status,
  } = body ?? {};

  if (!id || !status) {
    throw new Error(
      "Missing id or status"
    );
  }

  const pool =
    await getPool();

  await pool
    .request()

    .input(
      "MA_BB_TRA_PHONG",
      sql.VarChar(50),
      id
    )

    .input(
      "TRANG_THAI",
      sql.NVarChar(50),
      status
    )

    .execute(
      "SP_UpdateBienBanTraPhong"
    );

  return {
    success: true,
  };
}

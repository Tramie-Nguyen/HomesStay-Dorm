import { NextResponse } from "next/server";
import { getPool } from "@/lib/db";

export async function GET(
  req: Request,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await context.params;
    const pool = await getPool();

    const result = await pool.request().input("id", id).query(`
      SELECT
        p.MA_KTX,
        p.MA_PHONG,
        p.MA_PHONG AS TEN_PHONG,
        p.IMAGE_URL,
        p.SL_GIUONG,
        p.SL_GIUONG_TRONG,
        p.TRANG_THAI AS TRANG_THAI_PHONG,

        ktx.GIA_DIEN,
        ktx.GIA_NUOC,
        ktx.WIFI,
        ktx.GUI_XE,
        ktx.DICH_VU,

        l.MA_PHIEU,
        l.NGAY_GIO,
        l.LOAI,
        l.TRANG_THAI,

        kh.MA_KH,
        kh.TEN_KH,
        kh.SDT,
        kh.NGAY_SINH,
        kh.CCCD,
        kh.GIOI_TINH,
        tk.EMAIL,

        hd.MA_HOP_DONG,
        hd.NGAY_BD,
        hd.NGAY_KT,
        hd.TRANG_THAI AS TRANG_THAI_HOP_DONG,
        hd.IMAGE_URL AS HOP_DONG_IMAGE,
        bb.IMAGE_URL AS BIEN_BAN_IMAGE

      FROM LICH l
      JOIN PHONG p ON l.MA_KTX = p.MA_KTX
          AND l.MA_PHONG = p.MA_PHONG
      JOIN KY_TUC_XA ktx ON p.MA_KTX = ktx.MA_KTX 
      JOIN PHIEU_DANG_KY_THUE pdk ON l.MA_PDK = pdk.MA_PDK
      JOIN KHACH_HANG kh ON pdk.MA_KH = kh.MA_KH
      LEFT JOIN TAI_KHOAN tk ON kh.MA_TK = tk.MA_TK
      LEFT JOIN HOP_DONG_THUE hd ON hd.MA_PHIEU = l.MA_PHIEU
      LEFT JOIN BIEN_BAN_BAN_GIAO bb ON bb.MA_HOP_DONG = hd.MA_HOP_DONG

      WHERE l.MA_PHIEU = @id
    `);

    const main = result.recordset[0];

    if (!main) {
      return NextResponse.json(
        { message: "Không tìm thấy dữ liệu" },
        { status: 404 },
      );
    }

    // ===== GET BEDS OF THIS RENTAL =====
    let beds = await pool
      .request()
      .input("id", id)
      .input("roomId", main.MA_PHONG)
      .input("ktxId", main.MA_KTX).query(`
        SELECT lg.MA_GIUONG, g.GIA
        FROM LICH_GIUONG lg
        INNER JOIN GIUONG g ON g.MA_KTX = @ktxId
                           AND g.MA_PHONG = @roomId
                           AND g.MA_GIUONG = lg.MA_GIUONG
        WHERE lg.MA_PHIEU = @id
      `);

    console.log(
      "Beds query result:",
      beds.recordset,
      "Count:",
      beds.recordset.length,
    );
    console.log(
      "Query params - id:",
      id,
      "roomId:",
      main.MA_PHONG,
      "ktxId:",
      main.MA_KTX,
    );

    // Fallback: if no beds found via LICH_GIUONG, get all beds from this room
    if (beds.recordset.length === 0) {
      console.log("No beds in LICH_GIUONG, fetching all room beds as fallback");
      beds = await pool
        .request()
        .input("roomId", main.MA_PHONG)
        .input("ktxId", main.MA_KTX).query(`
          SELECT MA_GIUONG, GIA
          FROM GIUONG
          WHERE MA_PHONG = @roomId AND MA_KTX = @ktxId
        `);
    }

    const totalPrice = beds.recordset.reduce(
      (sum, bed) => sum + (Number(bed.GIA) || 0),
      0,
    );

    const response = {
      ...main,
      GIUONGS: beds.recordset.map((bed) => ({
        MA_GIUONG: bed.MA_GIUONG,
        GIA: Number(bed.GIA) || 0,
      })),
      TONG_TIEN: totalPrice,
      HOP_DONG_IMAGE: main.HOP_DONG_IMAGE,
      BIEN_BAN_IMAGE: main.BIEN_BAN_IMAGE,
    };

    return NextResponse.json(response);
  } catch (err) {
    console.error(err);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}

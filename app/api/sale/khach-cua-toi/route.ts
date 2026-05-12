import { NextRequest, NextResponse } from "next/server";
import { getPool } from "@/lib/db";
import sql from "mssql";

const DEFAULT_REQUEST_CONTENT = "Khách hàng gọi yêu cầu trả phòng";

const LIST_QUERY = `
  SELECT
    hd.MA_HOP_DONG AS maHopDong,
    hd.MA_PHIEU AS maPhieu,
    COALESCE(kh.MA_KH, pdk.MA_KH, 'N/A') AS maKhachHang,
    ISNULL(kh.TEN_KH, N'Khách hàng') AS tenKhachHang,
    ISNULL(kh.SDT, '') AS sdt,
    ISNULL(l.MA_PHONG, 'N/A') AS maPhong,
    CONVERT(VARCHAR(10), hd.NGAY_BD, 23) AS ngayBatDau,
    CONVERT(VARCHAR(10), hd.NGAY_KT, 23) AS ngayKetThuc,
    hd.TRANG_THAI AS trangThaiHopDong,
    hd.IMAGE_URL AS hopDongImage,
    bbg.MA_BAN_GIAO AS maBanGiao,
    CONVERT(VARCHAR(10), bbg.NGAY, 23) AS ngayBanGiao,
    bbg.IMAGE_URL AS bienBanImage,
    CASE
      WHEN bbg.MA_BAN_GIAO IS NULL THEN N'Chưa lưu'
      ELSE N'Đã lưu'
    END AS trangThaiBanGiao,
    tr.MA_BB_TRA_PHONG AS maTraPhong,
    CONVERT(VARCHAR(10), tr.NGAY, 23) AS ngayTraPhong,
    tr.TRANG_THAI AS trangThaiTraPhong,
    tr.NOI_DUNG AS noiDungTraPhong
  FROM HOP_DONG_THUE hd
  LEFT JOIN BIEN_BAN_BAN_GIAO bbg
    ON bbg.MA_HOP_DONG = hd.MA_HOP_DONG
  LEFT JOIN LICH l
    ON hd.MA_PHIEU = l.MA_PHIEU
  LEFT JOIN PHIEU_DANG_KY_THUE pdk
    ON l.MA_PDK = pdk.MA_PDK
  LEFT JOIN KHACH_HANG kh
    ON kh.MA_KH = pdk.MA_KH
  OUTER APPLY (
    SELECT TOP 1
      bbt.MA_BB_TRA_PHONG,
      bbt.NGAY,
      bbt.NOI_DUNG,
      bbt.TRANG_THAI
    FROM BIEN_BAN_TRA_PHONG bbt
    WHERE bbt.MA_HOP_DONG = hd.MA_HOP_DONG
    ORDER BY bbt.NGAY DESC, bbt.MA_BB_TRA_PHONG DESC
  ) tr
  WHERE hd.TRANG_THAI = N'Đã ký'
  ORDER BY
    CASE WHEN bbg.NGAY IS NULL THEN 1 ELSE 0 END,
    bbg.NGAY DESC,
    hd.NGAY_BD DESC,
    hd.MA_HOP_DONG DESC;
`;

export async function GET() {
  try {
    const pool = await getPool();
    const result = await pool.request().query(LIST_QUERY);

    const data = (result.recordset ?? []).map((row: any) => ({
      maHopDong: String(row.maHopDong ?? ""),
      maPhieu: row.maPhieu ?? null,
      maKhachHang: row.maKhachHang ?? "",
      tenKhachHang: row.tenKhachHang ?? "",
      sdt: row.sdt ?? null,
      maPhong: row.maPhong ?? null,
      ngayBatDau: row.ngayBatDau ?? null,
      ngayKetThuc: row.ngayKetThuc ?? null,
      trangThaiHopDong: row.trangThaiHopDong ?? null,
      hopDongImage: row.hopDongImage ?? null,
      maBanGiao: row.maBanGiao ?? null,
      ngayBanGiao: row.ngayBanGiao ?? null,
      bienBanImage: row.bienBanImage ?? null,
      trangThaiBanGiao: row.trangThaiBanGiao ?? null,
      maTraPhong: row.maTraPhong ?? null,
      ngayTraPhong: row.ngayTraPhong ?? null,
      trangThaiTraPhong: row.trangThaiTraPhong ?? null,
      noiDungTraPhong: row.noiDungTraPhong ?? null,
    }));

    return NextResponse.json({ data });
  } catch (error) {
    console.error("[GET /api/sale/khach-cua-toi]", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const maHopDong = String(body?.maHopDong ?? "").trim();
    const maNv = String(body?.maNv ?? "").trim();
    const noiDung = String(body?.noiDung ?? "").trim();

    if (!maHopDong || !maNv) {
      return NextResponse.json(
        { error: "Thiếu mã hợp đồng hoặc mã nhân viên" },
        { status: 400 },
      );
    }

    const pool = await getPool();

    const contractResult = await pool
      .request()
      .input("maHopDong", sql.VarChar(10), maHopDong).query(`
        SELECT TOP 1 MA_HOP_DONG
        FROM HOP_DONG_THUE
        WHERE MA_HOP_DONG = @maHopDong
          AND TRANG_THAI = N'Đã ký'
      `);

    if (!contractResult.recordset?.length) {
      return NextResponse.json(
        { error: "Không tìm thấy hợp đồng đã ký" },
        { status: 404 },
      );
    }

    const handoverResult = await pool
      .request()
      .input("maHopDong", sql.VarChar(10), maHopDong).query(`
        SELECT TOP 1 MA_BAN_GIAO
        FROM BIEN_BAN_BAN_GIAO
        WHERE MA_HOP_DONG = @maHopDong
      `);

    if (!handoverResult.recordset?.length) {
      return NextResponse.json(
        { error: "Chưa có biên bản bàn giao trong cơ sở dữ liệu" },
        { status: 400 },
      );
    }

    const latestRequestResult = await pool
      .request()
      .input("maHopDong", sql.VarChar(10), maHopDong).query(`
        SELECT TOP 1
          MA_BB_TRA_PHONG,
          TRANG_THAI
        FROM BIEN_BAN_TRA_PHONG
        WHERE MA_HOP_DONG = @maHopDong
        ORDER BY NGAY DESC, MA_BB_TRA_PHONG DESC
      `);

    const requestContent = noiDung || DEFAULT_REQUEST_CONTENT;

    if (latestRequestResult.recordset?.length) {
      const latestRequest = latestRequestResult.recordset[0];
      const isActiveRequest = latestRequest.TRANG_THAI !== "Đã xử lí";

      if (isActiveRequest) {
        await pool
          .request()
          .input("maBbTraPhong", sql.VarChar(6), latestRequest.MA_BB_TRA_PHONG)
          .input("maNv", sql.VarChar(5), maNv)
          .input("noiDung", sql.NVarChar(500), requestContent)
          .input("trangThai", sql.NVarChar(20), "Đang chờ xử lí").query(`
            UPDATE BIEN_BAN_TRA_PHONG
            SET NGAY = CAST(GETDATE() AS DATE),
                NOI_DUNG = @noiDung,
                MA_NV = @maNv,
                TRANG_THAI = @trangThai
            WHERE MA_BB_TRA_PHONG = @maBbTraPhong
          `);

        return NextResponse.json({
          success: true,
          action: "updated",
          maBbTraPhong: latestRequest.MA_BB_TRA_PHONG,
        });
      }
    }

    const nextIdResult = await pool.request().query(`
      SELECT ISNULL(MAX(TRY_CAST(SUBSTRING(MA_BB_TRA_PHONG, 4, 10) AS INT)), 0) + 1 AS nextId
      FROM BIEN_BAN_TRA_PHONG
      WHERE MA_BB_TRA_PHONG LIKE 'BBT%'
    `);

    const nextId = Number(nextIdResult.recordset?.[0]?.nextId ?? 1);
    const maBbTraPhong = `BBT${String(nextId).padStart(3, "0")}`;

    await pool
      .request()
      .input("maBbTraPhong", sql.VarChar(6), maBbTraPhong)
      .input("maNv", sql.VarChar(5), maNv)
      .input("noiDung", sql.NVarChar(500), requestContent)
      .input("maHopDong", sql.VarChar(10), maHopDong)
      .input("trangThai", sql.NVarChar(20), "Đang chờ xử lí")
      .input("maThanhToan", sql.VarChar(5), null).query(`
        INSERT INTO BIEN_BAN_TRA_PHONG
        (
          MA_BB_TRA_PHONG,
          NGAY,
          NOI_DUNG,
          MA_NV,
          MA_THANH_TOAN,
          MA_HOP_DONG,
          TRANG_THAI
        )
        VALUES
        (
          @maBbTraPhong,
          CAST(GETDATE() AS DATE),
          @noiDung,
          @maNv,
          @maThanhToan,
          @maHopDong,
          @trangThai
        )
      `);

    return NextResponse.json({
      success: true,
      action: "inserted",
      maBbTraPhong,
    });
  } catch (error) {
    console.error("[POST /api/sale/khach-cua-toi]", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

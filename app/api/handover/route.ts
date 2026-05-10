import { NextResponse } from "next/server";
import { mkdir, writeFile } from "fs/promises";
import path from "path";
import { getPool } from "@/lib/db";

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const contract = formData.get("contract") as File;
    const handover = formData.get("handover") as File;
    const rentalId = formData.get("rentalId") as string;

    if (!contract || !handover || !rentalId) {
      return NextResponse.json(
        { message: "Missing files or rentalId" },
        { status: 400 },
      );
    }

    // 👉 Convert files to buffer
    const contractBytes = await contract.arrayBuffer();
    const contractBuffer = Buffer.from(contractBytes);
    const handoverBytes = await handover.arrayBuffer();
    const handoverBuffer = Buffer.from(handoverBytes);

    // 👉 Create file names
    const contractFileName = `contract-${Date.now()}-${contract.name}`;
    const handoverFileName = `handover-${Date.now()}-${handover.name}`;

    // Ensure upload folder exists before writing files.
    const uploadDir = path.join(process.cwd(), "public/uploads");
    await mkdir(uploadDir, { recursive: true });

    // 👉 Save to public/uploads
    const contractPath = path.join(uploadDir, contractFileName);
    const handoverPath = path.join(uploadDir, handoverFileName);

    await writeFile(contractPath, contractBuffer);
    await writeFile(handoverPath, handoverBuffer);

    // 👉 Get URLs
    const contractUrl = `/uploads/${contractFileName}`;
    const handoverUrl = `/uploads/${handoverFileName}`;

    // 👉 Update database
    const pool = await getPool();

    // Upsert contract and handover records in one flow.
    await pool
      .request()
      .input("rentalId", rentalId)
      .input("contractUrl", contractUrl)
      .input("handoverUrl", handoverUrl).query(`
        DECLARE @maHopDong VARCHAR(5);

        SELECT TOP 1 @maHopDong = MA_HOP_DONG
        FROM HOP_DONG_THUE
        WHERE MA_PHIEU = @rentalId;

        IF @maHopDong IS NULL
        BEGIN
          DECLARE @nextHdNum INT = ISNULL(
            (
              SELECT MAX(TRY_CAST(SUBSTRING(MA_HOP_DONG, 3, 10) AS INT))
              FROM HOP_DONG_THUE
              WHERE MA_HOP_DONG LIKE 'HD%'
            ),
            0
          ) + 1;

          SET @maHopDong = 'HD' + RIGHT('000' + CAST(@nextHdNum AS VARCHAR(3)), 3);

          INSERT INTO HOP_DONG_THUE (
            MA_HOP_DONG,
            MA_PHIEU,
            TRANG_THAI,
            IMAGE_URL
          )
          VALUES (
            @maHopDong,
            @rentalId,
            N'Đã ký',
            @contractUrl
          );
        END
        ELSE
        BEGIN
          UPDATE HOP_DONG_THUE
          SET IMAGE_URL = @contractUrl,
              TRANG_THAI = N'Đã ký'
          WHERE MA_HOP_DONG = @maHopDong;
        END

        IF EXISTS (
          SELECT 1
          FROM BIEN_BAN_BAN_GIAO
          WHERE MA_HOP_DONG = @maHopDong
        )
        BEGIN
          UPDATE BIEN_BAN_BAN_GIAO
          SET IMAGE_URL = @handoverUrl,
              NGAY = CAST(GETDATE() AS DATE)
          WHERE MA_HOP_DONG = @maHopDong;
        END
        ELSE
        BEGIN
          DECLARE @nextBbNum INT = ISNULL(
            (
              SELECT MAX(TRY_CAST(SUBSTRING(MA_BAN_GIAO, 3, 10) AS INT))
              FROM BIEN_BAN_BAN_GIAO
              WHERE MA_BAN_GIAO LIKE 'BB%'
            ),
            0
          ) + 1;

          DECLARE @maBanGiao VARCHAR(5) =
            'BB' + RIGHT('000' + CAST(@nextBbNum AS VARCHAR(3)), 3);

          INSERT INTO BIEN_BAN_BAN_GIAO (
            MA_BAN_GIAO,
            NGAY,
            MA_HOP_DONG,
            MA_NV,
            IMAGE_URL
          )
          VALUES (
            @maBanGiao,
            CAST(GETDATE() AS DATE),
            @maHopDong,
            NULL,
            @handoverUrl
          );
        END
      `);

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

import { NextRequest, NextResponse } from "next/server";
import { writeFile } from "fs/promises";
import path from "path";
import { getPool } from "@/lib/db";
import sql from "mssql";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();

    const file = (formData.get("file") || formData.get("image")) as File;
    const maPhong = formData.get("maPhong") as string | null;

    if (!file) {
      return NextResponse.json({ error: "Thiếu file" }, { status: 400 });
    }

    const ext = file.name.split(".").pop();
    const fileName = `${Date.now()}${maPhong ? "_" + maPhong : ""}.${ext}`;

    const buffer = Buffer.from(await file.arrayBuffer());
    const filePath = path.join(process.cwd(), "public", "uploads", fileName);

    await writeFile(filePath, buffer);

    // 👉 chỉ update DB nếu là ảnh phòng
    if (maPhong) {
      const pool = await getPool();
      await pool
        .request()
        .input("fileName", sql.VarChar(255), fileName)
        .input("maPhong", sql.VarChar(4), maPhong).query(`
          UPDATE PHONG
          SET IMAGE_URL = @fileName
          WHERE MA_PHONG = @maPhong
        `);
    }

    return NextResponse.json({
      fileName,
      url: `/uploads/${fileName}`,
      message: "Upload thành công",
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Upload thất bại" }, { status: 500 });
  }
}

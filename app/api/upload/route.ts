import { NextRequest, NextResponse } from "next/server";
import { writeFile } from "fs/promises";
import path from "path";
import { getPool } from "@/lib/db";
import sql from "mssql";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("image") as File;
    const maPhong = formData.get("maPhong") as string;

    if (!file || !maPhong) {
      return NextResponse.json(
        { error: "Thiếu file hoặc mã phòng" },
        { status: 400 },
      );
    }

    // Tên file: timestamp_maPhong.ext  →  ví dụ: 1714000000000_101.jpg
    const ext = file.name.split(".").pop();
    const fileName = `${Date.now()}_${maPhong}.${ext}`;

    // Lưu vào public/uploads/
    const buffer = Buffer.from(await file.arrayBuffer());
    const filePath = path.join(process.cwd(), "public", "uploads", fileName);
    await writeFile(filePath, buffer);

    // Cập nhật IMAGE_URL vào bảng PHONG
    const pool = await getPool();
    await pool
      .request()
      .input("fileName", sql.VarChar(255), fileName)
      .input("maPhong", sql.VarChar(4), maPhong) // VARCHAR(4) khớp DB
      .query(`
        UPDATE PHONG
        SET IMAGE_URL = @fileName
        WHERE MA_PHONG = @maPhong
      `);

    return NextResponse.json({ fileName, message: "Upload thành công" });
  } catch (err) {
    console.error("[POST /api/upload]", err);
    return NextResponse.json({ error: "Upload thất bại" }, { status: 500 });
  }
}

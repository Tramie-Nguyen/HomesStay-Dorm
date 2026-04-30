import { NextResponse } from "next/server";
import { writeFile } from "fs/promises";
import path from "path";

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json(
        { message: "No file uploaded" },
        { status: 400 },
      );
    }

    // 👉 convert file
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // 👉 tạo tên file
    const fileName = `${Date.now()}-${file.name}`;

    // 👉 lưu vào public/uploads
    const filePath = path.join(process.cwd(), "public/uploads", fileName);

    await writeFile(filePath, buffer);

    // 👉 trả URL để frontend dùng
    const url = `/uploads/${fileName}`;

    return NextResponse.json({ url });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ message: "Upload failed" }, { status: 500 });
  }
}

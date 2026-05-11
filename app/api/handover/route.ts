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
      .input("handoverUrl", handoverUrl)
      .execute("SP_UPSERT_HANDOVER");

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

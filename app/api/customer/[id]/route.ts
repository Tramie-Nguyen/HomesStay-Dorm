import { NextResponse } from "next/server";
import { getPool } from "@/lib/db";

export async function PUT(
  req: Request,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await context.params;
    const body = await req.json();

    const { name, phone, cccd, gender, email } = body;

    const pool = await getPool();

    await pool
      .request()
      .input("MA_KH", id)
      .input("TEN_KH", name)
      .input("SDT", phone)
      .input("CCCD", cccd)
      .input("GIOI_TINH", gender)
      .input("EMAIL", email)
      .execute("SP_UPDATE_KHACH_HANG");

    return NextResponse.json({ message: "Updated" });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ message: "Error" }, { status: 500 });
  }
}

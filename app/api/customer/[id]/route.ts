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
      .input("id", id)
      .input("name", name)
      .input("phone", phone)
      .input("cccd", cccd)
      .input("gender", gender)
      .input("email", email).query(`
        UPDATE KHACH_HANG
        SET TEN_KH = @name,
            SDT = @phone,
            CCCD = @cccd,
            GIOI_TINH = @gender
        WHERE MA_KH = @id
      `);

    // nếu có bảng tài khoản thì update email
    if (email) {
      await pool.request().input("id", id).input("email", email).query(`
          UPDATE TAI_KHOAN
          SET EMAIL = @email
          WHERE MA_TK = (
            SELECT MA_TK FROM KHACH_HANG WHERE MA_KH = @id
          )
        `);
    }

    return NextResponse.json({ message: "Updated" });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ message: "Error" }, { status: 500 });
  }
}

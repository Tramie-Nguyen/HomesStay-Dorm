import { NextRequest, NextResponse } from "next/server";
import { getPool } from "@/lib/db";

// type trả về
interface LoginResponse {
  role: "CUSTOMER" | "SALE" | "BRANCH_MANAGER";
  user: {
    MA_NV?: string;
    TEN_NV?: string;
    MA_KH?: string;
    TEN_KH?: string;
    EMAIL: string;
  };
}

export async function POST(req: NextRequest) {
  try {
    const { email, password }: { email: string; password: string } =
      await req.json();

    if (!email || !password) {
      return NextResponse.json(
        { message: "Thiếu email hoặc mật khẩu" },
        { status: 400 },
      );
    }

    const pool = await getPool();

    const result = await pool
      .request()
      .input("email", email)
      .input("password", password).query(`
        SELECT 
          tk.MA_TK,
          tk.EMAIL,
          tk.ROLE,

          nv.MA_NV,
          nv.TEN_NV,

          kh.MA_KH,
          kh.TEN_KH

        FROM TAI_KHOAN tk
        LEFT JOIN NHAN_VIEN nv ON tk.MA_TK = nv.MA_TK
        LEFT JOIN KHACH_HANG kh ON tk.MA_TK = kh.MA_TK
        WHERE tk.EMAIL = @email AND tk.MAT_KHAU = @password
      `);

    if (result.recordset.length === 0) {
      return NextResponse.json(
        { message: "Sai email hoặc mật khẩu" },
        { status: 401 },
      );
    }

    const row = result.recordset[0];

    let role: LoginResponse["role"];
    let user: LoginResponse["user"];

    switch (row.ROLE) {
      case "SALE":
        role = "SALE";
        user = {
          MA_NV: row.MA_NV,
          TEN_NV: row.TEN_NV,
          EMAIL: row.EMAIL,
        };
        break;

      case "BRANCH_MANAGER":
        role = "BRANCH_MANAGER";
        user = {
          MA_NV: row.MA_NV,
          TEN_NV: row.TEN_NV,
          EMAIL: row.EMAIL,
        };
        break;

      default:
        role = "CUSTOMER";
        user = {
          MA_KH: row.MA_KH,
          TEN_KH: row.TEN_KH,
          EMAIL: row.EMAIL,
        };
        break;
    }

    const response: LoginResponse = {
      role,
      user,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error("LOGIN ERROR:", error);

    return NextResponse.json({ message: "Lỗi server" }, { status: 500 });
  }
}

import { NextResponse } from "next/server";
import { getPool } from "@/lib/db";

// Cập nhật trạng thái giường
export async function PUT(req: Request) {
    try {
        const body = await req.json();
        const { MA_KTX, MA_PHONG, MA_GIUONG, TRANG_THAI } = body;
        const pool = await getPool();
        const result = await pool
            .request()
            .input("MA_KTX", MA_KTX)
            .input("MA_PHONG", MA_PHONG)
            .input("MA_GIUONG", MA_GIUONG)
            .input("TRANG_THAI", TRANG_THAI)
            .execute("SP_CapNhatTrangThaiGiuong");
        return NextResponse.json(result);
    } catch (error) {
        console.error("Error updating bed status:", error);
        return NextResponse.json({ error: "Failed to update bed status" }, { status: 500 });
    }
};

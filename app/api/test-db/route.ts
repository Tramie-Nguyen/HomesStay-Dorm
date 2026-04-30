import { NextResponse } from "next/server";
import { getPool } from "@/lib/db";
import sql from "mssql";

export async function GET() {
  try {
    console.log("[API TEST] Starting database connection test...");
    const pool = await getPool();
    console.log("[API TEST] Pool connected");

    // Test 1: Check if BIEN_BAN_TRA_PHONG has data
    const testResult1 = await pool
      .request()
      .query("SELECT TOP 10 * FROM BIEN_BAN_TRA_PHONG ORDER BY NGAY DESC");
    console.log(
      "[API TEST] BIEN_BAN_TRA_PHONG count:",
      testResult1.recordset?.length,
    );
    console.log("[API TEST] First row:", testResult1.recordset?.[0]);

    // Test 2: Check if SP exists
    const testResult2 = await pool
      .request()
      .query(
        "SELECT name FROM sys.objects WHERE type='P' AND name='SP_GetBienBanTraPhong'",
      );
    console.log(
      "[API TEST] SP_GetBienBanTraPhong exists:",
      testResult2.recordset?.length > 0,
    );

    // Test 3: Try to execute SP
    let spResult = null;
    try {
      spResult = await pool
        .request()
        .input("TrangThai", sql.NVarChar(50), "")
        .input("SortDir", sql.VarChar(4), "DESC")
        .execute("SP_GetBienBanTraPhong");
      console.log(
        "[API TEST] SP execution successful, rows:",
        spResult.recordset?.length,
      );
      console.log("[API TEST] First SP row:", spResult.recordset?.[0]);
    } catch (spErr) {
      console.error("[API TEST] SP execution error:", spErr);
    }

    return NextResponse.json({
      status: "ok",
      tests: {
        bbTraPhongCount: testResult1.recordset?.length ?? 0,
        firstBBTraPhong: testResult1.recordset?.[0],
        spExists: testResult2.recordset?.length > 0,
        spResult: spResult?.recordset ?? null,
        spError: spResult ? null : "SP execution failed",
      },
    });
  } catch (err) {
    console.error("[API TEST] Error:", err);
    return NextResponse.json(
      {
        error: err instanceof Error ? err.message : String(err),
        stack: err instanceof Error ? err.stack : undefined,
      },
      { status: 500 },
    );
  }
}

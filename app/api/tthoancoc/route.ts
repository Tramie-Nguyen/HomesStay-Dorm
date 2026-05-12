import { NextResponse } from "next/server";

import { getThongTinHoanCoc } from "@/services/tthoancoc.service";

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);

    const ma_kh = url.searchParams.get("ma_kh");

    const result = await getThongTinHoanCoc(ma_kh || "");

    return NextResponse.json(result);
  } catch (err: any) {
    console.error("API /api/tthoancoc error", err);

    return NextResponse.json(
      {
        error: err.message || "Internal server error",
      },
      {
        status: 500,
      },
    );
  }
}

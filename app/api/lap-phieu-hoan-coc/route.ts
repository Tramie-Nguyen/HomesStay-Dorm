import { NextResponse } from "next/server";

import {
  getLapPhieuHoanCoc,
  createLapPhieuHoanCoc,
} from "@/services/lapPhieuHoanCoc.service";

export async function GET(req: Request) {
  try {

    const url = new URL(req.url);

    const ma_hop_dong =
      url.searchParams.get("ma_hop_dong");

    const ma_kh =
      url.searchParams.get("ma_kh");

    const result =
      await getLapPhieuHoanCoc({
        ma_hop_dong:
          ma_hop_dong || undefined,

        ma_kh:
          ma_kh || undefined,
      });

    return NextResponse.json(result);

  } catch (err: any) {

    console.error(
      "GET /api/lap-phieu-hoan-coc",
      err
    );

    return NextResponse.json(
      {
        error:
          err.message ||
          "Internal server error",
      },
      {
        status: 500,
      }
    );
  }
}

export async function POST(req: Request) {
  try {

    const payload =
      await req.json();

    const result =
      await createLapPhieuHoanCoc(
        payload
      );

    return NextResponse.json(
      result
    );

  } catch (err: any) {

    console.error(
      "POST /api/lap-phieu-hoan-coc",
      err
    );

    return NextResponse.json(
      {
        error:
          err.message ||
          "Internal server error",
      },
      {
        status: 500,
      }
    );
  }
}

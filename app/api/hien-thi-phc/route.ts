import { NextResponse } from "next/server";

import {
  hienThiPhieuHoanCoc,
  thanhToanHoanCoc,
} from "@/services/phieuHoanCoc.service";

export async function GET(req: Request) {
  try {

    const url = new URL(req.url);

    const ma_hop_dong =
      url.searchParams.get("ma_hop_dong") ||
      url.searchParams.get("ma_phieu");

    const result = await hienThiPhieuHoanCoc(
      ma_hop_dong || ""
    );

    return NextResponse.json(result);

  } catch (err: any) {

    return NextResponse.json(
      {
        error: err.message,
      },
      {
        status: 500,
      }
    );
  }
}

export async function POST(req: Request) {
  try {

    const payload = await req.json();

    const result = await thanhToanHoanCoc({
      ma_hop_dong:
        payload.ma_hop_dong || payload.ma_phieu,

      hinh_thuc: payload.hinh_thuc,

      so_tien: Number(
        payload.so_tien || payload.amount || 0
      ),
    });

    return NextResponse.json(result);

  } catch (err: any) {

    return NextResponse.json(
      {
        error: err.message,
      },
      {
        status: 500,
      }
    );
  }
}
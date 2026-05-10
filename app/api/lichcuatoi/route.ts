import { NextResponse } from "next/server";
import { Lich } from "../../services/LICH";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const thang = Number(searchParams.get('thang'));
    const nam = Number(searchParams.get('nam'));
    
    const data = await Lich.LayDanhSachLich(thang, nam);
    return NextResponse.json(data, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}
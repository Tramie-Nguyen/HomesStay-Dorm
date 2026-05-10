import { NextResponse } from "next/server";
import { Lich } from "../../services/LICH";

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    const body = await request.json();
    
    await Lich.DoiLich(params.id, body.ngay, body.gio);
    return NextResponse.json({ message: "Dời lịch thành công" }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    await Lich.HuyLich(params.id);
    return NextResponse.json({ message: "Hủy lịch thành công" }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}
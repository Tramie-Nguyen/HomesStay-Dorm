import { NextResponse } from "next/server";
import { getPool } from "@/lib/db";

export async function GET(
  req: Request,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await context.params;
    const pool = await getPool();

    const result = await pool
      .request()
      .input("id", id)
      .execute("SP_GET_RENTAL_DETAILS");

    const main = result.recordset[0];

    if (!main) {
      return NextResponse.json(
        { message: "Không tìm thấy dữ liệu" },
        { status: 404 },
      );
    }

    // ===== GET BEDS OF THIS RENTAL =====
    let beds = await pool
      .request()
      .input("id", id)
      .input("roomId", main.MA_PHONG)
      .input("ktxId", main.MA_KTX)
      .execute("SP_GET_RENTAL_BEDS");

    console.log(
      "Beds query result:",
      beds.recordset,
      "Count:",
      beds.recordset.length,
    );
    console.log(
      "Query params - id:",
      id,
      "roomId:",
      main.MA_PHONG,
      "ktxId:",
      main.MA_KTX,
    );

    // Fallback: if no beds found via LICH_GIUONG, get all beds from this room
    if (beds.recordset.length === 0) {
      console.log("No beds in LICH_GIUONG, fetching all room beds as fallback");
      beds = await pool
        .request()
        .input("roomId", main.MA_PHONG)
        .input("ktxId", main.MA_KTX)
        .execute("SP_GET_ALL_ROOM_BEDS");
    }

    const totalPrice = beds.recordset.reduce(
      (sum, bed) => sum + (Number(bed.GIA) || 0),
      0,
    );

    const response = {
      ...main,
      GIUONGS: beds.recordset.map((bed) => ({
        MA_GIUONG: bed.MA_GIUONG,
        GIA: Number(bed.GIA) || 0,
      })),
      TONG_TIEN: totalPrice,
      HOP_DONG_IMAGE: main.HOP_DONG_IMAGE,
      BIEN_BAN_IMAGE: main.BIEN_BAN_IMAGE,
    };

    return NextResponse.json(response);
  } catch (err) {
    console.error(err);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}

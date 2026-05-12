import {
  NextRequest,
  NextResponse,
} from "next/server";

import {
  getBienBanTraPhong,
  updateBienBanTraPhong,
} from "@/services/bienBanTraPhong.service";

export async function GET(
  req: NextRequest
) {
  try {

    const { searchParams } =
      new URL(req.url);

    const status =
      searchParams.get("status") ?? "";

    const sort =
      searchParams.get("sort") ??
      "DESC";

    const result =
      await getBienBanTraPhong({
        status,
        sort,
      });

    return NextResponse.json(
      result
    );

  } catch (err: any) {

    console.error(
      "[GET /api/bien-ban-tra-phong]",
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

export async function PUT(
  req: NextRequest
) {
  try {

    const body =
      await req.json();

    const result =
      await updateBienBanTraPhong(
        body
      );

    return NextResponse.json(
      result
    );

  } catch (err: any) {

    console.error(
      "[PUT /api/bien-ban-tra-phong]",
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
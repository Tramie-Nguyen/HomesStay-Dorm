import { NextResponse } from "next/server";
import { getPool } from "@/lib/db";
import sql from "mssql";

export async function POST(request) {
  try {
    const { maPdc, soTien, ngayNhanPhong, gioNhanPhong, emailKhach, qrUrl, maPhong, danhSachGiuong } = await request.json();
    const ngayGioNhan = `${ngayNhanPhong} ${gioNhanPhong}:00`;

    const pool = await getPool();
    
    // Cập nhật thời gian dự kiến nhận phòng vào Lịch
    await pool.request()
      .input('maPdc', sql.VarChar(5), maPdc)
      .input('ngayGio', sql.DateTime, ngayGioNhan)
      .query(`UPDATE LICH SET NGAY_GIO = @ngayGio WHERE MA_PDC = @maPdc`);

    // Gửi Email cho khách hàng nếu có email
    if (emailKhach) {
      const mailContent = `
        <h3>Thông báo giữ chỗ phòng trọ / KTX</h3>
        <p>Mã phiếu: <strong>${maPdc}</strong></p>
        <p>Phòng: ${maPhong} | Giường: ${danhSachGiuong?.join(", ")}</p>
        <p>Số tiền cọc: <strong>${soTien?.toLocaleString()} VND</strong></p>
        <p>Hệ thống sẽ giữ chỗ cho bạn trong vòng <strong>24 giờ</strong>. Vui lòng quét mã QR bên dưới để thanh toán:</p>
        <img src="${qrUrl}" alt="QR Code" />
        <p>Nội dung chuyển khoản: <strong>DATCOC ${maPdc}</strong></p>
      `;
      // Gọi hàm sendMail(emailKhach, "Xác nhận giữ chỗ", mailContent);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
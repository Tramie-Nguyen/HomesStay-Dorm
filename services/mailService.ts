import { transporter } from "@/lib/mailer";

export interface ThongTinLichHen {
  tenKh: string;
  email: string;
  maPhong: string;
  ktxName: string;
  ngayXem: string; // "YYYY-MM-DD HH:mm:ss"
  selectedBeds: string[];
  hinhThucThue: string;
}

// ── Nghiệp vụ: validate email trước khi gửi ─────────────────────────────────
export function validateEmail(email: string): string {
  const trimmed = email.trim();
  if (!trimmed || !trimmed.includes("@")) {
    throw new Error("Email không hợp lệ, không thể gửi xác nhận.");
  }
  return trimmed;
}

// ── Nghiệp vụ: gửi mail xác nhận lịch hẹn ──────────────────────────────────
export async function guiMailXacNhanLich(info: ThongTinLichHen): Promise<void> {
  const email = validateEmail(info.email);

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; 
                border: 1px solid #eee; border-radius: 12px; overflow: hidden;">
      <div style="background: #FF4081; padding: 24px; text-align: center;">
        <h1 style="color: white; margin: 0; font-size: 20px;">
          XÁC NHẬN ĐẶT LỊCH XEM PHÒNG
        </h1>
      </div>

      <div style="padding: 24px; color: #333;">
        <p>Xin chào <strong>${info.tenKh}</strong>,</p>
        <p>Lịch xem phòng của bạn đã được đặt thành công. Chi tiết như sau:</p>

        <table style="width: 100%; border-collapse: collapse; margin: 16px 0;">
          <tr style="background: #f9f9f9;">
            <td style="padding: 10px; border: 1px solid #eee; font-weight: bold; width: 40%;">KTX</td>
            <td style="padding: 10px; border: 1px solid #eee;">${info.ktxName}</td>
          </tr>
          <tr>
            <td style="padding: 10px; border: 1px solid #eee; font-weight: bold;">Phòng</td>
            <td style="padding: 10px; border: 1px solid #eee;">${info.maPhong}</td>
          </tr>
          <tr style="background: #f9f9f9;">
            <td style="padding: 10px; border: 1px solid #eee; font-weight: bold;">Giường</td>
            <td style="padding: 10px; border: 1px solid #eee;">${info.selectedBeds.join(", ")}</td>
          </tr>
          <tr>
            <td style="padding: 10px; border: 1px solid #eee; font-weight: bold;">Thời gian hẹn</td>
            <td style="padding: 10px; border: 1px solid #eee;">${info.ngayXem}</td>
          </tr>
          <tr style="background: #f9f9f9;">
            <td style="padding: 10px; border: 1px solid #eee; font-weight: bold;">Hình thức thuê</td>
            <td style="padding: 10px; border: 1px solid #eee;">${info.hinhThucThue}</td>
          </tr>
        </table>

        <p style="color: #666; font-size: 13px;">
          Vui lòng mang theo CCCD khi đến xem phòng.<br/>
          Nếu cần hỗ trợ, liên hệ hotline của chúng tôi.
        </p>
      </div>

      <div style="background: #f5f5f5; padding: 16px; text-align: center; 
                  font-size: 12px; color: #999;">
        © Homestay Dorm — Email này được gửi tự động, vui lòng không phản hồi.
      </div>
    </div>
  `;

  await transporter.sendMail({
    from: `"Homestay Dorm" <${process.env.MAIL_USER}>`,
    to: email,
    subject: `[Homestay Dorm] Xác nhận lịch xem phòng ${info.maPhong}`,
    html,
  });
}

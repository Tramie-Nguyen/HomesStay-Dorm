import { Lich_DB } from '../dal/Lich_DB';

export class Lich {
  public static async LayDanhSachLich(thang: number, nam: number) {
    if (thang < 1 || thang > 12) {
        throw new Error("Tháng không hợp lệ.");
    }

    return await Lich_DB.LayDanhSach(thang, nam);
  }

  public static async DoiLich(ma: string, ngay: string, gio: string) {
    if (!ma) throw new Error("Mã phiếu không tồn tại.");
    
    const lichMoi = new Date(`${ngay}T${gio}`);
    if (lichMoi < new Date()) {
      throw new Error("Không thể dời lịch về quá khứ.");
    }

    return await Lich_DB.CapNhat(ma, ngay, gio);
  }

  public static async HuyLich(ma: string) {
    if (!ma) throw new Error("Mã phiếu không tồn tại.");
    
    return await Lich_DB.Xoa(ma);
  }
}
"use client";
import type { Dispatch, SetStateAction } from "react";

type SetLoading = Dispatch<SetStateAction<boolean>>;

export const handleHuyLich = async (
  maPhieu: string | number,
  setIsLoading: SetLoading,
  onRefresh: () => void,
  onClose: () => void
) => {
  if (!confirm("Bạn có chắc chắn muốn hủy lịch này?")) return;

  setIsLoading(true);
  try {
    const res = await fetch(`/api/lich?maPhieu=${maPhieu}`, { method: "DELETE" });
    if (res.ok) {
      alert("Hủy lịch thành công!");
      onRefresh();
      onClose();
    } else {
      const data = await res.json();
      alert(`Lỗi: ${data.details || data.error}`);
    }
  } catch {
    alert("Lỗi kết nối mạng.");
  } finally {
    setIsLoading(false);
  }
};

export const handleDoiLich = async (
  maPhieu: string,
  newDate: Date | null,
  newTime: string,
  setIsLoading: SetLoading,
  onRefresh: () => void,
  onClose: () => void
) => {
  if (!newDate || !newTime) {
    alert("Vui lòng chọn cả ngày và giờ mới!");
    return;
  }

  const [hours, minutes] = newTime.split(":").map(Number);
  const combinedDateTime = new Date(newDate);
  combinedDateTime.setHours(hours + 7, minutes, 0, 0);

  if (combinedDateTime <= new Date()) {
    alert("Ngày giờ mới phải lớn hơn thời gian hiện tại!");
    return;
  }

  setIsLoading(true);
  try {
    const res = await fetch("/api/lich", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        maPhieu,
        ngayGioMoi: combinedDateTime.toISOString(),
      }),
    });

    if (res.ok) {
      alert("Dời lịch thành công!");
      onRefresh();
      onClose();
    } else {
      const data = await res.json();
      alert(`Lỗi: ${data.details || data.error}`);
    }
  } catch {
    alert("Lỗi kết nối mạng.");
  } finally {
    setIsLoading(false);
  }
};

export const handleCapNhatLich = async (
  maPhieu: string,
  newTrangThai: string,
  setIsLoading: SetLoading,
  onRefresh: () => void,
  onClose?: () => void
) => {
  setIsLoading(true);
  try {
    const res = await fetch("/api/lich", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        maPhieu,
        newTrangThai,
      }),
    });

    if (res.ok) {
      onRefresh();
      onClose?.();
    } else {
      const data = await res.json();
      alert(`Lỗi: ${data.details || data.error}`);
    }
  } catch {
    alert("Lỗi kết nối mạng.");
  } finally {
    setIsLoading(false);
  }
};

// Thêm lịch
export const handleThemLich = async (lichData: {
    maPhieu: string;
  ngayGio: Date;
  loai: string;
  maPdk: string;
  maPdc: string;
  maKtx: string;
  maPhong: string;
  maNv: string;

}) => {
  try {
    const res = await fetch("/api/lich", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(lichData),
    });

    if (!res.ok) {
      const data = await res.json();
      alert(`Lỗi: ${data.details || data.error}`);
    }
  } catch {
    alert("Lỗi kết nối mạng.");
  }
};

// Lấy chi tiết lịch theo ID
export const handleLayChiTietLich = async (id: string) => {
  try {
    const res = await fetch(`/api/lich/${id}`, {
      method: "GET",
      cache: "no-store",
    });
    if (!res.ok) {
      const data = await res.json();
      alert(`Lỗi: ${data.details || data.error}`);
      return null;
    }
    return await res.json();
  } catch {
    alert("Lỗi kết nối mạng.");
    return null;
  }
};

// thêm pdc mới vào lịch
export const handleThemPdcVaoLich = async (
  maPhieu: string,
  maPdc: string,
  setIsLoading: React.Dispatch<React.SetStateAction<boolean>>,
  onRefresh: () => void,
  onClose?: () => void
) => {
  try {
    setIsLoading(true);

    const res = await fetch("/api/lich/them-pdc", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        maPhieu,
        maPdc,
      }),
    });

    const data = await res.json();

    if (!res.ok) {
      alert(`Lỗi: ${data.details || data.error}`);
      return false;
    }

    onRefresh();

    if (onClose) {
      onClose();
    }

    return true;
  } catch (error) {
    console.error("Lỗi thêm PDC vào lịch:", error);
    alert("Lỗi kết nối mạng.");
    return false;
  } finally {
    setIsLoading(false);
  }
};

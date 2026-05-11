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

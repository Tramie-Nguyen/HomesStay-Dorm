"use client";
import { toast } from "react-hot-toast";

interface DepositRequest {
    soTien: number;
    maKh: string;
    maNv: string;
}

// Xử lý tạo phiếu đặt cọc: truyền vào số tiền, mã nhân viên, mã khách hàng
export const handleCreateDeposit = async (depositData: DepositRequest) => {
    try {
        const response = await fetch("/api/deposit", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(depositData),
        });
        if (!response.ok) {
            throw new Error("Failed to create deposit");
        }
        const result = await response.json();
        return result;
    } catch (error) {
        console.error("Error creating deposit:", error);
        toast.error("Có lỗi xảy ra khi tạo phiếu đặt cọc!");
        throw error;
    }
};

export const changeDepositStatus = async (maPhieu: string, newStatus: string) => {
  try {
    const response = await fetch(`/api/deposit/${maPhieu}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ MA_PDC: maPhieu, status: newStatus }),
    });

    if (!response.ok) {
      throw new Error("Failed to update deposit status");
    }

    const result = await response.json();
    return result;
  } catch (error) {
    console.error("Error updating deposit status:", error);
    toast.error("Có lỗi xảy ra khi cập nhật trạng thái phiếu đặt cọc!");
    throw error;
  }
};

export const calculateDepositAmount = (giaGiuong: number[]) => {
  const total = giaGiuong.reduce((sum, price) => sum + price, 0);
  return total * 2;
};

// lấy phiếu đặt cọc qua mã phiếu
export const handleGetDepositDetail = async (maPdc: string) => {
  try {
    const response = await fetch(`/api/deposit/${maPdc}`, {
      method: "GET",
      cache: "no-store",
    });

    if (!response.ok) {
      const data = await response.json();

      throw new Error(data.error || "Lỗi lấy chi tiết đặt cọc");
    }

    return await response.json();

  } catch (error) {
    console.error("Lỗi handleGetDepositDetail:", error);
    throw error;
  }
};
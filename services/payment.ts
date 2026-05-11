"use client";
import { toast } from "react-hot-toast";

// Tạo phiếu thanh toán
export const handleCreatePayment = async (paymentData: {
    hinhThuc: string;
    soTien: number;
    trangThai: string;
    maHd: string | null;
    ma_Pdc: string | null;
}) => {
    try {
        const response = await fetch("/api/payment", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(paymentData)
        });

        const result = await response.json();

        if (!response.ok) {
            throw new Error(result.error || "Lỗi khi tạo phiếu thanh toán");
        }

        toast.success("Phiếu thanh toán được tạo thành công!");
        return result;
    } catch (error: any) {
        toast.error(error.message || "Có lỗi xảy ra khi tạo phiếu thanh toán");
        throw error;
    }
};
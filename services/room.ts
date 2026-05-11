"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";

// changeRoomStatus 
export const changeRoomStatus = async (maPhong: string, newStatus: string) => {
  try {
    const response = await fetch(`/api/room/${maPhong}/status`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
    });

    if (!response.ok) {
      throw new Error("Failed to update room status");
    }
    const result = await response.json();
    return result;
    } catch (error) {
    console.error("Error updating room status:", error);
    toast.error("Có lỗi xảy ra khi cập nhật trạng thái phòng!");
    throw error;
  }
};
"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";

// Xử lý hủy lịch
export const handleEndSchedule = async (maPhieu: string) => {
  try {
    const response = await fetch(`/api/schedule/${maPhieu}/end`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
    });
    if (!response.ok) {
      throw new Error("Failed to end schedule");
    }
    const result = await response.json();
    return result;
  } catch (error) {
    console.error("Error ending schedule:", error);
    toast.error("Có lỗi xảy ra khi hủy lịch!");
    throw error;
  }
};

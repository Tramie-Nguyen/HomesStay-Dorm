"use client";

import { useState } from "react";
import { toast } from "react-toastify";

interface Props {
  open: boolean;
  onClose: () => void;
  customer: {
    id: string;
    name: string;
    phone: string;
    dob: string;
    cccd: string;
    gender: string;
    email: string;
  };
  onSuccess?: () => void;
}

export default function EditCustomerModal({
  open,
  onClose,
  customer,
  onSuccess,
}: Props) {
  const formatDateInput = (date?: string) => {
    if (!date) return "";
    return new Date(date).toISOString().split("T")[0];
  };

  const [form, setForm] = useState({
    ...customer,
    dob: formatDateInput(customer.dob),
  });

  if (!open) return null;

  const handleChange = (key: string, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = async () => {
    try {
      await fetch(`/api/customer/${form.id}`, {
        method: "PUT",
        body: JSON.stringify(form),
      });

      toast.success("Cập nhật thành công");
      onClose();
      onSuccess?.();
    } catch (err) {
      toast.error("Có lỗi xảy ra");
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-background rounded-xl p-6 w-96 space-y-3">
        <h2 className="font-semibold text-center text-text1">
          Chỉnh sửa thông tin
        </h2>

        <input
          className="bg-base w-full p-2 text-text1 rounded"
          value={form.name}
          onChange={(e) => handleChange("name", e.target.value)}
          placeholder="Họ tên"
        />

        <input
          className="bg-base w-full p-2 text-text1 rounded"
          value={form.phone}
          onChange={(e) => handleChange("phone", e.target.value)}
          placeholder="Số điện thoại"
        />

        <input
          type="date"
          className="bg-base w-full p-2 text-text1 rounded"
          value={form.dob}
          onChange={(e) => handleChange("dob", e.target.value)}
        />

        <input
          className="bg-base w-full p-2 text-text1 rounded"
          value={form.cccd}
          onChange={(e) => handleChange("cccd", e.target.value)}
          placeholder="CCCD"
        />

        <select
          className="bg-base w-full p-2 text-text1 rounded"
          value={form.gender}
          onChange={(e) => handleChange("gender", e.target.value)}
        >
          <option value="">Giới tính</option>
          <option value="Nam">Nam</option>
          <option value="Nữ">Nữ</option>
        </select>

        <input
          className="bg-base w-full p-2 text-text1 rounded"
          value={form.email}
          onChange={(e) => handleChange("email", e.target.value)}
          placeholder="Email"
        />

        <div className="flex justify-end gap-2 pt-2">
          <button
            onClick={onClose}
            className="cursor-pointer px-3 py-1 border border-text1 text-text1 rounded"
          >
            Hủy
          </button>

          <button
            onClick={handleSubmit}
            className="cursor-pointer px-3 py-1 bg-text2 text-white rounded"
          >
            Lưu
          </button>
        </div>
      </div>
    </div>
  );
}

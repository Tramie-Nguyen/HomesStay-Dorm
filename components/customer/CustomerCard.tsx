"use client";
import { useState } from "react";
import EditCustomerModal from "../customer/EditCustomerModal";

interface Props {
  id: string;
  name: string;
  code: string;
  phone: string;
  dob: string;
  cccd: string;
  gender: string;
  email: string;

  startDate?: string | null;
  endDate?: string | null;
  contractStatus?: string | null;

  onRefresh?: () => void;
  disableEdit?: boolean;
  scheduleType?: string;
}

export default function CustomerCard(props: Props) {
  const [openEdit, setOpenEdit] = useState(false);
  const formatDate = (date?: string | null) => {
    if (!date) return "";
    return new Date(date).toLocaleDateString("vi-VN");
  };

  // Kiểm tra xem lịch có phải là "Nhận phòng" không
  const isNhanPhong = props.scheduleType?.toLowerCase().includes("nhận");

  return (
    <div className="bg-base p-6 rounded-2xl flex gap-6">
      <div className="w-32 h-32 shrink-0 bg-gray-300 rounded-full flex items-center justify-center">
        👤
      </div>

      <div className="flex-1 flex flex-col justify-between">
        <div className="text-sm text-text1 space-y-1">
          <p className="font-semibold text-lg">{props.name}</p>
          <p>Mã KH: {props.code}</p>
          <p>Số điện thoại: {props.phone}</p>
          <p>Ngày sinh: {formatDate(props.dob)}</p>
          <p>CCCD: {props.cccd}</p>
          <p>Giới tính: {props.gender}</p>
          <p>Email: {props.email}</p>

          {/* Chỉ hiển thị Thời hạn và Trạng thái hợp đồng nếu là Nhận phòng */}
          {isNhanPhong && props.startDate && props.endDate && (
            <p>
              Thời hạn: {formatDate(props.startDate)} -{" "}
              {formatDate(props.endDate)}
            </p>
          )}

          {isNhanPhong && props.contractStatus && (
            <p className="font-medium">
              Trạng thái hợp đồng:{" "}
              <span
                className={
                  props.contractStatus === "Đã ký"
                    ? "text-text2"
                    : "text-red-500"
                }
              >
                {props.contractStatus}
              </span>
            </p>
          )}
        </div>

        {/* Căn chỉnh nút xuống góc dưới bên phải */}
        {!props.disableEdit && (
          <div className="flex justify-end mt-4">
            <button
              className="cursor-pointer bg-text2 hover:bg-opacity-90 transition text-white px-4 py-1.5 rounded-md text-sm"
              onClick={() => setOpenEdit(true)}
            >
              Chỉnh sửa thông tin
            </button>
          </div>
        )}
      </div>

      <EditCustomerModal
        open={openEdit}
        onClose={() => setOpenEdit(false)}
        customer={props}
        onSuccess={props.onRefresh}
      />
    </div>
  );
}

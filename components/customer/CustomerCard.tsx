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
}

export default function CustomerCard(props: Props) {
  const [openEdit, setOpenEdit] = useState(false);
  const formatDate = (date?: string | null) => {
    if (!date) return "";
    return new Date(date).toLocaleDateString("vi-VN");
  };

  return (
    <div className="bg-base p-6 rounded-2xl mt-4 flex gap-6 items-center">
      <div className="w-32 h-32 bg-gray-300 rounded-full flex items-center justify-center">
        👤
      </div>

      <div className="text-sm text-text1 space-y-1">
        <p className="font-semibold text-lg">{props.name}</p>
        <p>Mã KH: {props.code}</p>
        <p>Số điện thoại: {props.phone}</p>
        <p>Ngày sinh: {formatDate(props.dob)}</p>
        <p>CCCD: {props.cccd}</p>
        <p>Giới tính: {props.gender}</p>
        <p>Email: {props.email}</p>

        {props.startDate && props.endDate && (
          <p>
            Thời hạn: {formatDate(props.startDate)} -{" "}
            {formatDate(props.endDate)}
          </p>
        )}

        {props.contractStatus && (
          <p className="font-medium">
            Trạng thái hợp đồng:{" "}
            <span
              className={
                props.contractStatus === "Đã ký" ? "text-text2" : "text-red-500"
              }
            >
              {props.contractStatus}
            </span>
          </p>
        )}
      </div>

      {!props.disableEdit && (
        <button
          className="cursor-pointer bg-text2 text-white px-4 py-2 rounded-lg"
          onClick={() => setOpenEdit(true)}
        >
          Chỉnh sửa thông tin
        </button>
      )}
      <EditCustomerModal
        open={openEdit}
        onClose={() => setOpenEdit(false)}
        customer={props}
        onSuccess={props.onRefresh}
      />
    </div>
  );
}

"use client";

import { useState } from "react";
import EditCustomerModal from "../customer/EditCustomerModal";

interface CustomerProps {
  id: string;
  name: string;
  code: string;
  phone: string;
  dob: string;
  cccd: string;
  gender: string;
  email: string;
}

export default function CustomerCard(props: CustomerProps) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <div className="bg-base rounded-2xl p-4 flex gap-6 items-center">
        <div className="w-40 h-40 bg-gray-300 rounded-full flex items-center justify-center text-3xl">
          👤
        </div>

        <div className="flex-1 text-text1 text-sm">
          <p className="font-semibold">{props.name}</p>
          <p>Mã KH: {props.code}</p>
          <p>Số điện thoại: {props.phone}</p>
          <p>Ngày sinh: {props.dob}</p>
          <p>CCCD: {props.cccd}</p>
          <p>Giới tính: {props.gender}</p>
          <p>Email: {props.email}</p>

          <div className="flex justify-end mt-2">
            <button
              onClick={() => setOpen(true)}
              className="cursor-pointer bg-text2 text-white px-4 py-2 rounded-lg"
            >
              Chỉnh sửa thông tin
            </button>
          </div>
        </div>
      </div>

      <EditCustomerModal
        open={open}
        onClose={() => setOpen(false)}
        customer={props}
      />
    </>
  );
}

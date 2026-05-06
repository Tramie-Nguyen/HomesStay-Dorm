"use client";
import { useState } from "react";

export default function CustomerInfo({ initialCustomer }: { initialCustomer: any }) {
  const [isEditing, setIsEditing] = useState(false);
  const [customer, setCustomer] = useState(initialCustomer);

  const handleChange = (e: any) => setCustomer({ ...customer, [e.target.name]: e.target.value });

  return (
    <>
      <h2 className="text-lg font-bold text-text2 mb-2">Thông tin khách</h2>
      <div className="bg-base rounded-2xl p-6 mb-6 flex flex-col md:flex-row items-center md:items-start gap-8 relative shadow-sm">
        <div className="w-32 h-32 bg-gray-400 rounded-full flex-shrink-0 flex items-center justify-center overflow-hidden">
          <svg className="w-24 h-24 text-gray-200 mt-6" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" /></svg>
        </div>
        
        <div className="flex-1 w-full space-y-3 text-text1">
          {isEditing ? (
             <input name="ten" value={customer.ten} onChange={handleChange} className="font-bold text-lg border-b border-primary bg-transparent w-full focus:outline-none" />
          ) : (
            <h3 className="font-bold text-lg">{customer.ten}</h3>
          )}
          
          <div className="flex flex-col gap-3 text-sm">
            <p>Mã KH: <span className="font-medium">{customer.ma}</span></p>
            <p>SĐT: {isEditing ? <input name="sdt" value={customer.sdt} onChange={handleChange} className="border-b border-primary bg-transparent focus:outline-none" /> : customer.sdt}</p>
            <p>Ngày sinh: {isEditing ? <input name="ngaySinh" value={customer.ngaySinh} onChange={handleChange} className="border-b border-primary bg-transparent focus:outline-none" /> : customer.ngaySinh}</p>
            <p>CCCD: {isEditing ? <input name="cccd" value={customer.cccd} onChange={handleChange} className="border-b border-primary bg-transparent focus:outline-none" /> : customer.cccd}</p>
            <p>Giới tính: {isEditing ? <select name="gioiTinh" value={customer.gioiTinh} onChange={handleChange} className="border-b border-primary bg-transparent focus:outline-none"><option>Nữ</option><option>Nam</option></select> : customer.gioiTinh}</p>
            <p className="md:col-span-2">Email: {isEditing ? <input name="email" value={customer.email} onChange={handleChange} className="border-b border-primary bg-transparent focus:outline-none w-full md:w-1/2" /> : customer.email}</p>
          </div>
        </div>

        <button 
          onClick={() => setIsEditing(!isEditing)}
          className="absolute bottom-4 right-4 bg-text2 hover:bg-text1 text-white px-4 py-2 rounded-lg text-sm transition shadow"
        >
          {isEditing ? "Lưu thông tin" : "Chỉnh sửa thông tin"}
        </button>
      </div>
    </>
  );
}
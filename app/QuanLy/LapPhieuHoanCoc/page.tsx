"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

import Link from "next/link";
import NavBar from "../../../components/layout/nav";

interface Item {
  id: string;
  name: string;
  value: number;
  quantity: number;
  damaged: boolean;
  note?: string;
}

const initialItems: Item[] = [
  {
    id: "1",
    name: "Tủ khóa",
    value: 200000,
    quantity: 1,
    damaged: true,
    note: "Hư ổ khóa",
  },
  { id: "2", name: "Bàn học", value: 100000, quantity: 1, damaged: true },
  { id: "3", name: "Ghế dựa", value: 100000, quantity: 2, damaged: true },
  { id: "4", name: "Kệ giày", value: 100000, quantity: 1, damaged: true },
  { id: "5", name: "Chìa khóa", value: 100000, quantity: 1, damaged: true },
  { id: "6", name: "Máy lạnh", value: 100000, quantity: 1, damaged: true },
];

export default function LapPhieuHoanCocPage() {
  const [items, setItems] = useState(initialItems);
  const [extraNote, setExtraNote] = useState("");
  const [extraCost, setExtraCost] = useState<number>(0);

  // Tính tổng chi phí phát sinh
  const total =
    1200000 + // Tiền hoàn cọc (giả lập)
    items
      .filter((item) => item.damaged)
      .reduce((sum, item) => sum + item.value, 0) +
    (extraCost || 0);

  return (
    <>
      <NavBar />
      <main className="min-h-screen bg-[#e6f7fa] font-sans p-6 pt-24">
        <div className="mx-auto max-w-3xl bg-white/80 rounded-xl shadow p-6">
          <h2 className="text-center text-2xl font-bold text-text1 uppercase mb-6">
            Danh sách vật dụng
          </h2>
          <table className="w-full border mb-6">
            <thead>
              <tr className="bg-primary/10">
                <th className="border px-2 py-1">Tên vật dụng</th>
                <th className="border px-2 py-1">Giá trị</th>
                <th className="border px-2 py-1">Số lượng</th>
                <th className="border px-2 py-1">Đồ hư hỏng</th>
                <th className="border px-2 py-1">Ghi chú</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <tr key={item.id}>
                  <td className="border px-2 py-1">{item.name}</td>
                  <td className="border px-2 py-1">
                    {item.value.toLocaleString()}đ
                  </td>
                  <td className="border px-2 py-1">{item.quantity}</td>
                  <td className="border px-2 py-1 text-center">
                    <input
                      type="checkbox"
                      checked={item.damaged}
                      readOnly
                      className="accent-primary"
                    />
                  </td>
                  <td className="border px-2 py-1">{item.note || ""}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="flex gap-4 mb-6">
            <div className="flex-1">
              <label className="block font-semibold mb-1">
                Phát sinh thêm:
              </label>
              <input
                className="w-full rounded border border-base px-3 py-1.5"
                placeholder="Ghi chú"
                value={extraNote}
                onChange={(e) => setExtraNote(e.target.value)}
              />
            </div>
            <div className="flex-1">
              <label className="block font-semibold mb-1 invisible">.</label>
              <input
                className="w-full rounded border border-base px-3 py-1.5"
                placeholder="0đ"
                type="number"
                min={0}
                value={extraCost || ""}
                onChange={(e) => setExtraCost(Number(e.target.value))}
              />
            </div>
          </div>

          <h2 className="text-center text-lg font-bold text-text1 uppercase mb-2 mt-8">
            Tổng chi phí phát sinh
          </h2>
          <div className="bg-primary/10 rounded-xl p-4 mb-6">
            <table className="w-full">
              <tbody>
                <tr>
                  <td className="py-1">Tiền hoàn cọc</td>
                  <td className="py-1 text-right text-accent font-bold">
                    + 1.200.000đ
                  </td>
                </tr>
                <tr>
                  <td className="py-1">Kệ giày</td>
                  <td className="py-1 text-right">+ 100.000đ</td>
                </tr>
                <tr>
                  <td className="py-1">Tủ khóa</td>
                  <td className="py-1 text-right">+ 200.000đ</td>
                </tr>
                {extraCost > 0 && (
                  <tr>
                    <td className="py-1">{extraNote || "Phát sinh thêm"}</td>
                    <td className="py-1 text-right">
                      + {extraCost.toLocaleString()}đ
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
            <div className="flex justify-end font-bold text-lg mt-2">
              Tổng tiền:{" "}
              <span className="ml-4 text-accent">
                {total.toLocaleString()} VND
              </span>
            </div>
          </div>
          <div className="flex justify-end">
            <button className="rounded-full bg-accent px-8 py-2.5 text-base font-bold text-white shadow-md hover:bg-primary transition-colors">
              Xác nhận
            </button>
          </div>
        </div>
      </main>
    </>
  );
}

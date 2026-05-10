"use client";
import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import NavBar from "../../../components/layout/nav";

interface Item {
  id: string;
  MA_VT: string;
  TEN_VAT_TU: string;
  VALUE: number;
  QUANTITY: number;
  damaged: boolean;
  note?: string;
}

export default function LapPhieuHoanCocPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const ma_kh = searchParams?.get("ma_kh");
  const ma_hop_dong = searchParams?.get("ma_hop_dong");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [items, setItems] = useState<Item[]>([]);
  const [tieuCoc, setTieuCoc] = useState<number>(0);
  const [extraNote, setExtraNote] = useState("");
  const [extraCost, setExtraCost] = useState<number>(0);
  const [paramsLoaded, setParamsLoaded] = useState(false);
  const [fetchedMaHopDong, setFetchedMaHopDong] = useState<string | null>(null);

  // Fetch data on mount
  useEffect(() => {
    setParamsLoaded(true);
  }, []);

  useEffect(() => {
    async function load() {
      if (!paramsLoaded || (!ma_hop_dong && !ma_kh)) {
        if (paramsLoaded && !ma_hop_dong && !ma_kh) {
          setError("Missing parameters: ma_kh or ma_hop_dong required");
        }
        return;
      }
      setLoading(true);
      setError(null);
      try {
        const params = ma_hop_dong
          ? `?ma_hop_dong=${encodeURIComponent(ma_hop_dong)}`
          : `?ma_kh=${encodeURIComponent(ma_kh!)}`;
        console.log(`Fetching: /api/lap-phieu-hoan-coc${params}`);
        const res = await fetch(`/api/lap-phieu-hoan-coc${params}`);
        const json = await res.json();
        console.debug("/api/lap-phieu-hoan-coc response:", json);
        if (!res.ok) {
          setError(json?.error || "API error");
          setItems([]);
          return;
        }
        const itemsList = (json.items || []).map((r: any, idx: number) => ({
          id: String(idx + 1),
          MA_VT: r.MA_VT || "",
          TEN_VAT_TU: r.TEN_VAT_TU || "",
          VALUE: r.VALUE || 0,
          QUANTITY: r.QUANTITY || 0,
          damaged: false, // User decides via checkbox
          note: "",
        }));
        setItems(itemsList);
        setTieuCoc(json.summary?.TIEN_COC || 0);
        setFetchedMaHopDong(json.ma_hop_dong);
        console.log(
          "Fetched data - ma_hop_dong from API:",
          json.ma_hop_dong,
          "from URL:",
          ma_hop_dong,
        );
      } catch (err) {
        console.error(err);
        setError("Failed to load data");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [ma_hop_dong, ma_kh, paramsLoaded]);

  // Calculate total damaged amount
  const damagedAmount = items
    .filter((item) => item.damaged)
    .reduce((sum, item) => sum + item.VALUE, 0);

  const total = tieuCoc - damagedAmount - (extraCost || 0);

  const handleToggleDamaged = (id: string) => {
    setItems(
      items.map((item) =>
        item.id === id ? { ...item, damaged: !item.damaged } : item,
      ),
    );
  };

  const handleNoteChange = (id: string, note: string) => {
    setItems(items.map((item) => (item.id === id ? { ...item, note } : item)));
  };

  const handleConfirm = async () => {
    try {
      const contractCode = ma_hop_dong || fetchedMaHopDong;
      console.log(
        "handleConfirm - ma_hop_dong:",
        ma_hop_dong,
        "fetchedMaHopDong:",
        fetchedMaHopDong,
        "contractCode:",
        contractCode,
      );
      if (!contractCode) {
        alert("Lỗi: Không tìm thấy mã hợp đồng");
        return;
      }
      const payload = {
        ma_kh,
        ma_hop_dong: contractCode,
        items: items.map((item) => ({
          MA_VT: item.MA_VT,
          damaged: item.damaged,
          note: item.note,
        })),
        extraNote,
        extraCost,
        total,
      };
      console.log("Posting phieu data:", payload);
      const res = await fetch("/api/lap-phieu-hoan-coc", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const json = await res.json();
      if (!res.ok) {
        alert("Lỗi: " + (json?.error || "Không thể lưu"));
        return;
      }
      // Navigate to HienThiPHc with created phieu ID
      const phieuId = json.ma_phieu || contractCode;
      const query = phieuId
        ? `?ma_phieu=${encodeURIComponent(phieuId)}&total=${encodeURIComponent(String(total))}`
        : `?total=${encodeURIComponent(String(total))}`;
      router.push(`/QuanLy/HienThiPHc${query}`);
    } catch (err) {
      console.error(err);
      alert("Lỗi khi xác nhận");
    }
  };

  return (
    <>
      <NavBar />
      <main className="min-h-screen bg-background font-sans p-6 pt-24">
        <div className="mx-auto max-w-3xl bg-base/80 rounded-xl shadow p-6">
          <h2 className="text-center text-2xl font-bold text-text1 uppercase mb-6">
            Danh sách vật dụng
          </h2>

          {error && (
            <div className="mb-3 rounded-md border border-accent/50 bg-accent/10 px-4 py-2 text-sm text-accent">
              {error}
            </div>
          )}

          {loading ? (
            <div className="text-center py-8 text-gray-500">
              Đang tải dữ liệu...
            </div>
          ) : (
            <>
              <table className="w-full border mb-6">
                <thead>
                  <tr className="bg-primary/10">
                    <th className="border border-base px-2 py-1">
                      Tên vật dụng
                    </th>
                    <th className="border border-base px-2 py-1">Giá trị</th>
                    <th className="border border-base px-2 py-1">Số lượng</th>
                    <th className="border border-base px-2 py-1">Đồ hư hỏng</th>
                    <th className="border border-base px-2 py-1">Ghi chú</th>
                  </tr>
                </thead>
                <tbody>
                  {items.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="text-center py-4 text-text2">
                        Không có dữ liệu
                      </td>
                    </tr>
                  ) : (
                    items.map((item) => (
                      <tr key={item.id}>
                        <td className="border px-2 py-1">{item.TEN_VAT_TU}</td>
                        <td className="border px-2 py-1">
                          {item.VALUE.toLocaleString()}đ
                        </td>
                        <td className="border px-2 py-1">{item.QUANTITY}</td>
                        <td className="border px-2 py-1 text-center">
                          <input
                            type="checkbox"
                            checked={item.damaged}
                            onChange={() => handleToggleDamaged(item.id)}
                            className="accent-primary cursor-pointer"
                          />
                        </td>
                        <td className="border px-2 py-1">
                          <input
                            type="text"
                            className="w-full rounded border border-base px-2 py-1 text-sm"
                            placeholder="Ghi chú..."
                            value={item.note || ""}
                            onChange={(e) =>
                              handleNoteChange(item.id, e.target.value)
                            }
                          />
                        </td>
                      </tr>
                    ))
                  )}
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
                  <label className="block font-semibold mb-1 invisible">
                    .
                  </label>
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
                        + {tieuCoc.toLocaleString()}đ
                      </td>
                    </tr>
                    {items
                      .filter((item) => item.damaged)
                      .map((item) => (
                        <tr key={item.id}>
                          <td className="py-1">{item.TEN_VAT_TU}</td>
                          <td className="py-1 text-right text-red-600">
                            - {item.VALUE.toLocaleString()}đ
                          </td>
                        </tr>
                      ))}
                    {extraCost > 0 && (
                      <tr>
                        <td className="py-1">
                          {extraNote || "Phát sinh thêm"}
                        </td>
                        <td className="py-1 text-right text-red-600">
                          - {extraCost.toLocaleString()}đ
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
                <button
                  onClick={handleConfirm}
                  className="rounded-full bg-accent px-8 py-2.5 text-base font-bold text-white shadow-md hover:bg-primary transition-colors"
                >
                  Xác nhận
                </button>
              </div>
            </>
          )}
        </div>
      </main>
    </>
  );
}

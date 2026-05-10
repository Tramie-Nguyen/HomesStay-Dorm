"use client";

import { useState } from "react";
import { Upload } from "lucide-react";
import { toast } from "react-toastify";

interface Props {
  open: boolean;
  onClose: () => void;
  rentalId: string;
}

// ✅ ĐƯA RA NGOÀI
function UploadBox({
  label,
  file,
  setFile,
}: {
  label: string;
  file: File | null;
  setFile: (f: File) => void;
}) {
  return (
    <label className="border-2 border-dashed border-text2 bg-[#cfe3e6] rounded-xl h-28 flex flex-col items-center justify-center cursor-pointer">
      <Upload />
      <span className="text-text2">{file ? file.name : label}</span>
      <input
        type="file"
        hidden
        accept="image/*"
        onChange={(e) => {
          if (e.target.files?.[0]) setFile(e.target.files[0]);
        }}
      />
    </label>
  );
}

export default function HandoverModal({ open, onClose, rentalId }: Props) {
  const [contract, setContract] = useState<File | null>(null);
  const [handover, setHandover] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);

  if (!open) return null;

  const handleSubmit = async () => {
    if (!contract || !handover) {
      toast.error("Vui lòng tải đủ 2 ảnh");
      return;
    }

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("contract", contract);
      formData.append("handover", handover);
      formData.append("rentalId", rentalId);

      const res = await fetch("/api/handover", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => null);
        throw new Error(errorData?.message || errorData?.error || "Upload failed");
      }

      toast.success("Bàn giao thành công");
      setContract(null);
      setHandover(null);
      onClose();
    } catch (err) {
      const message = err instanceof Error ? err.message : "Có lỗi xảy ra";
      toast.error(message);
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-6 w-[420px] space-y-4">
        <h2 className="font-semibold">Hợp đồng thuê</h2>

        <UploadBox label="Tải ảnh" file={contract} setFile={setContract} />

        <h2 className="font-semibold">Biên bản bàn giao</h2>

        <UploadBox label="Tải ảnh" file={handover} setFile={setHandover} />

        <div className="flex justify-center gap-4 pt-2">
          <button
            onClick={() => {
              setContract(null);
              setHandover(null);
              onClose();
            }}
            className="border text-text1 cursor-pointer border-text2 px-6 py-2 rounded-lg font-semibold"
          >
            Hủy
          </button>

          <button
            onClick={handleSubmit}
            disabled={loading}
            className="bg-accent cursor-pointer text-white px-6 py-2 rounded-lg font-semibold disabled:opacity-50"
          >
            {loading ? "Đang tải..." : "Hoàn tất"}
          </button>
        </div>
      </div>
    </div>
  );
}

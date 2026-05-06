"use client";

import { useState } from "react";
import { toast } from "react-toastify";
import UploadFile from "@/components/UpLoadFile";

interface Props {
  open: boolean;
  onClose: () => void;
  maHopDong: string;
  onSuccess: () => void;
}

export default function HandoverModal({
  open,
  onClose,
  maHopDong,
  onSuccess,
}: Props) {
  const [contractUrl, setContractUrl] = useState<string>("");
  const [handoverUrl, setHandoverUrl] = useState<string>("");

  if (!open) return null;

  const handleSubmit = async () => {
    if (!contractUrl || !handoverUrl) {
      toast.error("Vui lòng upload đủ 2 file");
      return;
    }

    try {
      const res = await fetch("/api/handover", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          maHopDong,
          contractUrl,
          handoverUrl,
        }),
      });

      if (!res.ok) throw new Error();

      toast.success("Bàn giao thành công");

      onSuccess();
      onClose();
    } catch {
      toast.error("Có lỗi xảy ra");
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-6 w-[420px] space-y-4">
        <h2 className="font-semibold">Hợp đồng thuê</h2>

        <UploadFile
          label="Upload hợp đồng"
          onUploaded={(url) => setContractUrl(url)}
        />

        <h2 className="font-semibold">Biên bản bàn giao</h2>

        <UploadFile
          label="Upload biên bản"
          onUploaded={(url) => setHandoverUrl(url)}
        />

        <div className="flex justify-center gap-4 pt-2">
          <button
            onClick={onClose}
            className="border text-text1 border-text2 px-6 py-2 rounded-lg font-semibold"
          >
            Hủy
          </button>

          <button
            onClick={handleSubmit}
            className="bg-accent text-white px-6 py-2 rounded-lg font-semibold"
          >
            Hoàn tất
          </button>
        </div>
      </div>
    </div>
  );
}

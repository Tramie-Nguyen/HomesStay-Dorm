"use client";

import { useState } from "react";

interface UploadFileProps {
  label: string;
  onUploaded: (url: string) => void;
}

export default function UploadFile({ label, onUploaded }: UploadFileProps) {
  const [loading, setLoading] = useState(false);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);

    setLoading(true);

    const res = await fetch("/api/upload", {
      method: "POST",
      body: formData,
    });

    const data: { url?: string } = await res.json();
    setLoading(false);

    if (data.url) {
      onUploaded(data.url);
    }
  };

  return (
    <div className="space-y-1">
      <p className="font-medium">{label}</p>
      <input type="file" onChange={handleUpload} />
      {loading && <p className="text-sm text-gray-500">Đang upload...</p>}
    </div>
  );
}

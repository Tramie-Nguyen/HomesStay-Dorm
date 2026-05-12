"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";

export default function NotFound() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.92),rgba(248,251,255,0.96)_35%,rgba(239,246,255,1)_100%)] py-12 sm:px-6 lg:px-8 flex items-center justify-center">
      <div className="mx-auto max-w-xl text-center">
        <div className="mb-6 inline-flex h-16 w-16 items-center justify-center rounded-full bg-accent/10">
          <span className="text-4xl font-bold text-accent">⚙️</span>
        </div>

        <h1 className="mb-3 text-4xl font-bold tracking-tight text-text1 sm:text-4xl">
          Chức năng đang hoàn thiện
        </h1>

        <p className="mb-4 text-lg text-text2">
          Trang này chưa được phát triển. Chúng tôi đang làm việc để mang đến
          cho bạn trải nghiệm tốt nhất.
        </p>

        <div className="mb-8 rounded-2xl border border-accent/20 bg-accent/5 p-4">
          <p className="text-sm text-text2">
            Nếu bạn thấy lỗi này khi truy cập một trang thực, vui lòng liên hệ
            với chúng tôi để cập nhật tính năng sớm nhất.
          </p>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
          <button
            onClick={() => router.back()}
            className="inline-flex items-center justify-center rounded-full border border-accent/30 bg-white px-6 py-3 font-semibold text-accent transition hover:bg-accent/5"
          >
            ← Quay lại
          </button>

          <Link
            href="/"
            className="inline-flex items-center justify-center rounded-full bg-accent px-6 py-3 font-semibold text-white shadow-lg shadow-accent/20 transition hover:-translate-y-0.5 hover:shadow-xl hover:shadow-accent/25"
          >
            Về trang chủ
          </Link>
        </div>
      </div>
    </div>
  );
}

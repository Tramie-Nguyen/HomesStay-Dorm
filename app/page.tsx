"use client";

import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.92),rgba(248,251,255,0.96)_35%,rgba(239,246,255,1)_100%)] px-4 py-12 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">
        {/* Hero */}
        <div className="mb-16 text-center">
          <div className="mb-6 inline-flex h-16 w-16 items-center justify-center rounded-full bg-accent/10">
            <span className="text-3xl">🏠</span>
          </div>

          <h1 className="mb-4 text-4xl font-bold tracking-tight text-text1 sm:text-5xl lg:text-6xl">
            HomesStay Dorm
          </h1>

          <p
            className="mx-auto mb-8 max-w-2xl text-text2"
            style={{ fontSize: "1.125rem", lineHeight: "1.75rem" }}
          >
            Quản lý cho thuê phòng ký túc xá một cách hiệu quả. Từ hợp đồng
            thuê, bàn giao phòng, đến quản lý khách hàng — tất cả trong một nền
            tảng thống nhất.
          </p>

          <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
            <Link
              href="/sale/lich-cua-toi"
              className="inline-flex items-center justify-center rounded-full bg-accent px-7 py-3 font-semibold text-white shadow-lg shadow-accent/20 transition hover:-translate-y-0.5 hover:shadow-xl hover:shadow-accent/25"
            >
              Bắt đầu quản lý
            </Link>

            <a
              href="#features"
              className="inline-flex items-center justify-center rounded-full border border-accent/30 bg-white px-7 py-3 font-semibold text-accent transition hover:bg-accent/5"
            >
              Khám phá thêm
            </a>
          </div>
        </div>

        {/* Features */}
        <section id="features" className="mb-16 scroll-mt-20">
          <h2 className="mb-8 text-center text-3xl font-bold text-text1">
            Tính năng chính
          </h2>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {[
              {
                icon: "📋",
                title: "Quản lý hợp đồng",
                desc: "Lưu trữ và theo dõi toàn bộ hợp đồng thuê với trạng thái ký kết rõ ràng.",
              },
              {
                icon: "🔑",
                title: "Bàn giao phòng",
                desc: "Ghi nhận thông tin bàn giao với biên bản và hình ảnh tài liệu.",
              },
              {
                icon: "👥",
                title: "Quản lý khách",
                desc: "Cập nhật thông tin khách thuê, liên hệ, CCCD và thông tin cá nhân.",
              },
              {
                icon: "📅",
                title: "Lịch quản lý",
                desc: "Xem toàn bộ lịch cho thuê, kỳ hạn, và trạng thái bàn giao.",
              },
              {
                icon: "💰",
                title: "Giá dịch vụ",
                desc: "Quản lý giá tiền phòng, điện, nước, WiFi và các dịch vụ khác.",
              },
              {
                icon: "📱",
                title: "Responsive",
                desc: "Truy cập từ mọi thiết bị — máy tính, tablet hay điện thoại.",
              },
            ].map((feature, idx) => (
              <div
                key={idx}
                className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm transition hover:shadow-md"
              >
                <div className="mb-4 text-4xl">{feature.icon}</div>
                <h3 className="mb-2 text-xl font-semibold text-text2">
                  {feature.title}
                </h3>
                <p className="text-text2" style={{ fontSize: "0.95rem" }}>
                  {feature.desc}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* CTA */}
        <div className="rounded-3xl border border-accent/20 bg-accent/5 p-8 text-center sm:p-12">
          <h2 className="mb-4 text-2xl font-bold text-text1 sm:text-3xl">
            Sẵn sàng bắt đầu?
          </h2>
          <p className="mb-6 text-text2">
            Truy cập vào hệ thống quản lý ngay để kiểm soát toàn bộ dữ liệu cho
            thuê phòng của bạn.
          </p>
          <Link
            href="/sale/lich-cua-toi"
            className="inline-flex items-center justify-center rounded-full bg-accent px-8 py-3 font-semibold text-white shadow-lg shadow-accent/20 transition hover:-translate-y-0.5 hover:shadow-xl hover:shadow-accent/25"
          >
            Vào hệ thống
          </Link>
        </div>
      </div>
    </div>
  );
}

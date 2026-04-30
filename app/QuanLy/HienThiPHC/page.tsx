"use client";
import React from "react";
import NavBar from "../../../components/layout/nav";

const mockUser = {
  fullName: "Nguyễn Thị Như Quỳnh",
  email: "quynhha100205ntnq@gmail.com",
  idCard: "082300000000",
  phone: "0963745770",
  gender: "Nữ",
  dob: "10/02/2005",
};

const mockRoom = {
  name: "KÝ TÚC XÁ CHỢ QUÁN - PHÒNG 302",
  bed: "A01",
  price: "1tr2/tháng",
  images: ["/images/room1.jpg", "/images/room1.jpg", "/images/room1.jpg"],
};

export default function HienThiPHCPage() {
  const [isConfirmOpen, setIsConfirmOpen] = React.useState(false);
  const total = 300000;

  return (
    <>
      <NavBar />
      <main className="min-h-screen bg-background pt-24 pb-8 font-sans">
        <div className="mx-auto max-w-5xl px-6">
          <h1 className="mb-6 text-center text-2xl font-bold uppercase text-text1">
            Thông tin thanh toán
          </h1>

          <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
            <section className="space-y-4">
              <div className="rounded-md bg-base/50 p-4">
                <label className="block text-sm font-semibold text-text2">
                  Họ và tên
                </label>
                <div className="mt-2 rounded-md bg-primary/10 px-3 py-2 text-text2">
                  {mockUser.fullName}
                </div>

                <label className="mt-4 block text-sm font-semibold text-text2">
                  Email
                </label>
                <div className="mt-2 rounded-md bg-primary/10 px-3 py-2 text-text2">
                  {mockUser.email}
                </div>

                <label className="mt-4 block text-sm font-semibold text-text2">
                  CCCD
                </label>
                <div className="mt-2 rounded-md bg-primary/10 px-3 py-2 text-text2">
                  {mockUser.idCard}
                </div>

                <label className="mt-4 block text-sm font-semibold text-text2">
                  Số điện thoại
                </label>
                <div className="mt-2 rounded-md bg-primary/10 px-3 py-2 text-text2">
                  {mockUser.phone}
                </div>

                <div className="mt-4 grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-text2">
                      Giới tính
                    </label>
                    <div className="mt-2 rounded-md bg-primary/10 px-3 py-2 text-text2">
                      {mockUser.gender}
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-text2">
                      Ngày sinh
                    </label>
                    <div className="mt-2 rounded-md bg-primary/10 px-3 py-2 text-text2">
                      {mockUser.dob}
                    </div>
                  </div>
                </div>
              </div>

              <div className="w-44 rounded-lg bg-white p-3 shadow">
                <img
                  src="/images/qr-placeholder.png"
                  alt="qr"
                  className="h-auto w-full"
                />
              </div>
            </section>

            <section>
              <div className="rounded-md bg-base/50 p-4">
                <div className="grid grid-cols-3 gap-3">
                  {mockRoom.images.map((src, idx) => (
                    <div
                      key={idx}
                      className="h-20 w-full overflow-hidden rounded bg-gray-100"
                    >
                      <img
                        src={src}
                        alt={`room-${idx}`}
                        className="h-full w-full object-cover"
                      />
                    </div>
                  ))}
                </div>

                <div className="mt-4 rounded bg-base p-4">
                  <h4 className="font-bold text-text1">{mockRoom.name}</h4>
                  <p className="mt-2">
                    <span className="font-semibold">GIƯỜNG</span> {mockRoom.bed}
                  </p>
                  <p className="mt-2">
                    Giá: <span className="text-accent">{mockRoom.price}</span>
                  </p>

                  <div className="mt-4 flex items-center gap-4">
                    <label className="flex items-center gap-2 text-text2">
                      <input
                        type="checkbox"
                        checked={false}
                        readOnly
                        className="accent-primary"
                      />
                      Khách chưa thuê
                    </label>
                    <label className="flex items-center gap-2 text-primary">
                      <input
                        type="checkbox"
                        checked={true}
                        readOnly
                        className="accent-primary"
                      />
                      Khách thuê
                    </label>
                  </div>
                </div>

                <div className="mt-4 rounded-md bg-white/70 p-4">
                  <h3 className="text-lg font-bold leading-snug text-primary">
                    VUI LÒNG KIỂM TRA LẠI TOÀN BỘ THÔNG TIN TRƯỚC KHI THANH
                    TOÁN!!!
                  </h3>
                  <p className="mt-2 font-medium text-text2">
                    Số tiền thanh toán đã bao gồm toàn bộ chi phí và không phát
                    sinh thêm bất kỳ khoản thu nào!
                  </p>
                </div>

                <div className="mt-6 text-center">
                  <p className="text-2xl font-bold text-text1">
                    Thành tiền:{" "}
                    <span className="text-accent">
                      {total.toLocaleString()} VND
                    </span>
                  </p>
                  <button
                    onClick={() => setIsConfirmOpen(true)}
                    className="mt-6 inline-block rounded-full bg-accent px-6 py-2 font-semibold text-white transition hover:bg-primary"
                  >
                    Thanh toán
                  </button>
                </div>
              </div>
            </section>
          </div>
        </div>

        {isConfirmOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
            <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
              <h2 className="text-center text-xl font-bold text-text1">
                Xác nhận đã thanh toán thành công?
              </h2>

              <div className="mt-6 flex justify-center">
                <button
                  onClick={() => setIsConfirmOpen(false)}
                  className="rounded-full bg-accent px-8 py-2.5 text-[16px] font-bold text-white shadow-md transition-colors hover:bg-primary"
                >
                  Xác nhận
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </>
  );
}

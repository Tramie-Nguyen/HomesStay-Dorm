"use client";

import Input from "../../../components/common/input";
import { useState } from "react";
import { toast } from "react-toastify";
import { register } from "../../../services/auth";
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [gender, setGender] = useState("");
  const [dob, setDob] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!fullName || !email || !phone || !gender || !dob) {
      toast.error("Please fill all required fields");
      return;
    }

    if (password !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    if (password.length < 8) {
      toast.error("Password must be at least 8 characters");
      return;
    }

    if (!/\d/.test(password)) {
      toast.error("Password must contain at least one number");
      return;
    }

    const res = await register({
      email,
      password,
    });

    if (res.success) {
      toast.success("Registration successful");
      router.push("/auth/signin");
    } else {
      toast.error(res.message);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="w-full max-w-2xl px-6">
        <div className="bg-pastel rounded-3xl shadow-lg p-8">
          <form onSubmit={handleSubmit} className="space-y-4">
            <h1 className="text-2xl font-bold text-center text-text1">
              ĐĂNG KÝ
            </h1>

            <Input
              id="fullName"
              note="*Họ tên"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Nhập họ tên"
            />

            <Input
              id="email"
              note="*Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Nhập email"
            />

            <Input
              id="phone"
              note="*Số điện thoại"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="Nhập số điện thoại"
            />

            {/* 2 cột */}
            <div className="grid grid-cols-2 gap-4">
              <select
                value={gender}
                onChange={(e) => setGender(e.target.value)}
                className="w-full rounded-full px-4 py-2 bg-background text-text1 outline-none"
              >
                <option value="">Giới tính</option>
                <option value="male">Nam</option>
                <option value="female">Nữ</option>
              </select>

              <input
                type="date"
                value={dob}
                onChange={(e) => setDob(e.target.value)}
                className="w-full rounded-full px-4 py-2 bg-background outline-none"
              />
            </div>

            {/* password */}
            <div className="grid grid-cols-2 gap-4">
              <Input
                id="password"
                note="*Mật khẩu"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Nhập mật khẩu"
              />

              <Input
                id="confirmPassword"
                note="*Xác nhận mật khẩu"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Nhập lại mật khẩu"
              />
            </div>

            <p className="text-xs text-gray-700">
              Mật khẩu phải có tối thiểu 8 ký tự
            </p>

            <button
              type="submit"
              className="w-full cursor-pointer bg-text2 text-base font-semibold py-2 rounded-full hover:opacity-90"
            >
              Đăng ký
            </button>

            <p className="text-center font-semibold text-sm">
              Đã có tài khoản?{" "}
              <a href="/auth/signin" className="text-accent">
                Đăng nhập ngay
              </a>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}

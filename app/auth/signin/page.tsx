"use client";
import Input from "../../../components/common/input";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import { setAuthData } from "../../../utils/auth";

export default function Home() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async () => {
    if (!email || !password) {
      alert("Vui lòng nhập email và mật khẩu");
      return;
    }

    const API_URL = process.env.NEXT_PUBLIC_API_URL;

    const res = await fetch(`${API_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    const data = await res.json();

    if (!res.ok) {
      toast.error(data.message);
      return;
    }

    setAuthData({
      name: data.role === "CUSTOMER" ? data.user.HO_TEN : data.user.MA_NV,
      role: data.role,
      token: null,
      user: data.user,
    });

    switch (data.role) {
      case "CUSTOMER":
        router.push("/");
        break;
      case "SALE":
        router.push("/sale/danh-sach-phong");
        break;
      case "BRANCH_MANAGER":
        router.push("/bm/danh-sach-phong");
        break;
    }
  };

  return (
    <div className="bg-background flex justify-center items-center w-full min-h-screen relative">
      <div className="w-3/7">
        <div className="bg-pastel flex flex-col justify-center items-center rounded-4xl relative">
          <div className="w-5/7 m-10 flex flex-col space-y-4">
            <span className="text-text1 font-bold text-2xl text-center">
              ĐĂNG NHẬP
            </span>
            <Input
              note="Email*"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter email"
            />
            <Input
              note="Password*"
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter password"
            />
            <div className="flex items-center justify-between text-sm">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  // checked={rememberMe}
                  // onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 rounded"
                />
                <span className="text-text1 font-medium">REMEMBER ME</span>
              </label>
              <a
                href="/forgot-password"
                className="text-text2 font-medium transition-colors"
              >
                FORGOT PASSWORD?
              </a>
            </div>
          </div>
          <div className="space-y-5 mb-10">
            <button
              onClick={handleLogin}
              className="bg-text2 text-center text-base font-bold w-60 rounded-full py-2 cursor-pointer"
            >
              Đăng nhập
            </button>
            <div className="text-text1/80 font-semibold">
              <span> Dont have account? </span>
              <a href="/auth/signup" className="text-accent">
                Đăng ký ngay
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

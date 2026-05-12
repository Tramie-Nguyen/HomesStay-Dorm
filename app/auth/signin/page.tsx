"use client";

import Input from "../../../components/common/input";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "react-toastify";
import { setAuthData } from "../../../utils/auth";

export default function Home() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      toast.error("Vui lòng nhập email và mật khẩu");
      return;
    }

    try {
      setLoading(true);

      const res = await fetch("/api/auth/signin", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          password,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.message || "Đăng nhập thất bại");
        return;
      }

      setAuthData({
        name: data.role === "CUSTOMER" ? data.user.TEN_KH : data.user.TEN_NV,
        role: data.role,
        token: null,
        user: data.user,
      });

      toast.success("Đăng nhập thành công");

      switch (data.role) {
        case "CUSTOMER":
          router.push("/");
          break;

        case "SALE":
          router.push("/sale/danh-sach-phong");
          break;

        case "BRANCH_MANAGER":
          router.push("/bm/tra-phong");
          break;

        default:
          router.push("/");
          break;
      }
    } catch (error) {
      console.error(error);
      toast.error("Có lỗi xảy ra khi đăng nhập");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-background flex justify-center items-center w-full min-h-screen relative">
      <div className="w-3/7">
        <div className="bg-pastel flex flex-col justify-center items-center rounded-4xl relative">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleLogin();
            }}
            className="w-full flex flex-col items-center"
          >
            <div className="w-5/7 m-10 flex flex-col space-y-4">
              <span className="text-text1 font-bold text-2xl text-center">
                ĐĂNG NHẬP
              </span>

              <Input
                note="Email*"
                id="email"
                type="email"
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
                  <input type="checkbox" className="w-4 h-4 rounded" />

                  <span className="text-text1 font-medium">REMEMBER ME</span>
                </label>

                <Link
                  href="/forgot-password"
                  className="text-text2 font-medium transition-colors hover:underline"
                >
                  FORGOT PASSWORD?
                </Link>
              </div>
            </div>

            <div className="space-y-5 mb-10 flex flex-col items-center">
              <button
                type="submit"
                disabled={loading}
                className="bg-text2 text-center text-base font-bold w-60 rounded-full py-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? "Đang đăng nhập..." : "Đăng nhập"}
              </button>

              <div className="text-text1/80 font-semibold">
                <span>Dont have account? </span>

                <Link
                  href="/auth/signup"
                  className="text-accent hover:underline"
                >
                  Đăng ký ngay
                </Link>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

"use client";
import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "../../hooks/useAuth";
import { signOut } from "../../services/auth";
import { toast } from "react-toastify";
import { useRouter } from "next/navigation";
import { HomeIcon, Menu, X } from "lucide-react";

export default function NavBar() {
  const { user, isAuthenticated, updateUser } = useAuth();
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await signOut();
      updateUser();
      toast.success("Logout successfully!");
      router.push("/auth/login");
    } catch (error) {
      toast.error("Error when logout!");
    }
  };

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  const guestItems = [
    { href: "/", label: "Trang chủ" },
    { href: "/xem-phong", label: "Xem phòng" },
  ];

  const customerItems = [
    { href: "/", label: "Trang chủ" },
    { href: "/cus/xem-phong", label: "Xem phòng" },
    { href: "/cus/phong-cua-toi", label: "Phòng của tôi" },
  ];

  const saleItems = [
    { href: "/", label: "Trang chủ" },
    { href: "/sale/danh-sach-phong", label: "Danh sách phòng" },
    { href: "/sale/lich-hen", label: "Lịch hẹn" },
    { href: "/sale/lich-cua-toi", label: "Lịch của tôi" },
    { href: "/sale/khach-cua-toi", label: "Khách của tôi" },
  ];

  const bmItems = [
    { href: "/bm/danh-sach-phong", label: "Danh sách phòng" },
    { href: "/bm/khach-cua-toi", label: "Khách của tôi" },
    { href: "/bm/tra-phong", label: "Trả phòng" },
    { href: "/bm/hoan-coc", label: "Hoàn cọc" },
    { href: "/bm/chinh-sach", label: "Chính sách" },
  ];

  let navItems = guestItems;

  if (isAuthenticated && user?.role === "CUSTOMER") {
    navItems = customerItems;
  } else if (isAuthenticated && user?.role === "SALE") {
    navItems = saleItems;
  } else if (
    isAuthenticated &&
    (user?.role === "ADMIN" || user?.role === "BRANCH_MANAGER")
  ) {
    navItems = bmItems;
  }

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 bg-primary`}
    >
      <div className="max-w-[1360px] mx-auto px-6">
        <div className="flex items-center justify-between h-15">
          <Link href="/" className="flex items-center space-x-3 group">
            <div className="relative w-12 h-12  flex items-center justify-center transform group-hover:scale-110 transition-transform duration-300">
              <HomeIcon className="w-6 h-6 text-text1" />
              <div className="absolute text-text1 rounded-full opacity-50 animate-pulse">
                Homestay Dorm
              </div>
            </div>
          </Link>
          <nav className="hidden md:flex items-center space-x-4">
            {navItems
              .filter((item) => typeof item.href === "string" && item.href)
              .map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`relative px-4 py-2 text-lg font-medium rounded-lg transition-all duration-300 group hover:bg-primary cursor-pointer ${
                    pathname === item.href
                      ? "text-text1"
                      : "text-text2 hover:text-text1"
                  }`}
                >
                  <span className="relative z-10">{item.label}</span>
                </Link>
              ))}
          </nav>

          <div className="hidden md:flex items-center space-x-6 relative">
            {isAuthenticated && user ? (
              <>
                <div className="hidden md:flex items-center space-x-6">
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={handleLogout}
                      className="cursor-pointer px-4 py-2 text-accent bg-base rounded-lg font-medium hover:bg-accent hover:text-base transition-colors"
                    >
                      Đăng xuất
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <>
                <Link
                  href="/auth/signup"
                  className="px-6 py-2 text-base bg-accent  rounded-lg font-medium transition-all duration-300 hover:bg-base hover:text-accent hover:shadow-lg transform hover:-translate-y-0.5"
                >
                  Đăng ký
                </Link>
                <Link
                  href="/auth/signin"
                  className="px-6 py-2 text-accent bg-base rounded-lg font-medium transition-all duration-300 transform hover:-translate-y-0.5"
                >
                  Đăng nhập
                </Link>
              </>
            )}
          </div>
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden p-2 text-gray-600 hover:text-white hover:bg-primary rounded-lg transition-all duration-300"
          >
            {isMobileMenuOpen ? <X size={28} /> : <Menu size={28} />}
          </button>
        </div>

        {isMobileMenuOpen && (
          <div className="md:hidden py-4 border-t">
            <nav className="flex flex-col space-y-2">
              {navItems
                .filter((item) => typeof item.href === "string" && item.href)
                .map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`px-4 py-3 text-lg font-medium rounded-lg transition-all duration-300 ${
                      pathname === item.href
                        ? "text-text1 bg-primary"
                        : "text-text2 hover:text-text1"
                    }`}
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    {item.label}
                  </Link>
                ))}

              {isAuthenticated && user ? (
                <div className="flex flex-col gap-4 space-x-6">
                  <div className="flex flex-col gap-2">
                    <button
                      onClick={handleLogout}
                      className="block w-full cursor-pointer px-4 py-3 text-accent bg-base rounded-lg font-medium hover:bg-accent hover:text-base transition-colors"
                    >
                      Đăng xuất
                    </button>
                  </div>
                </div>
              ) : (
                <div className="pt-4 space-y-2">
                  <Link
                    href="/auth/signup"
                    className="block w-full px-4 py-3 text-center text-base bg-accent rounded-lg font-medium transition-all duration-300 hover:bg-base hover:text-accent"
                  >
                    Đăng ký
                  </Link>
                  <Link
                    href="/auth/signin"
                    className="block w-full px-4 py-3 text-center text-accent bg-base rounded-lg font-medium transition-all duration-300 hover:bg-accent hover:text-base"
                  >
                    Đăng nhập
                  </Link>
                </div>
              )}
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}

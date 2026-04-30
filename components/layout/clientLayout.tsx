"use client";

import { usePathname } from "next/navigation";
import Nav from "./nav";

export default function ClientLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const pathname = usePathname();
  const hideNav = ["/auth/signin", "/auth/signup"].includes(pathname);

  return (
    <>
      {!hideNav && <Nav />}
      <main
        className={`${!hideNav ? "pt-15" : ""}
        }`.trim()}
      >
        {children}
      </main>
    </>
  );
}

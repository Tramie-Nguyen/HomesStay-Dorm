import NavBar from "@/components/layout/nav";
import { Toaster } from "react-hot-toast";

export default function SaleLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <NavBar />
      <Toaster position="top-right" reverseOrder={false} />

      <main className="m-0 p-0">{children}</main>
    </>
  );
}

import NavBar from "@/components/layout/nav";

export default function SaleLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <NavBar />
      <main className="pt-13">{children}</main>
    </>
  );
}

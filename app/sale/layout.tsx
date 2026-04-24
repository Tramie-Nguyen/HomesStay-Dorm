import NavBar from "@/components/layout/nav";

export default function SaleLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <NavBar />
      <main className="pt-16">{children}</main>
    </>
  );
}

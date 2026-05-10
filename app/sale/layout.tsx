import NavBar from "@/components/layout/nav";

export default function SaleLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <NavBar />
      <main className="m-0 p-0">{children}</main>
    </>
  );
}

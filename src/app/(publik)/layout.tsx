import Header from "@/components/Header";
import Footer from "@/components/Footer";

export default function PublikLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Header />
      <main className="mx-auto max-w-4xl px-4 py-8">{children}</main>
      <Footer />
    </>
  );
}

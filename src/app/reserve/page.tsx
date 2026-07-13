import type { Metadata } from "next";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ReserveForm from "@/components/ReserveForm";

export const metadata: Metadata = { title: "Reserve" };

export default async function ReservePage({
  searchParams,
}: {
  searchParams: Promise<{ date?: string; kind?: string }>;
}) {
  const params = await searchParams;
  const kind = params.kind?.toUpperCase() === "GUESTLIST" ? "GUESTLIST" : "TABLE";

  return (
    <>
      <Header />
      <main className="mx-auto max-w-[1400px] px-6 pb-28 pt-36 md:px-10 md:pt-44">
        <div className="mb-16 max-w-2xl">
          <p className="mb-4 text-[9px] font-semibold uppercase tracking-door text-signal">
            Members &amp; guests
          </p>
          <h1 className="mb-6 text-[38px] font-extrabold uppercase leading-[0.9] tracking-tightest text-bone md:text-[64px]">
            Put your
            <br />
            name down
          </h1>
          <p className="max-w-md text-[13px] leading-relaxed text-bone/55">
            Two ways in. Take a table and it&apos;s yours the moment the deposit clears. Ask for the
            guest list and we&apos;ll come back to you by message.
          </p>
        </div>

        <ReserveForm initialKind={kind} initialDate={params.date ?? ""} />
      </main>
      <Footer />
    </>
  );
}

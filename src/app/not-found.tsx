import Link from "next/link";
import Wordmark from "@/components/Wordmark";

export default function NotFound() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center px-6 text-center">
      <Wordmark className="mb-10 w-48" fontSize={80} />
      <h1 className="mb-5 text-[30px] font-extrabold uppercase leading-none tracking-tightest text-bone md:text-[48px]">
        Wrong door.
      </h1>
      <p className="mb-9 text-[12px] uppercase tracking-[0.16em] text-ash">
        Nothing behind this one.
      </p>
      <Link
        href="/"
        className="border border-signal px-8 py-4 text-[11px] font-extrabold uppercase tracking-door text-signal transition-colors hover:bg-signal hover:text-ink"
      >
        Back to the room
      </Link>
    </main>
  );
}

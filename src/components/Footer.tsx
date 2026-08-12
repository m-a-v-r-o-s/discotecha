import Link from "next/link";

export default function Footer() {
  return (
    <footer className="border-t border-bone/10 bg-ink px-6 pb-10 pt-20 md:px-10">
      <div className="mx-auto max-w-[1400px]">
        <div className="grid gap-12 md:grid-cols-4">
          <div className="md:col-span-2">
            <p className="max-w-xs text-[12px] uppercase leading-relaxed tracking-[0.12em] text-ash">
              Chora, Ios 840 01
              <br />
              Cyclades, Greece
              <br />
              Find us on the map. The door does the rest.
            </p>
          </div>

          <div>
            <h3 className="mb-5 text-[9px] font-semibold uppercase tracking-door text-signal">
              The door
            </h3>
            <ul className="space-y-2.5 text-[12px] uppercase tracking-[0.1em] text-bone/70">
              <li>Fri · Sat · Sun</li>
              <li>23:30 till late</li>
              <li>21 and over</li>
              <li>
                <a href="tel:+302286000000" className="transition-colors hover:text-signal">
                  +30 22860 00000
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="mb-5 text-[9px] font-semibold uppercase tracking-door text-signal">
              Elsewhere
            </h3>
            <ul className="space-y-2.5 text-[12px] uppercase tracking-[0.1em] text-bone/70">
              <li>
                <Link href="/reserve" className="transition-colors hover:text-signal">
                  Reserve a table
                </Link>
              </li>
              <li>
                <Link href="/reserve?kind=guestlist" className="transition-colors hover:text-signal">
                  Guest list
                </Link>
              </li>
              <li>
                <Link href="/cookies" className="transition-colors hover:text-signal">
                  Cookie policy
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="transition-colors hover:text-signal">
                  Privacy policy
                </Link>
              </li>
              <li>
                <Link href="/terms" className="transition-colors hover:text-signal">
                  Terms of service
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-20 flex flex-col gap-4 border-t border-bone/10 pt-7 text-[9px] uppercase tracking-door text-ash md:flex-row md:items-center md:justify-between">
          <span>
            © {new Date().getFullYear()} Nocturne · Ios ·{" "}
            <a
              href="https://akosds.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="transition-colors hover:text-signal"
            >
              Akos Digital Services
            </a>
          </span>
          <span>Don Julio Tequila</span>
          <span>Right of admission reserved</span>
        </div>
      </div>
    </footer>
  );
}

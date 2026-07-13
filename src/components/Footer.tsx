import Image from "next/image";
import Link from "next/link";
import DiscoBall from "./DiscoBall";

export default function Footer() {
  return (
    <footer className="border-t border-bone/10 bg-ink px-6 pb-10 pt-20 md:px-10">
      <div className="mx-auto max-w-[1400px]">
        <div className="grid gap-12 md:grid-cols-4">
          <div className="flex items-start justify-between gap-8 md:col-span-2">
            <div>
              <Image
                src="/images/wordmark-cut.png"
                alt="Discotecha"
                width={471}
                height={127}
                className="mb-6 h-auto w-52"
              />
              <p className="max-w-xs text-[12px] uppercase leading-relaxed tracking-[0.12em] text-ash">
                Paros, Cyclades.
                <br />
                Find us on the map. The door does the rest.
              </p>
            </div>
            <DiscoBall className="hidden h-24 w-24 shrink-0 sm:block" />
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
                <a href="tel:+306942601351" className="transition-colors hover:text-signal">
                  +30 694 260 1351
                </a>
              </li>
              <li>
                <a
                  href="https://wa.me/306942601351"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="transition-colors hover:text-signal"
                >
                  WhatsApp
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
                <a
                  href="https://www.instagram.com/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="transition-colors hover:text-signal"
                >
                  Instagram
                </a>
              </li>
              <li>
                <a
                  href="https://maps.app.goo.gl/8KuRNnhgU78fyAhr8"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="transition-colors hover:text-signal"
                >
                  Map
                </a>
              </li>
              <li>
                <Link href="/cookies" className="transition-colors hover:text-signal">
                  Cookie policy
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-20 flex flex-col gap-4 border-t border-bone/10 pt-7 text-[9px] uppercase tracking-door text-ash md:flex-row md:items-center md:justify-between">
          <span>© {new Date().getFullYear()} Discotecha · Paros · Akos Digital Services</span>
          <span>Planet Mushroom · Patrón Tequila</span>
          <span>Right of admission reserved</span>
        </div>
      </div>
    </footer>
  );
}

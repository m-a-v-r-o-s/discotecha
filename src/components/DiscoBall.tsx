import Image from "next/image";

/**
 * The mirrorball from the poster art, static. The source image sits on a
 * grey/black square, so we clip it to a circle and scale slightly to push the
 * edges out, leaving just the glowing globe.
 */
export default function DiscoBall({ className = "" }: { className?: string }) {
  return (
    <div
      className={`overflow-hidden rounded-full bg-ink shadow-[0_0_40px_rgba(255,42,0,0.25)] ring-1 ring-bone/15 ${className}`}
    >
      <Image
        src="/images/igglobe.png"
        alt=""
        width={128}
        height={128}
        aria-hidden
        className="h-full w-full scale-[1.18] object-cover"
      />
    </div>
  );
}

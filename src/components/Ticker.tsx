const PHRASES = [
  "LESS TALKING MORE DANCING",
  "MUSIC LOUDER THAN YOUR THOUGHTS",
  "NO PHONES ON THE FLOOR",
  "21+",
  "PAROS IS ALWAYS THE ANSWER",
];

export default function Ticker() {
  const strip = [...PHRASES, ...PHRASES, ...PHRASES, ...PHRASES];
  return (
    <div className="overflow-hidden border-y border-signal/30 bg-signal py-3 text-ink">
      <div className="ticker">
        {strip.map((p, i) => (
          <span
            key={i}
            className="flex shrink-0 items-center whitespace-nowrap px-6 text-[11px] font-extrabold uppercase tracking-[0.2em]"
          >
            {p}
            <span className="ml-6 inline-block h-[5px] w-[5px] rounded-full bg-ink/70" aria-hidden />
          </span>
        ))}
      </div>
    </div>
  );
}

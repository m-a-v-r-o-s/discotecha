type Props = {
  className?: string;
};

/**
 * The moon mark: disc of r=37 at the origin with a second disc of the same
 * radius, offset by (15, -13), bitten out of it. Traced as the crescent's own
 * outline (the long way round the outer circle, then back along the bite)
 * rather than as a <mask>, so the glyph carries no SVG id and stays safe to
 * repeat anywhere on a page.
 *
 * Do NOT express this as two circles with fill-rule="evenodd": equal circles
 * XOR into *both* crescents, which reads as a ring, not a moon.
 *
 * The intersection points below are computed, not eyeballed; at fontSize 100
 * the Bungee cap band is 72 units and this crescent is ~20 at its thickest,
 * matching the stem weight of the letters beside it.
 */
export const MOON_PATH =
  "M -15.8444,-33.4358 A 37,37 0 1 0 30.8444,20.4358 A 37,37 0 0 1 -15.8444,-33.4358 Z";

/** The moon sits where the O would be, on the 100pt baseline at y=88. */
export const MOON_ORIGIN = { x: 120.3, y: 52 };

/**
 * The horizontal lockup for chrome (header, small placements): NOCTURNE set in
 * Bungee in signal red, with the O swapped for a bone-white moon, so the mark
 * is the one light in the word. The arced <Wordmark /> stays the display/poster
 * identity.
 */
export default function Logo({ className = "" }: Props) {
  return (
    <svg
      viewBox="0 0 584 104"
      className={className}
      role="img"
      aria-label="Nocturne"
      xmlns="http://www.w3.org/2000/svg"
    >
      <text
        x="0"
        y="88"
        fill="rgb(var(--signal))"
        fontFamily="'Bungee', sans-serif"
        fontSize="100"
      >
        N
      </text>
      <path
        d={MOON_PATH}
        fill="rgb(var(--bone))"
        transform={`translate(${MOON_ORIGIN.x}, ${MOON_ORIGIN.y})`}
      />
      <text
        x="165.3"
        y="88"
        fill="rgb(var(--signal))"
        fontFamily="'Bungee', sans-serif"
        fontSize="100"
      >
        CTURNE
      </text>
    </svg>
  );
}

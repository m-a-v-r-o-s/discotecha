type Props = {
  className?: string;
  fontSize?: number;
  color?: string;
};

/**
 * The wordmark is never set as flat text; it always rides an arc,
 * the way it does on the posters.
 */
export default function Wordmark({ className = "", fontSize = 80, color = "#FF2A00" }: Props) {
  return (
    <svg
      viewBox="0 0 900 210"
      className={className}
      role="img"
      aria-label="Nocturne"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <path id="arc" d="M 40 175 Q 450 55 860 175" fill="none" />
      </defs>
      <text
        fill={color}
        fontFamily="'Bungee', sans-serif"
        fontSize={fontSize}
        letterSpacing="4"
      >
        <textPath href="#arc" startOffset="50%" textAnchor="middle">
          NOCTURNE
        </textPath>
      </text>
    </svg>
  );
}

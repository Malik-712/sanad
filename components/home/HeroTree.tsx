// The small tree drawing from the Home hero, drawn as in the design (static; no animation).
// Decorative: the caption under it carries the real counts.
export function HeroTree() {
  return (
    <svg
      width="334"
      height="190"
      viewBox="0 0 320 190"
      aria-hidden="true"
      className="block h-auto w-full max-w-[334px] lg:max-w-none"
    >
      <path
        d="M160 20V96M160 114V126M32 126H288M32 126V147M96 126V147M160 126V147M224 126V147M288 126V147M32 157V171M96 157V171M160 157V171M224 157V171M288 157V171"
        fill="none"
        stroke="var(--color-parchment)"
        strokeWidth="3"
        strokeLinecap="square"
      />
      <rect x="154" y="8" width="12" height="12" fill="var(--color-gold)" transform="rotate(45 160 14)" />
      <rect x="154" y="32" width="12" height="12" fill="var(--color-parchment)" />
      {[53, 73].map((y) => (
        <rect key={y} x="155" y={y} width="10" height="10" fill="var(--color-green)" stroke="var(--color-parchment)" strokeWidth="2" />
      ))}
      <rect x="149" y="94" width="22" height="22" fill="none" stroke="var(--color-gold)" strokeWidth="2" transform="rotate(45 160 105)" />
      <rect x="155" y="100" width="10" height="10" fill="var(--color-green)" stroke="var(--color-parchment)" strokeWidth="2" />
      <rect x="156" y="122" width="8" height="8" fill="var(--color-gold)" transform="rotate(45 160 126)" />
      {[27, 91, 155, 219, 283].map((x) => (
        <rect key={`n${x}`} x={x} y="147" width="10" height="10" fill="var(--color-green)" stroke="var(--color-parchment)" strokeWidth="2" />
      ))}
      {[23, 87, 151, 215, 279].map((x) => (
        <rect key={`c${x}`} x={x} y="171" width="18" height="12" fill="var(--color-parchment)" />
      ))}
    </svg>
  );
}

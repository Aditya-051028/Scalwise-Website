export function Divider({ flip = false }: { flip?: boolean }) {
  return (
    <div className="relative h-12 w-full overflow-hidden md:h-16" aria-hidden>
      <svg
        viewBox="0 0 1040 64"
        preserveAspectRatio="none"
        className="absolute inset-0 h-full w-full"
      >
        <line
          x1="0"
          y1={flip ? 8 : 60}
          x2="1040"
          y2={flip ? 58 : 4}
          stroke="#D4FF3D"
          strokeWidth="1.5"
          opacity="0.35"
        />
      </svg>
    </div>
  );
}

export type WorldMapMarker = {
  id: string;
  label: string;
  x: number;
  y: number;
  tone?: "default" | "correct" | "wrong" | "quiet";
};

export function WorldMapSurface({
  markers,
  footer,
  onSelect,
  disabled = false,
  className = "min-h-[320px]",
}: {
  markers: readonly WorldMapMarker[];
  footer: string;
  onSelect: (id: string) => void;
  disabled?: boolean;
  className?: string;
}) {
  const continentLabels = [
    { label: "North America", left: "19%", top: "26%" },
    { label: "South America", left: "32%", top: "61%" },
    { label: "Europe", left: "52%", top: "22%" },
    { label: "Africa", left: "54%", top: "49%" },
    { label: "Asia", left: "72%", top: "27%" },
    { label: "Australia", left: "85%", top: "66%" },
    { label: "Antarctica", left: "50%", top: "88%" },
  ];

  return (
    <div aria-label="World map" className={`relative overflow-hidden rounded-lg border-2 border-[#092421] bg-[#b9dfdf] ${className}`}>
      <svg aria-hidden="true" viewBox="0 0 100 56" className="absolute inset-0 h-full w-full" preserveAspectRatio="none">
        <rect width="100" height="56" fill="#b9dfdf" />
        {[18.67, 28, 37.33].map((y) => (
          <line key={`latitude-${y}`} x1="0" y1={y} x2="100" y2={y} stroke="#4e8a83" strokeWidth="0.18" opacity="0.42" />
        ))}
        {[25, 50, 75].map((x) => (
          <line key={`longitude-${x}`} x1={x} y1="0" x2={x} y2="56" stroke="#4e8a83" strokeWidth="0.18" opacity="0.34" />
        ))}
        <image href="/world-map-land.svg" x="0" y="0" width="100" height="56" preserveAspectRatio="none" />
        <line x1="0" y1="28" x2="100" y2="28" stroke="#23645b" strokeDasharray="1.25 1.25" strokeWidth="0.5" opacity="0.9" />
      </svg>

      <div aria-hidden="true" className="pointer-events-none absolute inset-0">
        {continentLabels.map((continent) => (
          <span
            key={continent.label}
            className="absolute -translate-x-1/2 -translate-y-1/2 rounded bg-[#fff9ec]/80 px-1.5 py-0.5 text-center text-[7px] font-black uppercase leading-none tracking-[0.08em] text-[#23453f] shadow-[0_1px_0_rgba(9,36,33,.22)] min-[700px]:text-[9px]"
            style={{ left: continent.left, top: continent.top }}
          >
            {continent.label}
          </span>
        ))}
      </div>

      <div className="absolute left-2 top-2 rounded-lg border-2 border-[#092421] bg-white/95 px-2 py-1 text-[9px] font-black uppercase tracking-[0.12em] text-[#102f36] shadow-[2px_2px_0_#092421]">
        World map
      </div>
      <div className="absolute left-2 top-[50%] -translate-y-1/2 rounded-md bg-white/85 px-1.5 py-0.5 text-[8px] font-black uppercase tracking-[0.08em] text-[#23645b]">
        Equator
      </div>

      {markers.map((marker, index) => {
        const letter = String.fromCharCode(65 + index);
        return (
          <button
            key={marker.id}
            type="button"
            aria-label={`Choose map pin ${letter}: ${marker.label}`}
            onClick={() => onSelect(marker.id)}
            disabled={disabled}
            className={`absolute z-10 grid h-10 w-10 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full border-2 text-sm font-black text-[#102f36] shadow-[2px_2px_0_#092421] transition enabled:hover:bg-[#fff1bf] enabled:active:translate-y-[-45%] ${
              marker.tone === "correct"
                ? "border-[#092421] bg-[#70d392]"
                : marker.tone === "wrong"
                  ? "border-[#092421] bg-[#f59a7d]"
                  : marker.tone === "quiet"
                    ? "border-[#375b52] bg-white/65"
                    : "border-[#092421] bg-[#f0c84b]"
            }`}
            style={{ left: `${marker.x}%`, top: `${marker.y}%` }}
          >
            {letter}
          </button>
        );
      })}

      <div className="absolute bottom-2 left-2 right-2 rounded-lg bg-black/75 px-2 py-1.5 text-[10px] font-semibold text-white">
        {footer}
      </div>
    </div>
  );
}

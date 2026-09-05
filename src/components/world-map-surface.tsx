"use client";

import { useState } from "react";
import type { WorldLocation } from "@/lib/card-metadata";
import { isUsMapLocation, usMapPoint } from "@/lib/us-map";
import usStates from "@/lib/us-map-data.json";

export type WorldMapMarker = {
  id: string;
  label: string;
  x: number;
  y: number;
  location?: WorldLocation;
  tone?: "default" | "correct" | "wrong" | "quiet";
};

export function WorldMapSurface({
  markers,
  footer,
  onSelect,
  disabled = false,
  className = "min-h-[320px]",
  region = "world",
}: {
  markers: readonly WorldMapMarker[];
  footer: string;
  onSelect: (id: string) => void;
  disabled?: boolean;
  className?: string;
  region?: "world" | "us";
}) {
  const mapKey = markers.map((marker) => marker.id).join("|");
  const [view, setView] = useState<{ key: string; region: "world" | "us" } | null>(null);
  const usMarkers = markers.filter((marker) => isUsMapLocation(marker.location));
  const activeRegion = usMarkers.length ? (view?.key === mapKey ? view.region : region) : "world";
  const switcher = usMarkers.length > 0 && (
    <div className="absolute right-2 top-2 z-20 flex rounded-lg border-2 border-[#092421] bg-white p-0.5 text-[10px] font-black shadow-[2px_2px_0_#092421]">
      {(["world", "us"] as const).map((option) => (
        <button key={option} type="button" aria-label={option === "us" ? "Show US view" : "Show world view"} aria-pressed={activeRegion === option}
          onClick={() => setView({ key: mapKey, region: option })}
          className={`min-h-8 rounded-md px-2 text-[#102f36] ${activeRegion === option ? "bg-[#f0c84b]" : "hover:bg-[#fff1bf]"}`}>
          {option === "us" ? "United States" : "World"}
        </button>
      ))}
    </div>
  );

  if (activeRegion === "us") return (
    <UsMapSurface key={mapKey} markers={markers} footer={footer} onSelect={onSelect} disabled={disabled} className={className} switcher={switcher} />
  );
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
      {switcher}
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

function UsMapSurface({ markers, footer, onSelect, disabled, className, switcher }: {
  markers: readonly WorldMapMarker[];
  footer: string;
  onSelect: (id: string) => void;
  disabled: boolean;
  className: string;
  switcher: React.ReactNode;
}) {
  const [selectedState, setSelectedState] = useState("");
  const highlightedStates = new Set(markers.flatMap((marker) => marker.location?.states ?? []));
  const visibleMarkers = markers.map((marker, index) => ({ marker, index }))
    .filter(({ marker }) => isUsMapLocation(marker.location));
  return (
    <div aria-label="United States map" className={`relative flex flex-col overflow-hidden rounded-lg border-2 border-[#092421] bg-[#b9dfdf] ${className}`}>
      {switcher}
      <div className="px-3 pb-2 pt-3 pr-44 text-[10px] font-black uppercase tracking-wide text-[#102f36]">US states</div>
      <div className="mt-5 flex items-center gap-2 px-2 pb-1">
        <select aria-label="Find a US state" value={selectedState} onChange={(event) => setSelectedState(event.target.value)}
          className="min-h-9 min-w-0 max-w-full rounded-md border border-[#375b52] bg-white px-2 text-xs font-bold text-[#102f36]">
          <option value="">Explore a state…</option>
          {usStates.map((state) => <option key={state.id} value={state.name}>{state.name} ({state.abbreviation})</option>)}
        </select>
        <p aria-live="polite" className="text-xs font-black text-[#102f36]">{selectedState || "Tap a state to learn its name."}</p>
      </div>
      <div className="relative min-h-[220px] flex-1" data-us-map-plot>
        <svg viewBox="0 0 100 65" preserveAspectRatio="none" className="absolute inset-0 h-full w-full" aria-label="US state boundaries">
          {usStates.map((state) => (
            <path key={state.id} d={state.path} fill={selectedState === state.name ? "#f0c84b" : highlightedStates.has(state.name) ? "#f4df99" : "#d9c77e"}
              stroke="#375b52" strokeWidth="0.7" vectorEffect="non-scaling-stroke" fillRule="evenodd"
              role="button" tabIndex={0} aria-label={`Explore ${state.name}`} aria-pressed={selectedState === state.name}
              className="cursor-pointer hover:fill-[#fff1bf] focus:fill-[#f0c84b] focus:outline-none"
              onClick={() => setSelectedState(state.name)}
              onKeyDown={(event) => { if (event.key === "Enter" || event.key === " ") { event.preventDefault(); setSelectedState(state.name); } }}>
              <title>{state.name}</title>
            </path>
          ))}
          {usStates.filter((state) => state.label[0] !== state.anchor[0]).map((state) => (
            <line key={state.id} x1={state.anchor[0]} y1={state.anchor[1]} x2={state.label[0] - 1.5} y2={state.label[1]} stroke="#375b52" strokeWidth="0.5" vectorEffect="non-scaling-stroke" pointerEvents="none" />
          ))}
          <path d="M2 43H28V63M28 51H44V63" fill="none" stroke="#4e8a83" strokeWidth="0.5" vectorEffect="non-scaling-stroke" />
        </svg>
        {usStates.map((state) => (
          <span key={state.id} aria-hidden="true" className="pointer-events-none absolute -translate-x-1/2 -translate-y-1/2 text-[9px] font-black leading-none text-[#23453f]"
            style={{ left: `${state.label[0]}%`, top: `${state.label[1] / 65 * 100}%` }}>{state.abbreviation}</span>
        ))}
        {visibleMarkers.map(({ marker, index }) => {
          const point = usMapPoint(marker.location!.coordinates!)!;
          return <button key={marker.id} type="button" aria-label={`Choose map pin ${String.fromCharCode(65 + index)}: ${marker.label}`} disabled={disabled} onClick={() => onSelect(marker.id)}
            className={`absolute z-10 grid h-9 w-9 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full border-2 border-[#092421] text-sm font-black text-[#102f36] shadow-[2px_2px_0_#092421] enabled:hover:bg-[#fff1bf] ${marker.tone === "correct" ? "bg-[#70d392]" : marker.tone === "wrong" ? "bg-[#f59a7d]" : marker.tone === "quiet" ? "bg-white/65" : "bg-[#f0c84b]"}`}
            style={{ left: `${point.x}%`, top: `${point.y}%` }}>{String.fromCharCode(65 + index)}</button>;
        })}
      </div>
      <p className="px-2 py-1 text-[9px] font-semibold text-[#375b52]">Alaska & Hawaii are shown in insets at different scales. State outlines: US Census Bureau.</p>
      <div className="m-2 mt-0 rounded-lg bg-black/75 px-2 py-1.5 text-[10px] font-semibold text-white">
        {visibleMarkers.length < markers.length && <p>Showing US pins. Switch to World to see every choice.</p>}
        {footer}
      </div>
    </div>
  );
}

"use client";

import { CountryMapSurface } from "./country-map-surface";
import { continentRegions, type MapRegion } from "@/lib/continent-map";
import { useState } from "react";
import type { WorldLocation } from "@/lib/card-metadata";
import { isUsMapLocation, mapRegionForLocations, usMapPoint } from "@/lib/us-map";
import usStates from "@/lib/us-map-data.json";

export type WorldMapMarker = {
  id: string;
  label: string;
  x: number;
  y: number;
  location?: WorldLocation;
  tone?: "default" | "correct" | "wrong" | "quiet";
};

export function WorldMapContent({
  markers,
  footer,
  onSelect,
  disabled = false,
  className = "min-h-[320px]",
  region = mapRegionForLocations(markers.map((marker) => marker.location)),
}: {
  markers: readonly WorldMapMarker[];
  footer: string;
  onSelect: (id: string) => void;
  disabled?: boolean;
  className?: string;
  region?: MapRegion;
}) {
  const mapKey = `${region}:${markers.map((marker) => marker.id).join("|")}`;
  const [view, setView] = useState<{ key: string; region: MapRegion } | null>(null);
  const usMarkers = markers.filter((marker) => isUsMapLocation(marker.location));
  const activeRegion = view?.key === mapKey ? view.region : region;
  const switcher = (
    <select aria-label="Map view" value={activeRegion} onChange={(event) => setView({ key: mapKey, region: event.target.value as MapRegion })}
      className="absolute right-2 top-2 z-20 min-h-9 max-w-36 rounded-lg border-2 border-[#092421] bg-white px-2 text-[11px] font-black text-[#102f36] shadow-[2px_2px_0_#092421]">
      <option value="world">World</option>
      {usMarkers.length > 0 && <option value="us">United States</option>}
      {continentRegions.map((continent) => <option key={continent} value={continent}>{continent}</option>)}
    </select>
  );
  if (activeRegion === "us") return (
    <UsMapSurface key={mapKey} markers={markers} footer={footer} onSelect={onSelect} disabled={disabled} className={className} switcher={switcher} />
  );
  return <CountryMapSurface key={`${mapKey}:${activeRegion}`} region={activeRegion} markers={markers} footer={footer} onSelect={onSelect} disabled={disabled} className={className} switcher={switcher} />;
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

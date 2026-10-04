"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import type { WorldContinent } from "@/lib/card-metadata";
import { continentMapPoint, worldMapPoint, spreadMapPins } from "@/lib/continent-map";
import worldData from "@/lib/world-map-data.json";
import mapData from "@/lib/continent-map-data.json";
import type { WorldMapMarker } from "./world-map-surface";

export function CountryMapSurface({ region, markers, footer, onSelect, disabled, className, switcher }: {
  region: WorldContinent | "world";
  markers: readonly WorldMapMarker[];
  footer: string;
  onSelect: (id: string) => void;
  disabled: boolean;
  className: string;
  switcher: ReactNode;
}) {
  const isWorld = region === "world";
  const plotHeight = isWorld ? 56 : 70;
  const title = isWorld ? "World" : region;
  const plotFrame = useRef<HTMLDivElement>(null);
  const [plotWidth, setPlotWidth] = useState(300);
  useEffect(() => {
    const frame = plotFrame.current;
    if (!frame) return;
    const observer = new ResizeObserver(() => {
      const box = frame.getBoundingClientRect();
      setPlotWidth(Math.min(box.width, box.height / (plotHeight / 100)));
    });
    observer.observe(frame);
    return () => observer.disconnect();
  }, [plotHeight]);
  const [selectedCountry, setSelectedCountry] = useState("");
  const countries = isWorld ? worldData : mapData[region];
  const inThisView = (country: { continents: string[] }) => isWorld ? !country.continents.includes("Antarctica") : country.continents.includes(region);
  const regionalCountries = countries.filter(inThisView);
  const visibleMarkers = markers.flatMap((marker, index) => {
    if (isWorld) return [{ marker, index, point: worldMapPoint(marker.location?.coordinates ?? [90 - marker.y * 1.8, marker.x * 3.6 - 180]) }];
    if (!marker.location?.coordinates || !marker.location.continents.includes(region)) return [];
    const point = continentMapPoint(region, marker.location.coordinates);
    return point.x >= 3 && point.x <= 97 && point.y >= 3 && point.y <= 97 ? [{ marker, index, point }] : [];
  });
  const pinPositions = spreadMapPins(visibleMarkers.map(({ point }) => point), plotHeight, isWorld ? Math.max(8, 4800 / plotWidth) : 16);
  const explored = countries.find((country) => country.name === selectedCountry);
  const anchorVisible = explored && explored.anchor[0] >= 2 && explored.anchor[0] <= 98 && explored.anchor[1] >= 2 && explored.anchor[1] <= plotHeight - 2;
  return (
    <div aria-label={`${title} map`} className={`relative flex flex-col overflow-hidden rounded-lg border-2 border-[#092421] bg-[#b9dfdf] ${className}`}>
      {switcher}
      <div className="min-h-12 shrink-0 px-3 pb-2 pt-3 pr-40 text-[11px] font-black uppercase tracking-wide text-[#102f36]">{title}</div>
      <div className="flex shrink-0 flex-wrap items-center gap-2 px-2 pb-2">
        {region !== "Antarctica" && <select aria-label="Find a country" value={selectedCountry} onChange={(event) => setSelectedCountry(event.target.value)}
          className="min-h-10 min-w-0 max-w-full rounded-md border border-[#375b52] bg-white px-2 text-xs font-bold text-[#102f36]">
          <option value="">Explore a country…</option>
          {regionalCountries.map((country) => <option key={country.id} value={country.name}>{country.name}</option>)}
        </select>}
        <p aria-live="polite" className="text-xs font-bold text-[#102f36]">{selectedCountry || (region === "Antarctica" ? "Antarctica has no countries." : "Tap an outline to learn its name.")}</p>
      </div>
      <div ref={plotFrame} className={`relative mx-1 shrink-0 min-[760px]:aspect-auto min-[760px]:min-h-[230px] min-[760px]:flex-1 ${isWorld ? "aspect-[100/56]" : "aspect-[10/7]"}`}>
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2" style={{ width: plotWidth, aspectRatio: `100 / ${plotHeight}` }} data-continent-map-plot={isWorld ? undefined : ""} data-world-map-plot={isWorld ? "" : undefined}>
        <svg viewBox={`0 0 100 ${plotHeight}`} className="absolute inset-0 h-full w-full" aria-label={`${title} country boundaries`}>
          {isWorld && <g pointerEvents="none" stroke="#4e8a83" strokeWidth="0.5" vectorEffect="non-scaling-stroke" opacity="0.35">
            {[-60, -30, 0, 30, 60].map((latitude) => <line vectorEffect="non-scaling-stroke" key={latitude} x1="4" x2="96" y1={worldMapPoint([latitude, 0]).y * 0.56} y2={worldMapPoint([latitude, 0]).y * 0.56} />)}
            {[-120, -60, 0, 60, 120].map((longitude) => <line vectorEffect="non-scaling-stroke" key={longitude} x1={worldMapPoint([0, longitude]).x} x2={worldMapPoint([0, longitude]).x} y1="5" y2="51" />)}
          </g>}
          {countries.map((country) => {
            const inRegion = inThisView(country);
            const tone = visibleMarkers.find(({ marker }) => marker.location?.countries.includes(country.name)
              && (marker.tone === "correct" || marker.tone === "wrong"))?.marker.tone;
            const Shape = country.path ? "path" : "circle";
            return <Shape key={country.id} d={country.path || undefined} cx={country.anchor[0]} cy={country.anchor[1]} r={isWorld ? "0.25" : "0.6"}
              fill={tone === "correct" ? "#70d392" : tone === "wrong" ? "#f59a7d" : selectedCountry === country.name ? "#f0c84b" : inRegion ? "#e7d798" : "#cfdbc7"}
              stroke="#375b52" strokeWidth={isWorld ? "0.6" : "0.75"} vectorEffect="non-scaling-stroke" fillRule="evenodd"
              role={inRegion ? "button" : undefined} tabIndex={inRegion ? 0 : undefined} aria-label={inRegion ? `Explore ${country.name}` : undefined} aria-pressed={inRegion ? selectedCountry === country.name : undefined}
              className={inRegion ? "cursor-pointer hover:fill-[#fff1bf] focus:fill-[#f0c84b] focus:outline-none" : undefined}
              onClick={() => { if (inRegion) setSelectedCountry(country.name); }}
              onKeyDown={(event) => { if (inRegion && (event.key === "Enter" || event.key === " ")) { event.preventDefault(); setSelectedCountry(country.name); } }}>
              <title>{country.name}</title>
            </Shape>;
          })}
          {isWorld && <g pointerEvents="none">
            <line x1="4" y1="28" x2="96" y2="28" stroke="#23645b" strokeDasharray="1.25 1.25" strokeWidth="0.25" />
            <text x="5" y="27" fontSize="1.5" fill="#23645b" fontWeight="bold">EQUATOR</text>
          </g>}
          {visibleMarkers.map(({ marker, point }, index) => {
            const pin = pinPositions[index];
            return <g key={marker.id} pointerEvents="none">
              <line x1={point.x} y1={point.y * plotHeight / 100} x2={pin.x} y2={pin.y * plotHeight / 100} stroke="#102f36" strokeWidth="1.5" vectorEffect="non-scaling-stroke" />
              <circle cx={point.x} cy={point.y * plotHeight / 100} r="0.7" fill="#102f36" />
            </g>;
          })}
          {anchorVisible && <circle cx={explored.anchor[0]} cy={explored.anchor[1]} r="1.4" fill="#f0c84b" stroke="#102f36" strokeWidth="0.4" pointerEvents="none" />}
        </svg>
        {isWorld && <div aria-hidden="true" className="pointer-events-none absolute inset-0">
          {[
            { name: "North America", coordinates: [48, -110] },
            { name: "South America", coordinates: [-18, -61] },
            { name: "Europe", coordinates: [56, 17] },
            { name: "Africa", coordinates: [5, 20] },
            { name: "Asia", coordinates: [43, 100] },
            { name: "Oceania", coordinates: [-28, 139] },
            { name: "Antarctica", coordinates: [-80, 0] },
          ].map(({ name, coordinates }) => {
            const point = worldMapPoint(coordinates as [number, number]);
            return <span key={name} className="absolute -translate-x-1/2 -translate-y-1/2 rounded bg-[#fff9ec]/80 px-1 py-0.5 text-center text-[7px] font-black uppercase leading-none tracking-wide text-[#23453f] min-[700px]:text-[9px]" style={{ left: `${point.x}%`, top: `${point.y}%` }}>{name}</span>;
          })}
        </div>}
        {visibleMarkers.map(({ marker, index }, visibleIndex) => <button key={marker.id} type="button"
          aria-label={`Choose map pin ${String.fromCharCode(65 + index)}: ${marker.label}`} disabled={disabled} onClick={() => onSelect(marker.id)}
          className={`absolute z-10 grid h-10 w-10 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full border-2 border-[#092421] text-sm font-black text-[#102f36] shadow-[2px_2px_0_#092421] enabled:hover:bg-[#fff1bf] ${marker.tone === "correct" ? "bg-[#70d392]" : marker.tone === "wrong" ? "bg-[#f59a7d]" : marker.tone === "quiet" ? "bg-white/65" : "bg-[#f0c84b]"}`}
          style={{ left: `${pinPositions[visibleIndex].x}%`, top: `${pinPositions[visibleIndex].y}%` }}>{String.fromCharCode(65 + index)}</button>)}
        </div>
      </div>
      <p className="shrink-0 px-2 py-2 text-[9px] font-semibold text-[#375b52]">
        {region === "Antarctica" ? "View from above the South Pole. " : "Country and territory outlines. "}
        Natural Earth · public domain.
      </p>
      <div className="m-2 mt-0 shrink-0 rounded-lg bg-black/75 px-2 py-1.5 text-[10px] font-semibold text-white">
        {visibleMarkers.length < markers.length && <p>Showing pins in this view. Choose World to see every choice.</p>}
        {footer}
      </div>
    </div>
  );
}

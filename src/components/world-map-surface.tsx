"use client";

import dynamic from "next/dynamic";
import { Component, type ComponentProps, type ReactNode } from "react";
import type { WorldMapContent } from "./world-map-content";
export type { WorldMapMarker } from "./world-map-content";

export const preloadMaps = async () => {
  let timer: ReturnType<typeof setTimeout>;
  try {
    return await Promise.race([
      import("./world-map-content"),
      new Promise<never>((_, reject) => { timer = setTimeout(() => reject(new Error("Map load timed out")), 15000); }),
    ]);
  } finally { clearTimeout(timer!); }
};

const LazyMap = dynamic(() => preloadMaps().then((module) => module.WorldMapContent), { loading: () => <div role="status" className="grid min-h-[320px] place-items-center rounded-lg bg-[#b9dfdf]">Loading map…</div> });

class MapBoundary extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() { return { failed: true }; }
  render() {
    if (!this.state.failed) return this.props.children;
    return <div role="alert" className="rounded-lg border-2 border-[#092421] bg-[#fffdf6] p-4">
      <p>The map could not load. Check your connection and reload, or skip this question.</p>
      <button type="button" onClick={() => window.location.reload()} className="mt-2 min-h-11 rounded-lg border-2 border-[#092421] px-3 font-bold">Reload map</button>
    </div>;
  }
}

export function WorldMapSurface(props: ComponentProps<typeof WorldMapContent>) {
  return <MapBoundary><LazyMap {...props} /></MapBoundary>;
}

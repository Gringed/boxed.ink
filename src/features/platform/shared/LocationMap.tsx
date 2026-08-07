"use client";

import { Loader2 } from "lucide-react";
import { MapContainer, Marker, TileLayer, useMap } from "react-leaflet";
import L from "leaflet";

interface LocationMapProps {
  lat?: number | null;
  lng?: number | null;
  loading?: boolean;
  className?: string;
}

const pinIcon = L.divIcon({
  className: "",
  html: `<svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="hsl(var(--primary))" stroke="white" stroke-width="1.5" style="filter:drop-shadow(0 1px 2px rgb(0 0 0 / 0.35))"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3" fill="white" stroke="none"/></svg>`,
  iconSize: [28, 28],
  iconAnchor: [14, 28],
});

// Keeps the map centered on the current coordinates whenever they change
// (e.g. after picking a suggestion or the debounced geocode resolving) —
// MapContainer only applies `center` on mount, not on prop updates.
const RecenterOnChange = ({ lat, lng }: { lat: number; lng: number }) => {
  const map = useMap();
  map.setView([lat, lng], map.getZoom() < 4 ? 11 : map.getZoom());
  return null;
};

// Drops the "Leaflet" credit but keeps the OpenStreetMap one, which their
// usage policy requires to stay visible.
const TrimAttribution = () => {
  const map = useMap();
  map.attributionControl.setPrefix(false);
  return null;
};

export const LocationMap = ({
  lat,
  lng,
  loading,
  className,
}: LocationMapProps) => {
  const hasCoords = lat != null && lng != null;

  return (
    <div
      className={`relative overflow-hidden rounded-xl border shadow-sm z-0 ${
        className ?? ""
      }`}
    >
      <MapContainer
        center={hasCoords ? [lat, lng] : [20, 0]}
        zoom={hasCoords ? 11 : 1.5}
        scrollWheelZoom={false}
        className="w-full h-full"
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution="&copy; OpenStreetMap contributors"
        />
        <TrimAttribution />
        {hasCoords && (
          <>
            <Marker position={[lat, lng]} icon={pinIcon} />
            <RecenterOnChange lat={lat} lng={lng} />
          </>
        )}
      </MapContainer>
      {loading && (
        <div className="absolute inset-0 z-[1000] flex items-center justify-center bg-white/60">
          <Loader2 className="animate-spin text-noir" size={20} />
        </div>
      )}
    </div>
  );
};

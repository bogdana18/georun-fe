'use client';

import { MapContainer, TileLayer, Polyline, Marker, useMapEvents } from 'react-leaflet';
import L from 'leaflet';

// Fix Leaflet default marker icon bug in bundled environments
delete (L.Icon.Default.prototype as unknown as Record<string, unknown>)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

// Custom start marker (green)
const startIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-green.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

// Custom end marker (red)
const endIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-red.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

interface RouteMapProps {
  coordinates: [number, number][];
  onChange: (coords: [number, number][]) => void;
}

function toLatLng(coord: [number, number]): [number, number] {
  return [coord[1], coord[0]];
}

function ClickHandler({
  coordinates,
  onChange,
}: RouteMapProps) {
  useMapEvents({
    click(e) {
      const { lat, lng } = e.latlng;
      onChange([...coordinates, [lng, lat]]);
    },
  });
  return null;
}

export default function RouteMap({ coordinates, onChange }: RouteMapProps) {
  const kyivCenter: [number, number] = [50.4501, 30.5234];

  // Convert all coordinates to Leaflet's [lat, lng] for rendering
  const latLngCoords = coordinates.map(toLatLng);

  const handleUndo = () => {
    if (coordinates.length > 0) {
      onChange(coordinates.slice(0, -1));
    }
  };

  const handleClear = () => {
    onChange([]);
  };

  return (
    <div style={{ position: 'relative' }}>
      <MapContainer
        center={kyivCenter}
        zoom={13}
        scrollWheelZoom={true}
        className="w-full rounded-lg border border-[var(--card-border)]"
        style={{ height: '400px', zIndex: 1 }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <ClickHandler coordinates={coordinates} onChange={onChange} />

        {/* Route polyline */}
        {latLngCoords.length >= 2 && (
          <Polyline
            positions={latLngCoords}
            pathOptions={{
              color: '#4f8cff',
              weight: 4,
              opacity: 0.85,
              dashArray: '8 6',
            }}
          />
        )}

        {/* Start marker (first point) */}
        {latLngCoords.length > 0 && (
          <Marker position={latLngCoords[0]} icon={startIcon} />
        )}

        {/* End marker (last point, only if different from start) */}
        {latLngCoords.length > 1 && (
          <Marker
            position={latLngCoords[latLngCoords.length - 1]}
            icon={endIcon}
          />
        )}
      </MapContainer>

      {/* Controls overlay */}
      <div
        style={{
          position: 'absolute',
          bottom: '12px',
          right: '12px',
          zIndex: 10,
          display: 'flex',
          gap: '8px',
        }}
      >
        {coordinates.length > 0 && (
          <>
            <button
              type="button"
              onClick={handleUndo}
              style={{
                background: 'var(--surface-elevated)',
                color: 'var(--foreground)',
                border: '1px solid var(--card-border)',
                borderRadius: '8px',
                padding: '6px 12px',
                fontSize: '0.78rem',
                fontWeight: 500,
                cursor: 'pointer',
                backdropFilter: 'blur(12px)',
                transition: 'all 0.2s',
              }}
            >
              ↩ Undo
            </button>
            <button
              type="button"
              onClick={handleClear}
              style={{
                background: 'rgba(248, 113, 113, 0.15)',
                color: 'var(--error)',
                border: '1px solid rgba(248, 113, 113, 0.3)',
                borderRadius: '8px',
                padding: '6px 12px',
                fontSize: '0.78rem',
                fontWeight: 500,
                cursor: 'pointer',
                transition: 'all 0.2s',
              }}
            >
              ✕ Clear
            </button>
          </>
        )}
      </div>

      {/* Point counter & hint */}
      <div
        style={{
          marginTop: '8px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          fontSize: '0.78rem',
          color: 'var(--muted)',
        }}
      >
        <span>
          {coordinates.length === 0
            ? 'Click on the map to start drawing your route'
            : `${coordinates.length} point${coordinates.length !== 1 ? 's' : ''} placed`}
        </span>
        {coordinates.length >= 2 && (
          <span style={{ color: 'var(--badge-easy)' }}>✓ Route ready</span>
        )}
      </div>
    </div>
  );
}

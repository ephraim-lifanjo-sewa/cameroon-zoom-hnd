/* eslint-disable react-hooks/rules-of-hooks */
"use client";

import { useEffect, useState, useMemo, memo } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet-defaulticon-compatibility';
import 'leaflet-defaulticon-compatibility/dist/leaflet-defaulticon-compatibility.css';
import { MapContainer, TileLayer, Marker, useMap, Popup } from 'react-leaflet';
import { Enterprise } from '@/app/lib/types';
import { renderToString } from 'react-dom/server';
import { Star, ChevronRight, MapPin, Layers, Map as MapIcon } from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';

/** Create a custom marker safely */
const createCustomPin = (isHighlighted: boolean = false) => {
  const size = isHighlighted ? 44 : 34;
  const color = '#D71616';

  const html = renderToString(
    <div
      style={{
        width: `${size}px`,
        height: `${size}px`,
        position: 'relative',
        filter: 'drop-shadow(0 4px 12px rgba(0,0,0,0.4))',
        transform: isHighlighted ? 'translateY(-4px)' : 'scale(1)',
        transition: 'all 0.2s cubic-bezier(0.34, 1.56, 0.64, 1)',
        cursor: 'pointer'
      }}
    >
      <svg
        viewBox="0 0 24 24"
        fill={color}
        stroke="#FFFFFF"
        strokeWidth="2"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" />
        <circle cx="12" cy="9" r="3.5" fill="white" />
      </svg>
    </div>
  );

  return L.divIcon({
    className: 'enterprise-marker',
    html,
    iconSize: [size, size],
    iconAnchor: [size / 2, size],
    popupAnchor: [0, -size]
  });
};

/** MapHandler safely handles flyTo & fitBounds without errors */
function MapHandler({
  businesses,
  highlightedId
}: {
  businesses: Enterprise[],
  highlightedId?: string | null
}) {
  const map = useMap();

  useEffect(() => {
    try {
      const validPoints: [number, number][] = businesses
        .filter(b => 
          typeof b.latitude === 'number' &&
          typeof b.longitude === 'number' &&
          !isNaN(b.latitude) &&
          !isNaN(b.longitude)
        )
        .map(b => [b.latitude, b.longitude]);

      if (highlightedId) {
        const active = businesses.find(b => b.id === highlightedId);
        if (
          active &&
          typeof active.latitude === 'number' &&
          typeof active.longitude === 'number' &&
          !isNaN(active.latitude) &&
          !isNaN(active.longitude)
        ) {
          map.flyTo([active.latitude, active.longitude], 16, { duration: 0.6 });
          return;
        }
      }

      if (validPoints.length > 0) {
        const bounds = L.latLngBounds(validPoints);
        map.fitBounds(bounds, { padding: [60, 60], maxZoom: 15, animate: true, duration: 1 });
      }
    } catch (err) {
      console.error('Leaflet map error:', err);
    }
  }, [businesses, highlightedId, map]);

  return null;
}

/** Enterprise Marker component with safe coordinates */
const EnterpriseMarker = memo(({
  enterprise,
  isHighlighted,
  onClick
}: {
  enterprise: Enterprise,
  isHighlighted: boolean,
  onClick: () => void
}) => {
  if (
    typeof enterprise.latitude !== 'number' ||
    typeof enterprise.longitude !== 'number' ||
    isNaN(enterprise.latitude) ||
    isNaN(enterprise.longitude)
  ) return null;

  const icon = useMemo(() => createCustomPin(isHighlighted), [isHighlighted]);

  return (
    <Marker
      position={[enterprise.latitude, enterprise.longitude]}
      icon={icon}
      eventHandlers={{ click: onClick }}
      zIndexOffset={isHighlighted ? 1000 : 0}
    >
      <Popup closeButton={false} className="minimal-popup" offset={[0, -8]}>
        <div className="font-body bg-white p-4 w-60">
          <h4 className="font-black text-black uppercase text-[13px] truncate leading-tight tracking-tight">
            {enterprise.businessName || enterprise.name}
          </h4>
          <div className="flex items-center gap-1 mt-1">
            {[1,2,3,4,5].map(i => (
              <Star
                key={i}
                className={cn(
                  "w-3 h-3",
                  i <= Math.round(enterprise.averageRating || 0)
                    ? 'fill-[#FF643D] text-[#FF643D]'
                    : 'text-gray-200'
                )}
              />
            ))}
            <span className="text-[10px] font-black opacity-60 ml-1">({enterprise.totalReviews || 0})</span>
          </div>
          <div className="pt-3 border-t-2 border-black flex items-center justify-between">
            <span className="text-[9px] font-black opacity-60 flex items-center gap-1">
              <MapPin className="w-3 h-3 text-primary" /> {enterprise.city}
            </span>
            <Link
              href={`/business/${enterprise.id}`}
              className="text-primary font-black text-[10px] uppercase hover:underline flex items-center gap-1"
            >
              Visit <ChevronRight className="w-3 h-3" />
            </Link>
          </div>
        </div>
      </Popup>
    </Marker>
  );
});

EnterpriseMarker.displayName = 'EnterpriseMarker';

/** Main SearchMap Component */
export default function SearchMap({
  businesses,
  onMarkerClick,
  highlightedId,
 
}: {
  businesses: Enterprise[],
  onMarkerClick?: (enterprise: Enterprise) => void,
  highlightedId?: string | null,
  isMobileOnly?: boolean,
  onCloseMobile?: () => void
}) {
  const [isMounted, setIsMounted] = useState(false);
  const [mapType, setMapType] = useState<'standard' | 'satellite'>('standard');

  useEffect(() => setIsMounted(true), []);

  const tileUrl = useMemo(
    () =>
      mapType === 'standard'
        ? "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        : "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
    [mapType]
  );

  if (!isMounted) return <div className="w-full h-full bg-[#F5F5F5] animate-pulse" />;

  return (
    <div className="relative w-full h-full flex flex-col overflow-hidden">
      <style jsx global>{`
        .minimal-popup .leaflet-popup-content-wrapper {
          background: white;
          box-shadow: 0 10px 40px rgba(0,0,0,0.5);
          padding: 0;
          border-radius: 12px;
          border: 3px solid #000000;
          overflow: hidden;
        }
        .minimal-popup .leaflet-popup-content { margin: 0; width: auto !important; }
        .minimal-popup .leaflet-popup-tip-container { display: none; }
        .enterprise-marker { outline: none; }
      `}</style>

      <MapContainer
        center={[4.0511, 9.7679]}
        zoom={13}
        className="flex-1 w-full h-full z-0"
        zoomControl={false}
        preferCanvas={true}
      >
        <TileLayer url={tileUrl} attribution="&copy; OpenStreetMap" />
        <MapHandler businesses={businesses} highlightedId={highlightedId} />
        {businesses.map(b => (
          <EnterpriseMarker
            key={b.id}
            enterprise={b}
            isHighlighted={highlightedId === b.id}
            onClick={() => onMarkerClick?.(b)}
          />
        ))}
      </MapContainer>

      <div className="absolute bottom-6 right-6 z-400 flex flex-col gap-3 items-end">
        <div className="flex flex-col bg-white border-[3px] border-black rounded-xl p-1 shadow-xl">
          <button
            onClick={() => setMapType('standard')}
            className={cn(
              "p-3 rounded-lg transition-all",
              mapType === 'standard' ? "bg-black text-white shadow-md" : "text-black hover:bg-muted"
            )}
          >
            <MapIcon className="w-5 h-5" />
          </button>
          <div className="h-1" />
          <button
            onClick={() => setMapType('satellite')}
            className={cn(
              "p-3 rounded-lg transition-all",
              mapType === 'satellite' ? "bg-black text-white shadow-md" : "text-black hover:bg-muted"
            )}
          >
            <Layers className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
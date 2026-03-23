"use client";

import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet-defaulticon-compatibility';
import 'leaflet-defaulticon-compatibility/dist/leaflet-defaulticon-compatibility.css';
import { renderToString } from 'react-dom/server';
import { useState, useMemo } from 'react';

interface LocationPickerMapProps {
  lat: number;
  lng: number;
  onChange: (lat: number, lng: number) => void;
}

/**
 * CARTOON PICKER PIN
 * Thick black borders and vibrant red for easy seeing.
 */
const createPickerPin = () => {
  const html = renderToString(
    <div style={{
      width: '40px',
      height: '40px',
      filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.4))',
    }}>
      <svg viewBox="0 0 24 24" fill="#D71616" stroke="#000000" strokeWidth="2" xmlns="http://www.w3.org/2000/svg">
        <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" />
        <circle cx="12" cy="9" r="3" fill="white" stroke="#000000" strokeWidth="1" />
      </svg>
    </div>
  );

  return L.divIcon({
    className: 'picker-marker',
    html: html,
    iconSize: [40, 40],
    iconAnchor: [20, 40]
  });
};

export default function LocationPickerMap({ lat, lng, onChange }: LocationPickerMapProps) {
  const markerIcon = useMemo(() => createPickerPin(), []);

  function MapEvents() {
    useMapEvents({
      click(e) {
        onChange(e.latlng.lat, e.latlng.lng);
      },
    });
    return null;
  }

  return (
    <div className="w-full h-full relative rounded-xl overflow-hidden border-2 border-black">
      <MapContainer 
        center={[lat, lng]} 
        zoom={13} 
        style={{ height: '100%', width: '100%' }}
        zoomControl={false}
      >
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        <MapEvents />
        <Marker 
          position={[lat, lng]} 
          icon={markerIcon}
          draggable={true}
          eventHandlers={{
            dragend: (e) => {
              const marker = e.target;
              const position = marker.getLatLng();
              onChange(position.lat, position.lng);
            },
          }}
        />
      </MapContainer>
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-[400] bg-black text-white px-4 py-2 rounded-full shadow-2xl">
        <p className="text-[9px] font-black uppercase tracking-widest whitespace-nowrap">Move red pin to your door</p>
      </div>
    </div>
  );
}

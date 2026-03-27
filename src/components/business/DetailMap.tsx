
"use client";

import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet-defaulticon-compatibility';
import 'leaflet-defaulticon-compatibility/dist/leaflet-defaulticon-compatibility.css';
import { renderToString } from 'react-dom/server';

interface DetailMapProps {
  lat: number;
  lng: number;
  businessName: string;
}

const createCustomPin = () => {
  const html = renderToString(
    <div style={{
      width: '32px',
      height: '32px',
      filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))',
    }}>
      <svg viewBox="0 0 24 24" fill="#D71616" xmlns={'http://www.w3.org/2000/svg'}>
        <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" />
        <circle cx="12" cy="9" r="3" fill="white" />
      </svg>
    </div>
  );

  return L.divIcon({
    className: 'detail-marker',
    html: html,
    iconSize: [32, 32],
    iconAnchor: [16, 32]
  });
};

export default function DetailMap({ lat, lng, businessName }: DetailMapProps) {
  return (
    <MapContainer 
      center={[lat, lng]} 
      zoom={15} 
      style={{ height: '100%', width: '100%' }}
      zoomControl={false}
      scrollWheelZoom={false}
    >
      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
      <Marker position={[lat, lng]} icon={createCustomPin()}>
        <Popup className="font-bold uppercase text-[10px] tracking-widest">{businessName}</Popup>
      </Marker>
    </MapContainer>
  );
}

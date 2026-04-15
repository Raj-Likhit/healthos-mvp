'use client';

import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import { useEffect, useState } from 'react';
import { useHealthStore } from '@/lib/store';
import { translations } from '@/lib/translations';
import { Ambulance, MapPin, Navigation } from 'lucide-react';
import { renderToStaticMarkup } from 'react-dom/server';

// Custom icons using Lucide
const createCustomIcon = (IconComponent: any, color: string) => {
  return L.divIcon({
    html: renderToStaticMarkup(
      <div className="strategic-marker">
        <div style={{ color }} className="relative">
          <IconComponent size={32} />
          <div className="absolute inset-0 bg-current opacity-20 blur-sm rounded-full animate-pulse" />
        </div>
      </div>
    ),
    className: 'custom-leaflet-icon',
    iconSize: [32, 32],
    iconAnchor: [16, 32],
  });
};

function MapController({ center }: { center: [number, number] }) {
  const map = useMap();
  useEffect(() => {
    map.setView(center, 15);
  }, [center, map]);
  return null;
}

export default function TacticalMap() {
  const { activeEmergency, language } = useHealthStore();
  
  // Default center (Hyderabad, generic high-tech hub coordinates for demo)
  const [center, setCenter] = useState<[number, number]>([17.4483, 78.3915]);
  const [responderPos, setResponderPos] = useState<[number, number]>([17.4400, 78.3800]);

  // Emergency Marker
  const emergencyPos: [number, number] = [17.4483, 78.3915];

  // Icons
  const emergencyIcon = createCustomIcon(MapPin, 'var(--primary)');
  const responderIcon = createCustomIcon(Ambulance, '#3b82f6');

  return (
    <div className="w-full h-full relative">
      <MapContainer 
        center={center} 
        zoom={15} 
        scrollWheelZoom={true}
        zoomControl={false}
        className="w-full h-full"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        {/* Emergency Target */}
        {activeEmergency && (
          <Marker position={emergencyPos} icon={emergencyIcon}>
            <Popup className="clinical-popup">
              <div className="p-2">
                <p className="text-[10px] font-black uppercase tracking-widest text-primary mb-1">{translations[language].target_location}</p>
                <p className="text-xs font-bold">{activeEmergency.extraction.where}</p>
              </div>
            </Popup>
          </Marker>
        )}

        {/* Responder Unit */}
        <Marker position={responderPos} icon={responderIcon}>
          <Popup>
            <p className="text-[10px] font-black uppercase tracking-widest">{translations[language].unit_label}</p>
          </Popup>
        </Marker>

        <MapController center={activeEmergency ? emergencyPos : center} />
      </MapContainer>

      {/* Map Overlays for tactical feel */}
      <div className="absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-background/80 to-transparent pointer-events-none z-[1000]" />
      <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-background/80 to-transparent pointer-events-none z-[1000]" />
      
      {/* Tactical Compass Component (Visual Only) */}
      <div className="absolute right-8 top-32 z-[1000] p-4 rounded-full border border-primary/20 bg-card/40 backdrop-blur-xl pointer-events-auto shadow-2xl">
         <Navigation className="w-5 h-5 text-primary rotate-45" />
      </div>
    </div>
  );
}

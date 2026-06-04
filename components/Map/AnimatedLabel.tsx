"use client";

import { useEffect, useRef, useState } from "react";
import { Marker, useMap } from "react-leaflet";
import L from "leaflet";

interface AnimatedLabelProps {
  position: [number, number];
  icon: L.DivIcon;
  zIndexOffset?: number;
  eventHandlers?: any;
  children?: React.ReactNode;
  threshold?: number; // Distance in meters
}

export default function AnimatedLabel({ position, icon, zIndexOffset = 1000, eventHandlers, threshold = 2500, children }: AnimatedLabelProps) {
  const markerRef = useRef<L.Marker>(null);
  
  useEffect(() => {
    // Map of active vehicle distances
    const vehicleDistances = new Map<string, number>();
    
    // We start fully transparent
    const el = markerRef.current?.getElement();
    if (el) {
      el.style.opacity = '0';
      el.style.pointerEvents = 'none';
      el.style.transition = 'opacity 0.5s ease-in-out';
    }

    const handleVehiclePosition = (e: Event) => {
      const customEvent = e as CustomEvent;
      const { id, lat, lng } = customEvent.detail;
      
      const vehiclePos = L.latLng(lat, lng);
      const myPos = L.latLng(position[0], position[1]);
      const distance = myPos.distanceTo(vehiclePos);
      
      vehicleDistances.set(id, distance);
      
      let minDistance = Infinity;
      vehicleDistances.forEach((d) => {
        if (d < minDistance) minDistance = d;
      });
      
      const element = markerRef.current?.getElement();
      if (element) {
        if (minDistance <= threshold) {
          element.style.opacity = '1';
          element.style.pointerEvents = 'auto';
        } else {
          element.style.opacity = '0';
          element.style.pointerEvents = 'none';
        }
      }
    };

    window.addEventListener('vehicle-position', handleVehiclePosition);
    return () => {
      window.removeEventListener('vehicle-position', handleVehiclePosition);
    };
  }, [position, threshold]);

  return (
    <Marker 
      ref={markerRef} 
      position={position} 
      icon={icon} 
      zIndexOffset={zIndexOffset}
      eventHandlers={eventHandlers}
      interactive={!!eventHandlers}
    >
      {children}
    </Marker>
  );
}

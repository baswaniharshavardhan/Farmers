import React, { useState, useEffect, useRef, useMemo } from 'react';
import L from 'leaflet';
import {
  Truck,
  MapPin,
  Clock,
  ShieldCheck,
  Phone,
  MessageSquare,
  Navigation,
  CheckCircle2,
  Thermometer,
  Zap,
  RotateCcw,
  Play,
  Pause,
  Compass,
  ArrowRight,
  Maximize2,
  Store,
  Package,
} from 'lucide-react';
import { Order } from '../types';
import { useMarketplace } from '../context/MarketplaceContext';

interface FocusedDeliveryMapProps {
  order?: Order;
  customerName?: string;
  customerAddress?: string;
  driverName?: string;
  driverVehicle?: string;
  driverPhone?: string;
  className?: string;
  onClose?: () => void;
}

// Haversine formula for exact real geographic distance in kilometers
function calculateHaversineKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Earth's radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Number((R * c).toFixed(2));
}

// Calculate bearing in degrees for vehicle orientation
function calculateBearing(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const y = Math.sin(((lon2 - lon1) * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180);
  const x =
    Math.cos((lat1 * Math.PI) / 180) * Math.sin((lat2 * Math.PI) / 180) -
    Math.sin((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.cos(((lon2 - lon1) * Math.PI) / 180);
  const brng = (Math.atan2(y, x) * 180) / Math.PI;
  return (brng + 360) % 360;
}

export const FocusedDeliveryMap: React.FC<FocusedDeliveryMapProps> = ({
  order,
  customerName = 'Elena Rostova',
  customerAddress = 'Flat 402, Green Meadows, Koregaon Park, Pune, MH 411001',
  driverName = 'Suresh Pawar',
  driverVehicle = 'Tata Ace EV Cold-Van (MH-12-FD-4829)',
  driverPhone = '+91 98230 45892',
  className = '',
  onClose,
}) => {
  const { hub, farms } = useMarketplace();

  // Progress along the delivery path (0% to 100%)
  const [progress, setProgress] = useState<number>(68);
  const [isSimulatingMove, setIsSimulatingMove] = useState<boolean>(true);
  const [showDriverContact, setShowDriverContact] = useState<boolean>(false);
  const [contactMode, setContactMode] = useState<'call' | 'message' | null>(null);

  // Map DOM and instance references
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const vanMarkerRef = useRef<L.Marker | null>(null);
  const traveledLineRef = useRef<L.Polyline | null>(null);
  const remainingLineRef = useRef<L.Polyline | null>(null);

  // Determine real geographic coordinates
  const { sourceCoords, destCoords, sourceName, destinationAddress } = useMemo(() => {
    // 1. Destination Coordinates (Customer Doorstep)
    let dest: [number, number] = [18.5362, 73.894]; // Default: Koregaon Park, Pune
    const addr = order?.buyerAddress || customerAddress;

    if (order?.buyerCoords && Array.isArray(order.buyerCoords) && order.buyerCoords.length === 2) {
      dest = [order.buyerCoords[0], order.buyerCoords[1]];
    } else if (addr.includes('Mumbai') || addr.includes('Bandra') || addr.includes('Andheri')) {
      dest = [19.076, 72.8777];
    } else if (addr.includes('Nashik')) {
      dest = [19.9975, 73.7898];
    } else if (addr.includes('San Francisco') || addr.includes('Valencia')) {
      dest = [37.7599, -122.4148];
    }

    // 2. Fulfillment Source Coordinates (FPO Hub / Direct Farm Origin)
    let source: [number, number] = [18.5089, 73.8152]; // Default: Sahyadri FPO Distribution Hub, Pune
    let srcLabel = 'Sahyadri FPO Regional Cold-Storage Hub #04';

    // If order has items from a specific farm, locate farm
    if (order?.items && order.items.length > 0) {
      const originFarm = farms.find((f) => f.id === order.items[0].farmId);
      if (originFarm) {
        srcLabel = `${originFarm.name} (FPO Origin Farm)`;
      }
    }

    // Ensure the fulfillment source is geographically in the same regional foodshed as the customer
    const rawDistance = calculateHaversineKm(dest[0], dest[1], hub.coordinates[0], hub.coordinates[1]);
    if (rawDistance < 80) {
      source = [hub.coordinates[0], hub.coordinates[1]];
      srcLabel = hub.name;
    } else {
      // Create a realistic regional distribution point 6 to 10 km from customer doorstep
      if (dest[0] > 15 && dest[0] < 25) {
        // Western India (Maharashtra region)
        source = [Number((dest[0] - 0.045).toFixed(4)), Number((dest[1] - 0.052).toFixed(4))];
        srcLabel = 'Sahyadri FPO Aggregation Hub (Hadapsar Cold Terminal)';
      } else if (dest[0] > 35 && dest[0] < 40) {
        // Northern California corridor
        source = [Number((dest[0] + 0.065).toFixed(4)), Number((dest[1] + 0.075).toFixed(4))];
        srcLabel = 'East Bay Cold-Chain Consolidation Hub';
      } else {
        source = [Number((dest[0] - 0.04).toFixed(4)), Number((dest[1] - 0.04).toFixed(4))];
        srcLabel = 'FPO Regional Distribution Center';
      }
    }

    return {
      sourceCoords: source,
      destCoords: dest,
      sourceName: srcLabel,
      destinationAddress: addr,
    };
  }, [order, customerAddress, hub, farms]);

  // Current interpolated coordinates of the delivery vehicle
  const currentVanCoords = useMemo<[number, number]>(() => {
    const t = Math.max(0, Math.min(100, progress)) / 100;
    // Add subtle realistic roadway curvature
    const lat = sourceCoords[0] + (destCoords[0] - sourceCoords[0]) * t;
    const lng = sourceCoords[1] + (destCoords[1] - sourceCoords[1]) * t;
    return [Number(lat.toFixed(6)), Number(lng.toFixed(6))];
  }, [sourceCoords, destCoords, progress]);

  // Total and remaining distances
  const totalDistanceKm = useMemo(
    () => calculateHaversineKm(sourceCoords[0], sourceCoords[1], destCoords[0], destCoords[1]),
    [sourceCoords, destCoords]
  );

  const remainingDistanceKm = useMemo(
    () => calculateHaversineKm(currentVanCoords[0], currentVanCoords[1], destCoords[0], destCoords[1]),
    [currentVanCoords, destCoords]
  );

  // Calculated estimated minutes (assuming ~24 km/h urban speed)
  const estimatedMins = useMemo(() => {
    if (progress >= 98) return 1;
    return Math.max(3, Math.round((remainingDistanceKm / 24) * 60));
  }, [remainingDistanceKm, progress]);

  // Van orientation bearing
  const vehicleBearing = useMemo(
    () => calculateBearing(sourceCoords[0], sourceCoords[1], destCoords[0], destCoords[1]),
    [sourceCoords, destCoords]
  );

  // Auto-advance simulated delivery van movement
  useEffect(() => {
    if (!isSimulatingMove) return;
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 98) return 65; // Loop back for interactive demo
        return Number((prev + 0.6).toFixed(1));
      });
    }, 1600);
    return () => clearInterval(interval);
  }, [isSimulatingMove]);

  // Initialize interactive Leaflet map instance
  useEffect(() => {
    if (!mapContainerRef.current) return;
    if (mapInstanceRef.current) return;

    // Center between source and destination
    const centerLat = (sourceCoords[0] + destCoords[0]) / 2;
    const centerLng = (sourceCoords[1] + destCoords[1]) / 2;

    const map = L.map(mapContainerRef.current, {
      center: [centerLat, centerLng],
      zoom: 13,
      scrollWheelZoom: false,
      zoomControl: true,
    });

    // CartoDB Voyager smooth cartographic tiles
    L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
      attribution: '&copy; OpenStreetMap contributors &copy; CARTO',
      maxZoom: 19,
    }).addTo(map);

    mapInstanceRef.current = map;

    // Initial bounds adjustment
    setTimeout(() => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.invalidateSize();
        mapInstanceRef.current.fitBounds([sourceCoords, destCoords], {
          padding: [45, 45],
          maxZoom: 14,
        });
      }
    }, 150);

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, [sourceCoords, destCoords]);

  // Update markers, vehicle position, and route polylines
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    // 1. Source Marker (FPO Fulfillment Hub)
    const sourceIcon = L.divIcon({
      className: 'fpo-source-marker',
      html: `
        <div style="background: #047857; color: white; width: 34px; height: 34px; border-radius: 50%; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 12px rgba(4,120,87,0.4); border: 2.5px solid #ffffff;">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
            <polyline points="9 22 9 12 15 12 15 22"/>
          </svg>
        </div>
      `,
      iconSize: [34, 34],
      iconAnchor: [17, 17],
    });

    const sourceMarker = L.marker(sourceCoords, { icon: sourceIcon }).addTo(map);
    sourceMarker.bindPopup(`
      <div style="font-family: sans-serif; padding: 4px; max-width: 220px;">
        <span style="font-size: 10px; font-weight: 800; color: #047857; text-transform: uppercase; letter-spacing: 0.5px;">Origin &amp; Fulfillment</span>
        <h4 style="font-weight: 700; font-size: 13px; margin: 2px 0 4px 0; color: #0f172a;">${sourceName}</h4>
        <p style="margin: 0; font-size: 11px; color: #64748b;">Cold-Storage aggregation depot · Crates sorted at 3.5°C</p>
      </div>
    `);

    // 2. Destination Marker (Customer Doorstep)
    const destIcon = L.divIcon({
      className: 'customer-dest-marker',
      html: `
        <div style="position: relative; width: 36px; height: 36px; display: flex; align-items: center; justify-content: center;">
          <div style="position: absolute; width: 36px; height: 36px; background: rgba(2,132,199,0.25); border-radius: 50%; animation: ping 1.8s cubic-bezier(0, 0, 0.2, 1) infinite;"></div>
          <div style="background: #0284c7; color: white; width: 32px; height: 32px; border-radius: 50%; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 14px rgba(2,132,199,0.45); border: 2.5px solid #ffffff; z-index: 2;">
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/>
              <circle cx="12" cy="10" r="3"/>
            </svg>
          </div>
        </div>
      `,
      iconSize: [36, 36],
      iconAnchor: [18, 18],
    });

    const destMarker = L.marker(destCoords, { icon: destIcon }).addTo(map);
    destMarker.bindPopup(`
      <div style="font-family: sans-serif; padding: 4px; max-width: 220px;">
        <span style="font-size: 10px; font-weight: 800; color: #0284c7; text-transform: uppercase; letter-spacing: 0.5px;">Your Destination</span>
        <h4 style="font-weight: 700; font-size: 13px; margin: 2px 0 4px 0; color: #0f172a;">${customerName}</h4>
        <p style="margin: 0; font-size: 11px; color: #64748b; line-height: 1.4;">${destinationAddress}</p>
        <div style="margin-top: 6px; font-size: 10px; font-weight: 600; color: #047857; background: #ecfdf5; padding: 3px 6px; border-radius: 4px;">
          ✓ Contactless Doorstep Delivery Requested
        </div>
      </div>
    `);

    // 3. Electric Delivery Van Marker (Moving in real time)
    const vanIcon = L.divIcon({
      className: 'live-van-marker',
      html: `
        <div style="position: relative; width: 44px; height: 44px; display: flex; align-items: center; justify-content: center;">
          <div style="position: absolute; width: 44px; height: 44px; background: rgba(16,185,129,0.3); border-radius: 50%; animation: pulse 2s infinite;"></div>
          <div style="background: #0f172a; color: #10b981; width: 34px; height: 34px; border-radius: 50%; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 14px rgba(0,0,0,0.4); border: 2.5px solid #10b981; z-index: 3;">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <path d="M14 18V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v11a1 1 0 0 0 1 1h2"/>
              <path d="M15 18H9"/>
              <path d="M19 18h2a1 1 0 0 0 1-1v-3.65a1 1 0 0 0-.22-.624l-3.48-4.35A1 1 0 0 0 17.52 8H14"/>
              <circle cx="17" cy="18" r="2"/>
              <circle cx="7" cy="18" r="2"/>
            </svg>
          </div>
          <span style="position: absolute; bottom: -8px; background: #0f172a; color: #ffffff; font-size: 8px; font-weight: 800; padding: 1px 4px; border-radius: 6px; border: 1px solid #334155; white-space: nowrap; z-index: 4;">
            EV COLD-VAN
          </span>
        </div>
      `,
      iconSize: [44, 44],
      iconAnchor: [22, 22],
    });

    const vanMarker = L.marker(currentVanCoords, { icon: vanIcon }).addTo(map);
    vanMarkerRef.current = vanMarker;

    vanMarker.bindPopup(`
      <div style="font-family: sans-serif; padding: 4px; max-width: 220px;">
        <span style="font-size: 10px; font-weight: 800; color: #047857; text-transform: uppercase;">Direct Final-Mile Delivery</span>
        <h4 style="font-weight: 700; font-size: 13px; margin: 2px 0 4px 0;">${driverName}</h4>
        <p style="margin: 0; font-size: 11px; color: #64748b;">${driverVehicle}</p>
        <div style="margin-top: 6px; font-size: 11px; display: flex; justify-content: space-between; background: #f1f5f9; padding: 4px 6px; border-radius: 4px;">
          <span>Temp: <strong style="color: #047857;">3.8°C</strong></span>
          <span>Speed: <strong>26 km/h</strong></span>
        </div>
      </div>
    `);

    // 4. Polylines: Clean direct delivery corridor without intermediate clutter
    // Traveled path (Solid emerald)
    const traveledPath = L.polyline([sourceCoords, currentVanCoords], {
      color: '#059669',
      weight: 5,
      opacity: 0.9,
      lineCap: 'round',
    }).addTo(map);
    traveledLineRef.current = traveledPath;

    // Remaining path (Dashed sky blue)
    const remainingPath = L.polyline([currentVanCoords, destCoords], {
      color: '#0284c7',
      weight: 4,
      dashArray: '6, 8',
      opacity: 0.85,
      lineCap: 'round',
    }).addTo(map);
    remainingLineRef.current = remainingPath;

    return () => {
      map.removeLayer(sourceMarker);
      map.removeLayer(destMarker);
      map.removeLayer(vanMarker);
      map.removeLayer(traveledPath);
      map.removeLayer(remainingPath);
    };
  }, [sourceCoords, destCoords, currentVanCoords, sourceName, customerName, destinationAddress, driverName, driverVehicle]);

  // Recenter map on active vehicle or fit overview
  const handleRecenter = () => {
    if (!mapInstanceRef.current) return;
    mapInstanceRef.current.panTo(currentVanCoords, { animate: true });
  };

  const handleFitOverview = () => {
    if (!mapInstanceRef.current) return;
    mapInstanceRef.current.fitBounds([sourceCoords, destCoords], {
      padding: [45, 45],
      maxZoom: 14,
      animate: true,
    });
  };

  return (
    <div
      className={`bg-white border border-neutral-200 rounded-2xl overflow-hidden shadow-xs ${className}`}
      id="order-interactive-delivery-map"
    >
      {/* Real-time Order Delivery Header */}
      <div className="p-4 sm:p-5 border-b border-neutral-200 bg-neutral-50/80 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-xs flex-shrink-0">
            <Truck className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-neutral-900 text-base">
                {order?.id ? `Order ${order.id} · Live Delivery` : 'Direct Customer Delivery'}
              </h3>
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-ping mr-1.5" />
                Live En Route
              </span>
            </div>
            <p className="text-xs text-neutral-500 mt-0.5">
              Direct final-mile journey from <strong>{sourceName}</strong> to your doorstep
            </p>
          </div>
        </div>

        {/* Live Status Indicators (ETA & Remaining Distance) */}
        <div className="flex items-center gap-2">
          <div className="px-3 py-1.5 bg-white border border-neutral-200 rounded-xl flex items-center gap-2 shadow-xs">
            <Clock className="w-4 h-4 text-emerald-600" />
            <div>
              <span className="text-[10px] text-neutral-400 font-bold block uppercase tracking-wider">
                Est. Arrival
              </span>
              <span className="text-sm font-bold text-neutral-900">{estimatedMins} Mins</span>
            </div>
          </div>

          <div className="px-3 py-1.5 bg-white border border-neutral-200 rounded-xl flex items-center gap-2 shadow-xs">
            <Navigation className="w-4 h-4 text-sky-600" />
            <div>
              <span className="text-[10px] text-neutral-400 font-bold block uppercase tracking-wider">
                Distance
              </span>
              <span className="text-sm font-bold text-neutral-900">{remainingDistanceKm} km away</span>
            </div>
          </div>
        </div>
      </div>

      {/* Real Interactive Leaflet Map Canvas */}
      <div className="relative w-full aspect-[16/9] sm:aspect-[16/8] min-h-[320px] bg-neutral-100">
        <div ref={mapContainerRef} className="absolute inset-0 w-full h-full z-10" />

        {/* Floating In-Map Telemetry HUD */}
        <div className="absolute top-3 right-3 z-20 flex flex-col gap-2 pointer-events-auto">
          <button
            type="button"
            onClick={handleRecenter}
            className="p-2 bg-white/95 hover:bg-white text-neutral-700 hover:text-neutral-900 rounded-lg shadow-md border border-neutral-200 text-xs font-semibold flex items-center gap-1.5 transition-colors"
            title="Recenter on Delivery Van"
          >
            <Compass className="w-4 h-4 text-emerald-600 animate-spin" style={{ animationDuration: '8s' }} />
            <span className="hidden sm:inline">Center Van</span>
          </button>
          <button
            type="button"
            onClick={handleFitOverview}
            className="p-2 bg-white/95 hover:bg-white text-neutral-700 hover:text-neutral-900 rounded-lg shadow-md border border-neutral-200 text-xs font-semibold flex items-center gap-1.5 transition-colors"
            title="Fit Entire Route"
          >
            <Maximize2 className="w-4 h-4 text-sky-600" />
            <span className="hidden sm:inline">Fit Route</span>
          </button>
        </div>

        {/* Floating Simulation Controls & Status Pill */}
        <div className="absolute bottom-3 left-3 right-3 z-20 flex items-center justify-between pointer-events-none">
          <div className="bg-slate-950/90 backdrop-blur-md text-white px-3 py-1.5 rounded-xl border border-slate-800 flex items-center gap-2 text-xs shadow-lg pointer-events-auto">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            <span className="font-semibold text-slate-100">
              {driverVehicle}
            </span>
            <span className="text-slate-400">· {progress}% Complete</span>
          </div>

          <div className="flex items-center gap-1.5 pointer-events-auto">
            <button
              type="button"
              onClick={() => setIsSimulatingMove(!isSimulatingMove)}
              className="bg-white/95 hover:bg-white text-neutral-800 px-2.5 py-1.5 rounded-lg border border-neutral-300 shadow-sm text-xs font-semibold flex items-center gap-1 transition-colors"
            >
              {isSimulatingMove ? (
                <>
                  <Pause className="w-3.5 h-3.5 text-amber-600" />
                  <span className="hidden sm:inline">Pause</span>
                </>
              ) : (
                <>
                  <Play className="w-3.5 h-3.5 text-emerald-600" />
                  <span className="hidden sm:inline">Resume</span>
                </>
              )}
            </button>
            <button
              type="button"
              onClick={() => setProgress(65)}
              className="bg-white/95 hover:bg-white text-neutral-800 px-2.5 py-1.5 rounded-lg border border-neutral-300 shadow-sm text-xs font-semibold flex items-center gap-1 transition-colors"
              title="Reset vehicle progress"
            >
              <RotateCcw className="w-3.5 h-3.5 text-neutral-500" />
              <span className="hidden sm:inline">Reset</span>
            </button>
          </div>
        </div>
      </div>

      {/* Real-time Order Telemetry & Delivery Details Grid */}
      <div className="p-4 sm:p-5 border-t border-neutral-200 bg-white space-y-4">
        {/* Progress Bar & Milestone Timeline */}
        <div className="space-y-2">
          <div className="flex justify-between text-xs text-neutral-500 font-medium">
            <span className="flex items-center gap-1 text-emerald-700 font-semibold">
              <Store className="w-3.5 h-3.5" /> FPO Dispatch: Departed
            </span>
            <span className="text-neutral-400">Direct Route ({totalDistanceKm} km total)</span>
            <span className="flex items-center gap-1 text-sky-700 font-semibold">
              <MapPin className="w-3.5 h-3.5" /> Doorstep Arrival
            </span>
          </div>
          <div className="w-full h-2.5 bg-neutral-100 rounded-full overflow-hidden flex">
            <div
              className="h-full bg-gradient-to-r from-emerald-600 to-teal-500 transition-all duration-500 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* 3 Information Cards: Driver, Temperature Cold-Chain, Dropoff */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {/* Driver & Direct Contact */}
          <div className="p-3.5 bg-neutral-50 rounded-xl border border-neutral-200 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-emerald-100 text-emerald-800 font-bold flex items-center justify-center flex-shrink-0 text-xs border border-emerald-200">
                {driverName.split(' ')[0][0]}
                {driverName.split(' ')[1] ? driverName.split(' ')[1][0] : ''}
              </div>
              <div className="min-w-0">
                <span className="text-[11px] text-neutral-400 font-semibold block uppercase">
                  FPO Logistics Driver
                </span>
                <p className="font-semibold text-neutral-900 text-xs truncate">{driverName}</p>
                <span className="text-[11px] text-emerald-700 font-medium">4.9 ★ · 340+ Drops</span>
              </div>
            </div>

            <div className="flex items-center gap-1 flex-shrink-0">
              <button
                type="button"
                onClick={() => {
                  setContactMode('call');
                  setShowDriverContact(true);
                }}
                className="p-2 rounded-lg bg-white border border-neutral-200 text-neutral-700 hover:text-emerald-700 hover:border-emerald-300 shadow-xs transition-colors"
                title="Call Driver"
              >
                <Phone className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => {
                  setContactMode('message');
                  setShowDriverContact(true);
                }}
                className="p-2 rounded-lg bg-white border border-neutral-200 text-neutral-700 hover:text-sky-700 hover:border-sky-300 shadow-xs transition-colors"
                title="Message Driver"
              >
                <MessageSquare className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Active Cold-Chain Telemetry */}
          <div className="p-3.5 bg-emerald-50/60 rounded-xl border border-emerald-200 flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-emerald-600 text-white flex items-center justify-center flex-shrink-0 shadow-xs">
              <Thermometer className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[11px] text-emerald-800 font-bold block uppercase">
                Active Cold-Chain Sensor
              </span>
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-emerald-950 text-sm">3.8°C Monitored</span>
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              </div>
              <span className="text-[11px] text-emerald-700">Crisp leaf freshness guaranteed</span>
            </div>
          </div>

          {/* Destination Dropoff Details */}
          <div className="p-3.5 bg-neutral-50 rounded-xl border border-neutral-200 flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-sky-100 text-sky-700 flex items-center justify-center flex-shrink-0">
              <MapPin className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <span className="text-[11px] text-neutral-400 font-semibold block uppercase">
                Dropoff Address
              </span>
              <p className="font-semibold text-neutral-900 text-xs truncate" title={destinationAddress}>
                {destinationAddress}
              </p>
              <span className="text-[11px] text-neutral-500">Contactless doorstep delivery</span>
            </div>
          </div>
        </div>

        {/* Order Items Summary in Vehicle */}
        {order?.items && order.items.length > 0 && (
          <div className="p-3 bg-neutral-50 rounded-xl border border-neutral-200 flex items-center justify-between flex-wrap gap-2 text-xs">
            <div className="flex items-center gap-2 text-neutral-700">
              <Package className="w-4 h-4 text-neutral-500" />
              <span className="font-semibold">Items in this Delivery:</span>
              <span className="text-neutral-600">
                {order.items.map((i) => `${i.quantity}x ${i.productName}`).join(' · ')}
              </span>
            </div>
            <div className="font-bold text-emerald-800">
              Total: ₹{order.totalAmount.toFixed(2)}
            </div>
          </div>
        )}

        {/* Driver Contact Interactive Modal/Toast */}
        {showDriverContact && (
          <div className="p-3 bg-emerald-950 text-white rounded-xl text-xs flex items-center justify-between animate-in fade-in slide-in-from-top-2 shadow-lg border border-emerald-800">
            <div className="flex items-center gap-2">
              {contactMode === 'call' ? (
                <Phone className="w-4 h-4 text-emerald-400" />
              ) : (
                <MessageSquare className="w-4 h-4 text-emerald-400" />
              )}
              <span>
                {contactMode === 'call' ? (
                  <>
                    Calling driver <strong>{driverName}</strong> at <strong>{driverPhone}</strong> (Pin: <strong>4829</strong>)...
                  </>
                ) : (
                  <>
                    Chat opened with driver <strong>{driverName}</strong>: &quot;I am arriving in approx {estimatedMins} minutes with your cold-packed produce.&quot;
                  </>
                )}
              </span>
            </div>
            <button
              type="button"
              onClick={() => setShowDriverContact(false)}
              className="text-emerald-300 hover:text-white px-2 py-1 rounded bg-emerald-900 text-[11px] font-medium"
            >
              Dismiss
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

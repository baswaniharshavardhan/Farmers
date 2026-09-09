import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import {
  Truck,
  MapPin,
  Compass,
  ArrowRight,
  TrendingDown,
  Leaf,
  CheckCircle2,
  Clock,
  Boxes,
  RotateCcw,
  Zap,
} from 'lucide-react';
import { useMarketplace } from '../context/MarketplaceContext';

export const LogisticsMap: React.FC<{ height?: string }> = ({ height = '500px' }) => {
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersRef = useRef<L.LayerGroup | null>(null);
  const routePolylineRef = useRef<L.Polyline | null>(null);
  const unoptimizedPolylineRef = useRef<L.LayerGroup | null>(null);

  const { activeBatch, hub, farms, runSimulatedBatchOrder, isSimulating, simulationStepText } =
    useMarketplace();

  const [showUnoptimizedComparison, setShowUnoptimizedComparison] = useState(false);
  const [selectedStop, setSelectedStop] = useState<{
    title: string;
    type: 'farm' | 'hub' | 'buyer';
    details: string;
    boxes?: number;
    sequence?: number;
  } | null>(null);

  // Initialize Leaflet map
  useEffect(() => {
    if (!mapContainerRef.current) return;
    if (mapInstanceRef.current) return;

    // Centered around Bay Area corridor (between Sonoma/Napa and SF/Oakland)
    const map = L.map(mapContainerRef.current, {
      center: [38.08, -122.5],
      zoom: 9,
      scrollWheelZoom: false,
    });

    // Clean, high-contrast CartoDB Positron / OSM tiles
    L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>',
      maxZoom: 18,
    }).addTo(map);

    const markerGroup = L.layerGroup().addTo(map);
    markersRef.current = markerGroup;

    const unoptGroup = L.layerGroup().addTo(map);
    unoptimizedPolylineRef.current = unoptGroup;

    mapInstanceRef.current = map;

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // Update markers and route polylines whenever activeBatch or farms change
  useEffect(() => {
    const map = mapInstanceRef.current;
    const markerGroup = markersRef.current;
    if (!map || !markerGroup) return;

    markerGroup.clearLayers();
    if (unoptimizedPolylineRef.current) {
      unoptimizedPolylineRef.current.clearLayers();
    }
    if (routePolylineRef.current) {
      map.removeLayer(routePolylineRef.current);
      routePolylineRef.current = null;
    }

    const bounds = L.latLngBounds([]);

    // 1. Central Hub Marker
    bounds.extend(hub.coordinates);
    const hubIcon = L.divIcon({
      className: 'custom-map-pin',
      html: `
        <div style="background: #0284c7; color: white; width: 34px; height: 34px; border-radius: 50%; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 10px rgba(0,0,0,0.3); border: 2.5px solid white; font-weight: bold; font-size: 13px;">
          🏢
        </div>
      `,
      iconSize: [34, 34],
      iconAnchor: [17, 17],
    });

    const hubMarker = L.marker(hub.coordinates, { icon: hubIcon }).addTo(markerGroup);
    hubMarker.bindPopup(`
      <div style="font-family: sans-serif; padding: 4px;">
        <h3 style="font-weight: bold; font-size: 14px; margin: 0 0 4px 0; color: #0369a1;">${hub.name}</h3>
        <p style="margin: 0; font-size: 12px; color: #475569;">Central Cold-Chain &amp; Routing Depot</p>
        <div style="margin-top: 6px; font-size: 11px; background: #e0f2fe; padding: 4px 6px; border-radius: 4px; color: #0369a1;">
          Capacity: ${hub.capacityBoxes} crates | Temp: 3.5°C
        </div>
      </div>
    `);
    hubMarker.on('click', () => {
      setSelectedStop({
        title: hub.name,
        type: 'hub',
        details: 'Central regional cold-chain depot where rural collections are aggregated and sorted for urban dispatch.',
      });
    });

    // 2. Rural Farm Pickup Markers
    activeBatch.pickupStops.forEach((stop) => {
      bounds.extend(stop.coordinates);
      const farmIcon = L.divIcon({
        className: 'custom-map-pin',
        html: `
          <div style="background: #059669; color: white; width: 32px; height: 32px; border-radius: 50%; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 10px rgba(0,0,0,0.25); border: 2.5px solid white; font-weight: bold; font-size: 12px; position: relative;">
            🌱
            <span style="position: absolute; -top: 6px; -right: 6px; background: #10b981; color: white; font-size: 9px; font-weight: 800; padding: 1px 4px; border-radius: 8px; border: 1px solid white;">#${stop.sequenceOrder}</span>
          </div>
        `,
        iconSize: [32, 32],
        iconAnchor: [16, 16],
      });

      const marker = L.marker(stop.coordinates, { icon: farmIcon }).addTo(markerGroup);
      marker.bindPopup(`
        <div style="font-family: sans-serif; padding: 4px;">
          <span style="font-size: 10px; font-weight: 700; color: #047857; text-transform: uppercase;">Stop #${stop.sequenceOrder} · Rural Pickup</span>
          <h4 style="font-weight: bold; font-size: 13px; margin: 2px 0 4px 0;">${stop.farmName}</h4>
          <p style="margin: 0; font-size: 12px; color: #334155;">Load: <strong>${stop.boxCount} boxes</strong> (${stop.productSummary})</p>
          <div style="margin-top: 6px; font-size: 11px; color: ${stop.pickedUp ? '#059669' : '#d97706'};">
            ${stop.pickedUp ? '✓ Harvest collected' : '⏳ Ready at farm gate'}
          </div>
        </div>
      `);
      marker.on('click', () => {
        setSelectedStop({
          title: stop.farmName,
          type: 'farm',
          details: `Pickup load: ${stop.boxCount} boxes (${stop.productSummary})`,
          boxes: stop.boxCount,
          sequence: stop.sequenceOrder,
        });
      });
    });

    // 3. Urban Buyer Delivery Markers
    activeBatch.deliveryStops.forEach((stop) => {
      bounds.extend(stop.coordinates);
      const dropIcon = L.divIcon({
        className: 'custom-map-pin',
        html: `
          <div style="background: #7c3aed; color: white; width: 32px; height: 32px; border-radius: 50%; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 10px rgba(0,0,0,0.25); border: 2.5px solid white; font-weight: bold; font-size: 12px; position: relative;">
            🏡
            <span style="position: absolute; -top: 6px; -right: 6px; background: #8b5cf6; color: white; font-size: 9px; font-weight: 800; padding: 1px 4px; border-radius: 8px; border: 1px solid white;">#${stop.sequenceOrder}</span>
          </div>
        `,
        iconSize: [32, 32],
        iconAnchor: [16, 16],
      });

      const marker = L.marker(stop.coordinates, { icon: dropIcon }).addTo(markerGroup);
      marker.bindPopup(`
        <div style="font-family: sans-serif; padding: 4px;">
          <span style="font-size: 10px; font-weight: 700; color: #6d28d9; text-transform: uppercase;">Stop #${stop.sequenceOrder} · Urban Dropoff</span>
          <h4 style="font-weight: bold; font-size: 13px; margin: 2px 0 2px 0;">${stop.buyerName}</h4>
          <p style="margin: 0; font-size: 12px; color: #475569;">${stop.address}</p>
          <div style="margin-top: 4px; font-size: 11px; color: #7c3aed; font-weight: 500;">
            Order: ${stop.orderId}
          </div>
        </div>
      `);
      marker.on('click', () => {
        setSelectedStop({
          title: `Delivery: ${stop.buyerName}`,
          type: 'buyer',
          details: `Address: ${stop.address} · Order ${stop.orderId}`,
          sequence: stop.sequenceOrder,
        });
      });
    });

    // 4. Draw Optimized Batched Polyline Route
    // Hub -> Pickups in sequence -> Hub -> Deliveries in sequence -> Hub
    const orderedPickups = [...activeBatch.pickupStops].sort((a, b) => a.sequenceOrder - b.sequenceOrder);
    const orderedDeliveries = [...activeBatch.deliveryStops].sort((a, b) => a.sequenceOrder - b.sequenceOrder);

    const fullRouteCoords: [number, number][] = [hub.coordinates];
    orderedPickups.forEach((p) => fullRouteCoords.push(p.coordinates));
    fullRouteCoords.push(hub.coordinates);
    orderedDeliveries.forEach((d) => fullRouteCoords.push(d.coordinates));
    fullRouteCoords.push(hub.coordinates);

    const polyline = L.polyline(fullRouteCoords, {
      color: '#059669',
      weight: 4,
      opacity: 0.85,
      dashArray: '8, 8',
      lineCap: 'round',
      lineJoin: 'round',
    }).addTo(map);

    routePolylineRef.current = polyline;

    // 5. Draw Unoptimized routes if toggled (each farm driving individually to hub & city)
    if (showUnoptimizedComparison && unoptimizedPolylineRef.current) {
      activeBatch.pickupStops.forEach((p) => {
        L.polyline([p.coordinates, hub.coordinates], {
          color: '#ef4444',
          weight: 2,
          opacity: 0.6,
          dashArray: '4, 6',
        }).addTo(unoptimizedPolylineRef.current!);
      });
      activeBatch.deliveryStops.forEach((d) => {
        L.polyline([hub.coordinates, d.coordinates], {
          color: '#ef4444',
          weight: 2,
          opacity: 0.6,
          dashArray: '4, 6',
        }).addTo(unoptimizedPolylineRef.current!);
      });
    }

    if (bounds.isValid()) {
      map.fitBounds(bounds, { padding: [40, 40], maxZoom: 11 });
    }
  }, [activeBatch, hub, showUnoptimizedComparison]);

  return (
    <div className="bg-white border border-neutral-200 rounded-2xl shadow-xs overflow-hidden" id="logistics-map-module">
      {/* Module Header with Live Metrics */}
      <div className="p-4 border-b border-neutral-200 bg-neutral-50/70">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800">
                Live Routing Engine
              </span>
              <span className="text-xs font-mono text-neutral-500">{activeBatch.batchCode}</span>
            </div>
            <h3 className="text-base font-bold text-neutral-900 mt-1 flex items-center gap-2">
              Rural-to-Urban Logistics &amp; Batch Optimization
            </h3>
            <p className="text-xs text-neutral-500">
              Consolidating multiple farm pickups into unified refrigerated routes before urban last-mile delivery.
            </p>
          </div>

          {/* Action Simulation Trigger */}
          <div className="flex items-center gap-2.5 flex-wrap">
            <button
              type="button"
              onClick={() => setShowUnoptimizedComparison(!showUnoptimizedComparison)}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg border transition-colors ${
                showUnoptimizedComparison
                  ? 'bg-rose-50 border-rose-300 text-rose-800 font-semibold'
                  : 'bg-white border-neutral-300 text-neutral-700 hover:bg-neutral-50'
              }`}
            >
              {showUnoptimizedComparison ? 'Hide Unoptimized Comparison' : 'Compare vs Unoptimized'}
            </button>

            <button
              type="button"
              onClick={runSimulatedBatchOrder}
              disabled={isSimulating}
              className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-xs font-semibold shadow-xs disabled:opacity-50 transition-all"
              id="btn-run-simulated-batch"
            >
              {isSimulating ? (
                <>
                  <RotateCcw className="w-3.5 h-3.5 animate-spin" />
                  Simulating Batch...
                </>
              ) : (
                <>
                  <Zap className="w-3.5 h-3.5" />
                  Run Simulated Batch Order
                </>
              )}
            </button>
          </div>
        </div>

        {/* Real-time simulation progress banner if active */}
        {isSimulating && (
          <div className="mt-3 p-3 bg-emerald-50 border border-emerald-300 rounded-xl text-xs text-emerald-900 animate-pulse flex items-center gap-2">
            <RotateCcw className="w-4 h-4 animate-spin text-emerald-700 flex-shrink-0" />
            <span className="font-semibold">{simulationStepText}</span>
          </div>
        )}

        {/* Operational Performance Stat Badges */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mt-3 pt-3 border-t border-neutral-200">
          <div className="p-2.5 bg-white rounded-lg border border-neutral-200">
            <div className="flex items-center gap-1.5 text-neutral-500 text-[11px]">
              <TrendingDown className="w-3.5 h-3.5 text-emerald-600" />
              <span>Route Distance Saved</span>
            </div>
            <div className="text-sm font-bold text-neutral-900 mt-0.5">
              {activeBatch.distanceSavedKm} km{' '}
              <span className="text-xs font-semibold text-emerald-600">
                (-
                {Math.round(
                  (activeBatch.distanceSavedKm /
                    (activeBatch.optimizedDistanceKm + activeBatch.distanceSavedKm || 1)) *
                    100
                )}
                %)
              </span>
            </div>
            <div className="text-[10px] text-neutral-400">
              {activeBatch.optimizedDistanceKm} km vs {activeBatch.unoptimizedDistanceKm} km unbatched
            </div>
          </div>

          <div className="p-2.5 bg-white rounded-lg border border-neutral-200">
            <div className="flex items-center gap-1.5 text-neutral-500 text-[11px]">
              <Leaf className="w-3.5 h-3.5 text-emerald-600" />
              <span>Emissions Prevented</span>
            </div>
            <div className="text-sm font-bold text-emerald-700 mt-0.5">
              {activeBatch.co2ReductionKg} kg CO₂
            </div>
            <div className="text-[10px] text-neutral-400">Eliminating separate farm trips</div>
          </div>

          <div className="p-2.5 bg-white rounded-lg border border-neutral-200">
            <div className="flex items-center gap-1.5 text-neutral-500 text-[11px]">
              <Boxes className="w-3.5 h-3.5 text-sky-600" />
              <span>Consolidated Stops</span>
            </div>
            <div className="text-sm font-bold text-neutral-900 mt-0.5">
              {activeBatch.pickupStops.length} pickups · {activeBatch.deliveryStops.length} drops
            </div>
            <div className="text-[10px] text-neutral-400">Single vehicle multi-stop loop</div>
          </div>

          <div className="p-2.5 bg-white rounded-lg border border-neutral-200">
            <div className="flex items-center gap-1.5 text-neutral-500 text-[11px]">
              <Truck className="w-3.5 h-3.5 text-purple-600" />
              <span>Assigned Carrier</span>
            </div>
            <div className="text-sm font-bold text-neutral-900 mt-0.5 truncate">
              {activeBatch.driverName}
            </div>
            <div className="text-[10px] text-neutral-400 truncate">{activeBatch.driverVehicle}</div>
          </div>
        </div>
      </div>

      {/* Leaflet Map Stage */}
      <div className="relative">
        <div ref={mapContainerRef} style={{ height }} className="w-full bg-neutral-100" />

        {/* Map Legend Overlay */}
        <div className="absolute top-3 right-3 z-20 bg-white/90 backdrop-blur-xs p-2.5 rounded-xl border border-neutral-200 shadow-md text-xs space-y-1.5 pointer-events-auto max-w-[210px]">
          <div className="font-semibold text-neutral-800 text-[11px] uppercase tracking-wider">
            Logistics Layer
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-emerald-600 flex-shrink-0" />
            <span className="text-neutral-700 text-[11px]">Rural Farm Pickups (1-3)</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-sky-600 flex-shrink-0" />
            <span className="text-neutral-700 text-[11px]">Central Regional Hub</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-purple-600 flex-shrink-0" />
            <span className="text-neutral-700 text-[11px]">Urban Buyer Drops</span>
          </div>
          <div className="flex items-center gap-2 pt-1 border-t border-neutral-200">
            <span className="w-4 h-0.5 bg-emerald-600 border-b-2 border-emerald-600 border-dashed inline-block" />
            <span className="text-neutral-600 text-[10px]">Batched pickup loop</span>
          </div>
          {showUnoptimizedComparison && (
            <div className="flex items-center gap-2">
              <span className="w-4 h-0.5 bg-red-500 border-b-2 border-red-500 border-dotted inline-block" />
              <span className="text-red-700 text-[10px]">Unbatched trips (+41% dist)</span>
            </div>
          )}
        </div>

        {/* Stop Detail Drawer if selected */}
        {selectedStop && (
          <div className="absolute bottom-3 left-3 z-20 bg-white/95 backdrop-blur-xs p-3 rounded-xl border border-neutral-200 shadow-lg text-xs max-w-sm">
            <div className="flex items-start justify-between gap-3">
              <div>
                <span className="text-[10px] font-bold uppercase text-neutral-400">
                  {selectedStop.sequence ? `Stop #${selectedStop.sequence} · ` : ''}
                  {selectedStop.type === 'farm'
                    ? 'Rural Producer'
                    : selectedStop.type === 'hub'
                    ? 'Consolidation Center'
                    : 'Customer Destination'}
                </span>
                <h4 className="font-bold text-neutral-900 text-sm">{selectedStop.title}</h4>
                <p className="text-neutral-600 mt-1 text-xs">{selectedStop.details}</p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedStop(null)}
                className="text-neutral-400 hover:text-neutral-600 p-1 text-base leading-none"
              >
                ✕
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Sequence Itinerary Bar */}
      <div className="p-3 bg-neutral-50 border-t border-neutral-200 text-xs">
        <div className="flex items-center gap-2 overflow-x-auto pb-1 text-neutral-700 scrollbar-thin">
          <span className="font-semibold text-neutral-500 text-[11px] whitespace-nowrap uppercase tracking-wider">
            Optimized Dispatch Sequence:
          </span>

          <span className="inline-flex items-center gap-1 px-2 py-1 bg-sky-100 text-sky-800 rounded-md whitespace-nowrap font-medium text-[11px]">
            🏢 Start: {hub.name.split(' ')[0]} Hub
          </span>
          <ArrowRight className="w-3 h-3 text-neutral-400 flex-shrink-0" />

          {activeBatch.pickupStops
            .sort((a, b) => a.sequenceOrder - b.sequenceOrder)
            .map((stop, idx) => (
              <React.Fragment key={stop.id}>
                <span
                  className={`inline-flex items-center gap-1 px-2 py-1 rounded-md whitespace-nowrap font-medium text-[11px] ${
                    stop.pickedUp ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                  }`}
                >
                  🌱 Stop #{stop.sequenceOrder}: {stop.farmName.split(' ')[0]} ({stop.boxCount} boxes)
                </span>
                <ArrowRight className="w-3 h-3 text-neutral-400 flex-shrink-0" />
              </React.Fragment>
            ))}

          <span className="inline-flex items-center gap-1 px-2 py-1 bg-sky-100 text-sky-800 rounded-md whitespace-nowrap font-medium text-[11px]">
            🏢 Mid: Cold-Chain Sort
          </span>
          <ArrowRight className="w-3 h-3 text-neutral-400 flex-shrink-0" />

          {activeBatch.deliveryStops
            .sort((a, b) => a.sequenceOrder - b.sequenceOrder)
            .map((stop, idx) => (
              <React.Fragment key={stop.orderId}>
                <span className="inline-flex items-center gap-1 px-2 py-1 bg-purple-100 text-purple-800 rounded-md whitespace-nowrap font-medium text-[11px]">
                  🏡 Stop #{stop.sequenceOrder}: {stop.buyerName.split(' ')[0]} ({stop.address.split(',')[0]})
                </span>
                {idx < activeBatch.deliveryStops.length - 1 && (
                  <ArrowRight className="w-3 h-3 text-neutral-400 flex-shrink-0" />
                )}
              </React.Fragment>
            ))}
        </div>
      </div>
    </div>
  );
};

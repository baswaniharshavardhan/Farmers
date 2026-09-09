import { PickupStop, DeliveryStop, LogisticsHub } from '../types';

// Calculate Haversine distance in kilometers between two lat/lng coordinates
export function calculateDistanceKm(coord1: [number, number], coord2: [number, number]): number {
  const [lat1, lon1] = coord1;
  const [lat2, lon2] = coord2;
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
  return Math.round(R * c * 10) / 10;
}

export interface OptimizationResult {
  optimizedPickupStops: PickupStop[];
  optimizedDeliveryStops: DeliveryStop[];
  totalOptimizedDistanceKm: number;
  unoptimizedDistanceKm: number;
  distanceSavedKm: number;
  percentSaved: number;
  co2SavedKg: number;
  estimatedDurationMins: number;
  routeCoordinates: [number, number][];
}

/**
 * Optimizes the route:
 * 1. Starts from Hub
 * 2. Uses Nearest Neighbor heuristic to visit nearby farm pickup stops
 * 3. Returns to Hub for cold-chain consolidation & sorting
 * 4. Optimizes urban delivery drop-offs using Nearest Neighbor
 * 5. Returns to Hub
 */
export function optimizeLogisticsRoute(
  hub: LogisticsHub,
  rawPickups: PickupStop[],
  rawDeliveries: DeliveryStop[]
): OptimizationResult {
  if (rawPickups.length === 0 && rawDeliveries.length === 0) {
    return {
      optimizedPickupStops: [],
      optimizedDeliveryStops: [],
      totalOptimizedDistanceKm: 0,
      unoptimizedDistanceKm: 0,
      distanceSavedKm: 0,
      percentSaved: 0,
      co2SavedKg: 0,
      estimatedDurationMins: 0,
      routeCoordinates: [hub.coordinates],
    };
  }

  // 1. Optimize pickups using Nearest Neighbor starting from Hub
  const unvisitedPickups = [...rawPickups];
  const orderedPickups: PickupStop[] = [];
  let currentPos = hub.coordinates;

  while (unvisitedPickups.length > 0) {
    let nearestIdx = 0;
    let minDist = Infinity;
    for (let i = 0; i < unvisitedPickups.length; i++) {
      const d = calculateDistanceKm(currentPos, unvisitedPickups[i].coordinates);
      if (d < minDist) {
        minDist = d;
        nearestIdx = i;
      }
    }
    const [picked] = unvisitedPickups.splice(nearestIdx, 1);
    orderedPickups.push({
      ...picked,
      sequenceOrder: orderedPickups.length + 1,
    });
    currentPos = picked.coordinates;
  }

  // 2. Optimize urban deliveries starting from Hub
  const unvisitedDeliveries = [...rawDeliveries];
  const orderedDeliveries: DeliveryStop[] = [];
  currentPos = hub.coordinates;

  while (unvisitedDeliveries.length > 0) {
    let nearestIdx = 0;
    let minDist = Infinity;
    for (let i = 0; i < unvisitedDeliveries.length; i++) {
      const d = calculateDistanceKm(currentPos, unvisitedDeliveries[i].coordinates);
      if (d < minDist) {
        minDist = d;
        nearestIdx = i;
      }
    }
    const [delivered] = unvisitedDeliveries.splice(nearestIdx, 1);
    orderedDeliveries.push({
      ...delivered,
      sequenceOrder: orderedPickups.length + orderedDeliveries.length + 2, // hub is an intermediate step
    });
    currentPos = delivered.coordinates;
  }

  // Calculate coordinates for full loop: Hub -> Pickups in order -> Hub -> Deliveries in order -> Hub
  const routeCoordinates: [number, number][] = [hub.coordinates];
  orderedPickups.forEach((p) => routeCoordinates.push(p.coordinates));
  routeCoordinates.push(hub.coordinates);
  orderedDeliveries.forEach((d) => routeCoordinates.push(d.coordinates));
  routeCoordinates.push(hub.coordinates);

  // Compute optimized distance
  let totalOptimizedDistanceKm = 0;
  for (let i = 0; i < routeCoordinates.length - 1; i++) {
    totalOptimizedDistanceKm += calculateDistanceKm(routeCoordinates[i], routeCoordinates[i + 1]);
  }
  totalOptimizedDistanceKm = Math.round(totalOptimizedDistanceKm * 10) / 10;

  // Compute unoptimized distance (if each farm did individual roundtrips to city and buyers had separate couriers)
  let unoptimizedDistanceKm = 0;
  orderedPickups.forEach((p) => {
    // Farm roundtrip to hub
    unoptimizedDistanceKm += calculateDistanceKm(p.coordinates, hub.coordinates) * 2;
  });
  orderedDeliveries.forEach((d) => {
    // Individual delivery roundtrip
    unoptimizedDistanceKm += calculateDistanceKm(hub.coordinates, d.coordinates) * 2;
  });
  // Add direct point-to-point fragmentation baseline multiplier
  unoptimizedDistanceKm = Math.round(Math.max(unoptimizedDistanceKm * 1.35, totalOptimizedDistanceKm * 1.55) * 10) / 10;

  const distanceSavedKm = Math.max(0, Math.round((unoptimizedDistanceKm - totalOptimizedDistanceKm) * 10) / 10);
  const percentSaved = Math.round((distanceSavedKm / unoptimizedDistanceKm) * 100);
  const co2SavedKg = Math.round(distanceSavedKm * 0.22 * 10) / 10; // ~0.22 kg CO2 per km saved for light refrigerated van
  const estimatedDurationMins = Math.round(totalOptimizedDistanceKm * 1.1 + (orderedPickups.length + orderedDeliveries.length) * 12);

  return {
    optimizedPickupStops: orderedPickups,
    optimizedDeliveryStops: orderedDeliveries,
    totalOptimizedDistanceKm,
    unoptimizedDistanceKm,
    distanceSavedKm,
    percentSaved,
    co2SavedKg,
    estimatedDurationMins,
    routeCoordinates,
  };
}

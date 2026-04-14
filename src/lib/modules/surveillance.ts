import { SurveillanceAlert, Priority } from '../types';

// Mock storage for sessions (in-memory for hackathon)
const global_sos_events: Array<{ geofence: string; symptoms: string[]; timestamp: number }> = [];

export function processSurveillance(geofence: string, symptoms: string[]): SurveillanceAlert | null {
  const now = Date.now();
  const twoHoursAgo = now - (2 * 60 * 60 * 1000);

  // Add event
  global_sos_events.push({ geofence, symptoms, timestamp: now });

  // Filter relevant events in the same geofence within 2 hours
  const relevantEvents = global_sos_events.filter(e => 
    e.geofence === geofence && e.timestamp > twoHoursAgo
  );

  // Requirement: >5 SOS calls from the same Geofence report similar symptoms within 2 hours
  if (relevantEvents.length > 5) {
    return {
      type: 'POTENTIAL_OUTBREAK',
      geofence,
      symptoms: Array.from(new Set(relevantEvents.flatMap(e => e.symptoms))),
      hit_count: relevantEvents.length,
      radius_meters: 5000,
      severity: 'HIGH'
    };
  }

  return null;
}

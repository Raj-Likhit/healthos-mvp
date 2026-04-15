import { SurveillanceAlert, Priority } from '../types';

/**
 * HealthOS Geofence Engine
 * Maps coordinates to logical responding zones.
 */
export function getGeofence(lat: number, lng: number): string {
  // Simple Grid System for Hackathon
  // In a real app, this would use a spatial index or GeoJSON boundaries
  
  if (lat > 12.97 && lng > 77.59) return 'ZONE_ALPHA_NORTH';
  if (lat > 12.97 && lng <= 77.59) return 'ZONE_BETA_WEST';
  if (lat <= 12.97 && lng > 77.59) return 'ZONE_GAMMA_EAST';
  return 'ZONE_DELTA_SOUTH';
}

/**
 * Symptom Normalization Map
 * Resolves various natural language descriptions to forensic categories.
 */
const SYMPTOM_MAP: Record<string, string> = {
  'breathing difficulty': 'RESPIRATORY_DISTRESS',
  'shortness of breath': 'RESPIRATORY_DISTRESS',
  'cannot breathe': 'RESPIRATORY_DISTRESS',
  'chest pain': 'CARDIAC_ANOMALY',
  'heart attack': 'CARDIAC_ANOMALY',
  'bleeding': 'HEMORRHAGE',
  'blood': 'HEMORRHAGE',
  'fever': 'FEBRILE_ILLNESS',
  'cough': 'RESPIRATORY_DISTRESS'
};

function normalizeSymptoms(symptoms: string[]): string[] {
  return Array.from(new Set(
    symptoms.map(s => SYMPTOM_MAP[s.toLowerCase()] || s.toUpperCase().replace(/\s+/g, '_'))
  ));
}

/**
 * Surveillance Engine
 * Analyzes symptoms across a geofence to detect clusters.
 */
export function analyzeCluster(
  geofence: string, 
  symptoms: string[], 
  history: Array<{ geofence: string; symptoms: string[]; timestamp: number }>
): SurveillanceAlert | null {
  // Input Validation
  if (!geofence || !symptoms || symptoms.length === 0) return null;

  const normalizedInputSymptoms = normalizeSymptoms(symptoms);
  const now = Date.now();
  const twoHoursAgo = now - (2 * 60 * 60 * 1000);

  // Filter relevant events in the same geofence within 2 hours
  const relevantEvents = history.filter(e => 
    e.geofence === geofence && e.timestamp > twoHoursAgo
  );

  // Requirement: >5 SOS calls from the same Geofence report similar symptoms within 2 hours
  if (relevantEvents.length > 5) {
    const allRecentSymptoms = relevantEvents.flatMap(e => normalizeSymptoms(e.symptoms));
    
    return {
      type: 'POTENTIAL_OUTBREAK',
      geofence,
      symptoms: Array.from(new Set([...normalizedInputSymptoms, ...allRecentSymptoms])),
      hit_count: relevantEvents.length,
      radius_meters: 5000,
      severity: 'HIGH'
    };
  }

  return null;
}

/**
 * HealthOS Core Types
 * JSON-First Communication Protocol
 */

export type Priority = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
export type ActionType = 'DISPATCH' | 'REROUTE' | 'SYNTHESIZE' | 'SURVEILLANCE_ALERT' | 'REJECT' | 'AUTH_REQUIRED' | 'INFO';

export interface Location {
  lat?: number;
  lng?: number;
  text?: string;
  geofence?: string;
}

export interface TriageResult {
  action: ActionType;
  service?: 'Ambulance' | 'Fire' | 'Police' | 'Telemedicine';
  priority: Priority;
  reason?: string;
  instructions?: string[];
}

export interface Hospital {
  id: string;
  name: string;
  location: Location;
  inventory: {
    beds: number;
    oxygen: boolean;
    blood_groups: string[];
    icu_availability: number;
  };
  status: 'OPEN' | 'LOW' | 'CRITICAL_LOAD';
}

export interface FHIRSummary {
  resourceType: 'Bundle';
  type: 'collection';
  patient_id: string;
  timestamp: string;
  entry: Array<{
    resource: any;
  }>;
  metadata: {
    symptoms: string[];
    vitals_recorded: Record<string, any>;
    provisional_diagnosis: string;
    action_taken: string;
  };
}

export interface SurveillanceAlert {
  type: 'POTENTIAL_OUTBREAK';
  geofence: string;
  symptoms: string[];
  hit_count: number;
  radius_meters: number;
  severity: Priority;
}

export interface HealthOSSession {
  session_id: string;
  current_status: string;
  patient_record?: FHIRSummary;
  auth_status: 'UNAUTHORIZED' | 'OTP_SENT' | 'AUTHORIZED';
  last_location?: Location;
}

export interface OrchestratorResponse {
  session_id: string;
  logic_module: string;
  data: any;
  user_output: string;
  status: string;
}

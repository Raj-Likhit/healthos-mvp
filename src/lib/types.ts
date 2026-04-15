/**
 * HealthOS Core Types
 * JSON-First Communication Protocol
 */

export type Priority = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
export type ActionType = 'DISPATCH' | 'REROUTE' | 'SYNTHESIZE' | 'SURVEILLANCE_ALERT' | 'REJECT' | 'AUTH_REQUIRED' | 'INFO';
export type Language = 'en' | 'te';

export interface Location {
  lat?: number;
  lng?: number;
  text?: string;
  geofence?: string;
}

export interface Extraction {
  what: string;
  why: string;
  where: string;
  who: string;
  how: string;
}

export interface TriageResult {
  action: ActionType;
  service?: 'Ambulance' | 'Fire' | 'Police' | 'Telemedicine';
  priority: Priority;
  reason?: string;
  instructions?: string[];
  symptoms?: string[];
  extraction?: Extraction;
  vocalBiomarkers?: {
    intensity: number;
    stress_detected: boolean;
    tone: 'CALM' | 'DISTRESSED' | 'CRITICAL';
  };
}

export interface Medicine {
  id: string;
  name: string;
  generic_name: string;
  quantity: number;
  unit: 'strips' | 'vials' | 'bottles' | 'boxes';
  expiry_date: string;
  category: 'ANESTHETICS' | 'ANALGESICS' | 'ANTI_INFECTIVE' | 'CARDIOVASCULAR' | 'OTHER';
  confidence_score?: number; // For OCR validation
}

export interface Hospital {
  id: string;
  name: string;
  type: 'MULTI_SPECIALTY' | 'CLINIC' | 'TRAUMA_CENTER' | 'PHARMACY';
  location: Location;
  inventory: {
    beds: number;
    oxygen: boolean;
    blood_groups: string[];
    icu_availability: number;
    medicines: Medicine[];
  };
  capabilities: string[]; // e.g. ["Fracture", "Cardiac", "Dialysis"]
  status: 'OPEN' | 'LOW' | 'CRITICAL_LOAD';
}


export type EmergencyStatus = 'PENDING' | 'ACCEPTED' | 'REJECTED' | 'EN_ROUTE' | 'ARRIVED' | 'COMPLETED';

export interface EmergencyRecord {
  id: string;
  timestamp: string;
  transcript: string;
  extraction: Extraction;
  priority: Priority;
  location: Location;
  status: EmergencyStatus;
  responderId?: string;
  citizenId: string;
  vocalBiomarkers?: {
    intensity: number; // 0-1
    stress_detected: boolean;
    tone: 'CALM' | 'DISTRESSED' | 'CRITICAL';
  };
  assignedHospitalId?: string;
}


export interface FHIRResource {
  resourceType: string;
  id: string;
  [key: string]: any;
}

export interface FHIRBundle {
  resourceType: 'Bundle';
  type: 'document' | 'collection' | 'searchset';
  timestamp: string;
  entry: Array<{
    resource: FHIRResource;
  }>;
}

export interface FHIRSummary extends FHIRBundle {
  patient_id: string;
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



export interface OrchestratorResponse {
  session_id: string;
  logic_module: string;
  data: any;
  user_output: string;
  status: string;
}

export type UserRole = 'Physician' | 'Paramedic' | 'Nurse' | 'Admin' | 'Citizen' | 'Responder';

export interface Toast {
  id: string;
  message: string;
  type: 'success' | 'warning' | 'error' | 'info' | 'clinical';
  duration?: number;
}

export interface SystemMetrics {
  ai_status: 'online' | 'degraded' | 'offline';
  db_status: 'connected' | 'syncing' | 'offline';
  latency: number;
}

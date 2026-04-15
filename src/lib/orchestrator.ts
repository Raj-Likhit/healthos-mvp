import { OrchestratorResponse, EmergencyRecord } from './types';
import { analyzeTriage } from './modules/triage';
import { getHospitalByInventory } from './database';
import { getGeofence } from './modules/surveillance';
import { getPatientById } from './mockPatientData';
import { generateEmergencyBundle, generateMinimalBundle } from './modules/patientRecords';
import { useHealthStore } from './store';

export async function processHealthRequest(sessionId: string, transcript: string, patientId?: string): Promise<OrchestratorResponse> {
  // Phase 1: Clinical Triage (Gemini-Powered)
  const triage = await analyzeTriage(transcript);

  // Phase 2: Identity-Aware Routing
  let hospitalAssignment = null;
  const mockCoords: [number, number] = [12.9716, 77.5946]; 
  const patient = patientId ? getPatientById(patientId) : undefined;
  
  if (triage.action === 'DISPATCH') {
    hospitalAssignment = getHospitalByInventory(triage.priority !== 'LOW', patient?.bloodType);
  }

  // Phase 3: Geofence Surveillance
  const geofence = getGeofence(mockCoords[0], mockCoords[1]);

  // Phase 4: Patient Record Synthesis
  let clinicalBundle = null;
  try {
    clinicalBundle = generateEmergencyBundle(triage, patient, hospitalAssignment);
  } catch (err) {
    console.error('[STITCH_ORCHESTRATOR_SYNTHESIS_CRITICAL]: Synthesis failed.', err);
    clinicalBundle = generateMinimalBundle(triage);
  }

  // Phase 5: Response Synthesis
  const activeAlerts = useHealthStore.getState().surveillanceAlerts;
  const hasOutbreak = activeAlerts.some(a => a.geofence === geofence);
  const warning = hasOutbreak ? `⚠️ BIORISK ALERT: Cluster detected in ${geofence}.\n\n` : '';

  const userOutput = triage.action === 'REJECT' 
    ? `[SAFETY_PROTOCOL_TRIGGERED]: ${triage.instructions?.[0] || 'Medical calculation rejected.'}`
    : triage.action === 'DISPATCH'
      ? `${warning}DISPATCH_SEQUENCE_INITIATED: Sending help to your location. Closest facility: ${hospitalAssignment?.name ?? 'Searching...'}.`
      : `${warning}SYMPTOM_ANALYSIS: ${triage.reason}. Protocol: ${triage.instructions?.join(' ')}`;

  // Side Effect: Creating Emergency Record if Dispatch is triggered
  if (triage.action === 'DISPATCH') {
    const emergency: EmergencyRecord = {
      id: Math.random().toString(36).substring(7),
      timestamp: new Date().toISOString(),
      transcript: transcript,
      extraction: triage.extraction || {
        what: 'Emergency Service Required',
        why: triage.reason || 'Unknown distress',
        where: 'User location',
        who: patientId || 'Unknown Citizen',
        how: 'Voice Request'
      },
      priority: triage.priority,
      location: { lat: mockCoords[0], lng: mockCoords[1], text: triage.extraction?.where || 'Current Location' },
      status: 'PENDING',
      citizenId: patientId || 'ANONYMOUS_CITIZEN'
    };
    
    // We update the state via the hook's getState() or let the component handle it.
    // For this MVP, we'll let the component handle it to avoid side-effects in pure-ish logic,
    // but the response WILL carry the extraction for UI.
  }

  const response: OrchestratorResponse = {
    session_id: sessionId,
    logic_module: 'PHASE_4_ECOSYSTEM_ORCHESTRATOR',
    user_output: userOutput,
    status: triage.action === 'DISPATCH' ? 'EMERGENCY_ACTIVE' : 'STABLE',
    data: {
      triage: triage,
      hospital: hospitalAssignment,
      geofence: geofence,
      symptoms: triage.symptoms || [],
      clinical_bundle: clinicalBundle,
      outbreak_warning: hasOutbreak ? `Active ${geofence} cluster` : undefined,
      extraction: triage.extraction // Essential for Responder UI
    }
  };

  return response;
}

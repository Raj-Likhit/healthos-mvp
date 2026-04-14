import { analyzeTriage } from './modules/triage';
import { getHospitalByInventory } from './database';
import { synthesizeFHIR } from './modules/synthesis';
import { processSurveillance } from './modules/surveillance';
import { OrchestratorResponse, HealthOSSession } from './types';

// Mock state management
const sessions: Record<string, HealthOSSession> = {};

export async function processHealthRequest(
  session_id: string,
  transcript: string,
  geofence: string = 'NYC_DOWNTOWN'
): Promise<OrchestratorResponse> {
  // 1. State Recovery
  if (!sessions[session_id]) {
    sessions[session_id] = {
      session_id,
      current_status: 'INITIALIZING',
      auth_status: 'UNAUTHORIZED'
    };
  }
  const session = sessions[session_id];

  // 2. Module 1: Triage & SOS (High Priority)
  const triage = analyzeTriage(transcript);
  
  // 4. Module 4: Surveillance (Check for patterns across sessions)
  let outbreak_alert = null;
  if (triage.priority === 'HIGH' || triage.priority === 'CRITICAL') {
    const symptoms = [transcript.substring(0, 50)]; 
    const outbreak = processSurveillance(geofence, symptoms);
    if (outbreak) {
      outbreak_alert = outbreak;
    }
  }

  if (triage.action === 'DISPATCH') {
    // 3. Module 2: Inventory-Aware Routing
    const hospital = getHospitalByInventory(true);
    
    session.current_status = 'AMBULANCE_DISPATCHED';
    
    return {
      session_id,
      logic_module: outbreak_alert ? 'TRIAGE + SURVEILLANCE' : 'TRIAGE_AND_SOS',
      data: {
        triage,
        hospital_assignment: hospital,
        action: 'DISPATCH',
        service: 'Ambulance',
        outbreak: outbreak_alert
      },
      user_output: outbreak_alert 
        ? `HealthOS Alert: Potential Outbreak in ${geofence}. Help is on the way to your location. Dispatching to ${hospital?.name || 'nearest trauma center'}.`
        : `Help is on the way to your location. Stay on the line. Dispatching to ${hospital?.name || 'nearest trauma center'}. Apply pressure to any wounds.`,
      status: session.current_status
    };
  }

  // 5. Module 3: Synthesis
  const fhir = synthesizeFHIR({
    patient_id: session_id,
    symptoms: [transcript],
    vitals: {},
    diagnosis: 'Pending assessment',
    action: triage.action
  });
  session.patient_record = fhir;

  return {
    session_id,
    logic_module: 'PATIENT_SYNTHESIS',
    data: { fhir },
    user_output: "System Ready. Record synthesized and pushed to WhatsApp.",
    status: 'RECORD_CREATED'
  };
}

import { FHIRSummary } from '../types';

export function synthesizeFHIR(data: {
  patient_id: string;
  symptoms: string[];
  vitals: Record<string, any>;
  diagnosis: string;
  action: string;
}): FHIRSummary {
  const timestamp = new Date().toISOString();
  
  return {
    resourceType: 'Bundle',
    type: 'collection',
    patient_id: data.patient_id,
    timestamp,
    entry: [
      {
        resource: {
          resourceType: 'Patient',
          id: data.patient_id,
          meta: { lastUpdated: timestamp }
        }
      },
      ...data.symptoms.map((s, i) => ({
        resource: {
          resourceType: 'Observation',
          id: `symp-${i}`,
          status: 'final',
          code: { text: `Symptom: ${s}` },
          effectiveDateTime: timestamp
        }
      })),
      {
        resource: {
          resourceType: 'Condition',
          id: 'diag-0',
          clinicalStatus: { coding: [{ code: 'active', system: 'http://terminology.hl7.org/CodeSystem/condition-clinical' }] },
          code: { text: data.diagnosis },
          subject: { reference: `Patient/${data.patient_id}` }
        }
      }
    ],
    metadata: {
      symptoms: data.symptoms,
      vitals_recorded: data.vitals,
      provisional_diagnosis: data.diagnosis,
      action_taken: data.action
    }
  };
}

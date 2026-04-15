import { TriageResult, Hospital, FHIRResource, FHIRBundle } from '../types';
import { PatientProfile } from '../mockPatientData';

/**
 * Logic Module 4: Patient Record Synthesis
 * Generates a FHIR-lite clinical emergency bundle.
 */
export function generateEmergencyBundle(
  triage: TriageResult,
  patient: PatientProfile | undefined,
  hospital?: Hospital | null
): FHIRBundle {
  try {
    // 1. Validation Logic
    if (!triage) throw new Error('MISSING_TRIAGE_DATA');
    
    const timestamp = new Date().toISOString();
    const bundleId = `ERR-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;

  // 1. Patient Resource
  const patientResource: FHIRResource = {
    resourceType: 'Patient',
    id: patient?.id || 'ANONYMOUS',
    name: [{
      family: patient?.name.split(' ').pop() || 'Unknown',
      given: [patient?.name.split(' ')[0] || 'Anonymous']
    }],
    gender: patient?.gender || 'unknown',
    birthDate: patient?.birthDate || '0000-00-00'
  };

  // 2. Triage/Condition Resource
  const conditionResource: FHIRResource = {
    resourceType: 'Condition',
    id: `COND-${bundleId}`,
    clinicalStatus: 'active',
    severity: triage.priority,
    code: {
      text: triage.reason || 'Clinical Triage Evaluation'
    },
    symptom: triage.symptoms?.map(s => ({ code: { text: s } })) || []
  };

  // 3. Allergies Resource
  const allergyResources = patient?.allergies.map((a, i) => ({
    resource: {
      resourceType: 'AllergyIntolerance',
      id: `ALL-${bundleId}-${i}`,
      code: { text: a },
      criticality: 'high',
      patient: { reference: `Patient/${patient.id}` }
    } as FHIRResource
  })) || [];

  // 4. Medication Resources (Clinical Polish)
  const medicationResources = patient?.medications.map((m, i) => ({
    resource: {
      resourceType: 'MedicationRequest',
      id: `MED-${bundleId}-${i}`,
      status: 'active',
      intent: 'order',
      medicationCodeableConcept: { text: m },
      subject: { reference: `Patient/${patient.id}` }
    } as FHIRResource
  })) || [];

  // 5. Encounter Resource (Forensic Linkage)
  const encounterResource: FHIRResource = {
    resourceType: 'Encounter',
    id: `ENC-${bundleId}`,
    status: 'in-progress',
    class: { system: 'http://terminology.hl7.org/CodeSystem/v3-ActCode', code: 'EMER' },
    subject: { reference: `Patient/${patientResource.id}` },
    reasonCode: [{ text: triage.reason }]
  };

    // 6. Organization (Hospital) Resource
    const organizationResource: FHIRResource | null = hospital ? {
      resourceType: 'Organization',
      id: hospital.id,
      name: hospital.name,
      address: [{ text: hospital.location.text }]
    } : null;

    // Assemble Bundle (Clinical Polish: Composition/Entry structure)
    const bundle: FHIRBundle = {
      resourceType: 'Bundle',
      type: 'document',
      timestamp: timestamp,
      entry: [
        { resource: patientResource },
        { resource: encounterResource },
        { resource: conditionResource },
        ...(organizationResource ? [{ resource: organizationResource }] : []),
        ...allergyResources,
        ...medicationResources
      ]
    };

    return bundle;
  } catch (error) {
    console.error('[HealthOS_Synthesis_Failure]: Switching to Survival Mode.', error);
    return generateMinimalBundle(triage);
  }
}

/**
 * Survival Mode: Generates a minimal, anonymous bundle if full synthesis fails.
 */
export function generateMinimalBundle(triage: TriageResult): FHIRBundle {
  const timestamp = new Date().toISOString();
  return {
    resourceType: 'Bundle',
    type: 'document',
    timestamp: timestamp,
    entry: [
      {
        resource: {
          resourceType: 'Patient',
          id: 'ANONYMOUS_SURVIVAL',
          name: [{ family: 'Anonymous', given: ['Medical'] }]
        } as FHIRResource
      },
      {
        resource: {
          resourceType: 'Condition',
          id: 'COND-SURVIVAL',
          severity: triage?.priority || 'UNKNOWN',
          code: { text: triage?.reason || 'Emergency Triage' }
        } as FHIRResource
      }
    ]
  };
}

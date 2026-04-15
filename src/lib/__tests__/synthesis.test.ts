import { describe, it, expect } from 'vitest';
import { generateEmergencyBundle } from '../modules/patientRecords';
import { TriageResult } from '../types';
import { MOCK_PATIENTS } from '../mockPatientData';

describe('Phase 4: Patient Record Synthesis - Stress Tests', () => {
  const mockTriage: TriageResult = {
    action: 'DISPATCH',
    priority: 'CRITICAL',
    reason: 'Possible Myocardial Infarction',
    symptoms: ['Chest Pain', 'Shortness of Breath'],
    instructions: ['Administer Aspirin', 'Keep patient calm']
  };

  it('should synthesize a full forensic bundle for a valid patient (John Smith)', () => {
    const patient = MOCK_PATIENTS[0]; // John Smith
    const bundle = generateEmergencyBundle(mockTriage, patient);

    expect(bundle.resourceType).toBe('Bundle');
    expect(bundle.entry).toHaveLength(7);
    
    const resources = bundle.entry.map(e => e.resource.resourceType);
    expect(resources).toContain('Patient');
    expect(resources).toContain('Encounter');
    expect(resources).toContain('Condition');
    expect(resources).toContain('AllergyIntolerance');
    expect(resources).toContain('MedicationRequest');
    
    // Check specific clinical data
    const patientResource = bundle.entry.find(e => e.resource.resourceType === 'Patient')?.resource;
    expect(patientResource?.name[0].family).toBe('Smith');
  });

  it('should handle anonymous patients without medical history gracefully', () => {
    const bundle = generateEmergencyBundle(mockTriage, undefined);
    
    expect(bundle.entry).toHaveLength(3); // Patient, Encounter, Condition
    const patientResource = bundle.entry.find(e => e.resource.resourceType === 'Patient')?.resource;
    expect(patientResource?.id).toBe('ANONYMOUS');
    expect(patientResource?.name[0].family).toBe('Unknown');
  });

  it('should trigger Survival Mode if triage data is missing', () => {
    // @ts-ignore - Testing runtime failure
    const bundle = generateEmergencyBundle(null, undefined);
    
    expect(bundle.entry).toHaveLength(2); // Patient, Condition (Minimal Survival)
    const patientResource = bundle.entry.find(e => e.resource.resourceType === 'Patient')?.resource;
    expect(patientResource?.id).toBe('ANONYMOUS_SURVIVAL');
  });

  it('should include correct criticality for allergies', () => {
    const patient = MOCK_PATIENTS[0]; // John Smith
    const bundle = generateEmergencyBundle(mockTriage, patient);
    
    const allergy = bundle.entry.find(e => e.resource.resourceType === 'AllergyIntolerance')?.resource;
    expect(allergy?.criticality).toBe('high');
    expect(allergy?.patient.reference).toBe(`Patient/${patient.id}`);
  });

  it('should link the Encounter to the Patient', () => {
    const patient = MOCK_PATIENTS[0];
    const bundle = generateEmergencyBundle(mockTriage, patient);
    
    const encounter = bundle.entry.find(e => e.resource.resourceType === 'Encounter')?.resource;
    expect(encounter?.subject.reference).toBe(`Patient/${patient.id}`);
    expect(encounter?.status).toBe('in-progress');
  });
});

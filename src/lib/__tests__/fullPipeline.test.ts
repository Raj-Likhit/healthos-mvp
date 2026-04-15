import { describe, it, expect, vi, beforeEach } from 'vitest';
import { processHealthRequest } from '../orchestrator';
import { useHealthStore } from '../store';
import * as ai from '../ai';

describe('HealthOS Full-Pipeline Forensic Verification', () => {
    beforeEach(() => {
        useHealthStore.getState().clearLogs();
        useHealthStore.getState().clearSurveillance();
        vi.clearAllMocks();
    });

    it('should perform Blood-Aware Routing: AB- Patient to AB- Facility', async () => {
        // Mock Triage: Critical hemorrhage requiring blood
        vi.spyOn(ai, 'callGemini').mockResolvedValue(JSON.stringify({
            action: "DISPATCH",
            priority: "CRITICAL",
            reason: "Severe hemorrhage",
            instructions: ["Apply pressure", "Prepare for transfusion"],
            symptoms: ["bleeding", "low blood pressure"]
        }));

        // PATIENT_002 (Jane Doe) has AB- blood. 
        // HOSP_003 (St. Mary's) has 'AB-' and is 'OPEN'.
        const result = await processHealthRequest("trace-1", "I am bleeding out", "PATIENT_002");

        // Verify Phase 2 (Routing) used Phase 4 (Patient Data: AB-)
        expect(result.data.hospital?.name).toBe("St. Mary's Trauma Center");
        expect(result.data.hospital?.inventory.blood_groups).toContain('AB-');
    });

    it('should trigger Surveillance Interlock: Alert Warning in Triage Output', async () => {
        const geofence = 'ZONE_ALPHA_NORTH';
        const symptom = 'fever';

        // 1. Setup Phase 3: Create an outbreak cluster
        for (let i = 0; i < 8; i++) {
            useHealthStore.getState().recordSurveillanceEvent(geofence, [symptom]);
        }
        expect(useHealthStore.getState().surveillanceAlerts.length).toBeGreaterThan(0);

        // 2. Process Phase 1: New Triage in the same zone
        vi.spyOn(ai, 'callGemini').mockResolvedValue(JSON.stringify({
            action: "ADVISE",
            priority: "MEDIUM",
            reason: "Viral symptoms",
            instructions: ["Rest", "Hydrate"],
            symptoms: ["fever"]
        }));

        const result = await processHealthRequest("trace-2", "I have a fever and I'm downtown");
        
        // 3. Verify Interlock
        expect(result.user_output).toContain('BIORISK ALERT');
        expect(result.data.outbreak_warning).toBeDefined();
    });

    it('should establish FHIR-Routing Link: Bundle contains Destination Hospital', async () => {
        vi.spyOn(ai, 'callGemini').mockResolvedValue(JSON.stringify({
            action: "DISPATCH",
            priority: "HIGH",
            reason: "Respiratory distress",
            instructions: ["Oxygen mask"],
            symptoms: ["shortness of breath"]
        }));

        // Use Jane Doe (AB-) to ensure a hospital is assigned (St Mary's)
        const result = await processHealthRequest("trace-3", "I can't breathe", "PATIENT_002");
        
        // Verify Phase 4 (Synthesis) included Phase 2 (Routing) data
        const bundle = result.data.clinical_bundle;
        const orgEntry = bundle.entry.find((e: any) => e.resource.resourceType === 'Organization');
        
        expect(orgEntry).toBeDefined();
        expect(orgEntry.resource.name).toBe(result.data.hospital?.name);
    });

    it('should ensure Clinical-Triage Link: Bundle contains correct symptoms and reason', async () => {
        const mockReason = "Suspected fracture";
        const mockSymptoms = ["leg pain", "swelling"];
        
        vi.spyOn(ai, 'callGemini').mockResolvedValue(JSON.stringify({
            action: "DISPATCH",
            priority: "MEDIUM",
            reason: mockReason,
            instructions: ["Immobilize leg"],
            symptoms: mockSymptoms
        }));

        const result = await processHealthRequest("trace-4", "I fell and my leg hurts", "PATIENT_001");
        
        const bundle = result.data.clinical_bundle;
        const conditionEntry = bundle.entry.find((e: any) => e.resource.resourceType === 'Condition');
        const encounterEntry = bundle.entry.find((e: any) => e.resource.resourceType === 'Encounter');

        expect(conditionEntry.resource.code.text).toContain(mockReason);
        expect(encounterEntry.resource.reasonCode?.[0]?.text).toContain(mockReason);
    });
});

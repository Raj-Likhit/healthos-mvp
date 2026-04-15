import { describe, it, expect, vi, beforeEach } from 'vitest';
import { processHealthRequest } from '../orchestrator';
import { useHealthStore } from '../store';
import * as ai from '../ai';

vi.mock('../ai', () => ({
    callGemini: vi.fn()
}));

describe('Clinical Pipeline Integration (Phases 1-3)', () => {
    beforeEach(() => {
        useHealthStore.getState().clearLogs();
        useHealthStore.getState().clearSurveillance();
        vi.clearAllMocks();
    });

    it('should process a standard clinical request and update all systems', async () => {
        vi.mocked(ai.callGemini).mockResolvedValue(JSON.stringify({
            action: "DISPATCH",
            priority: "HIGH",
            reason: "MOCK_ANALYSIS",
            instructions: ["Keep calm"],
            symptoms: ["fever", "cough"],
            extraction: { what: "Fever", why: "Viral", where: "Zone Alpha", who: "Patient", how: "Acute" },
            vocal_biomarkers: { intensity: 0.5, stress_detected: false, tone: "CALM" }
        }));

        const input = "I have a fever and I'm in zone alpha north";
        const result = await processHealthRequest("test-session-1", input);
        const store = useHealthStore.getState();
        store.processResponse(result);
        if (result.data.geofence && result.data.symptoms) {
            store.recordSurveillanceEvent(result.data.geofence, result.data.symptoms);
        }

        // Verify result structure
        expect(result.data.triage).toBeDefined();
        expect(result.data.triage.priority).toBe('HIGH');
        
        // Verify Phase 1: Logs updated
        const logs = useHealthStore.getState().logs;
        expect(logs.length).toBeGreaterThan(0);
        expect(logs.some(l => l.content.includes('Logic Module triggered'))).toBe(true);

        // Verify Phase 3: Event recorded
        const events = useHealthStore.getState().recordedEvents;
        expect(events.length).toBe(1);
        expect(events[0].geofence).toBe('ZONE_ALPHA_NORTH');
    });

    it('should handle SOS priority and log specific provenance', async () => {
        vi.mocked(ai.callGemini).mockResolvedValue(JSON.stringify({
            action: "DISPATCH",
            priority: "CRITICAL",
            reason: "SOS Detection",
            instructions: ["Immediate action"],
            symptoms: ["unconscious"],
            extraction: { what: "Emergency", why: "Heart Failure", where: "Zone Alpha", who: "Self", how: "Collapse" },
            vocal_biomarkers: { intensity: 0.9, stress_detected: true, tone: "CRITICAL" }
        }));
        
        const input = "I am having a heart attack! I am in zone alpha north";
        const result = await processHealthRequest("test-session-2", input);
        const store = useHealthStore.getState();
        store.processResponse(result);
        if (result.data.geofence && result.data.symptoms) {
            store.recordSurveillanceEvent(result.data.geofence, result.data.symptoms);
        }

        expect(result.data.triage.priority).toBe('CRITICAL');

        const logs = useHealthStore.getState().logs;
        expect(logs.some(l => l.content.includes('Logic Module triggered'))).toBe(true);
    });

    it('should trigger a cluster alert after 6 integrated requests', async () => {
        const input = "I have a cough and fever in zone alpha north";
        
        // Process 7 requests to be well above the threshold of 5
        for (let i = 0; i < 7; i++) {
            const result = await processHealthRequest(`cluster-session-${i}`, input);
            useHealthStore.getState().processResponse(result);
            if (result.data.geofence && result.data.symptoms && result.data.symptoms.length > 0) {
                useHealthStore.getState().recordSurveillanceEvent(result.data.geofence, result.data.symptoms);
            }
        }

        const events = useHealthStore.getState().recordedEvents;
        expect(events.length).toBe(7);

        const alerts = useHealthStore.getState().surveillanceAlerts;
        expect(alerts.length).toBeGreaterThan(0);
        expect(alerts[0].geofence).toBe('ZONE_ALPHA_NORTH');
        expect(alerts[0].hit_count).toBeGreaterThan(5);
    });

    it('should synthesize a FHIR-lite clinical bundle for a known patient', async () => {
        vi.mocked(ai.callGemini).mockResolvedValue(JSON.stringify({
            action: "DISPATCH",
            priority: "MEDIUM",
            reason: "Routine triage for established patient",
            instructions: ["Check vitals"],
            symptoms: ["headache"],
            extraction: { what: "Headache", why: "Stress", where: "Home", who: "John Smith", how: "Dull pain" },
            vocal_biomarkers: { intensity: 0.3, stress_detected: false, tone: "CALM" }
        }));

        const input = "I have a headache and I am John Smith";
        const result = await processHealthRequest("test-session-fhir", input, "PATIENT_001");

        expect(result.data.clinical_bundle).toBeDefined();
        expect(result.data.clinical_bundle.resourceType).toBe('Bundle');
        
        const patientEntry = result.data.clinical_bundle.entry.find((e: any) => e.resource.resourceType === 'Patient');
        expect(patientEntry.resource.name[0].family).toBe('Smith');
        
        const allergyEntries = result.data.clinical_bundle.entry.filter((e: any) => e.resource.resourceType === 'AllergyIntolerance');
        expect(allergyEntries.length).toBeGreaterThan(0);
        expect(allergyEntries.some((e: any) => e.resource.code.text === 'Penicillin')).toBe(true);
    });
});

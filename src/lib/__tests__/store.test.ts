import { describe, it, expect, beforeEach } from 'vitest';
import { useHealthStore } from '../store';

describe('HealthOS Store (Phase 1 & 3 Verification)', () => {
  beforeEach(() => {
    useHealthStore.getState().clearLogs();
    useHealthStore.getState().clearSurveillance();
  });

  it('should maintain state persistence and capping for logs', () => {
    const store = useHealthStore.getState();
    
    // Add 60 logs (should cap at 50)
    for (let i = 0; i < 60; i++) {
        store.addLog({
            type: 'INFO',
            message: `Test log ${i}`,
            provenance: 'AI_CLINICAL',
            timestamp: new Date().toISOString()
        });
    }

    const logs = useHealthStore.getState().logs;
    expect(logs.length).toBeLessThanOrEqual(50);
    expect(logs[logs.length - 1].message).toBe('Test log 59');
  });

  it('should cap surveillance history at MAX_SURVEILLANCE_HISTORY', () => {
    const store = useHealthStore.getState();
    const MAX_HISTORY = 100;

    // Add 120 events
    for (let i = 0; i < 120; i++) {
        store.recordSurveillanceEvent('ZONE_ALPHA_NORTH', ['fever']);
    }

    const events = useHealthStore.getState().recordedEvents;
    expect(events.length).toBe(MAX_HISTORY);
  });

  it('should correctly trigger and store surveillance alerts', () => {
    const store = useHealthStore.getState();
    
    // Trigger an alert (need 6 hits)
    for (let i = 0; i < 6; i++) {
        store.recordSurveillanceEvent('ZONE_BETA_WEST', ['respiratory_distress']);
    }

    const alerts = useHealthStore.getState().surveillanceAlerts;
    expect(alerts.length).toBeGreaterThan(0);
    expect(alerts[0].geofence).toBe('ZONE_BETA_WEST');
    expect(alerts[0].hit_count).toBe(6);
  });
});

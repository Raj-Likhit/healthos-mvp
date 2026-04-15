import { describe, it, expect } from 'vitest';
import { localFallbackTriage } from '../modules/triage';

describe('HealthOS Triage Engine - Local Fallback', () => {
  it('should reject dosage inquiries with HIGH priority', () => {
    const transcript = "What is the dose for paracetamol?";
    const result = localFallbackTriage(transcript);
    
    expect(result.action).toBe('REJECT');
    expect(result.priority).toBe('HIGH');
    expect(result.instructions).toContain('I cannot calculate dosages. Please consult a human doctor immediately.');
  });

  it('should detect CRITICAL keywords and suggest DISPATCH', () => {
    const transcript = "Please help, someone is bleeding in a car accident!";
    const result = localFallbackTriage(transcript);
    
    expect(result.action).toBe('DISPATCH');
    expect(result.priority).toBe('CRITICAL');
    expect(result.service).toBe('Ambulance');
    expect(result.extraction?.what).toBe('Emergency detected via keyword match');
  });

  it('should default to INFO for non-critical routine inquiries', () => {
    const transcript = "I have a slight cough since yesterday.";
    const result = localFallbackTriage(transcript);
    
    expect(result.action).toBe('INFO');
    expect(result.priority).toBe('LOW');
    expect(result.symptoms).toContain('cough');
  });

  it('should handle multiple emergency keywords', () => {
    const transcript = "Help! Choking and unconscious!";
    const result = localFallbackTriage(transcript);
    
    expect(result.priority).toBe('CRITICAL');
    expect(result.action).toBe('DISPATCH');
  });
});

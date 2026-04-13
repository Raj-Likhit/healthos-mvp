import { TriageResult, Priority } from '../types';

const CRITICAL_KEYWORDS = ['bleeding', 'pain', 'accident', 'help', 'sos', 'choking', 'unconscious'];

export function analyzeTriage(transcript: string): TriageResult {
  const lowercaseInput = transcript.toLowerCase();
  
  const isCritical = CRITICAL_KEYWORDS.some(keyword => lowercaseInput.includes(keyword));

  if (isCritical) {
    return {
      action: 'DISPATCH',
      service: 'Ambulance',
      priority: 'CRITICAL',
      reason: 'Detected life-threatening keywords in transcript.',
      instructions: [
        'Stay on the line.',
        'Apply pressure to any visible wounds.',
        'Keep the patient warm and still.'
      ]
    };
  }

  // Check for dosage requests (Strict Safety Protocol)
  if (lowercaseInput.includes('dose') || lowercaseInput.includes('dosage') || lowercaseInput.includes('how much mg')) {
    return {
      action: 'REJECT',
      priority: 'HIGH',
      reason: 'Dose_Calculation_Safety_Protocol',
      instructions: ['Redirecting to a human doctor. I cannot provide dosage calculations.']
    };
  }

  return {
    action: 'INFO',
    priority: 'LOW',
    reason: 'Routine health inquiry detected.'
  };
}

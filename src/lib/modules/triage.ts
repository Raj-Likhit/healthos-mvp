import { TriageResult } from '../types';
import { callGemini } from '../ai';
import { TriageResultSchema } from '../schemas';

const LOCAL_CRITICAL_KEYWORDS = ['bleeding', 'pain', 'accident', 'help', 'sos', 'choking', 'unconscious', 'heart attack', 'emergency', 'bachao', 'madad', 'sahayam'];

const SYSTEM_PROMPT = `
You are the HealthOS Clinical Triage Engine. 
Analyze the medical transcript and return a JSON object. The transcript may be in English, Hindi, or Telugu (including transliterated Telugu/Hindi). Translate internally and parse the details.

VOCAL BIOMARKERS:
In addition to the text, detect the "Intensity" and "Tone" of the emergency from the language used. 
If the user uses words like "EMERGENCY", "BLOOD", "DYING", or repetitive SOS cries, set intensity to > 0.8.
If they are describing a routine symptom, intensity < 0.3.

RULES:
1. If the user asks for dosage (e.g. "how much mg", "what dose"), return ACTION: REJECT.
2. If it is a life-threatening emergency (heart attack, stroke, heavy bleeding, unconscious, severe accident), return ACTION: DISPATCH, SERVICE: Ambulance, PRIORITY: CRITICAL.
3. If it is non-emergency but health-related, return ACTION: INFO, PRIORITY: LOW.
4. Extract the 5 W's (what, why, where, who, how) for ecosystem dispatch.
5. Provide a 'vocal_biomarkers' object based on clinical intensity.

JSON SCHEMA:
{
  "action": "DISPATCH" | "INFO" | "REJECT",
  "service": "Ambulance" | "Fire" | "None",
  "priority": "CRITICAL" | "HIGH" | "MEDIUM" | "LOW",
  "reason": "Detailed clinical rationale",
  "instructions": ["Step 1", "Step 2"],
  "symptoms": ["symptom1", "symptom2"],
  "extraction": {
    "what": "What is occurring?",
    "why": "Why did it happen/Cause?",
    "where": "Specific location or landmarks provided",
    "who": "Identity or description of patient",
    "how": "Manner of injury or state of patient"
  },
  "vocal_biomarkers": {
    "intensity": 0.0 to 1.0,
    "stress_detected": boolean,
    "tone": "CALM" | "DISTRESSED" | "CRITICAL"
  }
}
`;

// Environment verification handled organically at call-level.

export function localFallbackTriage(transcript: string): TriageResult {
  const low = transcript.toLowerCase();
  
  if (low.includes('dose') || low.includes('dosage') || low.includes('how much mg')) {
    return {
      action: 'REJECT',
      priority: 'HIGH',
      reason: 'Safety Protocol: Dosage calculation requested.',
      instructions: ['I cannot calculate dosages. Please consult a human doctor immediately.'],
      symptoms: ['medication_query']
    };
  }

  // Priority mapping for common tokens
  let priority: TriageResult['priority'] = 'LOW';
  let action: TriageResult['action'] = 'INFO';
  let service: TriageResult['service'] = undefined;

  if (LOCAL_CRITICAL_KEYWORDS.some(k => low.includes(k))) {
    priority = 'CRITICAL';
    action = 'DISPATCH';
    service = 'Ambulance';
  } else if (low.includes('fever') || low.includes('vomiting') || low.includes('headache')) {
    priority = low.includes('fever') ? 'HIGH' : (low.includes('vomiting') ? 'MEDIUM' : 'MEDIUM');
    action = 'INFO';
  }

  const symptoms = [];
  if (low.includes('fever')) symptoms.push('fever');
  if (low.includes('cough')) symptoms.push('cough');
  if (low.includes('pain')) symptoms.push('pain');
  if (low.includes('vomiting')) symptoms.push('vomiting');
  if (low.includes('headache')) symptoms.push('headache');

  return {
    action,
    priority,
    service,
    reason: `System-derived analysis based on keyword identification.`,
    instructions: priority === 'CRITICAL' ? ['Stay where you are.', 'Keep the phone line open.'] : ['Monitor symptoms.', 'Consult a clinic if condition persists.'],
    symptoms,
    extraction: {
      what: 'Emergency detected via keyword match',
      why: 'Matched critical tokens in transcript',
      where: 'Triangulating...',
      who: 'User',
      how: 'Voice SOS'
    }
  };
}

export async function analyzeTriage(transcript: string): Promise<TriageResult> {
  const lowercaseInput = transcript.toLowerCase();

  if (lowercaseInput.includes('dose') || lowercaseInput.includes('dosage') || lowercaseInput.includes('how much mg')) {
    return localFallbackTriage(transcript);
  }

  try {
    const aiResponse = await callGemini(
      `Analyze this emergency transcript: "${transcript}"`,
      SYSTEM_PROMPT
    );

    // Robust JSON cleaning
    const sanitized = aiResponse.replace(/```json|```/gi, '').trim();
    const rawResult = JSON.parse(sanitized);

    // AI returns snake_case for some fields, we map to camelCase for our internal schema/types
    const mappedResult = {
      ...rawResult,
      vocalBiomarkers: rawResult.vocal_biomarkers ? {
        intensity: rawResult.vocal_biomarkers.intensity,
        stress_detected: rawResult.vocal_biomarkers.stress_detected,
        tone: rawResult.vocal_biomarkers.tone
      } : undefined
    };

    const parseResult = TriageResultSchema.safeParse(mappedResult);

    if (!parseResult.success) {
      console.error('[TRIAGE_VALIDATION_FAILURE]: Intelligence returned malformed clinical data.', JSON.stringify(parseResult.error.issues, null, 2));
      return {
        ...localFallbackTriage(transcript),
        reason: `[Local-Fallback]: Validation failed. (Reason: Schema Mismatch)`
      };
    }

    const validated = parseResult.data;
    return {
      ...validated,
      reason: `[Gemini-Clinical-v1]: ${validated.reason}`
    } as TriageResult;

  } catch (error) {
    console.error('Gemini Protocol Failure:', error);
    return {
      ...localFallbackTriage(transcript),
      reason: `[Local-Fallback]: ${localFallbackTriage(transcript).reason} (Reason: AI Offline)`
    };
  }
}

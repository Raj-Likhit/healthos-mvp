# HealthOS: Feature & Capability Documentation

HealthOS is a Next-Generation Emergency Response AI Platform designed to transform complex, multi-modal crisis inputs into highly structured, actionable clinical events. It features a decentralized dual-app architecture linking distress inputs (Citizens) with tactical oversight and deployment (Responders/Hospitals).

Below is a detailed breakdown of the ecosystem's core features, underlying technologies, and simulated example cases.

---

## 1. Core Platform Architecture

### Modular HUD Environments
HealthOS replaces traditional generic dashboards with **tactical, role-specific interfaces** built on a premium "glassmorphism" UI featuring real-time visual feedback.
*   **The Citizen Interface (`/citizen`)**: A deeply simplified, high-contrast SOS trigger screen designed for panicked users. Relies on large touch targets, color-coded ambient pulses, and direct voice integration.
*   **The Responder/Dispatch Interface (`/responder`)**: A dark-mode tactical map view combining incoming alerts with a centralized Command Palette, allowing dispatchers to manage routing logically.
*   **The Command Center (`/dashboard`)**: The institutional oversight view where hospital admins can track synchronized inventory (beds, oxygen, blood) and oversee real-time triage feeds.

### Bilingual Localization Engine
To ensure accessibility during emergencies, the entire UI and its underlying interaction prompts are fully localized.
*   **English & Telugu Parity**: Users can instantly toggle the interface between English and localized Telugu.
*   **Vocal Parsing Fallbacks**: The system utilizes multilingual voice recognition, translating inputs transliterated or spoken natively before piping them to the core orchestration layer.

---

## 2. Artificial Intelligence Integration

### AI-Driven Triage Engine
The backbone of the SOS system is powered by Google's **Gemini 2.0 Flash**.
*   **Contextual Extraction**: Instead of relying on rigid drop-down forms, the AI comprehends natural language vocal streams and autonomously extracts the **"5 Ws"** (What, Why, Where, Who, How).
*   **Priority Stratification**: The model assesses the clinical severity of the input, assigning explicit Priority flags (`LOW`, `MEDIUM`, `HIGH`, `CRITICAL`).
*   **Vocal Biomarkers**: Beyond the literal transcript, the AI analyzes the "intensity" and language patterns to detect `STRESS` levels and assign tones such as `CALM` or `CRITICAL` for dispatcher context.

### FHIR 4.0.1 Synthesis
To maintain institutional compliance and interoperability, HealthOS features a built-in module capable of transforming chaotic emergency data (vitals, symptoms, provisional diagnoses) into strictly standardized **HL7 FHIR bundles**.

---

## 3. Clinical Safety & Resilience

### The "Safety-First" Protocol
Operating in a medical context requires hard limitations to AI hallucinations. HealthOS enforces strict rules:
*   **Dosage Rejection Guardrails**: If a user attempts to use the AI to calculate medication dosages (e.g., "how much mg of aspirin should I take?"), the engine throws an immediate `REJECT` action, advising human consultation.
*   **Local Fallback Triaging**: If the cloud AI credentialing fails or latency timeouts occur, a localized regex-based engine catches critical keywords (e.g., *bleeding, accident, heart attack*) to execute a basic triage routing without network connectivity.
*   **Clinical Error Boundaries**: A custom `ClinicalErrorBoundary` traps subsystem faults, preventing blank screens by visually alerting the user of a local protocol violation and offering a safe module reset.

### Inventory-Aware Routing (Mock)
The system attempts to factor dynamic hospital resources (ICU availability, blood groups, specific medicines) before assigning an ambulance, preventing the dispatch of critical trauma patients to under-equipped clinics.

---

## 4. Simulated Example Cases

To illustrate the orchestration pipeline, here are three end-to-end flow examples.

### Example Case A: Critical Trauma Simulation
**Scenario:** A bystander witnesses a severe motorcycle collision.
1.  **Citizen Action:** The user opens the Citizen app (set to Telugu), taps the pulsing microphone, and screams, *"పెద్ద ప్రమాదం జరిగింది, ఒక వ్యక్తికి రక్తం కారుతోంది! జూబ్లీహిల్స్ చెక్‌పోస్ట్ దగ్గర!"* (*"There's been a massive accident, a person is losing blood! Near Jubilee Hills Checkpost!"*)
2.  **Triage Processing:** The AI identifies the critical keywords, transliterates the location schema, and assesses the tone.
3.  **Output Generation:**
    *   **Action:** `DISPATCH` (Service: Ambulance)
    *   **Priority:** `CRITICAL`
    *   **Biomarkers:** Intensity `0.9` | Tone: `DISTRESSED`
    *   **Extraction:** Where: "Jubilee Hills Checkpost" | What: "Massive accident, blood loss".
4.  **Responder Terminal:** The Responder dashboard immediately flashes red, injecting the new payload to the top of the queue for tactical assignment.

### Example Case B: Safety Guardrail Trigger
**Scenario:** A highly anxious user requests pharmaceutical instructions.
1.  **Citizen Action:** The user says into the microphone, *"My head hurts badly, how much mg of Paracetamol should I give a 5-year-old?"*
2.  **Triage Processing:** The Orchestrator string-matches the word "mg" and "how much". The system aborts the Gemini synthesis to prevent liability.
3.  **Output Generation:**
    *   **Action:** `REJECT`
    *   **Priority:** `HIGH`
    *   **Reason:** *"Safety Protocol: Dosage calculation requested."*
4.  **Citizen Screen:** The UI flashes a severe warning informing the citizen that the AI cannot legally calculate dosages and recommends immediate human consultation.

### Example Case C: Geofence Surveillance
**Scenario:** Five distinct users within a 5km radius report similar distinct symptoms (fever, extreme body ache, nausea).
1.  **Ingestion:** HealthOS tracks incoming SOS metadata, noting the coordinates and symptom tags ("fever", "nausea") without relying on Personal Health Information (PHI).
2.  **Synthesis:** The Surveillance Module detects an anomaly hitting its threshold block (`hit_count > 3` in a specific geofence).
3.  **Output Generation:** An automated `POTENTIAL_OUTBREAK` alert is generated.
4.  **Command Center:** Hospital Administrators viewing the `/dashboard` see a new clustered alert pop up alongside their ICU capacity monitors, giving them precious lead time to prepare for an influx of infectious disease patients.

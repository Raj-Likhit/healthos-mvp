# HealthOS MVP: Technical Architecture

This document provides a comprehensive breakdown of the **HealthOS** Logic Engine, designed for high-reliability medical emergency orchestration.

## 1. System Overview
HealthOS operates as a JSON-first orchestration layer that sits between communication channels (e.g., WhatsApp/Twilio) and medical response infrastructure. It utilizes a modular "Logic Pipeline" to process incoming health transcripts.

---

## 2. The Logic Pipeline
The orchestrator (`orchestrator.ts`) manages a strict sequential execution of four clinical modules:

### Module 1: Triage & SOS
**Goal:** Determine immediate patient criticality.
- **Mechanism:** Implements a keyword-based analysis engine.
- **High-Priority Trigger:** Detecting terms like "Bleeding", "Unconscious", "Chest Pain", or "Seizure" initiates an immediate `DISPATCH` state.
- **Safety Protocol:** Specifically intercepts and rejects dosage/medication quantity queries to prevent AI-generated medical errors.

### Module 2: Inventory-Aware Routing
**Goal:** Minimize time-to-care by intelligently selecting facilities.
- **Logic:** Queries a database of local hospitals.
- **Constraint:** Only selects facilities with active inventory for the required trauma level.
- **Status Change:** Transitions the session from `INITIALIZING` to `AMBULANCE_DISPATCHED`.

### Module 3: Patient Record Synthesis
**Goal:** Automate medical documentation for clinical continuity.
- **Standard:** Generates structured data mapped to **FHIR 4.0.1** specifications.
- **Output:** Encapsulates symptoms, suspected diagnosis, and triage priority into a persistent digital record.

### Module 4: Public Health Surveillance
**Goal:** Identify community-level health trends in real-time.
- **Logic:** Aggregates symptoms within specific `geofences` across active sessions.
- **Alerting:** If pattern thresholds are met (e.g., multiple respiratory complaints in one area), it appends a `Geofence Outbreak Alert` to the patient's dispatch metadata.

---

## 3. Tech Stack
- **Frontend HUD:** Next.js 15 (App Router) with custom React hooks for terminal state management.
- **Logic Core:** Type-safe TypeScript modules.
- **Styling:** Vanilla CSS + Tailwind for glassmorphism and command-center aesthetics.
- **Standards:** HL7 FHIR-aligned data structures.

---

## 4. Clinical Safety & Tone
HealthOS maintains a **Clinical/High-Reliability** tone.
- **No Hallucination:** If data is ambiguous, it defaults to `HUMAN_INTERVENTION`.
- **Reduced Motion:** Interactive elements respect `prefers-reduced-motion` for accessibility in high-stress environments.

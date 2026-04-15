import { z } from 'zod';

// Core Enums
const PrioritySchema = z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']);
const ActionTypeSchema = z.enum(['DISPATCH', 'REROUTE', 'SYNTHESIZE', 'SURVEILLANCE_ALERT', 'REJECT', 'AUTH_REQUIRED', 'INFO']);
const EmergencyStatusSchema = z.enum(['PENDING', 'ACCEPTED', 'REJECTED', 'EN_ROUTE', 'ARRIVED', 'COMPLETED']);
const HospitalStatusSchema = z.enum(['OPEN', 'LOW', 'CRITICAL_LOAD']);
const HospitalTypeSchema = z.enum(['MULTI_SPECIALTY', 'CLINIC', 'TRAUMA_CENTER', 'PHARMACY']);
const MedicineCategorySchema = z.enum(['ANESTHETICS', 'ANALGESICS', 'ANTI_INFECTIVE', 'CARDIOVASCULAR', 'OTHER']);

// Base Schemas
const LocationSchema = z.object({
  lat: z.number().optional(),
  lng: z.number().optional(),
  text: z.string().optional(),
  geofence: z.string().optional(),
});

const ExtractionSchema = z.object({
  what: z.string(),
  why: z.string(),
  where: z.string(),
  who: z.string(),
  how: z.string(),
});

// Clinical Schemas
export const MedicineSchema = z.object({
  id: z.string(),
  name: z.string(),
  generic_name: z.string(),
  quantity: z.number(),
  unit: z.enum(['strips', 'vials', 'bottles', 'boxes']),
  expiry_date: z.string(),
  category: MedicineCategorySchema,
  confidence_score: z.number().optional(),
});

export const TriageResultSchema = z.object({
  action: ActionTypeSchema,
  service: z.enum(['Ambulance', 'Fire', 'Police', 'Telemedicine']).optional(),
  priority: PrioritySchema,
  reason: z.string().optional(),
  instructions: z.array(z.string()).optional(),
  symptoms: z.array(z.string()).optional(),
  extraction: ExtractionSchema.optional(),
  vocalBiomarkers: z.object({
    intensity: z.number(),
    stress_detected: z.boolean(),
    tone: z.enum(['CALM', 'DISTRESSED', 'CRITICAL']),
  }).optional(),
});


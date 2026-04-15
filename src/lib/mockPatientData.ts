import { Hospital } from './types';

export interface PatientProfile {
  id: string;
  name: string;
  birthDate: string;
  gender: 'male' | 'female' | 'other';
  allergies: string[];
  medications: string[];
  conditions: string[];
  bloodType: string;
}

export const MOCK_PATIENTS: PatientProfile[] = [
  {
    id: 'PATIENT_001',
    name: 'John Smith',
    birthDate: '1985-06-12',
    gender: 'male',
    allergies: ['Penicillin', 'Peanuts'],
    medications: ['Lisinopril 10mg', 'Metformin 500mg'],
    conditions: ['Hypertension', 'Type 2 Diabetes'],
    bloodType: 'O+'
  },
  {
    id: 'PATIENT_002',
    name: 'Sarah Connor',
    birthDate: '1965-11-22',
    gender: 'female',
    allergies: ['Latex'],
    medications: ['Sertraline 50mg'],
    conditions: ['Hyperthyroidism'],
    bloodType: 'A-'
  },
  {
    id: 'PATIENT_003',
    name: 'James Bond',
    birthDate: '1970-11-11',
    gender: 'male',
    allergies: ['Propofol'],
    medications: ['None'],
    conditions: ['Stable Angina'],
    bloodType: 'AB+'
  }
];

export function getPatientById(id: string): PatientProfile | undefined {
  return MOCK_PATIENTS.find(p => p.id === id);
}

import { Hospital, Medicine } from './types';

const MOCK_MEDICINES: Medicine[] = [
  {
    id: 'MED_001',
    name: 'Aspirin',
    generic_name: 'Acetylsalicylic acid',
    quantity: 100,
    unit: 'strips',
    expiry_date: '2025-12-31',
    category: 'ANALGESICS'
  },
  {
    id: 'MED_002',
    name: 'Paracetamol',
    generic_name: 'Acetaminophen',
    quantity: 150,
    unit: 'strips',
    expiry_date: '2025-10-15',
    category: 'ANALGESICS'
  }
];

export const MOCK_HOSPITALS: Hospital[] = [
  {
    id: 'HOSP_001',
    name: 'City Central General',
    type: 'MULTI_SPECIALTY',
    location: { lat: 40.7128, lng: -74.006, text: 'Downtown Manhattan' },
    inventory: {
      beds: 5,
      oxygen: true,
      blood_groups: ['A+', 'O-', 'B+'],
      icu_availability: 2,
      medicines: [...MOCK_MEDICINES]
    },
    capabilities: ['Cardiac', 'Neurology', 'Surgery'],
    status: 'OPEN',
  },
  {
    id: 'HOSP_002',
    name: 'Eastside Medical Center',
    type: 'MULTI_SPECIALTY',
    location: { lat: 40.7282, lng: -73.9942, text: 'East Village' },
    inventory: {
      beds: 0,
      oxygen: true,
      blood_groups: ['AB+', 'O+'],
      icu_availability: 0,
      medicines: []
    },
    capabilities: ['General Medicine', 'Pediatrics'],
    status: 'LOW',
  },
  {
    id: 'HOSP_003',
    name: 'St. Mary\'s Trauma Center',
    type: 'TRAUMA_CENTER',
    location: { lat: 40.7589, lng: -73.9851, text: 'Times Square' },
    inventory: {
      beds: 12,
      oxygen: true,
      blood_groups: ['O-', 'A-', 'B-', 'AB-'],
      icu_availability: 5,
      medicines: []
    },
    capabilities: ['Trauma', 'Emergency Surgery', 'Burn Unit'],
    status: 'OPEN',
  },
  {
    id: 'CLINIC_001',
    name: 'Suburban Health Clinic',
    type: 'CLINIC',
    location: { lat: 40.7891, lng: -73.9598, text: 'Suburban Block A' },
    inventory: {
      beds: 2,
      oxygen: false,
      blood_groups: ['O+'],
      icu_availability: 0,
      medicines: []
    },
    capabilities: ['Fracture care', 'First Aid', 'General Consult'],
    status: 'OPEN',
  }
];

export function getHospitalByInventory(requiredBed: boolean = true, requiredBloodGroup?: string): Hospital | null {
  // Logic module 2: Inventory-Aware Routing
  const availableHospitals = MOCK_HOSPITALS.filter(h => {
    if (h.status === 'LOW') return false;
    if (requiredBed && h.inventory.beds <= 0) return false;
    if (requiredBloodGroup && !h.inventory.blood_groups.includes(requiredBloodGroup)) return false;
    return true;
  });

  return availableHospitals.length > 0 ? availableHospitals[0] : null;
}

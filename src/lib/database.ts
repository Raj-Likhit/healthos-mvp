import { Hospital } from './types';

export const MOCK_HOSPITALS: Hospital[] = [
  {
    id: 'HOSP_001',
    name: 'City Central General',
    location: { lat: 40.7128, lng: -74.006, text: 'Downtown Manhattan' },
    inventory: {
      beds: 5,
      oxygen: true,
      blood_groups: ['A+', 'O-', 'B+'],
      icu_availability: 2,
    },
    status: 'OPEN',
  },
  {
    id: 'HOSP_002',
    name: 'Eastside Medical Center',
    location: { lat: 40.7282, lng: -73.9942, text: 'East Village' },
    inventory: {
      beds: 0,
      oxygen: true,
      blood_groups: ['AB+', 'O+'],
      icu_availability: 0,
    },
    status: 'LOW',
  },
  {
    id: 'HOSP_003',
    name: 'St. Mary\'s Trauma Center',
    location: { lat: 40.7589, lng: -73.9851, text: 'Times Square' },
    inventory: {
      beds: 12,
      oxygen: true,
      blood_groups: ['O-', 'A-', 'B-', 'AB-'],
      icu_availability: 5,
    },
    status: 'OPEN',
  },
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

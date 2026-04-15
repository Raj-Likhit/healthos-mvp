import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { Hospital, OrchestratorResponse, SurveillanceAlert, UserRole, Toast, SystemMetrics, EmergencyRecord, EmergencyStatus, Medicine, Language } from './types';
import { MOCK_HOSPITALS } from './database';
import { analyzeCluster } from './modules/surveillance';

interface LogEntry {
  type: 'system' | 'user' | 'logic' | 'json' | 'os' | 'error' | 'clinical';
  content: string;
  data?: any;
}

const MAX_LOGS = 50;
const MAX_SURVEILLANCE_HISTORY = 100;

interface HealthState {
  // Core State
  hospitals: Hospital[];
  logs: LogEntry[];
  isProcessing: boolean;
  error: string | null;
  surveillanceAlerts: SurveillanceAlert[];
  recordedEvents: any[];

  theme: 'light' | 'dark';
  
  // Localization
  language: Language;
  setLanguage: (lang: Language) => void;

  // Ecosystem State
  activeEmergency: EmergencyRecord | null;
  emergenciesHistory: EmergencyRecord[];
  
  // Enterprise / Auth
  userRole: UserRole | null;
  toasts: Toast[];
  systemMetrics: SystemMetrics;
  
  // Actions
  addLog: (entry: LogEntry) => void;
  setProcessing: (processing: boolean) => void;
  setError: (error: string | null) => void;
  updateHospitalInventory: (hospitalId: string, bedsChange: number) => void;
  updateMedicineInventory: (hospitalId: string, medicines: Medicine[]) => void;
  resetHospitals: () => void;
  clearLogs: () => void;
  processResponse: (response: OrchestratorResponse) => void;
  recordSurveillanceEvent: (geofence: string, symptoms: string[]) => void;
  clearSurveillance: () => void;
  setTheme: (theme: 'light' | 'dark') => void;
  
  // Ecosystem Actions
  createEmergency: (record: EmergencyRecord) => void;
  updateEmergencyStatus: (status: EmergencyStatus, hospitalId?: string) => void;
  clearActiveEmergency: () => void;
  
  // Enterprise Actions
  setRole: (role: UserRole | null) => void;
  addToast: (toast: Omit<Toast, 'id'>) => void;
  removeToast: (id: string) => void;
  updateMetrics: (metrics: Partial<SystemMetrics>) => void;
}

export const useHealthStore = create<HealthState>()(
  persist(
    (set) => ({
      hospitals: MOCK_HOSPITALS,
      logs: [
        { type: 'system', content: 'HealthOS v1.0.0-alpha: System Ready. Shared Local Persistence Active.' }
      ],
      isProcessing: false,
      error: null,
      surveillanceAlerts: [],
      recordedEvents: [],
      theme: 'dark',
      language: 'en',
      activeEmergency: null,
      emergenciesHistory: [],
      userRole: null,
      toasts: [],
      systemMetrics: {
        ai_status: 'online',
        db_status: 'connected',
        latency: 0
      },

      addLog: (entry) => set((state) => ({ 
        logs: [...state.logs, entry].slice(-MAX_LOGS) 
      })),

      setProcessing: (processing) => set({ isProcessing: processing }),

      setError: (error) => set({ error }),

      clearLogs: () => set({ logs: [] }),

      resetHospitals: () => set({ hospitals: MOCK_HOSPITALS }),

      updateHospitalInventory: (hospitalId, bedsChange) => set((state) => ({
        hospitals: state.hospitals.map((h) => {
          if (h.id === hospitalId) {
            const newBeds = Math.max(0, h.inventory.beds + bedsChange);
            return {
              ...h,
              inventory: { ...h.inventory, beds: newBeds },
              status: newBeds === 0 ? 'CRITICAL_LOAD' : newBeds < 3 ? 'LOW' : 'OPEN'
            };
          }
          return h;
        })
      })),

      updateMedicineInventory: (hospitalId, newMedicines) => set((state) => ({
        hospitals: state.hospitals.map((h) => {
          if (h.id === hospitalId) {
            return {
              ...h,
              inventory: { 
                ...h.inventory, 
                medicines: [...h.inventory.medicines, ...newMedicines] 
              }
            };
          }
          return h;
        })
      })),

      processResponse: (response) => set((state) => {
        const newLogs: LogEntry[] = [
          ...state.logs,
          { type: 'logic', content: `[${response.logic_module}] Logic Module triggered.` },
          response.data?.clinical_bundle ? { 
            type: 'clinical', 
            content: `SYNTHESIZING_HANDOVER_DOC: [SUCCESS]. Resources: ${response.data.clinical_bundle.entry.length}`,
            data: response.data.clinical_bundle 
          } : null,
          { type: 'json', content: JSON.stringify(response.data, null, 2), data: response.data },
          { type: 'os', content: response.user_output }
        ].filter(Boolean) as LogEntry[];
        
        const cappedLogs = newLogs.slice(-MAX_LOGS);

        // Side effect: If a hospital was assigned, decrement beds
        if (response.data?.hospital?.id) {
           const hospitalId = response.data.hospital.id;
           return {
             logs: cappedLogs,
             hospitals: state.hospitals.map((h) => {
               if (h.id === hospitalId) {
                 const newBeds = Math.max(0, h.inventory.beds - 1);
                 return {
                   ...h,
                   inventory: { ...h.inventory, beds: newBeds },
                   status: newBeds === 0 ? 'CRITICAL_LOAD' : newBeds < 3 ? 'LOW' : 'OPEN'
                 };
               }
               return h;
             })
           };
        }

        return { logs: cappedLogs };
      }),

      recordSurveillanceEvent: (geofence, symptoms) => set((state) => {
        const now = Date.now();
        const newEvent = { geofence, symptoms, timestamp: now };
        
        const updatedEvents = [...state.recordedEvents, newEvent].slice(-MAX_SURVEILLANCE_HISTORY);
        const newAlert = analyzeCluster(geofence, symptoms, updatedEvents);

        if (newAlert) {
           const existingAlertIndex = state.surveillanceAlerts.findIndex(a => a.geofence === geofence);
           let updatedAlerts = [...state.surveillanceAlerts];
           if (existingAlertIndex >= 0) {
              updatedAlerts[existingAlertIndex] = newAlert;
           } else {
              updatedAlerts.push(newAlert);
           }
           return { recordedEvents: updatedEvents, surveillanceAlerts: updatedAlerts };
        }
        return { recordedEvents: updatedEvents };
      }),

      clearSurveillance: () => set({ surveillanceAlerts: [], recordedEvents: [] }),

      setTheme: (theme) => set({ theme }),

      setLanguage: (language) => set({ language }),

      setRole: (role) => set({ userRole: role }),

      // Ecosystem Actions
      createEmergency: (emergency) => set((state) => ({
        emergenciesHistory: [emergency, ...state.emergenciesHistory].slice(0, 50),
        activeEmergency: emergency
      })),

      updateEmergencyStatus: (status, hospitalId) => set((state) => ({
        activeEmergency: state.activeEmergency ? { 
          ...state.activeEmergency, 
          status,
          assignedHospitalId: hospitalId || state.activeEmergency.assignedHospitalId 
        } : null,
        // Update history too
        emergenciesHistory: state.emergenciesHistory.map(e => 
          e.id === state.activeEmergency?.id ? { 
            ...e, 
            status, 
            assignedHospitalId: hospitalId || e.assignedHospitalId 
          } : e
        )
      })),

      clearActiveEmergency: () => set({ activeEmergency: null }),

      addToast: (toast) => set((state) => ({
        toasts: [...state.toasts, { ...toast, id: Math.random().toString(36).substring(7) }]
      })),

      removeToast: (id) => set((state) => ({
        toasts: state.toasts.filter((t) => t.id !== id)
      })),

      updateMetrics: (metrics) => set((state) => ({
        systemMetrics: { ...state.systemMetrics, ...metrics }
      })),
    }),
    {
      name: 'health-os-storage',
      version: 1, // Incremented version for Phase 2 schema
      storage: createJSONStorage(() => localStorage),
      migrate: (persistedState: any, version: number) => {
        if (version === 0) {
          // Migration from Phase 1 to Phase 2
          if (persistedState.hospitals) {
            persistedState.hospitals = persistedState.hospitals.map((h: any) => ({
              ...h,
              type: h.type || 'MULTI_SPECIALTY', // Default missing type
              inventory: {
                ...h.inventory,
                medicines: h.inventory.medicines || [] // Ensure medicines array exists
              },
              status: h.status || 'OPEN'
            }));
          }
          if (!persistedState.theme) persistedState.theme = 'dark';
        }
        return persistedState;
      },
      partialize: (state) => ({ 
        hospitals: state.hospitals,
        logs: state.logs,
        surveillanceAlerts: state.surveillanceAlerts,
        recordedEvents: state.recordedEvents,
        theme: state.theme,
        language: state.language,
        activeEmergency: state.activeEmergency,
        emergenciesHistory: state.emergenciesHistory,
        userRole: state.userRole
      }),
    }
  )
);

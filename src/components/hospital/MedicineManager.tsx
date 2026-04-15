'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Pill, Upload, Loader2, CheckCircle, AlertCircle, Package, Calendar, Database } from 'lucide-react';
import { z } from 'zod';
import { useHealthStore } from '@/lib/store';
import { callGemini } from '@/lib/ai';
import { Medicine } from '@/lib/types';
import { MedicineSchema } from '@/lib/schemas';
import { translations } from '@/lib/translations';

const OCR_SYSTEM_PROMPT = `
You are a Clinical Pharmacist Assistant. Your task is to extract medicine details from labels or receipts.
Return a JSON array of Medicine objects.

SCHEMA:
[{
  "name": "Brand Name",
  "generic_name": "Chemical Name",
  "quantity": number,
  "unit": "strips" | "vials" | "bottles" | "boxes",
  "expiry_date": "YYYY-MM-DD",
  "category": "ANESTHETICS" | "ANALGESICS" | "ANTI_INFECTIVE" | "CARDIOVASCULAR" | "OTHER",
  "confidence_score": 0.0 to 1.0
}]

RULES:
1. If text is blurry, set confidence_score < 0.5.
2. Ensure generic_name is the standard clinical name.
3. Quantities must be numbers.
`;

export default function MedicineManager({ hospitalId }: { hospitalId: string }) {
  const { hospitals, updateMedicineInventory, addToast, language } = useHealthStore();
  const [isProcessing, setIsProcessing] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);

  const hospital = hospitals.find(h => h.id === hospitalId);
  const medicines = hospital?.inventory.medicines || [];

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validation: Check file size (e.g., 5MB limit)
    const MAX_FILE_SIZE = 5 * 1024 * 1024;
    if (file.size > MAX_FILE_SIZE) {
      addToast({
        type: 'error',
        message: translations[language].payload_too_large
      });
      return;
    }

    // Preview
    const reader = new FileReader();
    reader.onloadend = () => setPreview(reader.result as string);
    reader.readAsDataURL(file);

    setIsProcessing(true);
    try {
      const base64 = await fileToBase64(file);
      const aiResponse = await callGemini(
        translations[language].ocr_prompt,
        OCR_SYSTEM_PROMPT,
        base64
      );

      // Robust JSON Parsing: Handle potential markdown wrappers
      const cleanJson = aiResponse.replace(/```json/g, '').replace(/```/g, '').trim();
      let detectedMedicines: any[] = [];
      
      try {
        detectedMedicines = JSON.parse(cleanJson);
      } catch (parseErr) {
        console.error('JSON_PARSE_ERR:', parseErr, aiResponse);
        throw new Error(translations[language].malformed_response);
      }
      
      if (!Array.isArray(detectedMedicines)) {
        throw new Error(translations[language].invalid_structure);
      }
      
      // Update store with Zod validation
      const validatedMedicines = detectedMedicines.map((m: any) => {
        const parseResult = MedicineSchema.safeParse({
          ...m,
          id: m.id || `MED_${Math.random().toString(36).substring(7)}`,
          name: m.name || translations[language].unknown_item,
          generic_name: m.generic_name || translations[language].generic_unspecified,
          quantity: typeof m.quantity === 'number' ? m.quantity : 0,
          unit: m.unit || translations[language].units_label,
          expiry_date: m.expiry_date || new Date().toISOString().split('T')[0]
        });

        if (!parseResult.success) {
          console.error('OCR_VALIDATION_ERR:', parseResult.error.issues, m);
          return null;
        }
        return parseResult.data;
      }).filter(Boolean) as Medicine[];

      if (validatedMedicines.length > 0) {
        updateMedicineInventory(hospitalId, validatedMedicines);
        addToast({
          type: 'success',
          message: translations[language].inventory_sync_success.replace('{count}', validatedMedicines.length.toString())
        });
      } else {
        throw new Error(translations[language].no_valid_data);
      }

      setPreview(null);
    } catch (error: any) {
      console.error('OCR_FAILURE:', error);
      addToast({
        type: 'error',
        message: error.message || translations[language].ocr_interrupted
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = error => reject(error);
    });
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-full">
      {/* Upload & Preview Section */}
      <div className="space-y-6">
        <label className="relative group cursor-pointer block">
          <input 
            type="file" 
            className="hidden" 
            accept="image/*" 
            onChange={handleFileUpload}
            disabled={isProcessing}
          />
          <div className={`h-64 rounded-[2rem] border-2 border-dashed flex flex-col items-center justify-center transition-all ${
            isProcessing ? 'border-primary bg-primary/5 animate-pulse' : 'border-border hover:border-primary bg-secondary/20'
          }`}>
            {preview ? (
              <img src={preview} alt="Prescription Preview" className="h-full w-full object-cover rounded-[1.8rem] opacity-50" />
            ) : (
              <>
                <div className="p-4 bg-primary/10 rounded-2xl text-primary mb-4 group-hover:scale-110 transition-transform">
                  <Upload className="w-8 h-8" />
                </div>
                <p className="text-sm font-black uppercase tracking-widest text-foreground">{translations[language].upload_label}</p>
                <p className="text-[10px] font-bold text-muted-foreground uppercase mt-2">{translations[language].ocr_engine_label}</p>
              </>
            )}
            
            {isProcessing && (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-background/60 backdrop-blur-sm rounded-[2rem]">
                <Loader2 className="w-10 h-10 text-primary animate-spin mb-4" />
                <p className="text-xs font-black uppercase tracking-widest">{translations[language].parsing_data}</p>
              </div>
            )}
          </div>
        </label>

        {/* Categories / Stats */}
        <div className="grid grid-cols-2 gap-4">
          <div className="p-6 rounded-3xl bg-secondary/30 border border-border">
            <Package className="w-5 h-5 text-primary mb-3" />
            <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">{translations[language].total_stock}</p>
            <p className="text-2xl font-black mt-1">{medicines.length}</p>
          </div>
          <div className="p-6 rounded-3xl bg-secondary/30 border border-border">
            <Database className="w-5 h-5 text-primary mb-3" />
            <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">{translations[language].sync_status_label}</p>
            <p className="text-xs font-black mt-2 text-emerald-500 uppercase tracking-widest">{translations[language].nominal_status}</p>
          </div>
        </div>
      </div>

      {/* Inventory Table */}
      <div className="p-8 rounded-[2.5rem] bg-secondary/10 border border-border flex flex-col">
        <div className="flex justify-between items-center mb-6">
           <h3 className="text-sm font-black uppercase tracking-widest flex items-center gap-2">
             <Pill className="w-4 h-4 text-primary" /> {translations[language].stock_registry}
           </h3>
           <span className="text-[10px] bg-primary/20 text-primary px-3 py-1 rounded-full font-black uppercase tracking-widest">
             {hospital?.name}
           </span>
        </div>

        <div className="flex-1 overflow-auto space-y-3 pr-2 custom-scrollbar">
          {medicines.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center opacity-40 py-12">
               <Package className="w-12 h-12 mb-4" />
               <p className="text-xs font-bold uppercase tracking-widest">{translations[language].no_meds_detected}</p>
            </div>
          ) : (
            medicines.map((med) => (
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                key={med.id}
                className="p-4 rounded-2xl bg-secondary/40 border border-border flex justify-between items-center group hover:border-primary/50 transition-all"
              >
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-background rounded-xl border border-border group-hover:bg-primary/10 transition-colors">
                    <Pill className="w-4 h-4 text-primary" />
                  </div>
                  <div>
                    <h4 className="text-sm font-black tracking-tight">{med.name}</h4>
                    <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest">{med.generic_name}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-black">
                    {med.quantity} {translations[language][(med.unit.toUpperCase() + '_UNIT') as keyof typeof translations['en']] || med.unit}
                  </p>
                  <div className="flex items-center gap-2 justify-end mt-1">
                    <Calendar className="w-3 h-3 text-muted-foreground" />
                    <p className="text-[9px] font-bold text-muted-foreground uppercase">{med.expiry_date}</p>
                  </div>
                </div>
              </motion.div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

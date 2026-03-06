import React, { createContext, useContext, useState, ReactNode } from 'react';

export interface ScanResult {
  id: string;
  objectName: string;
  material: string;
  category: 'recyclable' | 'compost' | 'non-recyclable' | 'glass' | 'plastic' | 'paper' | 'metal';
  advice: string;
  imageUrl?: string;
  timestamp: Date;
}

interface AppContextType {
  scans: ScanResult[];
  currentScan: ScanResult | null;
  addScan: (scan: ScanResult) => void;
  setCurrentScan: (scan: ScanResult | null) => void;
  updateScan: (id: string, updates: Partial<ScanResult>) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [scans, setScans] = useState<ScanResult[]>([]);
  const [currentScan, setCurrentScan] = useState<ScanResult | null>(null);

  const addScan = (scan: ScanResult) => {
    setScans(prev => [...prev, scan]);
    setCurrentScan(scan);
  };

  const updateScan = (id: string, updates: Partial<ScanResult>) => {
    setScans(prev => prev.map(scan => 
      scan.id === id ? { ...scan, ...updates } : scan
    ));
    if (currentScan?.id === id) {
      setCurrentScan(prev => prev ? { ...prev, ...updates } : null);
    }
  };

  return (
    <AppContext.Provider value={{ scans, currentScan, addScan, setCurrentScan, updateScan }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within AppProvider');
  }
  return context;
}

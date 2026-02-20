// ═══════════════════════════════════════════════════════════════════════════
// useGameStore.ts  —  Bankopoly single source of truth
// ═══════════════════════════════════════════════════════════════════════════

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// ─── Sub-types ────────────────────────────────────────────────────────────────

export type PropertyType =
  | 'house'
  | 'shop'
  | 'bank'
  | 'hospital'
  | 'windmill'
  | 'park';

export interface PlacedProperty {
  plotId:  string;
  type:    PropertyType;
  builtAt: string;
}

export interface LoanRecord {
  id:             string;
  borrowedAmount: number;
  totalOwed:      number;
  repaidAmount:   number;
  fullyRepaid:    boolean;
  takenAt:        string;
}

// ─── Stats block ──────────────────────────────────────────────────────────────
export interface GameStats {
  totalAmountSaved:    number;
  totalInterestEarned: number;
  loansHistory:        LoanRecord[];
  scamsEncountered:    number;
  scamsAvoided:        number;
}

// ─── Full store shape ─────────────────────────────────────────────────────────
interface GameStore {
  wealth:            number;
  savings:           number;
  unlockedBuildings: string[];

  propertyCount:    number;
  placedProperties: Record<string, PlacedProperty>;

  // 🔥 NEW
  selectedProperty: PropertyType | null;
  townLevel: number;

  stats: GameStats;

  claimReward:  (finalNetWorth: number, finalSavings: number) => void;
  syncSavings:  (amount: number) => void;
  resetGameRun: () => void;

  earnProperty:   () => void;
  placeProperty:  (plotId: string, type: PropertyType) => void;
  removeProperty: (plotId: string) => void;

  unlockBuilding: (id: string, cost: number) => void;

  // 🔥 NEW
  setSelectedProperty: (type: PropertyType | null) => void;

  recordSave: (amount: number) => void;
  recordInterest: (amount: number) => void;
  recordLoanTaken: (borrowedAmount: number, totalOwed: number) => string;
  recordLoanRepaid: (amount: number) => void;
  recordScamEncounter: (avoided: boolean) => void;
}

export const useGameStore = create<GameStore>()(
  persist(
    (set, get) => ({
      wealth:            0,
      savings:           0,
      unlockedBuildings: [],
      propertyCount:     0,
      placedProperties:  {},

      // 🔥 NEW
      selectedProperty: null,
      townLevel: 1,

      stats: {
        totalAmountSaved:    0,
        totalInterestEarned: 0,
        loansHistory:        [],
        scamsEncountered:    0,
        scamsAvoided:        0,
      },

      claimReward: (finalNetWorth, finalSavings) =>
        set((s) => ({ wealth: s.wealth + finalNetWorth, savings: finalSavings })),

      syncSavings: (amount) => set({ savings: amount }),

      resetGameRun: () => set({ savings: 0 }),

      earnProperty: () =>
        set((s) => ({ propertyCount: s.propertyCount + 1 })),

      // 🔥 UPDATED
      placeProperty: (plotId, type) => {
        const { propertyCount, placedProperties } = get();
        if (propertyCount <= 0)       return;
        if (placedProperties[plotId]) return;

        set((s) => ({
          propertyCount: s.propertyCount - 1,
          placedProperties: {
            ...s.placedProperties,
            [plotId]: { plotId, type, builtAt: new Date().toISOString() },
          },
          townLevel: s.townLevel + 1,       // 🔥 town grows
          wealth: s.wealth + 100,           // 🔥 reward for building
          selectedProperty: null,
        }));
      },

      removeProperty: (plotId) => {
        const { placedProperties } = get();
        if (!placedProperties[plotId]) return;
        const next = { ...placedProperties };
        delete next[plotId];
        set((s) => ({
          propertyCount: s.propertyCount + 1,
          placedProperties: next,
        }));
      },

      unlockBuilding: (id, cost) => {
        const { wealth, unlockedBuildings } = get();
        if (unlockedBuildings.includes(id)) return;
        if (wealth < cost) return;

        set((s) => ({
          wealth:            s.wealth - cost,
          unlockedBuildings: [...s.unlockedBuildings, id],
        }));
      },

      // 🔥 NEW
      setSelectedProperty: (type) =>
        set(() => ({ selectedProperty: type })),

      recordSave: (amount) =>
        set((s) => ({
          stats: { ...s.stats, totalAmountSaved: s.stats.totalAmountSaved + amount },
        })),

      recordInterest: (amount) =>
        set((s) => ({
          stats: { ...s.stats, totalInterestEarned: s.stats.totalInterestEarned + amount },
        })),

      recordLoanTaken: (borrowedAmount, totalOwed) => {
        const id =
          typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function'
            ? crypto.randomUUID()
            : Date.now().toString();

        const record: LoanRecord = {
          id,
          borrowedAmount,
          totalOwed,
          repaidAmount: 0,
          fullyRepaid:  false,
          takenAt:      new Date().toISOString(),
        };

        set((s) => ({
          stats: { ...s.stats, loansHistory: [...s.stats.loansHistory, record] },
        }));

        return id;
      },

      recordLoanRepaid: (amount) =>
        set((s) => {
          let patched = false;

          const loansHistory = s.stats.loansHistory.map((loan) => {
            if (patched || loan.fullyRepaid) return loan;
            patched = true;
            const newRepaid = loan.repaidAmount + amount;
            return {
              ...loan,
              repaidAmount: newRepaid,
              fullyRepaid: newRepaid >= loan.totalOwed,
            };
          });

          return { stats: { ...s.stats, loansHistory } };
        }),

      recordScamEncounter: (avoided) =>
        set((s) => ({
          stats: {
            ...s.stats,
            scamsEncountered: s.stats.scamsEncountered + 1,
            scamsAvoided: avoided ? s.stats.scamsAvoided + 1 : s.stats.scamsAvoided,
          },
        })),
    }),
    {
      name: 'bankopoly-store',
      partialize: (s) => ({
        wealth:            s.wealth,
        savings:           s.savings,
        unlockedBuildings: s.unlockedBuildings,
        propertyCount:     s.propertyCount,
        placedProperties:  s.placedProperties,
        stats:             s.stats,
        townLevel:         s.townLevel,      // 🔥 persist town growth
      }),
      
    }
  )
);

// ─── Selectors ───────────────────────────────────────────────────────────────
export const useWealth            = () => useGameStore((s) => s.wealth);
export const useSavingsMirror     = () => useGameStore((s) => s.savings);
export const useUnlockedBuildings = () => useGameStore((s) => s.unlockedBuildings);
export const usePropertyCount     = () => useGameStore((s) => s.propertyCount);
export const usePlacedProperties  = () => useGameStore((s) => s.placedProperties);
export const useGameStats         = () => useGameStore((s) => s.stats);
export const useTownLevel         = () => useGameStore((s) => s.townLevel);
export const useSelectedProperty  = () => useGameStore((s) => s.selectedProperty);

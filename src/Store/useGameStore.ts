// ═══════════════════════════════════════════════════════════════════════════
// useGameStore.ts  —  Bankopoly single source of truth
//
// Screens that read this store:
//   BoardGame  — writes everything, reads `wealth`
//   TownMap    — reads propertyCount, placedProperties, wealth
//   Dashboard  — reads stats block
//
// PERSISTED (survives hard refresh):
//   wealth, savings, unlockedBuildings,
//   propertyCount, placedProperties,
//   stats (cumulative across all runs)
//
// NOT PERSISTED (local BoardGame useState handles these):
//   coins, pos, diceVal, rolling, loanActive, loanRemaining, ownedTiles …
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

/**
 * One loan event — pushed when taken, updated in-place when repaid.
 * Dashboard derives counts, totals, and history from this array.
 */
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
  /** Cumulative ZenCoins deposited to savings across all runs. */
  totalAmountSaved:    number;

  /** Cumulative interest coins received from EARN tiles. */
  totalInterestEarned: number;

  /** Full loan history — dashboard derives counts/totals from this. */
  loansHistory:        LoanRecord[];

  /** Total SCAM tiles landed on. */
  scamsEncountered:    number;

  /** How many scams the player successfully avoided (Ignore button). */
  scamsAvoided:        number;
}

// ─── Full store shape ─────────────────────────────────────────────────────────
interface GameStore {
  // ── Cross-screen ─────────────────────────────────────────────────────────
  wealth:            number;
  savings:           number;
  unlockedBuildings: string[];

  // ── Property deed system ──────────────────────────────────────────────────
  propertyCount:    number;
  placedProperties: Record<string, PlacedProperty>;

  // ── Dashboard stats (cumulative, never reset) ─────────────────────────────
  stats: GameStats;

  // ── Actions ───────────────────────────────────────────────────────────────

  // Board-game lifecycle
  claimReward:  (finalNetWorth: number, finalSavings: number) => void;
  syncSavings:  (amount: number) => void;
  resetGameRun: () => void;

  // Property deed system
  earnProperty:   () => void;
  placeProperty:  (plotId: string, type: PropertyType) => void;
  removeProperty: (plotId: string) => void;

  // Plot unlocks (wealth-gated)
  unlockBuilding: (id: string, cost: number) => void;

  // ── Dashboard stat recorders ──────────────────────────────────────────────

  /** Player deposited `amount` coins into savings. */
  recordSave: (amount: number) => void;

  /** Player collected `amount` interest from an EARN tile. */
  recordInterest: (amount: number) => void;

  /**
   * Player took a loan.
   * Returns the new loan id (useful if caller needs to reference it later).
   */
  recordLoanTaken: (borrowedAmount: number, totalOwed: number) => string;

  /**
   * `amount` coins were used at GO to repay the oldest active loan.
   * Updates repaidAmount + fullyRepaid flag on that record.
   */
  recordLoanRepaid: (amount: number) => void;

  /**
   * Player landed on a SCAM tile and made a choice.
   * avoided = true  → "Ignore & Report" path
   * avoided = false → "Give OTP" path
   */
  recordScamEncounter: (avoided: boolean) => void;
}

// ─── Store ────────────────────────────────────────────────────────────────────
export const useGameStore = create<GameStore>()(
  persist(
    (set, get) => ({
      // ── Initial state ─────────────────────────────────────────────────────
      wealth:            0,
      savings:           0,
      unlockedBuildings: [],
      propertyCount:     0,
      placedProperties:  {},
      stats: {
        totalAmountSaved:    0,
        totalInterestEarned: 0,
        loansHistory:        [],
        scamsEncountered:    0,
        scamsAvoided:        0,
      },

      // ── Board-game lifecycle ──────────────────────────────────────────────
      claimReward: (finalNetWorth, finalSavings) =>
        set((s) => ({ wealth: s.wealth + finalNetWorth, savings: finalSavings })),

      syncSavings: (amount) => set({ savings: amount }),

      resetGameRun: () => set({ savings: 0 }),

      // ── Property deed system ──────────────────────────────────────────────
      earnProperty: () =>
        set((s) => ({ propertyCount: s.propertyCount + 1 })),

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
        }));
      },

      removeProperty: (plotId) => {
        const { placedProperties } = get();
        if (!placedProperties[plotId]) return;
        const next = { ...placedProperties };
        delete next[plotId];
        set((s) => ({ propertyCount: s.propertyCount + 1, placedProperties: next }));
      },

      // ── Plot unlocks ──────────────────────────────────────────────────────
      unlockBuilding: (id, cost) => {
        const { wealth, unlockedBuildings } = get();
        if (unlockedBuildings.includes(id)) return;
        if (wealth < cost)                  return;
        set((s) => ({
          wealth:            s.wealth - cost,
          unlockedBuildings: [...s.unlockedBuildings, id],
        }));
      },

      // ── Stat recorders ────────────────────────────────────────────────────
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
          // Patch only the first un-fully-repaid loan
          let patched = false;
          const loansHistory = s.stats.loansHistory.map((loan) => {
            if (patched || loan.fullyRepaid) return loan;
            patched = true;
            const newRepaid = loan.repaidAmount + amount;
            return { ...loan, repaidAmount: newRepaid, fullyRepaid: newRepaid >= loan.totalOwed };
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
      }),
    }
  )
);

// ─── Convenience selectors ────────────────────────────────────────────────────
export const useWealth            = () => useGameStore((s) => s.wealth);
export const useSavingsMirror     = () => useGameStore((s) => s.savings);
export const useUnlockedBuildings = () => useGameStore((s) => s.unlockedBuildings);
export const usePropertyCount     = () => useGameStore((s) => s.propertyCount);
export const usePlacedProperties  = () => useGameStore((s) => s.placedProperties);
export const useGameStats         = () => useGameStore((s) => s.stats);

// ─── Pure dashboard helper (no Zustand, use anywhere) ────────────────────────
export function deriveDashboardData(stats: GameStats) {
  const totalLoansTaken  = stats.loansHistory.length;
  const totalBorrowed    = stats.loansHistory.reduce((a, l) => a + l.borrowedAmount, 0);
  const totalRepaid      = stats.loansHistory.reduce((a, l) => a + l.repaidAmount, 0);
  const activeLoans      = stats.loansHistory.filter((l) => !l.fullyRepaid).length;
  const scamAvoidRate    = stats.scamsEncountered > 0
    ? Math.round((stats.scamsAvoided / stats.scamsEncountered) * 100)
    : 0;

  return {
    // raw
    ...stats,
    // derived
    totalLoansTaken,
    totalBorrowed,
    totalRepaid,
    activeLoans,
    scamAvoidRate,
  };
}
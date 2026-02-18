// ═══════════════════════════════════════════════════════════════════════════
// useGameStore.ts
//
// Single source of truth shared between BoardGame ↔ TownMap.
//
// WHAT LIVES HERE:
//   • wealth        — ZenCoins carried over from the board game when the
//                     player wins. This is the currency the TownMap uses
//                     to unlock / buy buildings. It is ONLY written once:
//                     when the player hits the Win threshold and clicks
//                     "Claim". After that BoardGame resets; TownMap reads.
//
//   • savings       — mirrors the live in-game savings balance so TownMap
//                     (and any future screen) can always read it, even mid-game.
//
//   • unlockedBuildings — set of building IDs the player has purchased in
//                     TownMap. Persisted across page refreshes.
//
// WHAT DOES NOT LIVE HERE:
//   • coins, pos, diceVal, rolling … — pure UI / gameplay state that only
//     BoardGame needs. Keep those in local useState (no overhead, no confusion).
// ═══════════════════════════════════════════════════════════════════════════

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// ─── Shape ───────────────────────────────────────────────────────────────────
interface GameStore {
  // ── Cross-screen values ──────────────────────────────────────────────────
  /**
   * wealth: the final ZenCoin balance carried from BoardGame → TownMap.
   * Written exactly once per run (on game win). TownMap spends from this.
   */
  wealth: number;

  /**
   * savings: live mirror of the player's in-game savings balance.
   * BoardGame keeps it in sync on every change so TownMap can read it
   * even while a game is in progress (e.g. for a "current savings" widget).
   */
  savings: number;

  /**
   * unlockedBuildings: IDs of buildings the player has bought in TownMap.
   * Persisted — survives page refresh.
   */
  unlockedBuildings: string[];

  // ── Actions ──────────────────────────────────────────────────────────────

  /**
   * Called by BoardGame the moment the player wins (clicks "Claim").
   * Adds `finalNetWorth` to any existing wealth so multiple runs stack up.
   * Also snapshots the final savings balance.
   */
  claimReward: (finalNetWorth: number, finalSavings: number) => void;

  /**
   * Called by BoardGame on every savings change (deposit, withdrawal,
   * interest, etc.) so the store mirror stays in sync.
   */
  syncSavings: (amount: number) => void;

  /**
   * Called by TownMap when the player buys a building.
   * Deducts `cost` from `wealth`. No-ops if already owned or can't afford.
   */
  unlockBuilding: (id: string, cost: number) => void;

  /**
   * Resets the in-progress game state (savings mirror) without touching
   * wealth or unlockedBuildings — useful when starting a new game run
   * after already having visited the TownMap.
   */
  resetGameRun: () => void;
}

// ─── Store ───────────────────────────────────────────────────────────────────
export const useGameStore = create<GameStore>()(
  persist(
    (set, get) => ({
      // ── Initial state ───────────────────────────────────────────────────
      wealth: 0,
      savings: 0,
      unlockedBuildings: [],

      // ── claimReward ─────────────────────────────────────────────────────
      // Called once when player wins. Stacks wealth across runs.
      claimReward: (finalNetWorth, finalSavings) =>
        set((state) => ({
          wealth: state.wealth + finalNetWorth,
          savings: finalSavings,
        })),

      // ── syncSavings ──────────────────────────────────────────────────────
      // Keep the store mirror in sync with every BoardGame savings change.
      syncSavings: (amount) => set({ savings: amount }),

      // ── unlockBuilding ───────────────────────────────────────────────────
      unlockBuilding: (id, cost) => {
        const { wealth, unlockedBuildings } = get();
        if (unlockedBuildings.includes(id)) return;  // already owned
        if (wealth < cost) return;                   // can't afford
        set((state) => ({
          wealth: state.wealth - cost,
          unlockedBuildings: [...state.unlockedBuildings, id],
        }));
      },

      // ── resetGameRun ─────────────────────────────────────────────────────
      // Start a fresh board-game run without wiping TownMap progress.
      resetGameRun: () => set({ savings: 0 }),
    }),
    {
      name: 'bankopoly-store',   // localStorage key
      // Only persist what needs to survive a hard refresh.
      // In-game transient state (coins, pos, etc.) lives in BoardGame useState.
      partialize: (state) => ({
        wealth:             state.wealth,
        savings:            state.savings,
        unlockedBuildings:  state.unlockedBuildings,
      }),
    }
  )
);

// ─── Convenience selectors (use these in components for clean reads) ──────────
// e.g.  const wealth = useWealth();
export const useWealth            = () => useGameStore((s) => s.wealth);
export const useSavingsMirror     = () => useGameStore((s) => s.savings);
export const useUnlockedBuildings = () => useGameStore((s) => s.unlockedBuildings);
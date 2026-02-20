// ═══════════════════════════════════════════════════════════════════════════
// useGameStore.ts  (updated)
//
// NEW in this version:
//   • plotPlacements   — maps plot index (0-7) → building id placed there
//                        Used by TownMap's PlotSystem to render placed buildings
//   • townLevel        — derived from number of placed buildings (for Frame 13)
//   • placeBuilding    — places a building on a specific plot index
//   • removePlacement  — removes a building from a plot (admin / future)
//
// All existing fields + actions are preserved unchanged.
// ═══════════════════════════════════════════════════════════════════════════

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// ─── Shape ───────────────────────────────────────────────────────────────────
interface GameStore {
  // ── Cross-screen values ──────────────────────────────────────────────────
  /**
   * wealth: final ZenCoin balance carried from BoardGame → TownMap.
   * Written exactly once per run (on game win). TownMap spends from this.
   */
  wealth: number;

  /**
   * savings: live mirror of the player's in-game savings balance.
   * BoardGame keeps it in sync on every change.
   */
  savings: number;

  /**
   * unlockedBuildings: IDs of buildings the player has bought / earned.
   * Persisted — survives page refresh.
   */
  unlockedBuildings: string[];

  /**
   * plotPlacements: maps plot index (0–7 for the 8 outer plots in PlotSystem)
   * to the building ID placed there, or null if empty.
   *
   * The 3×3 grid layout (bank at centre index 4 of the grid):
   *   plotIndex 0 → grid[0,0]  plotIndex 1 → grid[0,1]  plotIndex 2 → grid[0,2]
   *   plotIndex 3 → grid[1,0]  [BANK centre]             plotIndex 4 → grid[1,2]
   *   plotIndex 5 → grid[2,0]  plotIndex 6 → grid[2,1]  plotIndex 7 → grid[2,2]
   */
  plotPlacements: Record<number, string | null>;

  /**
   * townLevel: increases by 5 for each building placed.
   * Shown in Frame 13 and the TownMap HUD.
   */
  townLevel: number;

  // ── Actions ──────────────────────────────────────────────────────────────

  /**
   * claimReward: called by BoardGame when the player wins.
   * Adds finalNetWorth to wealth, snapshots final savings,
   * and auto-unlocks the 'house' building (frame 10 reward).
   */
  claimReward: (finalNetWorth: number, finalSavings: number) => void;

  /**
   * syncSavings: called by BoardGame on every savings change.
   */
  syncSavings: (amount: number) => void;

  /**
   * unlockBuilding: called by TownMap when the player buys a building.
   * Deducts cost from wealth. No-ops if already owned or can't afford.
   * For free buildings (cost=0, e.g. house earned from win) always succeeds.
   */
  unlockBuilding: (id: string, cost: number) => void;

  /**
   * placeBuilding: places an unlocked building onto a specific plot.
   * No-ops if:
   *   - building is not in unlockedBuildings
   *   - plot already occupied
   *   - plotIndex out of range (0-7)
   * Increases townLevel by 5 on success.
   */
  placeBuilding: (buildingId: string, plotIndex: number) => void;

  /**
   * removePlacement: removes a building from a plot (for future redesign feature).
   * Does NOT put the building back in inventory — call unlockBuilding again if needed.
   */
  removePlacement: (plotIndex: number) => void;

  /**
   * resetGameRun: resets in-progress game state without wiping TownMap progress.
   */
  resetGameRun: () => void;
}

// ─── Store ───────────────────────────────────────────────────────────────────
export const useGameStore = create<GameStore>()(
  persist(
    (set, get) => ({
      // ── Initial state ───────────────────────────────────────────────────
      wealth:           0,
      savings:          0,
      unlockedBuildings: [],
      plotPlacements:   {},
      townLevel:        1,

      // ── claimReward ─────────────────────────────────────────────────────
      claimReward: (finalNetWorth, finalSavings) =>
        set((state) => ({
          wealth: state.wealth + finalNetWorth,
          savings: finalSavings,
          // Auto-unlock 'house' as the win reward (Frame 10)
          unlockedBuildings: state.unlockedBuildings.includes('house')
            ? state.unlockedBuildings
            : [...state.unlockedBuildings, 'house'],
        })),

      // ── syncSavings ──────────────────────────────────────────────────────
      syncSavings: (amount) => set({ savings: amount }),

      // ── unlockBuilding ───────────────────────────────────────────────────
      unlockBuilding: (id, cost) => {
        const { wealth, unlockedBuildings } = get();
        if (unlockedBuildings.includes(id)) return;  // already owned
        if (cost > 0 && wealth < cost) return;        // can't afford
        set((state) => ({
          wealth: cost > 0 ? state.wealth - cost : state.wealth,
          unlockedBuildings: [...state.unlockedBuildings, id],
        }));
      },

      // ── placeBuilding ─────────────────────────────────────────────────────
      placeBuilding: (buildingId, plotIndex) => {
        const { unlockedBuildings, plotPlacements } = get();
        if (!unlockedBuildings.includes(buildingId)) return;  // not owned
        if (plotIndex < 0 || plotIndex > 7) return;            // invalid plot
        if (plotPlacements[plotIndex]) return;                  // already occupied
        set((state) => ({
          plotPlacements: { ...state.plotPlacements, [plotIndex]: buildingId },
          townLevel: state.townLevel + 5,
        }));
      },

      // ── removePlacement ───────────────────────────────────────────────────
      removePlacement: (plotIndex) => {
        const { plotPlacements } = get();
        if (!plotPlacements[plotIndex]) return;
        set((state) => {
          const next = { ...state.plotPlacements };
          delete next[plotIndex];
          return {
            plotPlacements: next,
            townLevel: Math.max(1, state.townLevel - 5),
          };
        });
      },

      // ── resetGameRun ─────────────────────────────────────────────────────
      resetGameRun: () => set({ savings: 0 }),
    }),
    {
      name: 'bankopoly-store',
      partialize: (state) => ({
        wealth:             state.wealth,
        savings:            state.savings,
        unlockedBuildings:  state.unlockedBuildings,
        plotPlacements:     state.plotPlacements,
        townLevel:          state.townLevel,
      }),
    }
  )
);

// ─── Convenience selectors ────────────────────────────────────────────────────
export const useWealth             = () => useGameStore((s) => s.wealth);
export const useSavingsMirror      = () => useGameStore((s) => s.savings);
export const useUnlockedBuildings  = () => useGameStore((s) => s.unlockedBuildings);
export const usePlotPlacements     = () => useGameStore((s) => s.plotPlacements);
export const useTownLevel          = () => useGameStore((s) => s.townLevel);
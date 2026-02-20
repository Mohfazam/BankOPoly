// ═══════════════════════════════════════════════════════════════════════════
// INTEGRATION.md — How to wire WinRewardFlow.tsx into your project
// ═══════════════════════════════════════════════════════════════════════════

/**
 * ── STEP 1: Replace useGameStore.ts ──────────────────────────────────────
 *
 * Copy useGameStore.ts (delivered alongside this file) into:
 *   src/Store/useGameStore.ts
 *
 * New additions (backwards-compatible with existing code):
 *   • plotPlacements  — Record<number, string|null>   (plot index → building id)
 *   • townLevel       — number                         (increases +5 per placed building)
 *   • placeBuilding   — (buildingId, plotIndex) => void
 *   • removePlacement — (plotIndex) => void
 *   • claimReward now auto-unlocks 'house' on win
 *
 *
 * ── STEP 2: Copy WinRewardFlow.tsx ───────────────────────────────────────
 *
 * Copy WinRewardFlow.tsx into:
 *   src/components/WinRewardFlow.tsx   (or wherever your components live)
 *
 *
 * ── STEP 3: Wire into BoardGame.tsx ──────────────────────────────────────
 *
 * Find your existing WinModal in BoardGame.tsx.
 * Replace the entire showWin block at the bottom of the JSX:
 *
 *   // BEFORE:
 *   {showWin && (
 *     <WinModal
 *       zenCoins={netWorth} savings={savings}
 *       scamsAvoided={scamsAvoided} interestEarned={interestEarned}
 *       onClaim={() => {
 *         claimReward(netWorth, savings);
 *         resetGameRun();
 *         window.location.href = '/';
 *       }}
 *     />
 *   )}
 *
 *   // AFTER:
 *   {showWin && (
 *     <WinRewardFlow
 *       netWorth={netWorth}
 *       savings={savings}
 *       interest={interestEarned}
 *       scamsAvoided={scamsAvoided}
 *       loans={loansTaken}          // add a loansTaken counter in BoardGame (see below)
 *       properties={ownedTiles.length}
 *       onComplete={() => {
 *         claimReward(netWorth, savings);   // wealth written to store here
 *         resetGameRun();
 *         window.location.href = '/';       // go to TownMap
 *       }}
 *     />
 *   )}
 *
 * Add a loansTaken counter to BoardGame (already tracks loanActive, add a count):
 *   const [loansTaken, setLoansTaken] = useState(0);
 *   // When loan is taken in the loan/property modals:
 *   setLoansTaken(n => n + 1);
 *
 *
 * ── STEP 4: Wire into TownMap / PlotSystem ────────────────────────────────
 *
 * In your PlotSystem component (or wherever the 8 outer plots are rendered),
 * read plotPlacements from the store and render the placed building:
 *
 *   import { usePlotPlacements, useTownLevel } from '../Store/useGameStore';
 *   import { BUILDINGS } from './WinRewardFlow';
 *
 *   function PlotSystem() {
 *     const plotPlacements = usePlotPlacements();
 *     const townLevel      = useTownLevel();
 *
 *     // For each of your 8 outer plots (index 0-7):
 *     const renderPlot = (plotIndex: number) => {
 *       const buildingId = plotPlacements[plotIndex];
 *       const building   = buildingId ? BUILDINGS.find(b => b.id === buildingId) : null;
 *
 *       if (building) {
 *         // Render the appropriate 3-D building mesh for building.id
 *         // e.g. 'house' → your HouseBuilding component
 *         //      'hospital' → HospitalBuilding component
 *         return <HouseBuilding position={plotPosition} />;
 *       }
 *       // Render empty plot
 *       return <EmptyPlot position={plotPosition} />;
 *     };
 *   }
 *
 * In GameHUD (TownMap's HUD overlay), show the wealth + town level:
 *
 *   import { useWealth, useTownLevel } from '../Store/useGameStore';
 *
 *   function GameHUD() {
 *     const wealth    = useWealth();
 *     const townLevel = useTownLevel();
 *     return (
 *       <div>
 *         <span>💎 ₹{wealth.toLocaleString()}</span>
 *         <span>🏙️ Town Level {townLevel}</span>
 *       </div>
 *     );
 *   }
 *
 *
 * ── STEP 5: Frame 12 auto-places in PlotSystem ───────────────────────────
 *
 * Frame12_Placement calls `unlockBuilding('house', 0)` from the store.
 * You can ALSO call `placeBuilding('house', plotIndex)` there:
 *
 *   // In Frame12_Placement's handlePlace function the store call is:
 *   unlockBuilding('house', 0);   // marks as owned (already done by claimReward)
 *   // Add:
 *   placeBuilding('house', idx);  // places it on the chosen plot
 *
 * Because placeBuilding is exposed in the store, you can call it from
 * Frame12's onPlace handler by also pulling it from useGameStore:
 *
 *   const placeBuilding  = useGameStore(s => s.placeBuilding);
 *   // then inside handlePlace:
 *   placeBuilding('house', idx);
 *
 *
 * ── DATA FLOW SUMMARY ────────────────────────────────────────────────────
 *
 *   BoardGame (win)
 *     └─ claimReward(netWorth, savings)
 *          ├─ wealth += netWorth         ← stored
 *          └─ unlockedBuildings += 'house' ← stored
 *
 *   WinRewardFlow (Frames 10–16)
 *     └─ Frame12: placeBuilding('house', plotIndex)
 *          ├─ plotPlacements[plotIndex] = 'house'   ← stored
 *          └─ townLevel += 5                        ← stored
 *
 *   TownMap / PlotSystem
 *     └─ reads plotPlacements → renders 3-D buildings on correct plots
 *     └─ reads townLevel      → shows in HUD
 *     └─ reads wealth         → shows ZenCoin balance
 */

export {};  // make TypeScript treat this as a module
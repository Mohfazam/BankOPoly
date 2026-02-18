import { createContext, useContext, ReactNode } from 'react';
import * as C from './GridConfig';

type GridCtx = typeof C;
const GridContext = createContext<GridCtx>(C);

export function GridProvider({ children }: { children: ReactNode }) {
  return <GridContext.Provider value={C}>{children}</GridContext.Provider>;
}

export function useGrid() {
  return useContext(GridContext);
}
import { create } from "zustand";
import { GameAction } from "../types/actions";
import { GameState } from "../types/game";
import { createInitialGame } from "../engine/createInitialGame";
import { gameReducer } from "../engine/gameReducer";

interface GameStore {
  state: GameState;

  dispatch: (action: GameAction) => void;
}

export const useGameStore = create<GameStore>((set) => ({
  state: createInitialGame(),

  dispatch: (action) => {
    set((store) => ({
      state: gameReducer(store.state, action),
    }));
  },
}));

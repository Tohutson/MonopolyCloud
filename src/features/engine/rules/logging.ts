import { GameLogEntry, GameState } from "../../types/game";

export function addLog(state: GameState, message: string): GameLogEntry[] {
  return [
    {
      id: crypto.randomUUID(),
      message,
    },
    ...state.log,
  ];
}

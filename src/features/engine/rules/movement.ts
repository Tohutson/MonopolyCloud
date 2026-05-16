import { addLog } from "./logging";
import { GameState } from "@/features/types/game";

export interface MovementResult {
  newPosition: number;
  passedStart: boolean;
}

export function calculateNewPosition(
  currentPosition: number,
  spacesToMove: number,
  boardSize: number,
): MovementResult {
  const rawPosition = currentPosition + spacesToMove;
  const newPosition = rawPosition % boardSize;
  const passedStart = rawPosition >= boardSize;

  return {
    newPosition,
    passedStart,
  };
}

export function getMovementPath(
  startPosition: number,
  spacesToMove: number,
  boardSize: number,
): number[] {
  return Array.from({ length: spacesToMove }, (_, index) => {
    return (startPosition + index + 1) % boardSize;
  });
}

export function moveCurrentPlayerToPosition(
  state: GameState,
  position: number,
  message: string,
): GameState {
  const updatedPlayers = state.players.map((player, index) => {
    if (index !== state.currentPlayerIndex) {
      return player;
    }

    return {
      ...player,
      position,
    };
  });

  return {
    ...state,
    players: updatedPlayers,
    log: addLog(state, message),
  };
}

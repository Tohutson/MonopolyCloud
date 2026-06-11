import { board } from "../../data/board";
import { BoardSquare, PropertySquare } from "../../types/board";
import { GameState } from "../../types/game";
import { PlayerStatus } from "../../types/player";
import { createInitialGame } from "../createInitialGame";

export function createActiveGameForTest(): GameState {
  return {
    ...createInitialGame(),
    status: "ACTIVE",
  };
}

export function setCurrentPlayerPosition(
  state: GameState,
  position: number,
): GameState {
  return setPlayerPosition(state, state.currentPlayerIndex, position);
}

export function setPlayerPosition(
  state: GameState,
  playerIndex: number,
  position: number,
): GameState {
  return {
    ...state,
    players: state.players.map((player, index) =>
      index === playerIndex ? { ...player, position } : player,
    ),
  };
}

export function setCurrentPlayerCash(
  state: GameState,
  cash: number,
): GameState {
  return {
    ...state,
    players: state.players.map((player, index) =>
      index === state.currentPlayerIndex ? { ...player, cash } : player,
    ),
  };
}

export function setCurrentPlayerStatus(
  state: GameState,
  status: PlayerStatus,
): GameState {
  return {
    ...state,
    players: state.players.map((player, index) =>
      index === state.currentPlayerIndex ? { ...player, status } : player,
    ),
  };
}

export function setCurrentPlayerIndex(
  state: GameState,
  currentPlayerIndex: number,
): GameState {
  return {
    ...state,
    currentPlayerIndex,
  };
}

export function markPropertyOwned(
  state: GameState,
  propertyId: string,
  ownerId: string,
): GameState {
  return {
    ...state,
    ownedProperties: [...state.ownedProperties, { propertyId, ownerId }],
  };
}

export function markTurnRolled(state: GameState): GameState {
  return {
    ...state,
    hasRolledThisTurn: true,
    rolledDoublesCount: 0,
    diceRollSequence: state.diceRollSequence,
    lastDiceRoll: {
      die1: 1,
      die2: 2,
      total: 3,
    },
  };
}

export function setLastDiceRoll(state: GameState, total: number): GameState {
  const die1 = Math.min(6, Math.max(1, total - 1));
  const die2 = total - die1;

  return {
    ...state,
    lastDiceRoll: {
      die1,
      die2,
      total,
    },
  };
}

export function squareById(squareId: string): BoardSquare {
  const square = board.find((candidate) => candidate.id === squareId);

  if (!square) {
    throw new Error(`Could not find test square: ${squareId}`);
  }

  return square;
}

export function propertySquareById(squareId: string): PropertySquare {
  const square = squareById(squareId);

  if (square.type !== "PROPERTY") {
    throw new Error(`Test square is not a property: ${squareId}`);
  }

  return square;
}

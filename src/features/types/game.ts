import { BoardSquare } from "./board";
import { Player } from "./player";

export type GameStatus = "NOT_STARTED" | "ACTIVE" | "FINISHED";

export interface OwnedProperty {
  propertyId: string;
  ownerId: string;
}

export interface DiceRoll {
  die1: number;
  die2: number;
  total: number;
}

export interface PendingRoll {
  playerId: string;
  startPosition: number;
  movementPath: number[];
  finalPosition: number;
  passedStart: boolean;
}

export interface GameLogEntry {
  id: string;
  message: string;
}

export interface GameState {
  gameId: string;
  status: GameStatus;
  players: Player[];
  currentPlayerIndex: number;
  board: BoardSquare[];
  ownedProperties: OwnedProperty[];
  lastDiceRoll: DiceRoll | null;
  pendingRoll: PendingRoll | null;
  hasRolledThisTurn: boolean;
  rolledDoublesCount: number;
  diceRollSequence: number;
  winnerId: string | null;
  log: GameLogEntry[];
}

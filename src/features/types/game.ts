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

export interface GameLogEntry {
  id: string;
  message: string;
}

export interface GameState {
  gameId: string;
  status: GameStatus;
  players: Player[];
  board: BoardSquare[];
  ownedProperties: OwnedProperty[];
  lastDiceRoll: DiceRoll | null;
  hasRolledThisTurn: boolean;

  winnerId: string | null;
  logs: GameLogEntry[];
}

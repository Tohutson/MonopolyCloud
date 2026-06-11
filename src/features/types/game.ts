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

export type TurnPhase =
  | "INACTIVE"
  | "ROLL_READY"
  | "MOVING"
  | "RESOLVE_SQUARE"
  | "OPTIONAL_ACTIONS";

export interface GameState {
  gameId: string;
  status: GameStatus;
  players: Player[];
  currentPlayerIndex: number;
  turnPhase: TurnPhase;
  board: BoardSquare[];
  ownedProperties: OwnedProperty[];
  lastDiceRoll: DiceRoll | null;
  pendingRoll: PendingRoll | null;
  rolledDoublesCount: number;
  diceRollSequence: number;
  winnerId: string | null;
  log: GameLogEntry[];
}

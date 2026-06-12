import { BoardSquare } from "./board";
import { Card } from "./cards";
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

export interface AuctionState {
  propertyId: string;
  currentBidderId: string;
  topBidderId: string | null;
  topBid: number;
  passedPlayerIds: string[];
  declinedByPlayerId: string;
}

export type TurnPhase =
  | "INACTIVE"
  | "ROLL_READY"
  | "MOVING"
  | "RESOLVE_SQUARE"
  | "PROPERTY_DECISION"
  | "AUCTION"
  | "OPTIONAL_ACTIONS";

export interface GameState {
  gameId: string;
  status: GameStatus;
  players: Player[];
  currentPlayerIndex: number;
  turnPhase: TurnPhase;
  board: BoardSquare[];
  ownedProperties: OwnedProperty[];
  chanceDeck: Card[];
  communityChestDeck: Card[];
  lastDiceRoll: DiceRoll | null;
  pendingRoll: PendingRoll | null;
  auctionState: AuctionState | null;
  rolledDoublesCount: number;
  diceRollSequence: number;
  winnerId: string | null;
  log: GameLogEntry[];
}

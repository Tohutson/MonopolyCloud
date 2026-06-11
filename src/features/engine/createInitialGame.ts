import { board } from "../data/board";
import { GameState } from "../types/game";

export function createInitialGame(): GameState {
  return {
    gameId: "local-game",

    status: "NOT_STARTED",

    players: [
      {
        id: "player-1",
        name: "Player 1",
        cash: 1500,
        position: 0,
        status: "ACTIVE",
        jailState: {
          isInJail: false,
          turnsAttempted: 0,
          getOutOfJailFreeCards: 0,
        },
      },
      {
        id: "player-2",
        name: "Player 2",
        cash: 1500,
        position: 0,
        status: "ACTIVE",
        jailState: {
          isInJail: false,
          turnsAttempted: 0,
          getOutOfJailFreeCards: 0,
        },
      },
    ],

    currentPlayerIndex: 0,

    turnPhase: "INACTIVE",

    board,

    ownedProperties: [],

    lastDiceRoll: null,

    pendingRoll: null,

    rolledDoublesCount: 0,
    diceRollSequence: 0,

    winnerId: null,

    log: [],
  };
}

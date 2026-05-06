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
      },
      {
        id: "player-2",
        name: "Player 2",
        cash: 1500,
        position: 0,
        status: "ACTIVE",
      },
    ],

    currentPlayerIndex: 0,

    board,

    ownedProperties: [],

    lastDiceRoll: null,

    hasRolledThisTurn: false,

    winnerId: null,

    // TODO: Any events yet?
    logs: [],
  };
}

import { GameState } from "../types/game";
import { GameAction } from "./actions";
import { createInitialGame } from "./createInitialGame";

export function gameReducer(state: GameState, action: GameAction): GameState {
  switch (action.type) {
    case "START_GAME":
      return {
        ...state,
        status: "ACTIVE",
        log: addLog(state, "Game started."),
      };

    case "ROLL_DICE":
      // TODO: eventually roll dice and move current player
      return state;

    case "BUY_PROPERTY":
      // TODO: eventually buy the property using action.propertyId
      return state;

    case "END_TURN":
      // TODO: eventually switch currentPlayerIndex
      return state;

    case "RESET_GAME":
      return createInitialGame();

    default:
      return state;
  }
}

function addLog(state: GameState, message: string) {
  return [
    {
      id: crypto.randomUUID(),
      message,
    },
    ...state.log,
  ];
}

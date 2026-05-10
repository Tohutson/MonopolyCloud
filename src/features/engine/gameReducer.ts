import { GameState } from "../types/game";
import { GameAction } from "../types/actions";
import { createInitialGame } from "./createInitialGame";
import { buyPropertyAction } from "./actions/buyPropertyAction";
import { endTurnAction } from "./actions/endTurnAction";
import { rollDiceAction } from "./actions/rollDiceAction";
import { startGameAction } from "./actions/startGameAction";

export function gameReducer(state: GameState, action: GameAction): GameState {
  switch (action.type) {
    case "START_GAME":
      return startGameAction(state);

    case "ROLL_DICE":
      return rollDiceAction(state);

    case "BUY_PROPERTY":
      return buyPropertyAction(state, action.propertyId);

    case "END_TURN":
      return endTurnAction(state);

    case "RESET_GAME":
      return createInitialGame();

    default:
      return state;
  }
}

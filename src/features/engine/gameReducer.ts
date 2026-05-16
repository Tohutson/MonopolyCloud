import { GameState } from "../types/game";
import { GameAction } from "../types/actions";
import { createInitialGame } from "./createInitialGame";
import { buyPropertyAction } from "./actions/buyPropertyAction";
import { endTurnAction } from "./actions/endTurnAction";
import { resolveRollAction, rollDiceAction } from "./actions/rollDiceAction";
import { startGameAction } from "./actions/startGameAction";
import {
  payToLeaveJail,
  playGetOutOfJailCard,
  attemptJailRoll,
} from "./actions/jailActions";

export function gameReducer(state: GameState, action: GameAction): GameState {
  switch (action.type) {
    case "START_GAME":
      return startGameAction(state);

    case "ROLL_DICE":
      return rollDiceAction(state);

    case "RESOLVE_ROLL":
      return resolveRollAction(state);

    case "BUY_PROPERTY":
      return buyPropertyAction(state, action.propertyId);

    case "END_TURN":
      return endTurnAction(state);

    case "RESET_GAME":
      return createInitialGame();

    case "PAY_TO_LEAVE_JAIL":
      return payToLeaveJail(state);

    case "USE_JAIL_CARD":
      return playGetOutOfJailCard(state);

    case "ROLL_FOR_JAIL_RELEASE":
      return attemptJailRoll(state);

    default:
      return state;
  }
}

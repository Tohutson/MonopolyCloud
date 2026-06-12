import { GameState } from "../types/game";
import { GameAction } from "../types/actions";
import { createInitialGame } from "./createInitialGame";
import { completeMoveAction } from "./actions/completeMoveAction";
import { buyPropertyAction } from "./actions/buyPropertyAction";
import { declinePropertyAction } from "./actions/declinePropertyAction";
import { endTurnAction } from "./actions/endTurnAction";
import { resolveSquareAction } from "./actions/resolveSquareAction";
import { rollDiceAction } from "./actions/rollDiceAction";
import { startGameAction } from "./actions/startGameAction";
import {
  passAuctionBidAction,
  placeAuctionBidAction,
} from "./actions/auctionActions";
import {
  payToLeaveJail,
  playGetOutOfJailCard,
  attemptJailRoll,
} from "./actions/jailActions";
import {
  buyHotelAction,
  buyHouseAction,
  mortgagePropertyAction,
  sellHotelAction,
  sellHouseAction,
  unmortgagePropertyAction,
} from "./actions/improvementActions";

export function gameReducer(state: GameState, action: GameAction): GameState {
  switch (action.type) {
    case "START_GAME":
      return startGameAction(state);

    case "ROLL_DICE":
      return rollDiceAction(state);

    case "COMPLETE_MOVE":
      return completeMoveAction(state);

    case "RESOLVE_SQUARE":
      return resolveSquareAction(state);

    case "BUY_PROPERTY":
      return buyPropertyAction(state, action.propertyId);

    case "DECLINE_PROPERTY":
      return declinePropertyAction(state, action.propertyId);

    case "BUY_HOUSE":
      return buyHouseAction(state, action.propertyId);

    case "BUY_HOTEL":
      return buyHotelAction(state, action.propertyId);

    case "SELL_HOUSE":
      return sellHouseAction(state, action.propertyId);

    case "SELL_HOTEL":
      return sellHotelAction(state, action.propertyId);

    case "MORTGAGE_PROPERTY":
      return mortgagePropertyAction(state, action.propertyId);

    case "UNMORTGAGE_PROPERTY":
      return unmortgagePropertyAction(state, action.propertyId);

    case "PLACE_AUCTION_BID":
      return placeAuctionBidAction(state, action.bidderId, action.amount);

    case "PASS_AUCTION_BID":
      return passAuctionBidAction(state, action.bidderId);

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

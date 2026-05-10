import { GameState } from "../../types/game";
import {
  INCOME_TAX_AMOUNT,
  JAIL_POSITION,
  LUXURY_TAX_AMOUNT,
  PASS_GO_REWARD,
} from "./constants";
import { addLog } from "./logging";
import { chargeCurrentPlayer } from "./payments";

export function resolveLandedSquare(state: GameState): GameState {
  const currentPlayer = state.players[state.currentPlayerIndex];
  const square = state.board[currentPlayer.position];

  switch (square.type) {
    case "START":
      return {
        ...state,
        log: addLog(
          state,
          `${currentPlayer.name} passed Start and collected $${PASS_GO_REWARD}.`,
        ),
      };

    case "PROPERTY":
      return {
        ...state,
        log: addLog(
          state,
          `${currentPlayer.name} landed on ${square.name} (Property).`,
        ),
      };

    case "TAX": {
      const taxAmount = getTaxAmount(square.id);

      return chargeCurrentPlayer(
        state,
        taxAmount,
        `${currentPlayer.name} paid tax of $${taxAmount}.`,
      );
    }

    case "CHANCE":
      return {
        ...state,
        log: addLog(
          state,
          `${currentPlayer.name} landed on Chance. (No card effects implemented yet)`,
        ),
      };

    case "COMMUNITY_CHEST":
      return {
        ...state,
        log: addLog(state, `${currentPlayer.name} landed on Community Chest.`),
      };

    case "FREE_PARKING":
      return {
        ...state,
        log: addLog(state, `${currentPlayer.name} landed on Free Parking.`),
      };

    case "JAIL":
      return {
        ...state,
        log: addLog(state, `${currentPlayer.name} is visiting jail.`),
      };

    case "GO_TO_JAIL":
      return moveCurrentPlayerToPosition(
        state,
        JAIL_POSITION,
        `${currentPlayer.name} was sent to Jail.`,
      );

    default:
      return state;
  }
}

function getTaxAmount(squareId: string): number {
  if (squareId === "income-tax") {
    return INCOME_TAX_AMOUNT;
  }

  if (squareId === "luxury-tax") {
    return LUXURY_TAX_AMOUNT;
  }

  return 0;
}

function moveCurrentPlayerToPosition(
  state: GameState,
  position: number,
  message: string,
): GameState {
  const updatedPlayers = state.players.map((player, index) => {
    if (index !== state.currentPlayerIndex) {
      return player;
    }

    return {
      ...player,
      position,
    };
  });

  return {
    ...state,
    players: updatedPlayers,
    log: addLog(state, message),
  };
}

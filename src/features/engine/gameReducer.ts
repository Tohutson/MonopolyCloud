import { GameState } from "../types/game";
import { GameAction } from "../types/actions";
import { createInitialGame } from "./createInitialGame";
import { rollTwoDice } from "./dice";
import { calculateNewPosition } from "./movement";

const PASS_GO_REWARD = 200;
const INCOME_TAX_AMOUNT = 200;
const LUXURY_TAX_AMOUNT = 100;

export function gameReducer(state: GameState, action: GameAction): GameState {
  switch (action.type) {
    case "START_GAME":
      return {
        ...state,
        status: "ACTIVE",
        log: addLog(state, "Game started."),
      };

    case "ROLL_DICE":
      return rollDiceAction(state);

    case "BUY_PROPERTY":
      // TODO: eventually buy the property using action.propertyId
      return state;

    case "END_TURN": {
      if (state.status !== "ACTIVE") {
        return state;
      }

      if (!state.hasRolledThisTurn) {
        return state;
      }

      const nextPlayerIndex =
        (state.currentPlayerIndex + 1) % state.players.length;

      return {
        ...state,
        currentPlayerIndex: nextPlayerIndex,
        hasRolledThisTurn: false,
        lastDiceRoll: null,
        log: addLog(
          state,
          `${state.players[nextPlayerIndex].name}'s turn started.`,
        ),
      };
    }
    case "RESET_GAME":
      return createInitialGame();

    default:
      return state;
  }
}

function rollDiceAction(state: GameState): GameState {
  if (state.status !== "ACTIVE") {
    return state;
  }

  if (state.hasRolledThisTurn) {
    return state;
  }

  const currentPlayer = state.players[state.currentPlayerIndex];

  if (currentPlayer.status !== "ACTIVE") {
    return state;
  }

  const diceRoll = rollTwoDice();

  const movementResult = calculateNewPosition(
    currentPlayer.position,
    diceRoll.total,
    state.board.length,
  );

  const updatedPlayers = state.players.map((player, index) => {
    if (index !== state.currentPlayerIndex) {
      return player;
    }

    return {
      ...player,
      position: movementResult.newPosition,

      cash: movementResult.passedStart
        ? player.cash + PASS_GO_REWARD
        : player.cash,
    };
  });

  let nextState: GameState = {
    ...state,
    players: updatedPlayers,
    lastDiceRoll: diceRoll,
    hasRolledThisTurn: true,
    log: addLog(
      state,
      `${currentPlayer.name} rolled ${diceRoll.die1} + ${diceRoll.die2} = ${diceRoll.total}.`,
    ),
  };

  nextState = resolveLandedSquare(nextState);

  return nextState;
}

function resolveLandedSquare(state: GameState): GameState {
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
      return {
        ...state,
        log: addLog(state, `${currentPlayer.name} is going to jail!`),
      };

    default:
      return state;
  }
}

function chargeCurrentPlayer(
  state: GameState,
  amount: number,
  message: string,
): GameState {
  const updatedPlayers = state.players.map((player, index) => {
    if (index !== state.currentPlayerIndex) {
      return player;
    }

    return {
      ...player,
      cash: player.cash - amount,
    };
  });

  return {
    ...state,
    players: updatedPlayers,
    log: addLog(state, message),
  };
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

function addLog(state: GameState, message: string) {
  return [
    {
      id: crypto.randomUUID(),
      message,
    },
    ...state.log,
  ];
}

import { GameState } from "../types/game";
import { GameAction } from "../types/actions";
import { createInitialGame } from "./createInitialGame";
import { rollTwoDice } from "./dice";
import { calculateNewPosition } from "./movement";

const PASS_GO_REWARD = 200;

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

    case "END_TURN":
      // TODO: eventually switch currentPlayerIndex
      return state;

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

  return {
    ...state,
    players: updatedPlayers,
    lastDiceRoll: diceRoll,
    hasRolledThisTurn: true,
    log: addLog(
      state,
      `${currentPlayer.name} rolled ${diceRoll.die1} + ${diceRoll.die2} = ${diceRoll.total}.`,
    ),
  };
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
